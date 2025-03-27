import * as signalR from "@microsoft/signalr";

const SERVER_URL = "http://localhost:7183/callhub"; // Địa chỉ Backend

const hubConnection = new signalR.HubConnectionBuilder()
  .withUrl(SERVER_URL)
  .withAutomaticReconnect()
  .build();

export const startConnection = async () => {
  console.log("🔍 Gọi startConnection() với trạng thái:", hubConnection.state);

  if (
    hubConnection.state === signalR.HubConnectionState.Connected ||
    hubConnection.state === signalR.HubConnectionState.Connecting
  ) {
    console.warn("⚠️ SignalR đã kết nối hoặc đang kết nối, không gọi lại.");
    return;
  }

  try {
    await hubConnection.start();
    console.log("✅ SignalR Connected.");
  } catch (err) {
    console.error("❌ SignalR Connection Error:", err);
  }
};

// Bắt đầu cuộc gọi
export const callUser = async () => {
  await hubConnection.invoke("StartCall");
};

// Chấp nhận cuộc gọi
export const acceptCall = async (callerId) => {
  await hubConnection.invoke("AcceptCall", callerId);
};

// Từ chối cuộc gọi
export const rejectCall = async (callerId) => {
  await hubConnection.invoke("RejectCall", callerId);
};

// Sự kiện nhận cuộc gọi đến
hubConnection.on("IncomingCall", (callerId) => {
  console.log(`📞 Cuộc gọi đến từ: ${callerId}`);
});

// Xử lý khi cuộc gọi được chấp nhận
hubConnection.on("CallAccepted", (targetId) => {
  console.log(`🔗 Kết nối với ${targetId}`);
});

// Xử lý khi cuộc gọi bị từ chối
hubConnection.on("CallRejected", () => {
  console.log("❌ Cuộc gọi bị từ chối");
});

hubConnection.on("CallEnded", () => {
  console.log("📴 Cuộc gọi đã kết thúc");
});

export default hubConnection;
