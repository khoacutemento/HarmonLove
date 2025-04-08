// src/components/ListenerProfile.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate
import axiosInstance from "../../config/axios";
import { FaArrowLeft } from "react-icons/fa"; // Import back arrow icon

const ListenerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // For navigation
  const [listenerData, setListenerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListenerData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/listener/${id}`);
        if (response.data.status === "200") {
          setListenerData(response.data.data);
        } else {
          setError("Failed to fetch listener data");
        }
      } catch (err) {
        setError("Error fetching data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListenerData();
  }, [id]);

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1); // Go back to previous page
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
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!listenerData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Không tìm thấy thông tin</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 transition-colors hover:text-gray-800"
          >
            <FaArrowLeft className="mr-2" />
            <span>Quay lại</span>
          </button>
        </div>
        {/* Header Section with Back Icon */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
              {listenerData.avatarUrl ? (
                <img
                  src={listenerData.avatarUrl}
                  alt="Avatar"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl text-gray-500">
                  {listenerData.fullName.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {listenerData.fullName}
              </h1>
              <p className="text-gray-600">
                Giới tính: {listenerData.gender === "Female" ? "Nữ" : "Nam"}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-700">
            Giới thiệu
          </h2>
          <p className="leading-relaxed text-gray-600">
            {listenerData.description}
          </p>
        </div>

        {/* Contact Info */}
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-700">
            Thông tin liên hệ
          </h2>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Email:</span>{" "}
              {listenerData.getAccountResponse.email}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Số điện thoại:</span>{" "}
              {listenerData.getAccountResponse.phone}
            </p>
          </div>
        </div>

        {/* Pricing and Rating */}
        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <p className="text-gray-600">Giá dịch vụ</p>
            <p className="text-xl font-bold text-green-600">
              {formatPrice(listenerData.price)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Đánh giá</p>
            <p className="text-xl font-bold text-yellow-500">
              {listenerData.star} <span className="text-gray-400">/ 5</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListenerProfile;
