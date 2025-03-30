import React from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaVenusMars,
  FaCrown,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";

const ProfileInfo = ({ user }) => {
  return (
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
          <h1 className="text-2xl font-bold text-gray-800">{user.fullName}</h1>
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
              {user.userInfo.isActive ? "Đang hoạt động" : "Không hoạt động"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;
