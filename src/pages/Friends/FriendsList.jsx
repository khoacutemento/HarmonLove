import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axios"; // Assuming this is your axios setup
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Pagination icons

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10; // Matches API response size

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axiosInstance.get(
          `/friendship/friend-list?page=${currentPage}&size=${pageSize}`,
        );
        if (response.data.status === "200") {
          setFriends(response.data.data.items);
          setTotalPages(response.data.data.totalPages);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải danh sách bạn bè");
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

  const calculateAge = (dateOfBirth) => {
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

  return (
    <div className="min-h-screen bg-gray-100 px-5 pt-7">
      <h3 className="mb-5 text-lg font-bold text-gray-800">Danh sách bạn bè</h3>
      {friends.length === 0 ? (
        <div className="text-center text-gray-500">
          Không có bạn bè để hiển thị
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="w-full min-w-[250px] rounded-md border border-gray-300 bg-white shadow-sm" // Added w-full and min-w-[250px]
              >
                <img
                  src={friend.avatarUrl || "https://via.placeholder.com/200"}
                  alt={friend.fullName}
                  className="h-[250px] w-full rounded-t-md object-cover" // Increased height from 200px to 250px
                />
                <div className="p-4">
                  {" "}
                  {/* Increased padding from p-3 to p-4 */}
                  <div className="mb-3 text-lg font-semibold text-gray-800">
                    {" "}
                    {/* Added text-lg */}
                    {friend.fullName}
                  </div>
                  <div className="flex w-full gap-2 text-base text-gray-500">
                    {" "}
                    {/* Changed text-sm to text-base */}
                    <span>Giới tính:</span>
                    <span>{friend.gender}</span>
                  </div>
                  <div className="flex w-full gap-2 text-base text-gray-500">
                    <span>Tuổi:</span>
                    <span>{calculateAge(friend.dateOfBirth)}</span>
                  </div>
                  <div className="flex w-full gap-2 text-base text-gray-500">
                    <span>Email:</span>
                    <span className="truncate">{friend.email}</span>
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
  );
};

export default FriendsList;
