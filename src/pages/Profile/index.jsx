import React, { useState, useEffect } from "react";
import ProfileInfo from "./ProfileInfo";
import WalletAndTransactions from "./WalletAndTransactions";
import Bookings from "./Bookings";
import BookingModal from "./BookingModal";
import { fetchUserData } from "../../services/profileService";

const Profile = () => {
  const storedUser = localStorage.getItem("user");
  const { accountId } = storedUser ? JSON.parse(storedUser) : {};
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentBookingPage, setCurrentBookingPage] = useState(1);
  const [totalBookingPages, setTotalBookingPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (!accountId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { user, walletBalance, transactions, bookings } =
          await fetchUserData(accountId, currentPage, currentBookingPage);
        setUser(user);
        setWalletBalance(walletBalance);
        setTransactions(transactions.items);
        setTotalPages(transactions.totalPages);
        setBookings(bookings.items);
        setTotalBookingPages(bookings.totalPages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId, currentPage, currentBookingPage]);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  if (!user)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Không tìm thấy thông tin người dùng</p>
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-gray-100 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <ProfileInfo user={user} />
        {user.role.toLowerCase() !== "listener" ? (
          <div className="space-y-6 lg:w-1/2">
            <WalletAndTransactions
              walletBalance={walletBalance}
              transactions={transactions}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
            <Bookings
              bookings={bookings}
              currentBookingPage={currentBookingPage}
              totalBookingPages={totalBookingPages}
              setCurrentBookingPage={setCurrentBookingPage}
              handleViewDetails={handleViewDetails}
            />
          </div>
        ) : (
          <div className="lg:w-1/2">
            <WalletAndTransactions
              walletBalance={walletBalance}
              transactions={transactions}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
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

export default Profile;
