import axiosInstance from "../config/axios";

const pageSize = 10;

export const fetchUserData = async (
  accountId,
  currentPage,
  currentBookingPage,
) => {
  try {
    const userResponse = await axiosInstance.get(`/user/account/${accountId}`);
    if (userResponse.data.status !== "200")
      throw new Error(userResponse.data.message);

    const walletResponse = await axiosInstance.get("/wallet");
    if (walletResponse.data.status !== "200")
      throw new Error(walletResponse.data.message);

    const transResponse = await axiosInstance.get(
      `/transaction?page=${currentPage}&size=${pageSize}`,
    );
    if (transResponse.data.status !== "200")
      throw new Error(transResponse.data.message);

    const bookingResponse = await axiosInstance.get(
      `/booking/account?page=${currentBookingPage}&size=${pageSize}`,
    );
    if (bookingResponse.data.status !== "200")
      throw new Error(bookingResponse.data.message);

    return {
      user: userResponse.data.data,
      walletBalance: walletResponse.data.data.balance,
      transactions: transResponse.data.data,
      bookings: bookingResponse.data.data,
    };
  } catch (err) {
    throw new Error(
      err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu",
    );
  }
};
