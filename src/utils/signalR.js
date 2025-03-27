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
}) => {
  console.log("Setting up SignalR connection...");
  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://harmon.love/callhub") // From your logs
    .withAutomaticReconnect()
    .build();

  connection
    .start()
    .then(() => console.log("SignalR connected successfully"))
    .catch((err) => console.error("SignalR connection failed:", err));

  // Register hub event handlers based on backend methods
  connection.on("RandomUserSelected", (targetConnectionId) => {
    console.log("Random user selected:", targetConnectionId);
    onRandomUserSelected(targetConnectionId);
  });
  connection.on("NoAvailableUsers", () => {
    console.log("No available users found");
    onNoAvailableUsers();
  });
  connection.on("IncomingCall", (callerConnectionId) => {
    console.log("Incoming call from:", callerConnectionId);
    onIncomingCall(callerConnectionId);
  });
  connection.on("CallAccepted", (targetConnectionId) => {
    console.log("Call accepted by:", targetConnectionId);
    onCallAccepted(targetConnectionId);
  });
  connection.on("CallRejected", () => {
    console.log("Call rejected");
    onCallRejected();
  });
  connection.on("CallEnded", () => {
    console.log("Call ended");
    onCallEnded();
  });
  connection.on("ReceiveOffer", (callerConnectionId, offer) => {
    console.log("Received offer from:", callerConnectionId, offer);
    onReceiveOffer(callerConnectionId, offer);
  });
  connection.on("ReceiveAnswer", (callerConnectionId, answer) => {
    console.log("Received answer from:", callerConnectionId, answer);
    onReceiveAnswer(callerConnectionId, answer);
  });
  connection.on("ReceiveCandidate", (callerConnectionId, candidate) => {
    console.log("Received candidate from:", callerConnectionId, candidate);
    onReceiveCandidate(callerConnectionId, candidate);
  });

  connection.onclose((err) => console.log("SignalR connection closed:", err));

  return connection;
};
