import React, { useState } from "react";
import axiosInstance from "../../config/axios";

const ListenerUpdateInfo = ({ user }) => {
  // State for form data
  const [formData, setFormData] = useState({
    description: user?.description || "",
    price: user?.price || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // State to toggle between view and edit modes

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axiosInstance.put(
        `/listener/${user.id}`,
        formData,
      );

      if (response.status === 200) {
        setSuccess("Cập nhật thông tin thành công!");
        setIsEditing(false); // Switch back to view mode after successful update
      } else {
        throw new Error("Cập nhật thông tin thất bại");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Cập nhật thông tin thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel button (discard changes and switch back to view mode)
  const handleCancel = () => {
    setFormData({
      description: user?.description || "",
      price: user?.price || 0,
    }); // Reset form data to original user data
    setError(null);
    setSuccess(null);
    setIsEditing(false);
  };

  return (
    <div className="mt-5 rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <h2 className="mb-4 text-xl font-semibold">Thông tin cá nhân</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            Chỉnh sửa
          </button>
        )}
      </div>

      {isEditing ? (
        // Edit Mode: Show the form
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description Field */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows="3"
              placeholder="Nhập mô tả của bạn"
            />
          </div>

          {/* Price Field */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Giá (VND)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Nhập giá"
            />
          </div>

          {/* Error and Success Messages */}
          {error && <p className="text-red-600">{error}</p>}
          {success && <p className="text-green-600">{success}</p>}

          {/* Submit and Cancel Buttons */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white ${
                loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Hủy
            </button>
          </div>
        </form>
      ) : (
        // View Mode: Display the information
        <div className="space-y-4">
          <div>
            <p className="block text-sm font-medium text-gray-700">Mô tả</p>
            <p className="mt-1 text-gray-900">
              {formData.description || "Chưa có mô tả"}
            </p>
          </div>
          <div>
            <p className="block text-sm font-medium text-gray-700">Giá (VND)</p>
            <p className="mt-1 text-gray-900">
              {formData.price ? formData.price.toLocaleString("vi-VN") : "0"}{" "}
              VND
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListenerUpdateInfo;
