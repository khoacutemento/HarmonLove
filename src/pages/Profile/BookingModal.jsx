import React, { useEffect, useState, useRef } from "react";
import {
  FaTimes,
  FaPhoneAlt,
  FaPhoneSlash,
  FaHourglassHalf,
} from "react-icons/fa";
import { initSignalR } from "../../utils/signalRBooking";
import { initWebRTC } from "../../utils/webRTC";

const BookingModal = ({ booking, onClose, accountId }) => {
  const storedUser = localStorage.getItem("user");
  const { role } = storedUser ? JSON.parse(storedUser) : { role: null };
  const [signalRClient, setSignalRClient] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [targetConnectionId, setTargetConnectionId] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isSignalRConnected, setIsSignalRConnected] = useState(false); // New state for connection status
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    console.log("BookingModal useEffect: Initializing SignalR and WebRTC...", {
      booking,
      accountId,
    });

    const client = initSignalR({
      onIncomingCall: (callerConnectionId) => {
        console.log("Handler: onIncomingCall", { callerConnectionId });
        setCallStatus("incoming_call");
        setTargetConnectionId(callerConnectionId);
      },
      onCallAccepted: (targetId) => {
        console.log("Handler: onCallAccepted", { targetId });
        setCallStatus("in_call");
        setTargetConnectionId(targetId);
      },
      onCallRejected: () => {
        console.log("Handler: onCallRejected");
        setCallStatus("idle");
        alert("Cuộc gọi đã bị từ chối bởi người lắng nghe");
      },
      onCallEnded: () => {
        console.log("Handler: onCallEnded");
        handleEndCall();
      },
      onReceiveOffer: async (callerId, offer) => {
        console.log("Handler: onReceiveOffer", { callerId, offer });
        try {
          const parsedOffer = JSON.parse(offer);
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(parsedOffer),
          );
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          console.log("Sending answer after receiving offer", {
            callerId,
            answer,
          });
          client.sendAnswer(callerId, JSON.stringify(answer));
        } catch (error) {
          console.error("Error in onReceiveOffer:", error);
        }
      },
      onReceiveAnswer: async (callerId, answer) => {
        console.log("Handler: onReceiveAnswer", { callerId, answer });
        try {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(JSON.parse(answer)),
          );
        } catch (error) {
          console.error("Error in onReceiveAnswer:", error);
        }
      },
      onReceiveCandidate: async (callerId, candidate) => {
        console.log("Handler: onReceiveCandidate", { callerId, candidate });
        try {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(JSON.parse(candidate)),
          );
        } catch (error) {
          console.error("Error in onReceiveCandidate:", error);
        }
      },
      onGetUserForBooking: (targetConnectionId) => {
        console.log("Handler: onGetUserForBooking (UserSelected)", {
          targetConnectionId,
        });
        setTargetConnectionId(targetConnectionId);
        setCallStatus("ready_to_call");
      },
      onNoAvailableUsers: () => {
        console.log("Handler: onNoAvailableUsers");
        alert("Không có người dùng nào sẵn sàng. Vui lòng thử lại sau.");
        setCallStatus("idle");
        setIsJoined(false);
      },
    });

    console.log("SignalR client initialized:", client);
    setSignalRClient(client);

    // Start SignalR connection and update state
    client.connection
      .start()
      .then(() => {
        console.log("SignalR connection started successfully");
        setIsSignalRConnected(true);
      })
      .catch((err) =>
        console.error("SignalR connection failed to start:", err),
      );

    const pc = initWebRTC({
      onIceCandidate: (candidate) => {
        console.log("WebRTC: onIceCandidate", { candidate });
        if (targetConnectionId) {
          client.sendCandidate(targetConnectionId, JSON.stringify(candidate));
        }
      },
      onTrack: (event) => {
        console.log("WebRTC: onTrack", { streams: event.streams });
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
          setRemoteStream(event.streams[0]);
        }
      },
    });
    console.log("WebRTC peer connection initialized:", pc);
    setPeerConnection(pc);

    return () => {
      console.log("BookingModal cleanup triggered");
      if (signalRClient) {
        const myConnectionId = signalRClient.connection.connectionId;
        const targetAccountId =
          role.toLowerCase() === "listener"
            ? booking.userId
            : booking.listenerId;
        cleanupCall(myConnectionId, accountId, targetAccountId);
      }
    };
  }, [booking, accountId]);

  const cleanupCall = (myConnectionId, myAccountId, targetAccountId) => {
    console.log("cleanupCall started", {
      myConnectionId,
      myAccountId,
      targetAccountId,
    });
    if (peerConnection) {
      console.log("Closing WebRTC peer connection");
      peerConnection.close();
      setPeerConnection(null);
    }
    if (signalRClient && targetConnectionId && myAccountId && targetAccountId) {
      console.log("Ending call via SignalR", {
        myConnectionId,
        targetConnectionId,
      });
      signalRClient.endCall(myAccountId, targetAccountId, myConnectionId);
    }
    if (localStream) {
      console.log("Stopping local stream tracks");
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      console.log("Clearing remote stream");
      setRemoteStream(null);
    }
    if (signalRClient) {
      console.log("Stopping SignalR connection");
      signalRClient.connection
        .stop()
        .then(() => console.log("SignalR connection stopped successfully"))
        .catch((err) => console.error("Error stopping SignalR:", err));
    }
    setSignalRClient(null);
    setTargetConnectionId(null);
    setCallStatus("idle");
    setIsJoined(false);
    setIsSignalRConnected(false);
    console.log("cleanupCall completed");
  };

  const handleJoinCall = async () => {
    console.log("handleJoinCall triggered");
    if (!signalRClient) {
      console.log("SignalR client not initialized");
      alert("Chưa sẵn sàng để tham gia. Vui lòng đợi hoặc thử lại.");
      return;
    }
    if (!isSignalRConnected) {
      console.log("SignalR not connected yet");
      alert("Đang kết nối tới server. Vui lòng đợi một chút.");
      return;
    }

    try {
      setIsJoined(true);
      setCallStatus("joining");
      const targetUserId =
        role.toLowerCase() === "listener" ? booking.userId : booking.listenerId;
      console.log(
        "Joining call as",
        role.toLowerCase(),
        "with targetUserId:",
        targetUserId,
      );
      await signalRClient.getUserForBooking(targetUserId);
      console.log("GetUserForBooking invoked successfully");
    } catch (error) {
      console.error("Error in handleJoinCall:", error);
      setCallStatus("idle");
      setIsJoined(false);
      alert("Không thể tham gia cuộc gọi. Vui lòng thử lại.");
    }
  };

  const handleStartCall = async () => {
    console.log("handleStartCall triggered", { targetConnectionId });
    if (!signalRClient || !peerConnection || !targetConnectionId) {
      console.log("Not ready to start call", {
        signalRClient,
        peerConnection,
        targetConnectionId,
      });
      alert("Chưa sẵn sàng để bắt đầu cuộc gọi. Vui lòng thử lại.");
      return;
    }

    try {
      setCallStatus("calling");
      await signalRClient.startCall(targetConnectionId);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Got local stream", { stream });
      stream.getTracks().forEach((track) => {
        console.log("Adding track to peer connection", { track });
        peerConnection.addTrack(track, stream);
      });
      setLocalStream(stream);
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log("Sending offer", { offer });
      await signalRClient.sendOffer(targetConnectionId, JSON.stringify(offer));
    } catch (error) {
      console.error("Error in handleStartCall:", error);
      setCallStatus("idle");
      alert("Không thể bắt đầu cuộc gọi. Vui lòng thử lại.");
    }
  };

  const handleAcceptCall = async () => {
    console.log("handleAcceptCall triggered", { targetConnectionId });
    if (!signalRClient || !peerConnection || !targetConnectionId) {
      console.log("Not ready to accept call", {
        signalRClient,
        peerConnection,
        targetConnectionId,
      });
      alert("Không thể chấp nhận cuộc gọi vì thiếu thông tin kết nối.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Got local stream for accept", { stream });
      stream.getTracks().forEach((track) => {
        console.log("Adding track to peer connection", { track });
        peerConnection.addTrack(track, stream);
      });
      setLocalStream(stream);
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;

      const myAccountId = accountId;
      const targetAccountId =
        role.toLowerCase() === "listener" ? booking.userId : booking.listenerId;
      console.log("Accepting call", {
        myAccountId,
        targetAccountId,
        targetConnectionId,
      });
      await signalRClient.acceptCall(
        myAccountId,
        targetAccountId,
        targetConnectionId,
      );
      setCallStatus("in_call");
    } catch (error) {
      console.error("Error in handleAcceptCall:", error);
      setCallStatus("idle");
      alert("Không thể chấp nhận cuộc gọi.");
    }
  };

  const handleRejectCall = async () => {
    console.log("handleRejectCall triggered", { targetConnectionId });
    if (!signalRClient || !targetConnectionId) {
      console.log("Not ready to reject call", {
        signalRClient,
        targetConnectionId,
      });
      alert("Không thể từ chối cuộc gọi vì thiếu thông tin kết nối.");
      return;
    }

    try {
      const myAccountId = accountId;
      const targetAccountId =
        role.toLowerCase() === "listener" ? booking.userId : booking.listenerId;
      console.log("Rejecting call", {
        targetAccountId,
        myAccountId,
        targetConnectionId,
      });
      await signalRClient.rejectCall(
        targetAccountId,
        myAccountId,
        targetConnectionId,
      );
      setCallStatus("idle");
    } catch (error) {
      console.error("Error in handleRejectCall:", error);
      alert("Không thể từ chối cuộc gọi.");
    }
  };

  const handleEndCall = async () => {
    console.log("handleEndCall triggered", { targetConnectionId });
    if (signalRClient && targetConnectionId) {
      const myConnectionId = signalRClient.connection.connectionId;
      const myAccountId = accountId;
      const targetAccountId =
        role.toLowerCase() === "listener" ? booking.userId : booking.listenerId;
      console.log("Ending call", {
        myConnectionId,
        myAccountId,
        targetAccountId,
      });
      await cleanupCall(myConnectionId, myAccountId, targetAccountId);
    }
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
    isSignalRConnected,
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
                  disabled={!isSignalRConnected} // Disable until connected
                >
                  <FaPhoneAlt /> Tham gia cuộc gọi
                </button>
              )}
              {callStatus === "ready_to_call" && (
                <div>
                  <button
                    onClick={handleStartCall}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 py-2 font-medium text-white hover:bg-green-600"
                    disabled={!targetConnectionId}
                  >
                    <FaPhoneAlt /> Gọi{" "}
                    {role.toLowerCase() !== "listener"
                      ? "người lắng nghe"
                      : "người đặt lịch hẹn"}
                  </button>
                  <p className="mt-2 text-center text-sm text-gray-500">
                    {targetConnectionId
                      ? "Người khác đã tham gia."
                      : "Đang chờ người khác tham gia..."}
                  </p>
                </div>
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
                    onClick={handleRejectCall}
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
                      : "Đang tham gia..."}
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
