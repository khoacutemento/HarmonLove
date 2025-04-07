import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axios"; // Assuming this is your axios setup
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Pagination icons
import { useNavigate } from "react-router-dom";
import { handleImageProfile } from "../../utils/format";

const Chat = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10; // Matches API response size
  const navigate = useNavigate(); // Initialize navigate hook

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axiosInstance.get(
          `/friendship/friend-list?page=${currentPage}&size=${pageSize}`,
        );
        if (response.data.status === "200") {
          setFriends(response.data.data.items || []);
          setTotalPages(response.data.data.totalPages);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching friends");
        console.error("Error fetching friends:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setLoading(true); // Show loading while fetching new page
    }
  };

  const handleChatClick = (friendId) => {
    // Navigate to the chat page with the friend's ID
    navigate(`/chat/${friendId}`);
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

  return (
    <div className="min-h-screen w-full bg-gray-100 p-6">
      <div class="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-col">
        <h3 className="mb-5 text-lg font-bold text-gray-800">
          Danh sách trò chuyện
        </h3>
        {friends.length === 0 ? (
          <div className="text-center text-gray-500">
            Không có bạn bè để trò chuyện
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {friends.map((friend) => (
                <div
                  onClick={() => handleChatClick(friend.id)}
                  key={friend.id}
                  className="flex w-full items-center rounded-md border border-gray-300 bg-white p-3 shadow-sm hover:cursor-pointer hover:bg-gray-50"
                >
                  <img
                    src={handleImageProfile(friend.avatar)}
                    alt={friend.fullName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="ml-3 flex-1">
                    <div className="text-base font-semibold text-gray-800">
                      {friend.fullName}
                    </div>
                    <div className="text-sm text-gray-500">
                      Nhấn để trò chuyện
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
