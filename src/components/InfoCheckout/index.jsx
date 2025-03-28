import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axios";

function InfoCheckout() {
  const storedUser = localStorage.getItem("user");
  const { accountId } = storedUser ? JSON.parse(storedUser) : {};
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!accountId) {
        setError("No account ID found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userResponse = await axiosInstance.get(
          `/user/account/${accountId}`,
        );
        if (userResponse.data.status === "200") {
          setUser(userResponse.data.data);
        } else {
          setError(userResponse.data.message);
        }
      } catch (err) {
        setError("Error fetching user profile");
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div className="flex flex-col rounded-lg border border-violet-200 bg-[#F1E0FD] p-5 text-gray-700">
      <h3 className="mb-5 text-2xl font-bold">Thông Tin Thanh Toán</h3>
      <div className="mb-5 flex w-1/2 flex-col gap-2">
        <label className="font-semibold">Họ Và Tên</label>
        <input
          value={user.fullName || ""}
          className="cursor-not-allowed rounded-lg border border-violet-400 bg-transparent px-4 py-2"
          disabled
        />
      </div>

      <div className="mb-5 flex w-1/2 flex-col gap-2">
        <label className="font-semibold">Địa Chỉ Email</label>
        <input
          value={user.email || ""}
          className="cursor-not-allowed rounded-lg border border-violet-400 bg-transparent px-4 py-2"
          disabled
        />
      </div>

      <div className="mb-5 flex w-1/2 flex-col gap-2">
        <label className="font-semibold">Số Điện Thoại</label>
        <input
          value={user.phone || ""}
          className="cursor-not-allowed rounded-lg border border-violet-400 bg-transparent px-4 py-2"
          disabled
        />
      </div>
    </div>
  );
}

export default InfoCheckout;
