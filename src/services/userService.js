import axiosInstance from "../config/axios";
import { SERVER_URL } from "../constants";

export const deposit = async (amount, description) => {
  try {
    const response = await axiosInstance.post(`${SERVER_URL}/wallet`, {
      amount: amount,
      description: description,
    });
    if (response.status === 200) {
      return response.data.data;
    } else {
      throw new Error("Lỗi khi nạp tiền");
    }
  } catch (error) {
    throw new Error("Lỗi khi nạp tiền", error.message);
  }
};
