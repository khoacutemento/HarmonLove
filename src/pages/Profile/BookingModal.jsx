import React, { useEffect, useState, useRef } from "react";
import {
  FaTimes,
  FaPhoneAlt,
  FaPhoneSlash,
  FaHourglassHalf,
  FaStar,
} from "react-icons/fa";
import { initSignalR } from "../../utils/signalRBooking";
import { initWebRTC } from "../../utils/webRTC";
import axiosInstance from "../../config/axios";
import ReviewForm from "./ReviewForm";
import ReviewListener from "./ReviewListener";

const BookingModal = ({ booking, onClose, accountId }) => {
  const storedUser = localStorage.getItem("user");
  const { role } = storedUser ? JSON.parse(storedUser) : { role: null };
  const [signalRClient, setSignalRClient] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [submittedReview, setSubmittedReview] = useState(null); // State to store submitted review
  const [targetConnectionId, setTargetConnectionId] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false); // State to show/hide review form
  const [isSignalRConnected, setIsSignalRConnected] = useState(false);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    const pc = initWebRTC({
      onIceCandidate: (candidate) => {
        if (targetConnectionId) {
          console.log("Sending ICE candidate to:", targetConnectionId);
          signalRClient?.sendCandidate(
            targetConnectionId,
            JSON.stringify(candidate),
          );
        }
      },
      onTrack: (event) => {
        console.log("Received remote track:", event.streams);
        const audio = document.createElement("audio");
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        audio
          .play()
          .catch((err) => console.error("Audio playback error:", err));
        document.body.appendChild(audio);
        console.log("Remote stream tracks:", event.streams[0].getAudioTracks());
        setRemoteStream(event.streams[0]);
      },
    });
    pc.oniceconnectionstatechange = () => {
      console.log("ICE Connection State:", pc.iceConnectionState);
      if (
        pc.iceConnectionState === "connected" ||
        pc.iceConnectionState === "completed"
      ) {
        console.log("ICE connection established, audio should work");
      } else if (pc.iceConnectionState === "failed") {
        console.error("ICE connection failed");
      } else if (pc.iceConnectionState === "disconnected") {
        console.warn("ICE connection disconnected");
      }
    };
    setPeerConnection(pc);
    peerConnectionRef.current = pc;

    const client = initSignalR({
      onConnectedForBooking: (connectionId) => {
        console.log("Connected to SignalR with ID:", connectionId);
        setIsSignalRConnected(true);
      },
      onIncomingCall: (callerConnectionId) => {
        console.log("Incoming call from:", callerConnectionId);
        setCallStatus("incoming_call");
        setTargetConnectionId(callerConnectionId);
      },
      onCallAccepted: (targetId) => {
        console.log("Call accepted with target:", targetId);
        setCallStatus("in_call");
        setTargetConnectionId(targetId);
      },
      onCallRejected: () => {
        console.log("Call rejected");
        setCallStatus("idle");
        alert("Cuộc gọi đã bị từ chối");
        setIsJoined(false);
      },
      onCallEnded: () => {
        console.log("Call ended");
        handleEndCall();
      },
      onReceiveOffer: async (callerId, offer) => {
        const pc = peerConnectionRef.current;
        if (!pc) {
          console.error("PeerConnection is null in onReceiveOffer");
          return;
        }
        try {
          console.log("Handling offer with peerConnection:", pc);
          const parsedOffer = JSON.parse(offer);
          await pc.setRemoteDescription(new RTCSessionDescription(parsedOffer));

          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          console.log(
            "Local stream tracks in onReceiveOffer:",
            stream.getAudioTracks(),
          );
          stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
            console.log("Added local track in onReceiveOffer:", track);
          });
          setLocalStream(stream);
          const localAudio = document.createElement("audio");
          localAudio.srcObject = stream;
          localAudio.autoplay = true; // Unmuted for testing
          document.body.appendChild(localAudio);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          client.sendAnswer(callerId, JSON.stringify(answer));
        } catch (error) {
          console.error("Error in onReceiveOffer:", error);
        }
      },
      onReceiveAnswer: async (callerId, answer) => {
        const pc = peerConnectionRef.current;
        if (!pc) {
          console.error("PeerConnection is null in onReceiveAnswer");
          return;
        }
        try {
          console.log("Handling answer with peerConnection:", pc);
          await pc.setRemoteDescription(
            new RTCSessionDescription(JSON.parse(answer)),
          );
        } catch (error) {
          console.error("Error in onReceiveAnswer:", error);
        }
      },
      onReceiveCandidate: async (callerId, candidate) => {
        const pc = peerConnectionRef.current;
        if (!pc) {
          console.error("PeerConnection is null in onReceiveCandidate");
          return;
        }
        try {
          await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
        } catch (error) {
          console.error("Error in onReceiveCandidate:", error);
        }
      },
      onGetUserForBooking: (targetConnectionId) => {
        console.log("User for booking found:", targetConnectionId);
        setTargetConnectionId(targetConnectionId);
        setCallStatus("ready_to_call");
      },
      onNoAvailableUsers: () => {
        console.log("No available users");
        alert("Không có người dùng nào sẵn sàng. Vui lòng thử lại sau.");
        setCallStatus("idle");
        setIsJoined(false);
      },
    });

    setSignalRClient(client);

    return () => {
      if (signalRClient && isSignalRConnected) {
        const myConnectionId = signalRClient.connection.connectionId;
        const targetAccountId =
          role.toLowerCase() === "listener"
            ? booking.userId
            : booking.listenerId;
        cleanupCall(myConnectionId, accountId, targetAccountId);
      }
    };
  }, [booking, accountId, role]);

  const cleanupCall = (myConnectionId, myAccountId, targetAccountId) => {
    console.log("Cleaning up call:", { myConnectionId, targetAccountId });
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      setPeerConnection(null);
    }
    if (signalRClient && targetConnectionId && callStatus !== "idle") {
      signalRClient.endCall(targetAccountId, targetConnectionId);
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    document.querySelectorAll("audio").forEach((audio) => audio.remove());
    if (signalRClient && isSignalRConnected) {
      signalRClient.connection.stop();
    }
    setSignalRClient(null);
    setTargetConnectionId(null);
    setCallStatus("idle");
    setIsJoined(false);
    setIsSignalRConnected(false);
  };

  const handleJoinCall = async () => {
    if (!signalRClient || !isSignalRConnected) {
      alert("Chưa kết nối được tới server. Vui lòng thử lại.");
      return;
    }
    try {
      setIsJoined(true);
      setCallStatus("joining");
      const targetUserId =
        role.toLowerCase() === "listener" ? booking.userId : booking.listenerId;
      console.log("Joining call with target:", targetUserId);
      await signalRClient.getUserForBooking(targetUserId);
    } catch (error) {
      console.error("Error in handleJoinCall:", error);
      setCallStatus("idle");
      setIsJoined(false);
    }
  };

  const handleStartCall = async () => {
    const pc = peerConnectionRef.current;
    if (!signalRClient || !pc || !targetConnectionId) {
      alert("Chưa sẵn sàng để bắt đầu cuộc gọi.");
      return;
    }
    try {
      setCallStatus("calling");
      await signalRClient.startCall(targetConnectionId);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Local stream tracks:", stream.getAudioTracks());
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
        console.log("Added track:", track);
      });
      setLocalStream(stream);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("Sending offer to:", targetConnectionId);
      await signalRClient.sendOffer(targetConnectionId, JSON.stringify(offer));
    } catch (error) {
      console.error("Error in handleStartCall:", error);
      setCallStatus("idle");
    }
  };

  const handleAcceptCall = async () => {
    const pc = peerConnectionRef.current;
    if (!signalRClient || !pc || !targetConnectionId) {
      alert("Không thể chấp nhận cuộc gọi.");
      return;
    }
    try {
      const callerAccountId =
        role.toLowerCase() === "listener" ? booking.userId : booking.listenerId;
      console.log("Accepting call from:", callerAccountId);
      await signalRClient.acceptCall(callerAccountId, targetConnectionId);
      setCallStatus("in_call");
    } catch (error) {
      console.error("Error in handleAcceptCall:", error);
      setCallStatus("idle");
    }
  };

  const handleRejectCall = async () => {
    if (!signalRClient || !targetConnectionId) {
      alert("Không thể từ chối cuộc gọi.");
      return;
    }
    try {
      const callerAccountId =
        role.toLowerCase() === "listener" ? booking.userId : booking.listenerId;
      console.log("Rejecting call from:", callerAccountId);
      await signalRClient.rejectCall(
        callerAccountId,
        targetConnectionId,
        accountId,
      );
      setCallStatus("idle");
    } catch (error) {
      console.error("Error in handleRejectCall:", error);
    }
  };

  const handleEndCall = async () => {
    if (signalRClient && targetConnectionId) {
      const myConnectionId = signalRClient.connection.connectionId;
      const targetAccountId =
        role.toLowerCase() === "listener" ? booking.userId : booking.listenerId;
      console.log("Ending call with:", targetAccountId);
      cleanupCall(myConnectionId, accountId, targetAccountId);
    }
    onClose();
  };

  const getStatusBadge = (status) => {
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

  const handleOpenReviewForm = () => {
    setShowReviewForm(true);
  };

  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
  };

  const handleReviewSubmit = (review) => {
    setSubmittedReview(review); // Store the submitted review
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">Chi tiết lịch hẹn</h3>
          <button
            onClick={handleEndCall}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {role.toLowerCase() !== "listener"
                ? "Người lắng nghe:"
                : "Người đặt nghe:"}
            </p>
            <p className="text-lg">
              {role.toLowerCase() === "listener"
                ? booking.userName
                : booking.listenerName}
            </p>
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

          {booking.status === "Upcoming" && (
            <div className="space-y-3 pt-4">
              {callStatus === "idle" && !isJoined && (
                <button
                  onClick={handleJoinCall}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 py-2 font-medium text-white hover:bg-blue-600 disabled:bg-gray-400"
                  disabled={!isSignalRConnected}
                >
                  <FaPhoneAlt /> Tham gia cuộc gọi
                </button>
              )}
              {callStatus === "idle" &&
                !isJoined &&
                !submittedReview &&
                role.toLowerCase() !== "listener" && (
                  <button
                    onClick={handleOpenReviewForm}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 py-2 font-medium text-white hover:bg-blue-600 disabled:bg-gray-400"
                    disabled={!isSignalRConnected}
                  >
                    <FaStar /> Đánh Giá Người Lắng Nghe
                  </button>
                )}
              {callStatus === "ready_to_call" && (
                <div>
                  <button
                    onClick={handleStartCall}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 py-2 font-medium text-white hover:bg-green-600 disabled:bg-gray-400"
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
                <div>
                  {/* <button
                    onClick={() => {
                      const audio = document.querySelector("audio");
                      if (audio)
                        audio
                          .play()
                          .catch((err) =>
                            console.error("Manual play error:", err),
                          );
                    }}
                    className="mt-2 rounded bg-blue-500 px-4 py-2 text-white"
                  >
                    Play Audio Manually
                  </button> */}
                  <button
                    onClick={handleEndCall}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 py-2 font-medium text-white hover:bg-red-600"
                  >
                    <FaPhoneSlash /> Kết thúc cuộc gọi
                  </button>
                </div>
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
      {/* Show ReviewForm when the button is clicked */}
      {showReviewForm && (
        <ReviewForm
          bookingId={booking.id}
          listenerName={booking.listenerName}
          onClose={handleCloseReviewForm}
          onSubmit={handleReviewSubmit}
        />
      )}

      {/* Show submitted review if available */}
      {submittedReview && (
        <div className="mt-4">
          <ReviewListener reviewData={submittedReview} />
        </div>
      )}
    </div>
  );
};

export default BookingModal;
