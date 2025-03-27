import React, { useState } from "react";
import axiosInstance from "../../config/axios"; // Assuming this is your axios setup
import { FaCrown, FaCheckCircle, FaSpinner } from "react-icons/fa"; // Added FaSpinner for modal
import { useNavigate } from "react-router-dom";

const BuyPremiumModal = ({ isOpen, onClose, premiumDetails }) => {
  const navigation = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleBuyPremium = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axiosInstance.post(
        `/premium/${premiumDetails.id}/buy`,
      );
      console.log(response);
      if (response.data.status === "200") {
        setSuccess(response.data.message);
        setTimeout(() => {
          onClose(); // Close modal on success
          navigation("/profile");
        }, 500);
      } else {
        setError(response.data.message || "Mua gói premium thất bại");
      }
    } catch (err) {
      setError(err.response.data.message || "Mua gói premium thất bại");
      console.error("Error buying premium:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        {/* Header */}
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-800">
          <FaCrown className="text-yellow-500" /> Mua Gói Premium
        </h1>

        {/* Premium Details */}
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">
            Chi tiết gói
          </h2>
          <div className="space-y-3 text-gray-600">
            <p>
              Gói: <span className="font-semibold">{premiumDetails.type}</span>
            </p>
            <p>
              Số bạn bè:{" "}
              <span className="font-semibold">{premiumDetails.friend}</span>
            </p>
            <p>
              Số lượt khớp:{" "}
              <span className="font-semibold">{premiumDetails.match}</span>
            </p>
            <p>
              Thời hạn:{" "}
              <span className="font-semibold">
                {premiumDetails.duration} ngày
              </span>
            </p>
            <p>
              Giá:{" "}
              <span className="font-semibold">
                {premiumDetails.price.toLocaleString()} VND
              </span>
            </p>
          </div>
        </div>

        {/* Feedback Messages */}
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-green-100 p-3 text-green-700">
            <FaCheckCircle /> {success}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        {/* Buy Button */}
        <button
          onClick={handleBuyPremium}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition-colors duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" /> Đang xử lý...
            </>
          ) : (
            "Mua ngay"
          )}
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-300"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default BuyPremiumModal;
