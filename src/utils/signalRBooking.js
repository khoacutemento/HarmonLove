import * as signalR from "@microsoft/signalr";

export const initSignalR = ({
  onIncomingCall,
  onCallAccepted,
  onCallRejected,
  onCallEnded,
  onReceiveOffer,
  onReceiveAnswer,
  onReceiveCandidate,
  onGetUserForBooking,
  onNoAvailableUsers,
  onConnectedForBooking, // Optional callback for connection success
}) => {
  console.log("Setting up SignalR connection for CallBookingHub...");

  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://harmon.love/callBookingHub", {
      accessTokenFactory: async () => {
        const token = localStorage.getItem("token");
        console.log("Fetching token from localStorage:", { token });
        if (!token) {
          console.error("No token found in localStorage");
          throw new Error("No token found in localStorage");
        }
        return token;
      },
    })
    .withAutomaticReconnect([0, 2000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Information)
    .build();

  // Start the connection and trigger onConnectedForBooking
  connection
    .start()
    .then(() => {
      console.log("SignalR connected successfully:", {
        connectionId: connection.connectionId,
      });
      if (onConnectedForBooking) {
        onConnectedForBooking(connection.connectionId);
      }
    })
    .catch((err) => console.error("SignalR connection failed:", err));

  // Event handlers aligned with backend SendAsync calls
  connection.on("IncomingCall", (callerConnectionId) => {
    console.log("IncomingCall received:", { callerConnectionId });
    if (onIncomingCall) onIncomingCall(callerConnectionId);
  });

  connection.on("CallAccepted", (targetConnectionId) => {
    console.log("CallAccepted received:", { targetConnectionId });
    if (onCallAccepted) onCallAccepted(targetConnectionId);
  });

  connection.on("CallRejected", () => {
    console.log("CallRejected received");
    if (onCallRejected) onCallRejected();
  });

  connection.on("CallEnded", () => {
    console.log("CallEnded received");
    if (onCallEnded) onCallEnded();
  });

  connection.on("ReceiveOffer", (callerConnectionId, offer) => {
    console.log("ReceiveOffer received:", { callerConnectionId, offer });
    if (onReceiveOffer) onReceiveOffer(callerConnectionId, offer);
  });

  connection.on("ReceiveAnswer", (callerConnectionId, answer) => {
    console.log("ReceiveAnswer received:", { callerConnectionId, answer });
    if (onReceiveAnswer) onReceiveAnswer(callerConnectionId, answer);
  });

  connection.on("ReceiveCandidate", (callerConnectionId, candidate) => {
    console.log("ReceiveCandidate received:", {
      callerConnectionId,
      candidate,
    });
    if (onReceiveCandidate) onReceiveCandidate(callerConnectionId, candidate);
  });

  connection.on("UserSelected", (targetConnectionId) => {
    console.log("UserSelected received:", { targetConnectionId });
    if (onGetUserForBooking) onGetUserForBooking(targetConnectionId);
  });

  connection.on("NoAvailableUsers", () => {
    console.log("NoAvailableUsers received");
    if (onNoAvailableUsers) onNoAvailableUsers();
  });

  // Reconnection and closure handling
  connection.onreconnecting((err) => {
    console.log("SignalR reconnecting:", { error: err });
  });

  connection.onreconnected(() => {
    console.log("SignalR reconnected successfully:", {
      connectionId: connection.connectionId,
    });
    if (onConnectedForBooking) {
      onConnectedForBooking(connection.connectionId);
    }
  });

  connection.onclose((err) => {
    console.log("SignalR connection closed:", { error: err });
  });

  // Exposed API for invoking hub methods
  return {
    connection,
    getUserForBooking: (accountId) => {
      console.log("Invoking GetUserForBooking:", { accountId });
      return connection
        .invoke("GetUserForBooking", accountId)
        .then(() => console.log("GetUserForBooking invoked successfully"))
        .catch((err) => {
          console.error("GetUserForBooking failed:", err);
          throw err;
        });
    },
    startCall: (targetConnectionId) => {
      console.log("Invoking StartCall:", { targetConnectionId });
      return connection
        .invoke("StartCall", targetConnectionId)
        .then(() => console.log("StartCall invoked successfully"))
        .catch((err) => {
          console.error("StartCall failed:", err);
          throw err;
        });
    },
    acceptCall: (accountId1, callerConnectionId) => {
      console.log("Invoking AcceptCall:", { accountId1, callerConnectionId });
      return connection
        .invoke("AcceptCall", accountId1, callerConnectionId)
        .then(() => console.log("AcceptCall invoked successfully"))
        .catch((err) => {
          console.error("AcceptCall failed:", err);
          throw err;
        });
    },
    rejectCall: (accountId1, callerConnectionId, accountId) => {
      console.log("Invoking RejectCall:", {
        accountId1,
        callerConnectionId,
        accountId2: accountId,
      });
      return connection
        .invoke("RejectCall", accountId1, callerConnectionId, accountId)
        .then(() => console.log("RejectCall invoked successfully"))
        .catch((err) => {
          console.error("RejectCall failed:", err);
          throw err;
        });
    },
    endCall: (accountId1, callerConnectionId) => {
      console.log("Invoking EndCall:", { accountId1, callerConnectionId });
      return connection
        .invoke("EndCall", accountId1, callerConnectionId)
        .then(() => console.log("EndCall invoked successfully"))
        .catch((err) => {
          console.error("EndCall failed:", err);
          throw err;
        });
    },
    sendOffer: (targetConnectionId, offer) => {
      console.log("Invoking SendOffer:", { targetConnectionId, offer });
      return connection
        .invoke("SendOffer", targetConnectionId, offer)
        .then(() => console.log("SendOffer invoked successfully"))
        .catch((err) => {
          console.error("SendOffer failed:", err);
          throw err;
        });
    },
    sendAnswer: (targetConnectionId, answer) => {
      console.log("Invoking SendAnswer:", { targetConnectionId, answer });
      return connection
        .invoke("SendAnswer", targetConnectionId, answer)
        .then(() => console.log("SendAnswer invoked successfully"))
        .catch((err) => {
          console.error("SendAnswer failed:", err);
          throw err;
        });
    },
    sendCandidate: (targetConnectionId, candidate) => {
      console.log("Invoking SendCandidate:", { targetConnectionId, candidate });
      return connection
        .invoke("SendCandidate", targetConnectionId, candidate)
        .then(() => console.log("SendCandidate invoked successfully"))
        .catch((err) => {
          console.error("SendCandidate failed:", err);
          throw err;
        });
    },
  };
};
