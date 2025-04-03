import * as signalR from "@microsoft/signalr";

export const initSignalR = (handlers) => {
  const token = localStorage.getItem("token");
  console.log("Initializing SignalR with token:", token);

  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://harmon.love/callbookinghub", {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .build();
  console.log("SignalR connection built:", connection);

  // Register event handlers with logging
  connection.on("IncomingCall", (callerConnectionId) => {
    console.log("SignalR Event: IncomingCall received", { callerConnectionId });
    handlers.onIncomingCall(callerConnectionId);
  });
  connection.on("CallAccepted", (targetId) => {
    console.log("SignalR Event: CallAccepted received", { targetId });
    handlers.onCallAccepted(targetId);
  });
  connection.on("CallRejected", () => {
    console.log("SignalR Event: CallRejected received");
    handlers.onCallRejected();
  });
  connection.on("CallEnded", () => {
    console.log("SignalR Event: CallEnded received");
    handlers.onCallEnded();
  });
  connection.on("ReceiveOffer", (callerId, offer) => {
    console.log("SignalR Event: ReceiveOffer received", { callerId, offer });
    handlers.onReceiveOffer(callerId, offer);
  });
  connection.on("ReceiveAnswer", (callerId, answer) => {
    console.log("SignalR Event: ReceiveAnswer received", { callerId, answer });
    handlers.onReceiveAnswer(callerId, answer);
  });
  connection.on("ReceiveCandidate", (callerId, candidate) => {
    console.log("SignalR Event: ReceiveCandidate received", {
      callerId,
      candidate,
    });
    handlers.onReceiveCandidate(callerId, candidate);
  });
  connection.on("UserSelected", (targetConnectionId) => {
    console.log("SignalR Event: UserSelected received", { targetConnectionId });
    handlers.onGetUserForBooking(targetConnectionId);
  });
  connection.on("NoAvailableUsers", () => {
    console.log("SignalR Event: NoAvailableUsers received");
    handlers.onNoAvailableUsers();
  });

  // Helper to ensure connection is started before invoking
  const ensureConnected = async () => {
    if (connection.state !== signalR.HubConnectionState.Connected) {
      console.log("Connection not yet started, attempting to start...", {
        state: connection.state,
      });
      await connection.start();
      console.log("Connection started successfully");
    }
  };

  // Return client with helper methods and logging
  return {
    connection,
    getUserForBooking: async (accountId) => {
      console.log("Invoking GetUserForBooking", { accountId });
      await ensureConnected();
      return connection.invoke("GetUserForBooking", accountId);
    },
    startCall: async (targetId) => {
      console.log("Invoking StartCall", { targetId });
      await ensureConnected();
      return connection.invoke("StartCall", targetId);
    },
    acceptCall: async (myAccountId, targetAccountId, targetId) => {
      console.log("Invoking AcceptCall", {
        myAccountId,
        targetAccountId,
        targetId,
      });
      await ensureConnected();
      return connection.invoke(
        "AcceptCall",
        myAccountId,
        targetAccountId,
        targetId,
      );
    },
    rejectCall: async (accountId1, accountId2, callerConnectionId) => {
      console.log("Invoking RejectCall", {
        accountId1,
        accountId2,
        callerConnectionId,
      });
      await ensureConnected();
      return connection.invoke(
        "RejectCall",
        accountId1,
        accountId2,
        callerConnectionId,
      );
    },
    endCall: async (accountId1, accountId2, callerConnectionId) => {
      console.log("Invoking EndCall", {
        accountId1,
        accountId2,
        callerConnectionId,
      });
      await ensureConnected();
      return connection.invoke(
        "EndCall",
        accountId1,
        accountId2,
        callerConnectionId,
      );
    },
    sendOffer: async (targetId, offer) => {
      console.log("Invoking SendOffer", { targetId, offer });
      await ensureConnected();
      return connection.invoke("SendOffer", targetId, offer);
    },
    sendAnswer: async (targetId, answer) => {
      console.log("Invoking SendAnswer", { targetId, answer });
      await ensureConnected();
      return connection.invoke("SendAnswer", targetId, answer);
    },
    sendCandidate: async (targetId, candidate) => {
      console.log("Invoking SendCandidate", { targetId, candidate });
      await ensureConnected();
      return connection.invoke("SendCandidate", targetId, candidate);
    },
  };
};
