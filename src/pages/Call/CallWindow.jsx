import React, { useState, useEffect } from "react";
import { initWebRTC, startCall } from "../../utils/webRTC";

const CallWindow = () => {
  const [callStatus, setCallStatus] = useState("Finding a match...");
  const [targetConnectionId, setTargetConnectionId] = useState(null);
  const [incomingCallerId, setIncomingCallerId] = useState(null);
  const [micMuted, setMicMuted] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [inputDevices, setInputDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);
  const [selectedInput, setSelectedInput] = useState("");
  const [selectedOutput, setSelectedOutput] = useState("");

  let pc = null; // Local WebRTC peer connection

  useEffect(() => {
    // Initialize WebRTC
    pc = initWebRTC({
      onIceCandidate: (candidate) => {
        if (targetConnectionId) {
          window.opener.postMessage(
            {
              type: "sendCandidate",
              targetConnectionId,
              candidate: JSON.stringify(candidate),
            },
            "*",
          );
        }
      },
      onTrack: (event) => {
        const audio = document.createElement("audio");
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        audio.muted = speakerMuted;
        document.body.appendChild(audio);
        setCallStatus("Connected!");
      },
    });

    // Get audio devices
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const inputs = devices.filter((d) => d.kind === "audioinput");
      const outputs = devices.filter((d) => d.kind === "audiooutput");
      setInputDevices(inputs);
      setOutputDevices(outputs);
      setSelectedInput(inputs[0]?.deviceId || "");
      setSelectedOutput(outputs[0]?.deviceId || "");
    });

    // Handle messages from main window
    const handleMessage = (event) => {
      const { type, targetId, callerId, offer, answer, candidate } = event.data;
      switch (type) {
        case "startCall":
          setTargetConnectionId(targetId);
          setCallStatus("User found, starting call...");
          startCall(
            pc,
            { invoke: window.opener.postMessage.bind(window.opener) },
            targetId,
          );
          break;
        case "incomingCall":
          setIncomingCallerId(callerId);
          setCallStatus("Incoming call...");
          break;
        case "callAccepted":
          setTargetConnectionId(targetId);
          setCallStatus("Call connected!");
          startCall(
            pc,
            { invoke: window.opener.postMessage.bind(window.opener) },
            targetId,
          );
          break;
        case "callRejected":
          setCallStatus("Call rejected");
          setTargetConnectionId(null);
          break;
        case "callEnded":
          setCallStatus("Call ended");
          setTargetConnectionId(null);
          window.close();
          break;
        case "receiveOffer":
          pc.setRemoteDescription(
            new RTCSessionDescription(JSON.parse(offer)),
          ).then(() => {
            pc.createAnswer().then((answer) => {
              pc.setLocalDescription(answer);
              window.opener.postMessage(
                {
                  type: "sendAnswer",
                  targetConnectionId: callerId,
                  answer: JSON.stringify(answer),
                },
                "*",
              );
            });
          });
          break;
        case "receiveAnswer":
          pc.setRemoteDescription(
            new RTCSessionDescription(JSON.parse(answer)),
          );
          break;
        case "receiveCandidate":
          pc.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate)));
          break;
        case "noUsers":
          setCallStatus("No available users");
          break;
      }
    };
    window.addEventListener("message", handleMessage);

    // Sync with localStorage
    const storedState = JSON.parse(localStorage.getItem("callState") || "{}");
    setCallStatus(storedState.status || "Finding a match...");

    return () => {
      window.removeEventListener("message", handleMessage);
      if (pc) pc.close();
    };
  }, []);

  const handleAcceptCall = () => {
    window.opener.postMessage(
      { type: "acceptCall", callerId: incomingCallerId },
      "*",
    );
    setIncomingCallerId(null);
  };

  const handleRejectCall = () => {
    window.opener.postMessage(
      { type: "rejectCall", callerId: incomingCallerId },
      "*",
    );
    setIncomingCallerId(null);
  };

  const handleEndCall = () => {
    window.opener.postMessage({ type: "endCall" }, "*");
    window.close();
  };

  const toggleMic = () => {
    if (audioStream) {
      audioStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setMicMuted(!micMuted);
    }
  };

  const toggleSpeaker = () => {
    document
      .querySelectorAll("audio")
      .forEach((audio) => (audio.muted = !audio.muted));
    setSpeakerMuted(!speakerMuted);
  };

  const handleDeviceChange = async () => {
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: selectedInput ? { exact: selectedInput } : undefined },
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
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Call Window</h1>
      <p className="mb-6 text-lg text-gray-600">{callStatus}</p>
      {incomingCallerId && (
        <div className="flex space-x-4">
          <button
            className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            onClick={handleAcceptCall}
          >
            Accept
          </button>
          <button
            className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            onClick={handleRejectCall}
          >
            Reject
          </button>
        </div>
      )}
      {callStatus === "Connected!" && (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-4">
            <button onClick={toggleMic} className="text-2xl">
              {micMuted ? "🔇" : "🎤"}
            </button>
            <button onClick={toggleSpeaker} className="text-2xl">
              {speakerMuted ? "🔈" : "🔊"}
            </button>
            <button onClick={handleEndCall} className="text-2xl">
              📞
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
              Apply Device Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallWindow;
