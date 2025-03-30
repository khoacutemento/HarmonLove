import React, { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { useParams } from "react-router-dom";

const Chat = () => {
  const { id } = useParams(); // Get both user id and action from route params
  const storedUserToken = localStorage.getItem("token"); // Chỉ dùng token từ localStorage
  const [connection, setConnection] = useState(null);
  const [username, setUsername] = useState(""); // Không lấy từ localStorage
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [directChatId, setDirectChatId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Khi có kết nối, start và đăng ký các sự kiện
  useEffect(() => {
    if (!connection) return;

    connection
      .start()
      .then(() => {
        console.log("✅ Connected to SignalR!");
        setIsConnected(true);

        connection.on("ReceiveMessage", (sender, msg) => {
          setMessages((prev) => [...prev, { sender, content: msg }]);
        });

        connection.on("UserConnected", (user) => {
          setOnlineUsers((prev) => [...prev, user]);
        });

        connection.on("UserDisconnected", (user) => {
          setOnlineUsers((prev) => prev.filter((u) => u !== user));
        });
      })
      .catch((err) => console.error("❌ Connection failed: ", err));

    return () => {
      connection.stop().then(() => console.log("SignalR connection stopped"));
    };
  }, [connection]);

  // Cuộn xuống cuối danh sách tin nhắn
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Hàm kết nối (không lưu username vào localStorage)
  const handleConnect = () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }
    if (!storedUserToken) {
      alert("No authentication token found. Please log in.");
      return;
    }

    console.log("Username entered: ", username);

    // Tạo kết nối SignalR chỉ khi nhấn Connect
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`https://harmon.love/chathub?username=${username}`, {
        accessTokenFactory: () => {
          console.log("🔑 Sending Token:", storedUserToken);
          return storedUserToken;
        },
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    setConnection(newConnection);
  };

  // Hàm chọn người nhận tin nhắn
  const selectReceiver = async (user) => {
    setReceiver(user);
    if (!connection || !username) return;

    try {
      const chatId = await connection.invoke("GetDirectChat", username, user);
      setDirectChatId(chatId);
    } catch (error) {
      console.error("❌ Error fetching DirectChat:", error);
    }
  };

  // Hàm gửi tin nhắn
  const sendMessage = async () => {
    if (!connection || !message || !receiver || !directChatId) return;

    try {
      await connection.invoke(
        "SendMessage",
        directChatId,
        username,
        receiver,
        message,
      );
      setMessages((prev) => [...prev, { sender: username, content: message }]);
      setMessage("");
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col bg-gray-100 p-4">
      {!isConnected ? (
        // Nếu chưa kết nối, hiển thị ô nhập username và nút Connect
        <div className="flex h-full flex-col items-center justify-center">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="mb-4 w-64 rounded border p-2"
          />
          <button
            onClick={handleConnect}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Connect
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Chat App</h1>
            <span className="text-sm text-gray-600">
              Logged in as: {username}
            </span>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold">Online Users</h2>
            <div className="flex flex-wrap gap-2">
              {onlineUsers.map((user) => (
                <button
                  key={user}
                  onClick={() => selectReceiver(user)}
                  className={`rounded px-3 py-1 ${
                    receiver === user ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                >
                  {user}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto rounded bg-white p-4 shadow">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 flex ${msg.sender === username ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs rounded-lg p-3 ${
                    msg.sender === username
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <strong>{msg.sender}: </strong>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded border p-2"
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
