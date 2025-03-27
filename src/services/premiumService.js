import axios from "axios";
import { SERVER_URL } from "../constants/index";
import axiosInstance from "../config/axios";
export const getPremiums = async () => {
  try {
    const response = await axios.get(`${SERVER_URL}/premium`);
    if (response.status === 200) {
      return response.data.data;
    } else {
      throw new Error("Lỗi khi lấy danh sách premium");
    }
  } catch (error) {
    throw new Error("Lỗi khi lấy danh sách premium", error.message);
  }
};

export const buyPremium = async (accountId, premiumId) => {
  try {
    const response = await axiosInstance.post(`${SERVER_URL}/userinfo`, {
      accountId: accountId,
      premiumId: premiumId,
    });
    if (response.status === 200) {
      return response.data.data;
    } else {
      throw new Error("Lỗi khi mua gói premium");
    }
  } catch (error) {
    throw new Error("Lỗi khi mua gói premium", error.message);
  }
};
