import React from "react";
import { useNavigate } from "react-router-dom";
import Harmon_Logo from "../../assets/images/Harmon_Logo.png";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 bg-custom-gradient">
      <img src={Harmon_Logo} alt="Harmon" className="mb-5 w-28" />
      <h1 className="text-4xl font-bold text-heading">404</h1>
      <p className="text-lg font-semibold text-heading">
        Trang bạn đang tìm không tồn tại
      </p>
      <button
        onClick={() => navigate(-1)}
        aria-label="Trở lại trang trước"
        className="mt-5 rounded-lg bg-purple-400 px-4 py-2 text-lg font-semibold text-white duration-300 hover:scale-110"
      >
        Trở lại
      </button>
    </div>
  );
}

export default NotFound;
