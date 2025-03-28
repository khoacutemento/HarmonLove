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
    .withUrl("https://harmon.love/callhub")
    .withAutomaticReconnect()
    .build();

  connection
    .start()
    .then(() => console.log("SignalR connected successfully"))
    .catch((err) => console.error("SignalR connection failed:", err));

  // Existing hub event handlers
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

  // New booking-related handlers
  connection.on("ConnectedForBooking", (success) => {
    console.log("Connected for booking:", success);
    onConnectedForBooking(success);
  });
  connection.on("GetUserForBooking", (targetConnectionId) => {
    console.log("Got user for booking:", targetConnectionId);
    onGetUserForBooking(targetConnectionId);
  });
  connection.on("UserNotConnectedForBooking", () => {
    console.log("Other user not connected for booking");
    onUserNotConnectedForBooking();
  });

  connection.onclose((err) => console.log("SignalR connection closed:", err));

  return connection;
};
