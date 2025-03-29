import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const FriendsRequests = () => {
  const storedUser = localStorage.getItem("user");
  const { accountId } = storedUser
    ? JSON.parse(storedUser)
    : { accountId: null };
  const navigate = useNavigate(); // Initialize navigate hook
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axiosInstance.get(
          `/friendship/account/${accountId}/status?status=Request&page=${currentPage}&size=${pageSize}`,
        );
        if (response.data.status === "200") {
          const friendItems = response.data.data.items.map((item) => ({
            id: item.friendId,
            fullName:
              item.friendFullName || "Người bạn " + item.friendId.slice(0, 8),
            avatarUrl:
              item.friendAvatarUrl || "https://via.placeholder.com/300",
            gender: item.friendGender || "Không xác định",
            dateOfBirth: item.friendDateOfBirth || null,
          }));
          setFriends(friendItems);
          setTotalPages(response.data.data.totalPages || 1);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải danh sách yêu cầu kết bạn");
        console.error("Error fetching friend requests:", err);
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      fetchFriends();
    } else {
      setError("Không tìm thấy thông tin tài khoản");
      setLoading(false);
    }
  }, [accountId, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setLoading(true);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const handleCardClick = (friendId) => {
    navigate(`/user/${friendId}/accept`);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-5 pt-7">
      <h3 className="mb-5 text-xl font-bold text-gray-800">Yêu cầu kết bạn</h3>
      {friends.length === 0 ? (
        <div className="grid w-full grid-cols-1 items-center justify-center gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <p className="text-gray-500">Không có yêu cầu kết bạn để hiển thị</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-5">
            {friends.map((friend) => (
              <div
                key={friend.id}
                onClick={() => handleCardClick(friend.id)}
                className="w-full min-w-[240px] rounded-lg border border-gray-300 bg-white shadow-md transition-transform hover:scale-105 hover:cursor-pointer"
              >
                <img
                  src={friend.avatarUrl}
                  alt={friend.fullName}
                  className="h-[240px] w-full rounded-t-lg object-cover"
                />
                <div className="p-4">
                  <div className="mb-3 text-lg font-semibold text-gray-800">
                    {friend.fullName}
                  </div>
                  <div className="flex w-full gap-2 text-base text-gray-600">
                    <span className="font-medium">Giới tính:</span>
                    <span>{friend.gender}</span>
                  </div>
                  <div className="flex w-full gap-2 text-base text-gray-600">
                    <span className="font-medium">Tuổi:</span>
                    <span>{calculateAge(friend.dateOfBirth)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between text-gray-600">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 rounded-md bg-gray-200 px-4 py-2 transition-colors duration-200 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaChevronLeft /> Trước
              </button>
              <span className="text-base">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 rounded-md bg-gray-200 px-4 py-2 transition-colors duration-200 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tiếp <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FriendsRequests;
