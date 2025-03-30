import React from "react";
import { FaChevronLeft, FaChevronRight, FaInfoCircle } from "react-icons/fa";

const Bookings = ({
  bookings,
  currentBookingPage,
  totalBookingPages,
  setCurrentBookingPage,
  handleViewDetails,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Upcoming":
        return (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            Sắp tới
          </span>
        );
      case "Completed":
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            Hoàn thành
          </span>
        );
      case "Cancelled":
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-gray-700">Lịch đặt hẹn</h2>
      {bookings.length === 0 ? (
        <div className="flex items-center justify-center py-6 text-gray-500">
          Không có lịch hẹn nào
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Người lắng nghe</th>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{booking.listenerName}</td>
                    <td className="px-4 py-3">
                      {new Date(booking.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{booking.time}</td>
                    <td className="px-4 py-3">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="flex items-center gap-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                      >
                        <FaInfoCircle /> Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-gray-600">
            <button
              onClick={() => setCurrentBookingPage(currentBookingPage - 1)}
              disabled={currentBookingPage === 1}
              className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaChevronLeft /> Trước
            </button>
            <span>
              Trang {currentBookingPage} / {totalBookingPages}
            </span>
            <button
              onClick={() => setCurrentBookingPage(currentBookingPage + 1)}
              disabled={currentBookingPage === totalBookingPages}
              className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Tiếp <FaChevronRight />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Bookings;
