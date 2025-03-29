import React, { useEffect, useState, useRef } from "react";
import {
  FaTimes,
  FaPhoneAlt,
  FaPhoneSlash,
  FaHourglassHalf,
} from "react-icons/fa";
import { initSignalR } from "../../utils/signalR";
import { initWebRTC } from "../../utils/webRTC";

const BookingModal = ({ booking, onClose, accountId }) => {
  const storedUser = localStorage.getItem("user");
  const { role } = storedUser ? JSON.parse(storedUser) : {};
  const [signalRConnection, setSignalRConnection] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [targetConnectionId, setTargetConnectionId] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    console.log("Initializing SignalR...");

    const connection = initSignalR({
      onIncomingCall: (callerConnectionId) => {
        console.log("Received IncomingCall", { callerConnectionId });
        setCallStatus("incoming_call");
        setTargetConnectionId(callerConnectionId);
        console.log("Caller user ID from incoming call:", accountId);
      },
      onCallAccepted: (targetId) => {
        console.log("Received CallAccepted", { targetId });
        setCallStatus("in_call");
        setTargetConnectionId(targetId);
        console.log("Target user ID from call accepted:", booking.listenerId);
      },
      onCallRejected: () => {
        console.log("Received CallRejected");
        setCallStatus("idle");
        alert("Cuộc gọi đã bị từ chối bởi người lắng nghe");
      },
      onCallEnded: () => {
        console.log("Received CallEnded");
        handleEndCall();
      },
      onReceiveOffer: async (callerId, offer) => {
        console.log("Received Offer", { callerId, offer });
        try {
          const parsedOffer = JSON.parse(offer);
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(parsedOffer),
          );
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          console.log("Sending Answer", { callerId, answer });
          connection.invoke("SendAnswer", callerId, JSON.stringify(answer));
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      },
      onReceiveAnswer: async (callerId, answer) => {
        console.log("Received Answer", { callerId, answer });
        try {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(JSON.parse(answer)),
          );
        } catch (error) {
          console.error("Error handling answer:", error);
        }
      },
      onReceiveCandidate: async (callerId, candidate) => {
        console.log("Received Candidate", { callerId, candidate });
        try {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(JSON.parse(candidate)),
          );
        } catch (error) {
          console.error("Error handling candidate:", error);
        }
      },
      onConnectedForBooking: (success) => {
        console.log("ConnectedForBooking callback", { success });
        setIsJoined(success);
        if (success) {
          setCallStatus("ready_to_call"); // Move to ready_to_call immediately
        } else {
          alert("Không thể tham gia cuộc gọi. Vui lòng thử lại.");
          setCallStatus("idle");
        }
      },
      onGetUserForBooking: (targetConnectionId) => {
        console.log("GetUserForBooking callback", { targetConnectionId });
        setTargetConnectionId(targetConnectionId);
        // No need to change callStatus here since it's already "ready_to_call"
        console.log("Target connection ID received:", targetConnectionId);
        console.log(
          "Target user ID:",
          role.toLowerCase() === "listener"
            ? booking.userId
            : booking.listenerId,
        );
      },
      onUserNotConnectedForBooking: () => {
        console.log("UserNotConnectedForBooking callback");
        alert("Người khác chưa tham gia cuộc gọi. Vui lòng chờ hoặc thử lại.");
        setCallStatus("idle");
        setIsJoined(false);
      },
      onNoAvailableUsers: () => {
        console.log("NoAvailableUsers callback");
        alert("Không có người dùng nào sẵn sàng. Vui lòng thử lại sau.");
        setCallStatus("idle");
        setIsJoined(false);
      },
    });

    setSignalRConnection(connection);

    console.log("Initializing WebRTC...");
    const pc = initWebRTC({
      onIceCandidate: (candidate) => {
        console.log("WebRTC onIceCandidate", { candidate });
        if (targetConnectionId && connection) {
          connection.invoke(
            "SendCandidate",
            targetConnectionId,
            JSON.stringify(candidate),
          );
        }
      },
      onTrack: (event) => {
        console.log("WebRTC onTrack", { streams: event.streams });
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
          setRemoteStream(event.streams[0]);
        }
      },
    });
    console.log("Initializing RTCPeerConnection...");
    setPeerConnection(pc);
    console.log("WebRTC initialized with pc:", pc);

    return () => {
      console.log("Cleaning up BookingModal");
      if (signalRConnection) {
        console.log("Stopping SignalR connection on cleanup");
        signalRConnection
          .stop()
          .then(() => console.log("SignalR connection stopped during cleanup"))
          .catch((err) =>
            console.error("Error stopping SignalR on cleanup:", err),
          );
      }
      if (peerConnection) {
        console.log("Closing WebRTC peer connection");
        peerConnection.close();
        setPeerConnection(null);
      }
      if (localStream) {
        console.log("Stopping local stream tracks");
        localStream.getTracks().forEach((track) => track.stop());
      }
      setSignalRConnection(null);
      setLocalStream(null);
      setRemoteStream(null);
      console.log("Cleanup completed");
    };
  }, [booking, accountId]);

  const handleJoinCall = async () => {
    console.log("handleJoinCall triggered");
    if (!signalRConnection) {
      console.log("SignalR connection not initialized");
      alert("Chưa sẵn sàng để tham gia. Vui lòng đợi hoặc thử lại.");
      return;
    }

    try {
      console.log("Invoking OnConnectedForBookingAsync", { accountId });
      await signalRConnection.invoke("OnConnectedForBookingAsync", accountId);
      console.log("OnConnectedForBookingAsync invoked");

      let targetUserId;
      if (role.toLowerCase() === "listener") {
        targetUserId = booking.userId;
        console.log("Joining as listener, target user ID:", targetUserId);
      } else {
        targetUserId = booking.listenerId;
        console.log("Joining as user, target user ID:", targetUserId);
      }

      console.log("Invoking GetUserForBooking", { targetUserId });
      const res = await signalRConnection.invoke(
        "GetUserForBooking",
        targetUserId,
      );
      setCallStatus("ready_to_call");
      // callStatus is set to "ready_to_call" in onConnectedForBooking callback
    } catch (error) {
      console.error("Error joining call:", error);
      setCallStatus("idle");
      setIsJoined(false);
      alert("Không thể tham gia cuộc gọi. Vui lòng thử lại.");
    }
  };

  const handleStartCall = async () => {
    console.log("handleStartCall triggered", {
      signalRConnection,
      peerConnection,
      targetConnectionId,
    });
    if (!signalRConnection || !peerConnection) {
      console.log("Not ready to start call: Missing SignalR or WebRTC");
      alert("Chưa sẵn sàng để bắt đầu cuộc gọi. Vui lòng thử lại.");
      return;
    }

    try {
      setCallStatus("calling");
      let callTarget = targetConnectionId;
      if (!callTarget) {
        // Fallback to target user ID if targetConnectionId isn't set yet
        callTarget =
          role.toLowerCase() === "listener"
            ? booking.userId
            : booking.listenerId;
        console.log("No targetConnectionId yet, using fallback:", callTarget);
      }
      console.log("Invoking StartCall", { callTarget });
      await signalRConnection.invoke("StartCall", callTarget);

      console.log("Requesting user media");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => {
        console.log("Adding track to peer connection", { track });
        peerConnection.addTrack(track, stream);
      });
      setLocalStream(stream);
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;
      console.log("Local stream set");

      console.log("Creating offer");
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log("Sending offer", { callTarget, offer });
      await signalRConnection.invoke(
        "SendOffer",
        callTarget,
        JSON.stringify(offer),
      );
    } catch (error) {
      console.error("Error starting call:", error);
      setCallStatus("idle");
      alert("Không thể bắt đầu cuộc gọi. Vui lòng thử lại.");
    }
  };

  const handleAcceptCall = async () => {
    console.log("handleAcceptCall triggered", { targetConnectionId });
    if (!signalRConnection || !peerConnection || !targetConnectionId) {
      console.log("Not ready to accept call");
      return;
    }

    try {
      console.log(
        "Target user ID from call acceptance:",
        role.toLowerCase() === "listener" ? booking.userId : booking.listenerId,
      );
      console.log("Requesting user media for accept");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => {
        console.log("Adding track to peer connection", { track });
        peerConnection.addTrack(track, stream);
      });
      setLocalStream(stream);
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;
      console.log("Local stream set for accept");

      console.log("Invoking AcceptCall", { targetConnectionId });
      await signalRConnection.invoke("AcceptCall", targetConnectionId);
      setCallStatus("in_call");
    } catch (error) {
      console.error("Error accepting call:", error);
      setCallStatus("idle");
      alert("Không thể chấp nhận cuộc gọi.");
    }
  };

  const handleEndCall = async () => {
    console.log("handleEndCall triggered");
    if (peerConnection) {
      console.log("Closing peer connection");
      peerConnection.close();
      setPeerConnection(null);
    }
    if (signalRConnection && targetConnectionId) {
      console.log("Invoking EndCall", {
        callerConnectionId: signalRConnection.connectionId,
        targetConnectionId,
      });
      console.log("Caller user ID ending call:", accountId);
      await signalRConnection.invoke(
        "EndCall",
        signalRConnection.connectionId,
        targetConnectionId,
      );
    }
    if (localStream) {
      console.log("Stopping local stream tracks");
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (signalRConnection) {
      console.log("Stopping SignalR connection on end call");
      await signalRConnection
        .stop()
        .then(() => console.log("SignalR connection stopped on end call"))
        .catch((err) =>
          console.error("Error stopping SignalR on end call:", err),
        );
    }
    setCallStatus("idle");
    setTargetConnectionId(null);
    setLocalStream(null);
    setRemoteStream(null);
    setIsJoined(false);
    setSignalRConnection(null);
    console.log("Call ended");
  };

  const getStatusBadge = (status) => {
    console.log("getStatusBadge called", { status });
    switch (status) {
      case "Upcoming":
        return (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            Sắp tới
          </span>
        );
      case "Completed":
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            Hoàn thành
          </span>
        );
      case "Cancelled":
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
            {status}
          </span>
        );
    }
  };

  console.log("Rendering BookingModal", {
    callStatus,
    targetConnectionId,
    isJoined,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">Chi tiết lịch hẹn</h3>
          <button
            onClick={() => {
              console.log("Close button clicked");
              handleEndCall();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Người lắng nghe: {booking.listenerId}
            </p>
            <p className="text-lg">{booking.listenerName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Ngày:</p>
            <p className="text-lg">
              {new Date(booking.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Thời gian:</p>
            <p className="text-lg">{booking.time}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Trạng thái:</p>
            <div className="mt-1">{getStatusBadge(booking.status)}</div>
          </div>

          <audio ref={localAudioRef} autoPlay muted />
          <audio ref={remoteAudioRef} autoPlay />

          {booking.status === "Upcoming" && (
            <div className="space-y-3 pt-4">
              {callStatus === "idle" && !isJoined && (
                <button
                  onClick={handleJoinCall}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 py-2 font-medium text-white hover:bg-blue-600"
                >
                  <FaPhoneAlt /> Tham gia cuộc gọi
                </button>
              )}
              {callStatus === "ready_to_call" && (
                <button
                  onClick={handleStartCall}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 py-2 font-medium text-white hover:bg-green-600"
                >
                  <FaPhoneAlt /> Gọi {booking.listenerName}
                </button>
              )}
              {callStatus === "incoming_call" && (
                <div className="flex gap-3">
                  <button
                    onClick={handleAcceptCall}
                    className="flex-1 rounded-lg bg-green-500 py-2 font-medium text-white hover:bg-green-600"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={handleEndCall}
                    className="flex-1 rounded-lg bg-red-500 py-2 font-medium text-white hover:bg-red-600"
                  >
                    Từ chối
                  </button>
                </div>
              )}
              {callStatus === "calling" && (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-yellow-500 py-2 font-medium text-white">
                  <FaHourglassHalf /> Đang gọi {booking.listenerName}...
                </div>
              )}
              {callStatus === "in_call" && (
                <button
                  onClick={handleEndCall}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 py-2 font-medium text-white hover:bg-red-600"
                >
                  <FaPhoneSlash /> Kết thúc cuộc gọi
                </button>
              )}
              {callStatus !== "idle" && callStatus !== "ready_to_call" && (
                <div className="text-center text-sm text-gray-500">
                  Trạng thái:{" "}
                  {callStatus === "calling"
                    ? "Đang gọi..."
                    : callStatus === "in_call"
                      ? "Đang trong cuộc gọi"
                      : "Đang xử lý..."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
