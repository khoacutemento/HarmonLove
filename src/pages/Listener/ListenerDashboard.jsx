// src/components/ListenerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axios";
import { FaArrowLeft } from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const ListenerDashboard = () => {
  const storedUser = localStorage.getItem("user");
  const { accountId } = storedUser ? JSON.parse(storedUser) : {};
  const navigate = useNavigate();
  const [listenerData, setListenerData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [listenerResponse, dashboardResponse] = await Promise.all([
          axiosInstance.get(`/listener/account/${accountId}`),
          axiosInstance.get(`/dashboard/listener`),
        ]);

        if (listenerResponse.data.status === "200") {
          setListenerData(listenerResponse.data.data);
        } else {
          setError("Failed to fetch listener data");
        }

        if (dashboardResponse.data.status === "200") {
          setDashboardData(dashboardResponse.data.data);
        } else {
          setError("Failed to fetch dashboard data");
        }
      } catch (err) {
        setError("Error fetching data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId]);

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Bar Chart Data (Monthly Bookings)
  const barChartData = {
    labels: dashboardData?.chart.labels || [],
    datasets: [
      {
        label: "Số lượng booking",
        data: dashboardData?.chart.values || [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Pie Chart Data (Booking Status)
  const pieChartData = {
    labels: ["Thành công", "Đã hủy"],
    datasets: [
      {
        data: [
          dashboardData?.totalBookingSuccess || 0,
          dashboardData?.totalBookingCancel || 0,
        ],
        backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
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
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!listenerData || !dashboardData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Không tìm thấy dữ liệu</p>
      </div>
    );
  }

  // Calculate total earnings based on successful bookings and price
  const totalEarnings = dashboardData.totalBookingSuccess * listenerData.price;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md">
        {/* Header */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-gray-600 transition-colors hover:text-gray-800"
        >
          <FaArrowLeft className="mr-2" />
          <span>Quay lại</span>
        </button>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard - {listenerData.fullName}
          </h1>
        </div>

        {/* Profile Info */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-700">
              Thông tin
            </h2>
            <p>Email: {listenerData.getAccountResponse.email}</p>
            <p>SĐT: {listenerData.getAccountResponse.phone}</p>
            <p>Giá: {formatPrice(listenerData.price)}</p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-700">
              Tổng quan
            </h2>
            <p>Tổng booking: {dashboardData.totalBookings}</p>
            <p>Tổng thu nhập: {formatPrice(totalEarnings)}</p>
            <p>Đánh giá trung bình: {dashboardData.averageStars} / 5</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-700">
              Booking theo thời gian
            </h2>
            <Bar data={barChartData} options={chartOptions} />
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-700">
              Trạng thái booking
            </h2>
            <Pie data={pieChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListenerDashboard;
