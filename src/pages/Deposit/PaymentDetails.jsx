import React from "react";
import QRCode from "react-qr-code";

const PaymentDetails = ({ data }) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString("vi-VN");
  };

  return (
    <div className="mx-auto mb-10 mt-10 w-full max-w-7xl rounded bg-white p-6 shadow-xl">
      <h2 className="mb-6 text-2xl font-bold">Chi Tiết Thanh Toán</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="mb-6">
          <h3 className="mb-2 text-xl font-semibold">Thực Hiện Thanh Toán</h3>
          <div className="mb-4">
            <a
              href={data.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Thanh Toán Trực Tuyến
            </a>
          </div>
          <div>
            <QRCode value={data.qrCode} size={256} />
            <p className="mt-2 text-sm text-gray-600">
              Quét mã QR để thanh toán
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xl font-semibold">Chi Tiết Giao Dịch</h3>
          <dl className="mt-5">
            <div className="mt-2">
              <dt className="text-sm font-medium text-gray-500">
                Số Tài Khoản
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {data.accountNumber}
              </dd>
            </div>
            <div className="mt-2">
              <dt className="text-sm font-medium text-gray-500">Số Tiền</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {data.amount} {data.currency}
              </dd>
            </div>
            <div className="mt-2">
              <dt className="text-sm font-medium text-gray-500">Mô Tả</dt>
              <dd className="mt-1 break-words text-sm text-gray-900">
                {data.description}
              </dd>
            </div>
            <div className="mt-2">
              <dt className="text-sm font-medium text-gray-500">Mã Đơn Hàng</dt>
              <dd className="mt-1 text-sm text-gray-900">{data.orderCode}</dd>
            </div>
            <div className="mt-2">
              <dt className="text-sm font-medium text-gray-500">Trạng Thái</dt>
              <dd className="mt-1 text-sm text-gray-900">{data.status}</dd>
            </div>
            <div className="mt-2">
              <dt className="text-sm font-medium text-gray-500">Hết Hạn Vào</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(data.expiredAt)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
