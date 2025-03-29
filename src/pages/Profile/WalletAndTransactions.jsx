import React from "react";
import {
  FaWallet,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const WalletAndTransactions = ({
  walletBalance,
  transactions,
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  const navigate = useNavigate();

  const handleDeposit = () => {
    navigate("/deposit");
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-700">
            <FaWallet className="text-green-500" /> Số dư ví
          </h2>
          <p className="text-2xl font-bold text-gray-800">
            {walletBalance.toLocaleString()} VND
          </p>
        </div>
        <button
          onClick={handleDeposit}
          className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-lg font-semibold text-white hover:bg-blue-600"
        >
          Nạp Thêm
        </button>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-700">
          Lịch sử giao dịch
        </h2>
        {transactions.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-gray-500">
            Không có giao dịch để hiển thị
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Mã đơn</th>
                    <th className="px-4 py-3">Số tiền</th>
                    <th className="px-4 py-3">Loại</th>
                    <th className="px-4 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((trans) => (
                    <tr key={trans.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{trans.orderCode}</td>
                      <td className="px-4 py-3">
                        {trans.amount.toLocaleString()} VND
                      </td>
                      <td className="px-4 py-3">{trans.type}</td>
                      <td className="flex items-center gap-1 px-4 py-3">
                        {trans.status === "SUCCESS" && (
                          <FaCheckCircle className="text-green-500" />
                        )}
                        {trans.status === "FAILED" && (
                          <FaTimesCircle className="text-red-500" />
                        )}
                        {trans.status === "PENDING" && (
                          <FaHourglassHalf className="text-yellow-500" />
                        )}
                        {trans.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-gray-600">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaChevronLeft /> Trước
              </button>
              <span>
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tiếp <FaChevronRight />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WalletAndTransactions;
