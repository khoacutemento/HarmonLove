import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import Harmon_Logo from "../../assets/images/Harmon_Logo.png";
import { useNavigate } from "react-router-dom";
import BuyPremiumModal from "./BuyPremiumModal";
function Item({ item }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  return (
    <div className="flex w-full p-3 sm:w-1/2 sm:p-4 md:w-1/3 lg:w-1/3">
      <div className="flex h-full w-full flex-col items-center gap-3 rounded-xl bg-[#F1E0FD] p-4 transition-transform duration-300 hover:scale-105 sm:gap-4 sm:p-6 sm:hover:scale-110 md:gap-5 md:p-8 lg:p-10">
        <img
          src={Harmon_Logo}
          alt={item.type}
          className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20"
        />
        <h3 className="text-center text-lg font-bold text-heading sm:text-xl md:text-2xl">
          {item.type}
        </h3>
        <span className="text-center text-base font-medium text-heading sm:text-lg md:text-xl lg:text-2xl">
          {item.price.toLocaleString("vi-VN")} đ/tháng
        </span>
        <div className="mt-1 flex w-full flex-col items-start justify-start gap-2 sm:mt-2 sm:gap-3">
          <div className="flex w-full items-start justify-start">
            <FaStar className="mr-2 mt-1 size-3 flex-shrink-0 text-heading" />
            <p className="text-left text-sm text-[#696969] sm:text-base">
              Kết bạn với {item.friend} người bạn đồng hành
            </p>
          </div>
          <div className="flex w-full items-start justify-start">
            <FaStar className="mr-2 mt-1 size-3 flex-shrink-0 text-heading" />
            <p className="text-left text-sm text-[#696969] sm:text-base">
              {item.timelimit
                ? "Giới hạn thời gian gọi, trò chuyện"
                : "Không giới hạn thời gian gọi, trò chuyện thoải mái để sẻ chia và lắng nghe"}
            </p>
          </div>
          <div className="flex w-full items-start justify-start">
            <FaStar className="mr-2 mt-1 size-3 flex-shrink-0 text-heading" />
            <p className="text-left text-sm text-[#696969] sm:text-base">
              {item.match} lần đổi bạn đồng hành mỗi tháng để tìm ra sự kết nối
              phù hợp nhất
            </p>
          </div>
        </div>
        <div className="mt-auto pt-4">
          <button
            className="w-full rounded-lg bg-[#E6BFFF] px-6 py-2 text-sm font-medium text-[#8A55D4] sm:w-auto sm:px-8 sm:py-2.5 sm:text-base sm:font-semibold md:px-10 md:py-3"
            onClick={() => setIsModalOpen(true)}
          >
            Mua Ngay
          </button>
        </div>
      </div>
      {/* Buy Premium Modal */}
      <BuyPremiumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        premiumDetails={item}
      />
    </div>
  );
}

export default Item;
