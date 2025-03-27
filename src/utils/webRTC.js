export const initWebRTC = ({ onIceCandidate, onTrack }) => {
  console.log("Initializing RTCPeerConnection...");
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("ICE Candidate generated:", event.candidate);
      onIceCandidate(event.candidate);
    }
  };

  peerConnection.ontrack = (event) => {
    console.log("Track event received:", event);
    onTrack(event);
  };

  peerConnection.oniceconnectionstatechange = () => {
    console.log("ICE Connection State:", peerConnection.iceConnectionState);
  };

  return peerConnection;
};

export const startCall = async (
  peerConnection,
  signalRConnection,
  targetConnectionId,
) => {
  console.log("Starting call with target:", targetConnectionId);
  if (!peerConnection) {
    console.error("peerConnection is null, cannot start call");
    return null;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("Local audio stream obtained:", stream);
    stream.getTracks().forEach((track) => {
      console.log("Adding track to peer connection:", track);
      peerConnection.addTrack(track, stream);
    });

    const offer = await peerConnection.createOffer();
    console.log("Offer created:", offer);
    await peerConnection.setLocalDescription(offer);
    console.log("Local description set with offer");
    signalRConnection
      .invoke("SendOffer", targetConnectionId, JSON.stringify(offer))
      .catch((err) => console.error("SendOffer invocation failed:", err));
    return stream; // Return stream for mute control
  } catch (error) {
    console.error("Error starting call:", error);
    return null;
  }
};
