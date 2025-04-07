import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { handleImageProfile } from "../../utils/format";
import * as signalR from "@microsoft/signalr";

const ChatLayout = () => {
  const { friendId } = useParams();
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [errorFriends, setErrorFriends] = useState(null);
  const storedUserToken = localStorage.getItem("token");
  const [selectedFriendId, setSelectedFriendId] = useState(friendId || null);
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [directChatId, setDirectChatId] = useState("");
  const messagesEndRef = React.useRef(null);

  // Fetch friends list and SignalR logic remain unchanged
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axiosInstance.get(`/direct-chat/user`);
        if (response.data.status === "200") {
          setFriends(response.data.data || []);
          console.log(response.data.data);
        } else {
          setErrorFriends(response.data.message);
        }
      } catch (err) {
        setErrorFriends(
          err.response?.data?.message || "Error fetching friends",
        );
      } finally {
        setLoadingFriends(false);
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    if (!selectedFriendId) return;
    const connect = async () => {
      if (!isGuid(selectedFriendId)) {
        setErrorMessage("Invalid friend ID");
        return;
      }
      if (!storedUserToken) {
        setErrorMessage("No token found. Please log in again.");
        return;
      }
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`https://harmon.love/chathub?username=${selectedFriendId}`, {
          accessTokenFactory: () => storedUserToken,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();
      try {
        await newConnection.start();
        setConnection(newConnection);
        setIsConnected(true);
        setErrorMessage("");
      } catch (err) {
        setErrorMessage("Failed to connect to server: " + err.message);
      }
    };
    connect();
    return () => {
      if (connection) connection.stop();
    };
  }, [selectedFriendId, storedUserToken]);

  useEffect(() => {
    if (!connection) return;
    connection.on("ReceiveMessageThread", (msgThread) => {
      const formattedMessages = msgThread.map((msg) => ({
        senderId: msg.senderId,
        content: msg.content,
        senderFullName: msg.senderFullName,
      }));
      setMessages(formattedMessages);
    });
    connection.on("NewMessage", (sender, content, senderFullName) => {
      setMessages((prev) => [
        ...prev,
        { senderId: sender, content, senderFullName },
      ]);
    });
    connection.on("DirectChatId", (chatId) => {
      setDirectChatId(chatId);
    });
    connection.on("Error", (error) => {
      setErrorMessage(error);
    });
    connection.onclose(() => {
      setIsConnected(false);
      setErrorMessage("Connection closed");
    });
  }, [connection]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!connection || !message.trim() || !directChatId) return;
    try {
      await connection.invoke("SendMessage", directChatId, message);
      setMessage("");
    } catch (error) {
      setErrorMessage("Failed to send message: " + error.message);
    }
  };

  const isGuid = (value) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );

  const handleFriendClick = (friendId) => {
    setSelectedFriendId(friendId);
  };

  return (
    <div className="mx-[400px] flex min-h-screen w-full bg-gray-100">
      {/* Left: Friend List */}
      <div className="my-8 h-[94%] w-1/3 border-r bg-white p-6">
        <h3 className="mb-5 text-lg font-bold text-gray-800">
          Danh sách trò chuyện
        </h3>
        {loadingFriends ? (
          <p className="text-gray-600">Đang tải...</p>
        ) : errorFriends ? (
          <p className="text-red-600">{errorFriends}</p>
        ) : friends.length === 0 ? (
          <p className="text-gray-500">Không có bạn bè để trò chuyện</p>
        ) : (
          <>
            <div className="space-y-4">
              {friends.map((friend) => (
                <div
                  key={friend.friend.id}
                  onClick={() => handleFriendClick(friend.friend.id)}
                  className={`flex items-center rounded-md border p-3 shadow-sm hover:cursor-pointer hover:bg-gray-50 ${
                    selectedFriendId === friend.friend.id ? "bg-gray-100" : ""
                  }`}
                >
                  <img
                    src={handleImageProfile(friend.friend.avatarUrl)}
                    alt={friend.friend.fullName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <div className="text-base font-semibold text-gray-800">
                      {friend.friend.fullName}
                    </div>
                    {friend.latestMessage ? (
                      <div className="text-sm font-bold text-gray-500">
                        Tin nhắn: {friend.latestMessage}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Nhấn để trò chuyện
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right: Chat Detail */}
      <div className="flex w-2/3 flex-col p-6">
        {selectedFriendId ? (
          !isConnected ? (
            <div className="flex h-full items-center justify-center">
              <p>Đang kết nối với server...</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">
                Trò chuyện với{" "}
                {friends.find((f) => f.id === selectedFriendId)?.fullName ||
                  "Bạn"}
              </h1>
              <div className="flex-1 overflow-y-auto rounded bg-white p-4 shadow">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 flex ${
                      msg.senderId !== selectedFriendId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`overflow-wrap-anywhere max-w-xs whitespace-pre-wrap break-words rounded-lg p-3 ${
                        msg.senderId !== selectedFriendId
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
          )
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Chọn một bạn bè để bắt đầu trò chuyện
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
