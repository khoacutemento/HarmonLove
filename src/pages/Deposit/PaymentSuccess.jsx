import React from "react";
import { useLocation } from "react-router-dom";

function PaymentSuccess() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Extract query parameters
  const code = queryParams.get("code");
  const id = queryParams.get("id");
  const cancel = queryParams.get("cancel");
  const status = queryParams.get("status");
  const orderCode = queryParams.get("orderCode");

  return (
    <div className="flex items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600">
            Thanh Toán Thành Công
          </h1>
          <p className="mt-2 text-gray-600">
            Cảm ơn bạn đã thực hiện giao dịch!
          </p>
        </div>

        {/* Payment Details */}
        <div className="space-y-4">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="font-medium text-gray-600">Mã giao dịch:</span>
            <span className="text-gray-800">{id}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="font-medium text-gray-600">Mã đơn hàng:</span>
            <span className="text-gray-800">{orderCode}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="font-medium text-gray-600">Trạng thái:</span>
            <span
              className={`font-semibold ${
                status === "PAID" ? "text-green-600" : "text-red-600"
              }`}
            >
              {status === "PAID" ? "Đã thanh toán" : "Thất bại"}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="font-medium text-gray-600">Mã phản hồi:</span>
            <span className="text-gray-800">{code}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Hủy bỏ:</span>
            <span className="text-gray-800">
              {cancel === "false" ? "Không" : "Có"}
            </span>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => (window.location.href = "/")} // Redirect to homepage or another page
            className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-white transition duration-300 hover:bg-indigo-700"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
