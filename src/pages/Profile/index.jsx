import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axios"; // Assuming this is your axios setup
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
} from "react-icons/fa"; // Added pagination icons
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const storedUser = localStorage.getItem("user");
  const { accountId } = storedUser ? JSON.parse(storedUser) : null;
  const navigation = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10; // Matches API response size

  const handleDeposit = () => {
    navigation("/deposit");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const userResponse = await axiosInstance.get(
          `/user/account/${accountId}`,
        );
        if (userResponse.data.status === "200") {
          setUser(userResponse.data.data);
        } else {
          setError(userResponse.data.message);
        }

        // Fetch wallet balance
        const walletResponse = await axiosInstance.get("/wallet");
        if (walletResponse.data.status === "200") {
          setWalletBalance(walletResponse.data.data.balance);
        } else {
          setError(walletResponse.data.message);
        }

        // Fetch transactions with pagination
        const transResponse = await axiosInstance.get(
          `/transaction?page=${currentPage}&size=${pageSize}`,
        );
        if (transResponse.data.status === "200") {
          setTransactions(transResponse.data.data.items);
          setTotalPages(transResponse.data.data.totalPages);
        } else {
          setError(transResponse.data.message);
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId, currentPage]); // Refetch on page change

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setLoading(true); // Show loading while fetching new page
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

  return (
    <div className="min-h-screen w-full bg-gray-100 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        {/* Left Side: Profile Info */}
        <div className="rounded-lg bg-white p-6 shadow-md lg:w-1/2">
          {/* Header */}
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

          {/* Personal Info */}
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">
              Thông tin cá nhân
            </h2>
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-gray-600">
                <FaEnvelope className="text-blue-500" /> {user.email}
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <FaPhone className="text-green-500" /> {user.phone}
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <FaBirthdayCake className="text-pink-500" />{" "}
                {new Date(user.dateOfBirth).toLocaleDateString()}
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <FaVenusMars className="text-purple-500" /> {user.gender}
              </p>
            </div>
          </div>

          {/* Premium Info */}
          {user.userInfo && (
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-700">
                Thông tin Premium
              </h2>
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-gray-600">
                  <FaCrown className="text-yellow-500" /> Gói:{" "}
                  {user.userInfo.premium.type}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <FaUser className="text-blue-500" /> Số bạn bè:{" "}
                  {user.userInfo.premium.friend}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <FaClock className="text-orange-500" /> Thời hạn:{" "}
                  {user.duration} ngày
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <FaCalendarAlt className="text-teal-500" /> Bắt đầu:{" "}
                  {new Date(user.userInfo.dateStart).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <FaCalendarAlt className="text-red-500" /> Kết thúc:{" "}
                  {new Date(user.userInfo.dateEnd).toLocaleDateString()}
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

        {/* Right Side: Transactions and Wallet */}
        <div className="rounded-lg bg-white p-6 shadow-md lg:w-1/2">
          {/* Wallet Balance */}
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

          {/* Transaction Table */}
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
                {/* Pagination Controls */}
                <div className="mt-4 flex items-center justify-between text-gray-600">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-1 transition-colors duration-200 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaChevronLeft /> Trước
                  </button>
                  <span>
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-1 transition-colors duration-200 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Tiếp <FaChevronRight />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
