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
    .withUrl("https://harmon.love/callhub") // Your provided URL
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information) // Added logging for better debugging
    .build();

  connection
    .start()
    .then(() => console.log("SignalR connected successfully"))
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

  // Booking-related handlers adjusted to backend
  connection.on("UserSelected", (targetConnectionId) => {
    console.log("Got user for booking:", targetConnectionId);
    if (onGetUserForBooking) onGetUserForBooking(targetConnectionId);
  });

  // Note: Backend doesn’t send "ConnectedForBooking" or "UserNotConnectedForBooking"
  // Simulate onConnectedForBooking via promise resolution in frontend
  // Add UserNotConnectedForBooking logic if backend is updated

  connection.onclose((err) => console.log("SignalR connection closed:", err));

  return connection;
};
