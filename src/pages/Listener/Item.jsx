import React from "react";
import { RiUser3Fill } from "react-icons/ri";
import { PiGenderIntersexBold } from "react-icons/pi";
import { FaHeart, FaCoins } from "react-icons/fa6";
import { GoStarFill, GoStar } from "react-icons/go";
function Item({ listener }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border-2 border-white bg-violet-50 p-3 shadow-xl transition-transform duration-300 hover:scale-105 sm:p-4 lg:p-5">
      <img
        src="https://chothuestudio.com/wp-content/uploads/2023/08/a3e1b7c1e2ac37659bba6e1145a5187b.jpg"
        alt={listener.fullName}
        className="h-40 w-full rounded-lg object-cover sm:h-48 md:h-56"
      />
      <div className="flex flex-col gap-2 text-center">
        <div className="flex items-center justify-between">
          <RiUser3Fill className="text-lg text-gray-500" />
          <p className="truncate text-sm font-bold text-heading sm:text-base">
            {listener.fullName}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <PiGenderIntersexBold className="text-lg text-gray-500" />
          <p className="text-sm text-heading sm:text-base">
            {listener.gender === "Male"
              ? "Nam"
              : listener.gender === "Female"
                ? "Nữ"
                : "Khác"}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <FaCoins className="text-lg text-gray-500" />
          <p className="text-sm text-heading sm:text-base">
            {listener.price.toLocaleString("vi-VN")} &#8363;
          </p>
        </div>
        <div className="flex items-center justify-between">
          <FaHeart className="text-lg text-gray-500" />
          <span className="flex gap-1 text-heading">
            <GoStar />
            <GoStar />
            <GoStarFill />
            <GoStarFill />
            <GoStarFill />
          </span>
        </div>
      </div>
      <button className="rounded-lg bg-purple-500 px-6 py-2 font-medium text-white hover:bg-purple-400">
        Chọn
      </button>
    </div>
  );
}

export default Item;
