import React, { useState, useEffect } from "react";
import { fetchUserData } from "../../services/profileService";
import Bookings from "../Profile/Bookings";
import BookingModal from "../Profile/BookingModal";

const BookingsPage = () => {
  const storedUser = localStorage.getItem("user");
  const { accountId } = storedUser ? JSON.parse(storedUser) : {};
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentBookingPage, setCurrentBookingPage] = useState(1);
  const [totalBookingPages, setTotalBookingPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (!accountId) return;

    const fetchBookingsData = async () => {
      setLoading(true);
      try {
        const { bookings } = await fetchUserData(
          accountId,
          1, // Default transaction page (not used here)
          currentBookingPage,
        );
        setBookings(bookings.items);
        setTotalBookingPages(bookings.totalPages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingsData();
  }, [accountId, currentBookingPage]);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          Quản lý lịch hẹn
        </h1>
        <Bookings
          bookings={bookings}
          currentBookingPage={currentBookingPage}
          totalBookingPages={totalBookingPages}
          setCurrentBookingPage={setCurrentBookingPage}
          handleViewDetails={handleViewDetails}
        />
      </div>
      {showBookingModal && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setShowBookingModal(false)}
          accountId={accountId}
        />
      )}
    </div>
  );
};

export default BookingsPage;
