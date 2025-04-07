import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import axiosInstance from "../../config/axios"; // Assuming you have this configured

const ReviewPage = () => {
  const storedUser = localStorage.getItem("user");
  const { accountId } = storedUser ? JSON.parse(storedUser) : {};
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/review/listener/${accountId}?page=${currentPage}`,
        );
        const { data } = response.data;
        setReviews(data.items);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err.message || "Đã có lỗi xảy ra khi tải đánh giá");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [currentPage]);

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => (
          <FaStar
            key={index}
            className={index < rating ? "text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Đánh giá người lắng nghe
        </h1>

        {reviews.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-gray-500">
            Không có đánh giá nào
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg bg-white p-6 shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Người đánh giá: {review.userName || "Ẩn danh"}
                      </p>
                      <div className="mt-1">{renderStars(review.star)}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-600">{review.message}</p>
                  {review.replyMessage && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3">
                      <p className="text-sm font-medium text-gray-500">
                        Phản hồi từ người lắng nghe:
                      </p>
                      <p className="mt-1 text-gray-600">
                        {review.replyMessage}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between text-gray-600">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Trước
                </button>
                <span>
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Tiếp
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;
