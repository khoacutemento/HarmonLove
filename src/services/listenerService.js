import axiosInstance from "../config/axios";
import { SERVER_URL } from "../constants";

export const getListeners = async ({ topic, listenerType, sortByPrice }) => {
  try {
    const params = {};
    if (topic) params.topicNameEnum = topic;
    if (listenerType) params.listenerTypeEnum = listenerType;
    if (sortByPrice !== null) params.sortByPrice = sortByPrice ? "asc" : "desc";

    console.log("API Request Params:", params); // Debug log

    const response = await axiosInstance.get(`${SERVER_URL}/listener`, {
      params,
    });
    if (response.status === 200) {
      console.log("API Response:", response.data.data); // Debug log
      return response.data.data;
    } else {
      throw new Error("Lấy danh sách người nghe thất bại");
    }
  } catch (error) {
    console.error("API Error:", error.response?.data?.message || error.message);
    throw error.response?.data?.message || "Lấy danh sách người nghe thất bại!";
  }
};
