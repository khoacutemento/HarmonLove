import React, { useState } from "react";
import { FaStar, FaTimes } from "react-icons/fa";
import axiosInstance from "../../config/axios";

const ReviewForm = ({ bookingId, listenerName, onClose, onSubmit }) => {
  const [reviewMessage, setReviewMessage] = useState("");
  const [star, setStar] = useState(0);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (rating) => {
    setStar(rating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewMessage || star === 0) {
      setError("Vui lòng nhập nội dung đánh giá và chọn số sao.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reviewData = {
        reviewMessage,
        replyMessage: "", // Initially empty, can be updated later by the listener
        star,
      };

      const response = await axiosInstance.post(
        "review?bookingId=" + bookingId,
        reviewData,
      );
      const submittedReview = {
        ...response.data.data,
        listenerName, // Add listenerName for display purposes
      };
      onSubmit(submittedReview); // Pass the submitted review to the parent
      onClose(); // Close the form after submission
    } catch (err) {
      setError("Đã có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.");
      console.error("Error submitting review:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">
            Đánh giá người lắng nghe
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Đánh giá cho: {listenerName}
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nội dung đánh giá
            </label>
            <textarea
              value={reviewMessage}
              onChange={(e) => setReviewMessage(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring focus:ring-blue-200"
              rows="3"
              placeholder="Nhập nội dung đánh giá..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Xếp hạng
            </label>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <FaStar
                  key={rating}
                  className={`cursor-pointer text-2xl ${rating <= star ? "text-yellow-400" : "text-gray-300"}`}
                  onClick={() => handleStarClick(rating)}
                />
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-500 py-2 font-medium text-white hover:bg-blue-600 disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-400"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
