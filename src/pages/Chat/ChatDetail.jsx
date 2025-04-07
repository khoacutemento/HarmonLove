import React, { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { useParams } from "react-router-dom";

const ChatDetail = () => {
  const { friendId } = useParams();
  const storedUserToken = localStorage.getItem("token");
  const [connection, setConnection] = useState(null);
  const [username, setUsername] = useState(friendId);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [directChatId, setDirectChatId] = useState("");

  // Auto connect when the component mounts
  useEffect(() => {
    const connect = async () => {
      if (!username || !isGuid(username)) {
        setErrorMessage("Vui lòng nhập GUID hợp lệ làm ID của bạn");
        return;
      }

      if (!storedUserToken) {
        setErrorMessage("Không tìm thấy token. Vui lòng đăng nhập lại.");
        return;
      }

      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`https://harmon.love/chathub?username=${username}`, {
          accessTokenFactory: () => storedUserToken,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      try {
        console.log("[Debug] Đang kết nối tới SignalR với username:", username);
        await newConnection.start();
        console.log("[Debug] Kết nối thành công!");
        setConnection(newConnection);
        setIsConnected(true);
        setErrorMessage("");
      } catch (err) {
        console.error("[Error] Lỗi kết nối SignalR:", err);
        setErrorMessage("Không thể kết nối tới server: " + err.message);
      }
    };

    connect();

    // Cleanup function to stop the connection when the component unmounts
    return () => {
      if (connection) {
        connection.stop();
        console.log("[Debug] Đã ngắt kết nối SignalR");
      }
    };
  }, [username, storedUserToken]); // Dependencies: re-run if username or token changes

  // Handle SignalR events
  useEffect(() => {
    if (!connection) return;

    connection.on("ReceiveMessageThread", (msgThread) => {
      console.log("[SignalR] Nhận MessageThread:", msgThread);
      const formattedMessages = msgThread.map((msg) => ({
        senderId: msg.senderId,
        content: msg.content,
        senderFullName: msg.senderFullName,
      }));
      setMessages(formattedMessages);
    });

    connection.on("NewMessage", (sender, content, senderFullName) => {
      console.log("[SignalR] Nhận NewMessage:", {
        sender,
        content,
        senderFullName,
      });
      setMessages((prev) => [
        ...prev,
        { senderId: sender, content, senderFullName: senderFullName },
      ]);
    });

    connection.on("DirectChatId", (chatId) => {
      console.log("[SignalR] Nhận directChatId:", chatId);
      setDirectChatId(chatId);
    });

    connection.on("Error", (error) => {
      console.error("[SignalR] Nhận lỗi từ server:", error);
      setErrorMessage(error);
    });

    connection.onclose((error) => {
      console.error("[SignalR] Kết nối bị đóng:", error);
      setErrorMessage("Kết nối với server đã bị đóng");
      setIsConnected(false);
    });

    return () => {
      connection.off("ReceiveMessageThread");
      connection.off("NewMessage");
      connection.off("DirectChatId");
      connection.off("Error");
      connection.off("onclose");
    };
  }, [connection]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!connection) {
      console.log("[Debug] Không có kết nối SignalR.");
      setErrorMessage("Không có kết nối SignalR.");
      return;
    }

    if (!message.trim()) {
      console.log("[Debug] Tin nhắn rỗng.");
      setErrorMessage("Tin nhắn không thể rỗng.");
      return;
    }

    if (!directChatId) {
      console.log("[Debug] directChatId không tồn tại.");
      setErrorMessage(
        "Thiếu directChatId. Vui lòng chờ đến khi kết nối hoàn tất.",
      );
      return;
    }

    try {
      await connection.invoke("SendMessage", directChatId, message);
      console.log("[Debug] Đã gửi tin nhắn thành công qua SignalR");
      setMessage("");
      setErrorMessage("");
    } catch (error) {
      console.error("[Error] Lỗi khi gửi tin nhắn:", error);
      setErrorMessage("Không thể gửi tin nhắn: " + error.message);
    }
  };

  const isGuid = (value) => {
    const guidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(value);
  };

  return (
    <div className="mx-auto flex h-screen w-full flex-col bg-gray-100 p-20">
      {!isConnected ? (
        <div className="flex h-full flex-col items-center justify-center">
          <p>Đang kết nối với server...</p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Ứng dụng Chat</h1>
          <div className="flex-1 overflow-y-auto rounded bg-white p-4 shadow">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 flex ${msg.senderId !== username ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs rounded-lg p-3 ${
                    msg.senderId !== username
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <strong>{msg.senderFullName}: </strong>
                  {msg.content}
                </div>
              </div>
            ))}
            {errorMessage && (
              <div className="mt-2 text-red-500">{errorMessage}</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 rounded border p-2"
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              Gửi
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatDetail;
