import React, { useState, useEffect } from "react";
import ProfileInfo from "./ProfileInfo";
import WalletAndTransactions from "./WalletAndTransactions";
import Bookings from "./Bookings";
import BookingModal from "./BookingModal";
import { fetchUserData } from "../../services/profileService";
import ListenerUpdateInfo from "../Listener/ListenerUpdateInfo";
import axiosInstance from "../../config/axios";

const Profile = () => {
  const storedUser = localStorage.getItem("user");
  const { accountId, role } = storedUser ? JSON.parse(storedUser) : {};
  const [user, setUser] = useState(null);
  const [listenerData, setListenerData] = useState(null); // New state for listener-specific data
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
        // Fetch general user data
        const { user, walletBalance, transactions, bookings } =
          await fetchUserData(accountId, currentPage, currentBookingPage);
        setUser(user);
        setWalletBalance(walletBalance);
        setTransactions(transactions.items);
        setTotalPages(transactions.totalPages);
        setBookings(bookings.items);
        setTotalBookingPages(bookings.totalPages);

        // If the user is a listener, fetch listener-specific data
        if (user.role.toLowerCase() === "listener") {
          const listenerResponse = await axiosInstance.get(
            `/listener/account/${accountId}`,
          );
          if (listenerResponse.data.status === "200") {
            setListenerData(listenerResponse.data.data);
          } else {
            throw new Error("Không thể lấy thông tin người nghe");
          }
        }
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

  // Merge user and listenerData for the ListenerUpdateInfo component
  const listenerUserData = listenerData ? { ...user, ...listenerData } : user;

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
            {listenerData ? (
              <ListenerUpdateInfo user={listenerUserData} />
            ) : (
              <div className="rounded-lg bg-white p-6 shadow">
                <p className="text-gray-600">
                  Đang tải thông tin người nghe...
                </p>
              </div>
            )}
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
