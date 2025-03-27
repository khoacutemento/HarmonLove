import React from "react";

function InfoCheckout() {
  const person = {
    name: "Nguyễn Thúc Thùy Tiên",
    email: "tiencute@gmail.com",
    phone: "0901232323",
  };
  return (
    <div className="flex flex-col rounded-lg border border-violet-200 bg-[#F1E0FD] p-5 text-gray-700">
      <h3 className="mb-5 text-2xl font-bold">Thông Tin Thanh Toán</h3>
      <div className="mb-5 flex w-1/2 flex-col gap-2">
        <label className="font-semibold">Họ Và Tên</label>
        <input
          value={person.name}
          className="cursor-not-allowed rounded-lg border border-violet-400 bg-transparent px-4 py-2"
          disabled
        />
      </div>

      <div className="mb-5 flex w-1/2 flex-col gap-2">
        <label className="font-semibold">Địa Chỉ Email</label>
        <input
          value={person.email}
          className="cursor-not-allowed rounded-lg border border-violet-400 bg-transparent px-4 py-2"
          disabled
        />
      </div>

      <div className="mb-5 flex w-1/2 flex-col gap-2">
        <label className="font-semibold">Số Điện Thoại</label>
        <input
          value={person.phone}
          className="cursor-not-allowed rounded-lg border border-violet-400 bg-transparent px-4 py-2"
          disabled
        />
      </div>
    </div>
  );
}

export default InfoCheckout;
