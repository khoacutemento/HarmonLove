import axios from "axios";

import { SERVER_URL } from "../constants";
import { toast } from "react-toastify";
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${SERVER_URL}/auth`, {
      username,
      password,
    });
    if (response.status == 200) {
      return {
        token: response.data.data.token,
        refreshToken: response.data.data.refreshToken,
        user: {
          accountId: response.data.data.accountId,
          userName: response.data.data.userName,
          role: response.data.data.roleEnum,
        },
      };
    } else {
      toast.error("Đăng nhập thất bại");
    }
  } catch (error) {
    throw error.response?.data?.message || "Đăng nhập thất bại!";
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${SERVER_URL}/user`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status == 201) {
      return response.data.data;
    } else {
      throw new Error("Đăng ký thất bại");
    }
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error.response?.data || error.message);
    throw new Error("Đăng ký thất bại");
  }
};

export const verify = async (email, otp) => {
  try {
    const response = await axios.post(`${SERVER_URL}/user/verify-otp`, {
      email: email,
      otp: otp,
    });
    if (response.status === 200) {
      return response.data.data;
    } else {
      throw new Error("LỖi khi xác thực mã OTP");
    }
  } catch (error) {
    console.error(
      "Lỗi khi xác thực mã OTP",
      error.response?.data || error.message,
    );
    throw new Error("Lỗi khi xác thực OTP");
  }
};

export const resendOtp = async (email) => {
  try {
    const response = await axios.post(`${SERVER_URL}/user/resend-otp`, email, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      return response.data.data;
    } else {
      throw new Error("Lỗi khi gửi lại mã OTP");
    }
  } catch (error) {
    console.error("Lỗi khi gửi lại mã OTP");
    throw new Error("Lỗi khi gửi lại mã OTP");
  }
};
