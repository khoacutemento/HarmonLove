import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../../config/axios";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaVenusMars,
  FaCrown,
  FaCalendarAlt,
  FaClock,
  FaWallet,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaChevronLeft,
  FaChevronRight,
  FaInfoCircle,
  FaTimes,
  FaPhoneAlt,
  FaPhoneSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { initSignalR } from "../../utils/signalR";
import { initWebRTC, startCall } from "../../utils/webRTC";

const Profile = () => {
  const storedUser = localStorage.getItem("user");
  const { accountId } = storedUser ? JSON.parse(storedUser) : {};
  const navigation = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentBookingPage, setCurrentBookingPage] = useState(1);
  const [totalBookingPages, setTotalBookingPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [signalRConnection, setSignalRConnection] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [listenerConnectionId, setListenerConnectionId] = useState(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pageSize = 10;

  const handleDeposit = () => {
    navigation("/deposit");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const userResponse = await axiosInstance.get(
          `/user/account/${accountId}`,
        );
        if (userResponse.data.status === "200") {
          setUser(userResponse.data.data);
        } else {
          setError(userResponse.data.message);
        }

        const walletResponse = await axiosInstance.get("/wallet");
        if (walletResponse.data.status === "200") {
          setWalletBalance(walletResponse.data.data.balance);
        } else {
          setError(walletResponse.data.message);
        }

        const transResponse = await axiosInstance.get(
          `/transaction?page=${currentPage}&size=${pageSize}`,
        );
        if (transResponse.data.status === "200") {
          setTransactions(transResponse.data.data.items);
          setTotalPages(transResponse.data.data.totalPages);
        } else {
          setError(transResponse.data.message);
        }

        const bookingResponse = await axiosInstance.get(
          `/booking/account?page=${currentBookingPage}&size=${pageSize}`,
        );
        if (bookingResponse.data.status === "200") {
          setBookings(bookingResponse.data.data.items);
          setTotalBookingPages(bookingResponse.data.data.totalPages);
        } else {
          setError(bookingResponse.data.message);
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      fetchData();
    }
  }, [accountId, currentPage, currentBookingPage]);

  useEffect(() => {
    if (showBookingModal && selectedBooking) {
      const connection = initSignalR({
        onIncomingCall: (callerConnectionId) => {
          console.log("Incoming call from:", callerConnectionId);
          setCallStatus("incoming_call");
          setListenerConnectionId(callerConnectionId);
        },
        onCallAccepted: (targetConnectionId) => {
          console.log("Call accepted by:", targetConnectionId);
          setCallStatus("in_call");
          setListenerConnectionId(targetConnectionId);
        },
        onCallRejected: () => {
          console.log("Call rejected");
          setCallStatus("idle");
          alert("Cuộc gọi đã bị từ chối bởi người lắng nghe");
        },
        onCallEnded: () => {
          console.log("Call ended");
          handleEndCall();
        },
        onReceiveOffer: async (callerConnectionId, offer) => {
          console.log("Received offer from:", callerConnectionId, offer);
          try {
            await peerConnection.setRemoteDescription(JSON.parse(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            connection.invoke(
              "SendAnswer",
              callerConnectionId,
              JSON.stringify(answer),
            );
            setCallStatus("in_call");
          } catch (error) {
            console.error("Error handling offer:", error);
          }
        },
        onReceiveAnswer: async (callerConnectionId, answer) => {
          console.log("Received answer from:", callerConnectionId, answer);
          try {
            await peerConnection.setRemoteDescription(JSON.parse(answer));
            setCallStatus("in_call");
          } catch (error) {
            console.error("Error handling answer:", error);
          }
        },
        onReceiveCandidate: async (callerConnectionId, candidate) => {
          console.log(
            "Received candidate from:",
            callerConnectionId,
            candidate,
          );
          try {
            await peerConnection.addIceCandidate(JSON.parse(candidate));
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        },
      });
      setSignalRConnection(connection);

      const pc = initWebRTC({
        onIceCandidate: (candidate) => {
          console.log("Sending ICE candidate");
          if (listenerConnectionId) {
            connection.invoke(
              "SendCandidate",
              listenerConnectionId,
              JSON.stringify(candidate),
            );
          }
        },
        onTrack: (event) => {
          console.log("Received remote track", event);
          if (remoteAudioRef.current && event.streams[0]) {
            remoteAudioRef.current.srcObject = event.streams[0];
            setRemoteStream(event.streams[0]);
          }
        },
      });
      setPeerConnection(pc);

      // Register the user for the booking
      connection.invoke("OnConnectedForBookingAsync", accountId);

      return () => {
        connection?.stop();
        pc?.close();
        if (localStream) {
          localStream.getTracks().forEach((track) => track.stop());
        }
      };
    }
  }, [showBookingModal, selectedBooking, accountId, listenerConnectionId]);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const handleStartCall = async () => {
    if (!signalRConnection || !peerConnection || !selectedBooking) return;

    try {
      setCallStatus("calling");

      // Initiate the call to the specific listener
      await signalRConnection.invoke("StartCall", selectedBooking.listenerId);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, stream));
      setLocalStream(stream);
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      signalRConnection.invoke(
        "SendOffer",
        selectedBooking.listenerId,
        JSON.stringify(offer),
      );
    } catch (error) {
      console.error("Error starting call:", error);
      setCallStatus("idle");
      alert("Không thể kết nối với người lắng nghe. Vui lòng thử lại.");
    }
  };

  const handleAcceptCall = async () => {
    if (!peerConnection || !listenerConnectionId) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, stream));
      setLocalStream(stream);
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      signalRConnection.invoke(
        "SendAnswer",
        listenerConnectionId,
        JSON.stringify(answer),
      );
      setCallStatus("in_call");
    } catch (error) {
      console.error("Error accepting call:", error);
      setCallStatus("idle");
    }
  };

  const handleEndCall = () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    if (signalRConnection && listenerConnectionId) {
      signalRConnection.invoke("EndCall", listenerConnectionId);
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setCallStatus("idle");
    setListenerConnectionId(null);
    setLocalStream(null);
    setRemoteStream(null);
  };

  const closeModal = () => {
    handleEndCall();
    setShowBookingModal(false);
    setSelectedBooking(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Upcoming":
        return (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            Sắp tới
          </span>
        );
      case "Completed":
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            Hoàn thành
          </span>
        );
      case "Cancelled":
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Không tìm thấy thông tin người dùng</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        {/* Left Side: Profile Info */}
        <div className="rounded-lg bg-white p-6 shadow-md lg:w-1/2">
          <div className="mb-6 flex items-center gap-4">
            <img
              src={
                user.avatarUrl === "string"
                  ? "https://i.pinimg.com/736x/a9/1b/35/a91b35dbe4c722ce0b557dd72a3dca92.jpg"
                  : user.avatarUrl
              }
              alt="Avatar"
              className="h-20 w-20 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {user.fullName}
              </h1>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">
              Thông tin cá nhân
            </h2>
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-gray-600">
                <FaEnvelope className="text-blue-500" /> {user.email}
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <FaPhone className="text-green-500" />{" "}
                {user.phone || "Chưa cập nhật"}
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <FaBirthdayCake className="text-pink-500" />{" "}
                {user.dateOfBirth
                  ? new Date(user.dateOfBirth).toLocaleDateString()
                  : "Chưa cập nhật"}
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <FaVenusMars className="text-purple-500" />{" "}
                {user.gender || "Chưa cập nhật"}
              </p>
            </div>
          </div>

          {user.userInfo && (
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-700">
                Thông tin Premium
              </h2>
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-gray-600">
                  <FaCrown className="text-yellow-500" /> Gói:{" "}
                  {user.userInfo.premium?.type || "Chưa đăng ký"}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <FaUser className="text-blue-500" /> Số bạn bè:{" "}
                  {user.userInfo.premium?.friend || "0"}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <FaClock className="text-orange-500" /> Thời hạn:{" "}
                  {user.duration || "0"} ngày
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <FaCalendarAlt className="text-teal-500" /> Bắt đầu:{" "}
                  {user.userInfo.dateStart
                    ? new Date(user.userInfo.dateStart).toLocaleDateString()
                    : "Chưa có"}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <FaCalendarAlt className="text-red-500" /> Kết thúc:{" "}
                  {user.userInfo.dateEnd
                    ? new Date(user.userInfo.dateEnd).toLocaleDateString()
                    : "Chưa có"}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <FaClock className="text-green-500" /> Trạng thái:{" "}
                  {user.userInfo.isActive
                    ? "Đang hoạt động"
                    : "Không hoạt động"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Wallet, Bookings and Transactions */}
        <div className="rounded-lg bg-white p-6 shadow-md lg:w-1/2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-700">
                <FaWallet className="text-green-500" /> Số dư ví
              </h2>
              <p className="text-2xl font-bold text-gray-800">
                {walletBalance.toLocaleString()} VND
              </p>
            </div>
            <button
              onClick={handleDeposit}
              className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-lg font-semibold text-white duration-300 hover:scale-110"
            >
              Nạp Thêm
            </button>
          </div>

          <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">
              Lịch đặt hẹn
            </h2>
            {bookings.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-gray-500">
                Không có lịch hẹn nào
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3">Người lắng nghe</th>
                        <th className="px-4 py-3">Ngày</th>
                        <th className="px-4 py-3">Thời gian</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">{booking.listenerName}</td>
                          <td className="px-4 py-3">
                            {new Date(booking.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">{booking.time}</td>
                          <td className="px-4 py-3">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleViewDetails(booking)}
                              className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                            >
                              <FaInfoCircle /> Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center justify-between text-gray-600">
                  <button
                    onClick={() =>
                      setCurrentBookingPage(currentBookingPage - 1)
                    }
                    disabled={currentBookingPage === 1}
                    className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaChevronLeft /> Trước
                  </button>
                  <span>
                    Trang {currentBookingPage} / {totalBookingPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentBookingPage(currentBookingPage + 1)
                    }
                    disabled={currentBookingPage === totalBookingPages}
                    className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Tiếp <FaChevronRight />
                  </button>
                </div>
              </>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-700">
              Lịch sử giao dịch
            </h2>
            {transactions.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-gray-500">
                Không có giao dịch để hiển thị
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3">Mã đơn</th>
                        <th className="px-4 py-3">Số tiền</th>
                        <th className="px-4 py-3">Loại</th>
                        <th className="px-4 py-3">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((trans) => (
                        <tr
                          key={trans.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">{trans.orderCode}</td>
                          <td className="px-4 py-3">
                            {trans.amount.toLocaleString()} VND
                          </td>
                          <td className="px-4 py-3">{trans.type}</td>
                          <td className="flex items-center gap-1 px-4 py-3">
                            {trans.status === "SUCCESS" && (
                              <FaCheckCircle className="text-green-500" />
                            )}
                            {trans.status === "FAILED" && (
                              <FaTimesCircle className="text-red-500" />
                            )}
                            {trans.status === "PENDING" && (
                              <FaHourglassHalf className="text-yellow-500" />
                            )}
                            {trans.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center justify-between text-gray-600">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaChevronLeft /> Trước
                  </button>
                  <span>
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Tiếp <FaChevronRight />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Chi tiết lịch hẹn
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Người lắng nghe:
                </p>
                <p className="text-lg">{selectedBooking.listenerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Ngày:</p>
                <p className="text-lg">
                  {new Date(selectedBooking.date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Thời gian:</p>
                <p className="text-lg">{selectedBooking.time}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Trạng thái:</p>
                <div className="mt-1">
                  {getStatusBadge(selectedBooking.status)}
                </div>
              </div>

              <audio ref={localAudioRef} autoPlay muted />
              <audio ref={remoteAudioRef} autoPlay />

              {selectedBooking.status === "Upcoming" && (
                <div className="space-y-3 pt-4">
                  {callStatus === "idle" && (
                    <button
                      onClick={handleStartCall}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 py-2 font-medium text-white hover:bg-green-600"
                    >
                      <FaPhoneAlt /> Gọi {selectedBooking.listenerName}
                    </button>
                  )}

                  {callStatus === "incoming_call" && (
                    <div className="flex gap-3">
                      <button
                        onClick={handleAcceptCall}
                        className="flex-1 rounded-lg bg-green-500 py-2 font-medium text-white hover:bg-green-600"
                      >
                        Chấp nhận
                      </button>
                      <button
                        onClick={handleEndCall}
                        className="flex-1 rounded-lg bg-red-500 py-2 font-medium text-white hover:bg-red-600"
                      >
                        Từ chối
                      </button>
                    </div>
                  )}

                  {(callStatus === "calling" ||
                    callStatus === "connecting") && (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-yellow-500 py-2 font-medium text-white">
                      <FaHourglassHalf /> Đang kết nối với{" "}
                      {selectedBooking.listenerName}...
                    </div>
                  )}

                  {callStatus === "in_call" && (
                    <button
                      onClick={handleEndCall}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 py-2 font-medium text-white hover:bg-red-600"
                    >
                      <FaPhoneSlash /> Kết thúc cuộc gọi
                    </button>
                  )}

                  {callStatus !== "idle" && (
                    <div className="text-center text-sm text-gray-500">
                      Trạng thái:{" "}
                      {callStatus === "calling"
                        ? "Đang gọi..."
                        : callStatus === "connecting"
                          ? "Đang kết nối..."
                          : callStatus === "in_call"
                            ? "Đang trong cuộc gọi"
                            : ""}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
