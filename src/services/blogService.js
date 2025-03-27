import axiosInstance from "../config/axios";
import { SERVER_URL } from "../constants";

export const getBlogs = async () => {
  try {
    const response = await axiosInstance(`${SERVER_URL}/blog`);
    if (response.status === 200) {
      return response.data.data;
    } else {
      throw new Error("Lỗi khi tải blogs");
    }
  } catch (error) {
    throw new Error(error || "Lỗi khi tải blogs");
  }
};
