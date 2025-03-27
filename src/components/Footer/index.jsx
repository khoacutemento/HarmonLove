import React from "react";
import MASTERCARD from "../../assets/images/MASTERCARD.png";
import NAPAS from "../../assets/images/NAPAS.png";
import VISA from "../../assets/images/VISA.png";
import { IoLogoInstagram } from "react-icons/io5";
import { FaFacebookF } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const customer_care = [
    {
      key: 1,
      label: "Blog",
      path: "/",
    },
    {
      key: 2,
      label: "Bài Test Tâm Lý",
      path: "/",
    },
    {
      key: 3,
      label: "Thanh Toán",
      path: "/",
    },
    {
      key: 4,
      label: "Hoàn Tiền",
      path: "/",
    },
    {
      key: 5,
      label: "Hỗ Trợ",
      path: "/",
    },
    {
      key: 6,
      label: "Chính Sách Bảo Hành",
      path: "/",
    },
  ];

  const about_harmon = [
    {
      key: 1,
      label: "Giới Thiệu Về Harmon",
      path: "/",
    },
    {
      key: 2,
      label: "Tuyển Dụng",
      path: "/",
    },
    {
      key: 3,
      label: "Chính Sách Bảo Mật",
      path: "/",
    },
    {
      key: 4,
      label: "Kênh Chuyện Của",
      path: "/",
    },
  ];

  const payment = [
    { key: 1, label: "MASTERCARD", image: MASTERCARD },
    { key: 2, label: "NAPAS", image: NAPAS },
    { key: 3, label: "VISA", image: VISA },
  ];

  const social_media = [
    {
      key: 1,
      label: "Facebook",
      icon: (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-800">
          <FaFacebookF className="text-lg text-white" />
        </div>
      ),
      path: "/",
    },
    {
      key: 2,
      label: "Instagram",
      icon: (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
          <IoLogoInstagram className="text-lg text-white" />
        </div>
      ),
      path: "/",
    },
  ];

  return (
    <footer className="sticky top-0 z-30 bg-custom-gradient px-4 py-10 text-heading">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:justify-items-center">
        <div className="flex flex-col">
          <h3 className="mb-5 text-lg font-bold">CHĂM SÓC KHÁCH HÀNG</h3>
          <ul className="flex flex-col gap-2">
            {customer_care.map((item, index) => {
              return (
                <li key={index} className="cursor-pointer hover:underline">
                  <Link to={item.path}>{item.label}</Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col">
          <h3 className="mb-5 text-lg font-bold">VỀ HARMON</h3>
          <ul className="flex flex-col gap-2">
            {about_harmon.map((item, index) => {
              return (
                <li key={index} className="cursor-pointer hover:underline">
                  <Link to={item.path}>{item.label}</Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col">
          <h3 className="mb-5 text-lg font-bold">THANH TOÁN</h3>
          <div className="flex flex-row gap-4 md:flex-col md:gap-2">
            {payment.map((item, index) => {
              return (
                <img
                  src={item.image}
                  alt={item.label}
                  key={index}
                  className="w-10 cursor-pointer hover:scale-105"
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-col">
          <h3 className="mb-5 text-lg font-bold">THEO DÕI CHÚNG TÔI TRÊN</h3>
          <div className="flex flex-col gap-2">
            {social_media.map((item, index) => {
              return (
                <Link
                  to={item.path}
                  key={index}
                  className="flex items-center space-x-2"
                >
                  {item.icon}
                  <p>{item.label}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-[#8A55D4]/70 pt-8 text-center text-sm">
        <p>© 2025 Harmon. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
