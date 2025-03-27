import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { initSignalR } from "../../utils/signalR";
import { initWebRTC, startCall } from "../../utils/webRTC";
import axiosInstance from "../../config/axios";
import { toast } from "react-toastify";

// Global variable for call duration
const CALL_DURATION_MINUTES = 15;
const CALL_DURATION_SECONDS = CALL_DURATION_MINUTES * 60; // Convert to seconds
const CALL_DURATION_MS = CALL_DURATION_SECONDS * 1000; // Convert to milliseconds

const Call = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const { accountId } = storedUser ? JSON.parse(storedUser) : null;
  const [user, setUser] = useState(null);
  const [callStatus, setCallStatus] = useState("Waiting for a match...");
  const [connection, setConnection] = useState(null);
  const [targetConnectionId, setTargetConnectionId] = useState(null);
  const [incomingCallerId, setIncomingCallerId] = useState(null);
  const [micMuted, setMicMuted] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [inputDevices, setInputDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);
  const [selectedInput, setSelectedInput] = useState("");
  const [selectedOutput, setSelectedOutput] = useState("");
  const [callTimer, setCallTimer] = useState(null);
  const [remainingTime, setRemainingTime] = useState(CALL_DURATION_SECONDS); // Use global variable
  const [countdownInterval, setCountdownInterval] = useState(null);
  const [showOneMinuteWarning, setShowOneMinuteWarning] = useState(false);

  let pc = null; // Local peer connection variable

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axiosInstance.get(
          `/user/account/${accountId}`,
        );
        if (userResponse.data.status === "200") {
          setUser(userResponse.data.data);
        } else {
          console.error(userResponse.data.message);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchData();
  }, [accountId]);

  useEffect(() => {
    console.log("Initializing SignalR...");
    const signalRConn = initSignalR({
      onRandomUserSelected: (targetId) => {
        setTargetConnectionId(targetId);
        setCallStatus("User found, starting call...");
        signalRConn
          .invoke("StartCall", targetId)
          .catch((err) => console.error("StartCall invocation failed:", err));
      },
      onNoAvailableUsers: () => {
        setCallStatus("No available users");
      },
      onIncomingCall: (callerId) => {
        setIncomingCallerId(callerId);
        setCallStatus("Incoming call...");
      },
      onCallAccepted: (acceptedTargetId) => {
        setTargetConnectionId(acceptedTargetId);
        setCallStatus("Call connected!");
        console.log("Starting call with local pc:", pc);
        if (pc) {
          startCall(pc, signalRConn, acceptedTargetId).then((stream) => {
            setAudioStream(stream);
          });
        } else {
          console.error("pc is null, cannot start call");
          setCallStatus("Error: Call setup failed");
        }
      },
      onCallRejected: () => {
        setCallStatus("Call rejected, waiting for a match...");
        setTargetConnectionId(null);
      },
      onCallEnded: () => {
        setCallStatus("Call ended, waiting for a match...");
        setTargetConnectionId(null);
        cleanupCall();
      },
      onReceiveOffer: async (callerId, offer) => {
        try {
          console.log("Handling offer with pc:", pc);
          await pc.setRemoteDescription(
            new RTCSessionDescription(JSON.parse(offer)),
          );
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          signalRConn
            .invoke("SendAnswer", callerId, JSON.stringify(answer))
            .catch((err) =>
              console.error("SendAnswer invocation failed:", err),
            );
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      },
      onReceiveAnswer: async (callerId, answer) => {
        try {
          console.log("Handling answer with pc:", pc);
          await pc.setRemoteDescription(
            new RTCSessionDescription(JSON.parse(answer)),
          );
        } catch (error) {
          console.error("Error handling answer:", error);
        }
      },
      onReceiveCandidate: async (callerId, candidate) => {
        try {
          console.log("Handling candidate with pc:", pc);
          await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
        } catch (error) {
          console.error("Error handling candidate:", error);
        }
      },
    });
    setConnection(signalRConn);

    console.log("Initializing WebRTC...");
    pc = initWebRTC({
      onIceCandidate: (candidate) => {
        if (targetConnectionId) {
          signalRConn
            .invoke(
              "SendCandidate",
              targetConnectionId,
              JSON.stringify(candidate),
            )
            .catch((err) =>
              console.error("SendCandidate invocation failed:", err),
            );
        }
      },
      onTrack: (event) => {
        const audio = document.createElement("audio");
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        if (selectedOutput) audio.setSinkId(selectedOutput);
        document.body.appendChild(audio);
        setCallStatus("Connected!");
      },
    });
    console.log("WebRTC initialized with pc:", pc);

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const inputs = devices.filter((d) => d.kind === "audioinput");
      const outputs = devices.filter((d) => d.kind === "audiooutput");
      setInputDevices(inputs);
      setOutputDevices(outputs);
      setSelectedInput(inputs[0]?.deviceId || "");
      setSelectedOutput(outputs[0]?.deviceId || "");
    });

    return () => {
      console.log("Cleaning up...");
      signalRConn.stop();
      cleanupCall();
      if (callTimer) clearTimeout(callTimer);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, []);

  // Start timer and countdown when call connects (for normal users)
  useEffect(() => {
    if (
      callStatus === "Connected!" &&
      user?.userInfo?.premium?.type === "normal"
    ) {
      console.log(
        `Starting ${CALL_DURATION_MINUTES}-minute timer for normal user...`,
      );
      setRemainingTime(CALL_DURATION_SECONDS); // Use global variable
      setShowOneMinuteWarning(false);

      // Start countdown timer
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          const newTime = prev - 1;
          if (newTime === 60 && !showOneMinuteWarning) {
            toast.warn(
              "You have 1 minute left in your call. Upgrade to premium for unlimited time!",
              {
                position: "top-center",
                autoClose: 5000,
              },
            );
            setShowOneMinuteWarning(true);
          }
          return newTime;
        });
      }, 1000);
      setCountdownInterval(interval);

      // End call after the duration
      const timer = setTimeout(() => {
        handleEndCall();
        toast.info(
          <div>
            <p>
              Your {CALL_DURATION_MINUTES}-minute call limit has been reached.
            </p>
            <button
              className="mt-2 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
              onClick={() => navigate("/premium")}
            >
              Upgrade to Premium
            </button>
          </div>,
          {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
          },
        );
      }, CALL_DURATION_MS); // Use global variable
      setCallTimer(timer);
    }

    return () => {
      if (callTimer) {
        console.log("Clearing call timer...");
        clearTimeout(callTimer);
      }
      if (countdownInterval) {
        console.log("Clearing countdown interval...");
        clearInterval(countdownInterval);
      }
    };
  }, [callStatus, user, navigate]);

  const cleanupCall = () => {
    if (pc) {
      pc.close();
      pc = null;
    }
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      setAudioStream(null);
    }
    document.querySelectorAll("audio").forEach((audio) => audio.remove());
    if (callTimer) {
      clearTimeout(callTimer);
      setCallTimer(null);
    }
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    setRemainingTime(CALL_DURATION_SECONDS); // Reset to global variable
    setShowOneMinuteWarning(false);
  };

  const handleFindMatch = () => {
    if (connection) {
      console.log("Invoking GetRandomUser...");
      setCallStatus("Finding a match...");
      connection
        .invoke("GetRandomUser")
        .catch((err) => console.error("GetRandomUser invocation failed:", err));
    }
  };

  const handleAcceptCall = () => {
    if (connection && incomingCallerId) {
      console.log("Accepting call from:", incomingCallerId);
      connection
        .invoke("AcceptCall", incomingCallerId)
        .catch((err) => console.error("AcceptCall invocation failed:", err));
      setIncomingCallerId(null);
    }
  };

  const handleRejectCall = () => {
    if (connection && incomingCallerId) {
      console.log("Rejecting call from:", incomingCallerId);
      connection
        .invoke("RejectCall", incomingCallerId)
        .catch((err) => console.error("RejectCall invocation failed:", err));
      setIncomingCallerId(null);
    }
  };

  const handleEndCall = () => {
    if (connection) {
      console.log("Ending call...");
      connection
        .invoke("EndCall")
        .catch((err) => console.error("EndCall invocation failed:", err));
      cleanupCall();
      setCallStatus("Waiting for a match...");
      setTargetConnectionId(null);
    }
  };

  const toggleMic = () => {
    if (audioStream) {
      audioStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setMicMuted(!micMuted);
    }
  };

  const handleDeviceChange = async () => {
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedInput ? { exact: selectedInput } : undefined,
        },
      });
      setAudioStream(stream);
      if (pc) {
        pc.getSenders().forEach((sender) => {
          sender.replaceTrack(stream.getAudioTracks()[0]);
        });
      }
      document.querySelectorAll("audio").forEach((audio) => {
        if (selectedOutput) audio.setSinkId(selectedOutput);
      });
    } catch (error) {
      console.error("Error updating audio devices:", error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
      <div className="flex h-full w-full flex-col items-center justify-center bg-white p-6">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">
          Random Audio Call
        </h1>
        <p className="mb-6 text-xl text-gray-600">{callStatus}</p>
        {user?.userInfo?.premium?.type === "normal" &&
          callStatus === "Connected!" && (
            <div className="mb-4 text-center">
              <p className="text-sm text-red-500">
                You are on a normal plan. Your call will end after{" "}
                {CALL_DURATION_MINUTES} minutes. Upgrade to premium for
                unlimited calls!
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Time remaining:{" "}
                <span className="font-semibold">
                  {formatTime(remainingTime)}
                </span>
              </p>
            </div>
          )}
        {!incomingCallerId && callStatus !== "Connected!" && (
          <button
            className="rounded-lg bg-blue-500 px-6 py-3 text-lg text-white hover:bg-blue-600 disabled:bg-gray-400"
            onClick={handleFindMatch}
            disabled={!connection}
          >
            Find a Match
          </button>
        )}
        {incomingCallerId && (
          <div className="flex space-x-4">
            <button
              className="rounded-lg bg-green-500 px-6 py-3 text-lg text-white hover:bg-green-600"
              onClick={handleAcceptCall}
            >
              Accept Call
            </button>
            <button
              className="rounded-lg bg-red-500 px-6 py-3 text-lg text-white hover:bg-red-600"
              onClick={handleRejectCall}
            >
              Reject Call
            </button>
          </div>
        )}
        {callStatus === "Connected!" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-4">
              <button onClick={toggleMic} className="text-2xl">
                {micMuted ? "🔇" : "🎤"}
              </button>
              <button
                className="rounded-lg bg-red-500 px-6 py-3 text-lg text-white hover:bg-red-600"
                onClick={handleEndCall}
              >
                End Call
              </button>
            </div>
            <div className="flex flex-col space-y-2">
              <select
                value={selectedInput}
                onChange={(e) => setSelectedInput(e.target.value)}
                className="rounded border p-2"
              >
                {inputDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || "Microphone"}
                  </option>
                ))}
              </select>
              <select
                value={selectedOutput}
                onChange={(e) => setSelectedOutput(e.target.value)}
                className="rounded border p-2"
              >
                {outputDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || "Speaker"}
                  </option>
                ))}
              </select>
              <button
                onClick={handleDeviceChange}
                className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Apply Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Call;
