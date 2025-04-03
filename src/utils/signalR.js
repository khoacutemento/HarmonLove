import * as signalR from "@microsoft/signalr";

export const initSignalR = ({
  onRandomUserSelected,
  onNoAvailableUsers,
  onIncomingCall,
  onCallAccepted,
  onCallRejected,
  onCallEnded,
  onReceiveOffer,
  onReceiveAnswer,
  onReceiveCandidate,
  onConnectedForBooking,
  onGetUserForBooking,
  onUserNotConnectedForBooking,
}) => {
  console.log("Setting up SignalR connection...");

  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://harmon.love/callhub", {
      accessTokenFactory: async () => {
        const token = localStorage.getItem("token"); // Retrieve token from localStorage
        if (!token) {
          throw new Error("No token found in localStorage");
        }
        return token; // Automatically appends token to the query string
      },
    })
    .withAutomaticReconnect([0, 2000, 10000, 30000]) // Custom retry delays
    .configureLogging(signalR.LogLevel.Information)
    .build();

  // Start the connection and simulate onConnectedForBooking
  connection
    .start()
    .then(() => {
      console.log("SignalR connected successfully");
      if (onConnectedForBooking) {
        onConnectedForBooking(connection.connectionId);
      }
    })
    .catch((err) => console.error("SignalR connection failed:", err));

  // Event handlers aligned with backend SendAsync calls
  connection.on("RandomUserSelected", (targetConnectionId) => {
    console.log("Random user selected:", targetConnectionId);
    if (onRandomUserSelected) onRandomUserSelected(targetConnectionId);
  });

  connection.on("NoAvailableUsers", () => {
    console.log("No available users found");
    if (onNoAvailableUsers) onNoAvailableUsers();
  });

  connection.on("IncomingCall", (callerConnectionId) => {
    console.log("Incoming call from:", callerConnectionId);
    if (onIncomingCall) onIncomingCall(callerConnectionId);
  });

  connection.on("CallAccepted", (targetConnectionId) => {
    console.log("Call accepted by:", targetConnectionId);
    if (onCallAccepted) onCallAccepted(targetConnectionId);
  });

  connection.on("CallRejected", () => {
    console.log("Call rejected");
    if (onCallRejected) onCallRejected();
  });

  connection.on("CallEnded", () => {
    console.log("Call ended");
    if (onCallEnded) onCallEnded();
  });

  connection.on("ReceiveOffer", (callerConnectionId, offer) => {
    console.log("Received offer from:", callerConnectionId, offer);
    if (onReceiveOffer) onReceiveOffer(callerConnectionId, offer);
  });

  connection.on("ReceiveAnswer", (callerConnectionId, answer) => {
    console.log("Received answer from:", callerConnectionId, answer);
    if (onReceiveAnswer) onReceiveAnswer(callerConnectionId, answer);
  });

  connection.on("ReceiveCandidate", (callerConnectionId, candidate) => {
    console.log("Received candidate from:", callerConnectionId, candidate);
    if (onReceiveCandidate) onReceiveCandidate(callerConnectionId, candidate);
  });

  connection.on("UserSelected", (targetConnectionId) => {
    console.log("Got user for booking:", targetConnectionId);
    if (onGetUserForBooking) onGetUserForBooking(targetConnectionId);
  });

  // Reconnection and closure handling
  connection.onreconnecting((err) => {
    console.log("SignalR reconnecting:", err);
  });

  connection.onreconnected(() => {
    console.log("SignalR reconnected successfully");
    if (onConnectedForBooking) {
      onConnectedForBooking(connection.connectionId);
    }
  });

  connection.onclose((err) => {
    console.log("SignalR connection closed:", err);
  });

  // Exposed API for invoking hub methods
  return {
    connection,
    getRandomUser: () =>
      connection
        .invoke("GetRandomUser")
        .catch((err) => console.error("GetRandomUser failed:", err)),
    getUserForBooking: (accountId) =>
      connection
        .invoke("GetUserForBooking", accountId)
        .catch((err) => console.error("GetUserForBooking failed:", err)),
    startCall: (targetConnectionId) =>
      connection
        .invoke("StartCall", targetConnectionId)
        .catch((err) => console.error("StartCall failed:", err)),
    acceptCall: (callerConnectionId) =>
      connection
        .invoke("AcceptCall", callerConnectionId)
        .catch((err) => console.error("AcceptCall failed:", err)),
    rejectCall: (callerConnectionId) =>
      connection
        .invoke("RejectCall", callerConnectionId)
        .catch((err) => console.error("RejectCall failed:", err)),
    endCall: (callerConnectionId, targetConnectionId) =>
      connection
        .invoke("EndCall", callerConnectionId, targetConnectionId)
        .catch((err) => console.error("EndCall failed:", err)),
    sendOffer: (targetConnectionId, offer) =>
      connection
        .invoke("SendOffer", targetConnectionId, offer)
        .catch((err) => console.error("SendOffer failed:", err)),
    sendAnswer: (targetConnectionId, answer) =>
      connection
        .invoke("SendAnswer", targetConnectionId, answer)
        .catch((err) => console.error("SendAnswer failed:", err)),
    sendCandidate: (targetConnectionId, candidate) =>
      connection
        .invoke("SendCandidate", targetConnectionId, candidate)
        .catch((err) => console.error("SendCandidate failed:", err)),
  };
};
