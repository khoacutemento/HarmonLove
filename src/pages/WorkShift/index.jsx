import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axios";
import { FaChevronDown, FaChevronUp, FaEdit, FaTrash } from "react-icons/fa";

const ROLES = {
  CUSTOMER: "Customer",
  LISTENER: "Listener",
  ADMIN: "Admin",
};

const WorkShift = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");

  // Memoize the user object to prevent re-creation on every render
  const user = useMemo(
    () => (storedUser ? JSON.parse(storedUser) : null),
    [storedUser],
  );
  const { accountId } = user || {};

  const [workshifts, setWorkshifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    day: "Monday",
    startTime: { hour: "00", minute: "00" },
    endTime: { hour: "00", minute: "00" },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isFormExpanded, setIsFormExpanded] = useState(false); // Toggle for create form
  const [isUpdateFormExpanded, setIsUpdateFormExpanded] = useState(false); // Toggle for update form
  const [selectedWorkshift, setSelectedWorkshift] = useState(null); // Track the workshift being updated
  const isMounted = useRef(true); // Track if the component is mounted

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const workshiftsPerPage = 5; // Number of workshifts per page

  // Days of the week for the dropdown
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Hours and minutes for time selection
  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0"),
  );

  // Fetch workshifts
  useEffect(() => {
    if (!user || user.role !== ROLES.LISTENER) {
      navigate("/");
      return;
    }

    console.log("useEffect triggered for fetching workshifts");

    const fetchWorkshifts = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `api/workshift/account/${accountId}`,
        );
        console.log("API Response:", response.data.data);
        if (isMounted.current) {
          setWorkshifts(response.data.data.items); // Assuming the response is an array of workshifts
        }
      } catch (err) {
        if (isMounted.current) {
          setError("Có lỗi xảy ra khi tải danh sách ca làm việc");
          console.error("Error fetching workshifts:", err);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchWorkshifts();

    return () => {
      isMounted.current = false;
    };
  }, [accountId, navigate, user]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "startHour" || name === "startMinute") {
      setFormData((prev) => ({
        ...prev,
        startTime: {
          ...prev.startTime,
          [name === "startHour" ? "hour" : "minute"]: value,
        },
      }));
    } else if (name === "endHour" || name === "endMinute") {
      setFormData((prev) => ({
        ...prev,
        endTime: {
          ...prev.endTime,
          [name === "endHour" ? "hour" : "minute"]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle Create Workshift
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const startTime = `${formData.startTime.hour}:${formData.startTime.minute}:00`;
    const endTime = `${formData.endTime.hour}:${formData.endTime.minute}:00`;

    console.log("Submitted data:", {
      day: formData.day,
      startTime,
      endTime,
    });

    try {
      const response = await axiosInstance.post(
        `/api/workshift/account/${accountId}?day=${formData.day}`,
        {
          startTime,
          endTime,
        },
      );

      console.log("API Response:", response.data);

      if (response.data.status === "200") {
        setMessage("Tạo ca làm việc thành công");
        setWorkshifts((prev) => [
          ...prev,
          {
            id: response.data.data?.id || Date.now().toString(),
            day: formData.day,
            startTime,
            endTime,
          },
        ]);
        setFormData({
          day: "Monday",
          startTime: { hour: "00", minute: "00" },
          endTime: { hour: "00", minute: "00" },
        });
        setCurrentPage(1);
        setIsFormExpanded(false);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage("Có lỗi xảy ra khi tạo ca làm việc");
      console.error("Error creating workshift:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Update Workshift (Open Update Form)
  const handleUpdateClick = (workshift) => {
    const [startHour, startMinute] = workshift.startTime.split(":");
    const [endHour, endMinute] = workshift.endTime.split(":");
    setFormData({
      day: workshift.day,
      startTime: { hour: startHour, minute: startMinute },
      endTime: { hour: endHour, minute: endMinute },
    });
    setSelectedWorkshift(workshift);
    setIsUpdateFormExpanded(true);
    setIsFormExpanded(false); // Collapse create form if open
  };

  // Handle Update Workshift Submission
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const startTime = `${formData.startTime.hour}:${formData.startTime.minute}:00`;
    const endTime = `${formData.endTime.hour}:${formData.endTime.minute}:00`;

    try {
      const response = await axiosInstance.patch(
        `/api/workshift/${selectedWorkshift.id}?day=${formData.day}`,
        {
          startTime,
          endTime,
          isActive: true,
        },
      );

      if (response.data.status === "200") {
        setMessage("Cập nhật ca làm việc thành công");
        setWorkshifts((prev) =>
          prev.map((ws) =>
            ws.id === selectedWorkshift.id
              ? { ...ws, day: formData.day, startTime, endTime }
              : ws,
          ),
        );
        setFormData({
          day: "Monday",
          startTime: { hour: "00", minute: "00" },
          endTime: { hour: "00", minute: "00" },
        });
        setSelectedWorkshift(null);
        setIsUpdateFormExpanded(false);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage("Có lỗi xảy ra khi cập nhật ca làm việc");
      console.error("Error updating workshift:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Workshift
  const handleDelete = async (workshiftId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ca làm việc này?")) return;

    try {
      const response = await axiosInstance.delete(
        `/api/workshift/${workshiftId}`,
      );

      if (response.data.status === "200") {
        setMessage("Xóa ca làm việc thành công");
        setWorkshifts((prev) => prev.filter((ws) => ws.id !== workshiftId));
        setCurrentPage(1); // Reset to first page after deletion
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage(error.response.data.message);
      console.error("Error deleting workshift:", error);
    }
  };

  // Pagination logic
  const indexOfLastWorkshift = currentPage * workshiftsPerPage;
  const indexOfFirstWorkshift = indexOfLastWorkshift - workshiftsPerPage;
  const currentWorkshifts = workshifts.slice(
    indexOfFirstWorkshift,
    indexOfLastWorkshift,
  );
  const totalPages = Math.ceil(workshifts.length / workshiftsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="mw-full in-h-screen flex max-w-7xl items-center justify-center bg-gray-100">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full max-w-7xl items-center justify-center bg-gray-100">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-7xl bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          Quản lý ca làm việc
        </h1>

        {/* Toggleable Create Workshift Form */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <div
            className="flex cursor-pointer items-center justify-between"
            onClick={() => {
              setIsFormExpanded(!isFormExpanded);
              setIsUpdateFormExpanded(false); // Collapse update form if open
            }}
          >
            <h2 className="text-xl font-semibold text-gray-800">
              Tạo ca làm việc mới
            </h2>
            {isFormExpanded ? (
              <FaChevronUp className="text-gray-600" />
            ) : (
              <FaChevronDown className="text-gray-600" />
            )}
          </div>

          {isFormExpanded && (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Ngày
                </label>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Thời gian bắt đầu
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="startHour"
                      value={formData.startTime.hour}
                      onChange={handleInputChange}
                      className="w-1/2 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                    <select
                      name="startMinute"
                      value={formData.startTime.minute}
                      onChange={handleInputChange}
                      className="w-1/2 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {minutes.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Thời gian kết thúc
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="endHour"
                      value={formData.endTime.hour}
                      onChange={handleInputChange}
                      className="w-1/2 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                    <select
                      name="endMinute"
                      value={formData.endTime.minute}
                      onChange={handleInputChange}
                      className="w-1/2 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {minutes.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsFormExpanded(false)}
                  className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 ${
                    isSubmitting ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  {isSubmitting ? "Đang tạo..." : "Tạo ca làm việc"}
                </button>
              </div>
            </form>
          )}

          {message && isFormExpanded && (
            <div
              className={`mt-4 text-center ${
                message.includes("thành công")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Toggleable Update Workshift Form */}
        {selectedWorkshift && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
            <div
              className="flex cursor-pointer items-center justify-between"
              onClick={() => setIsUpdateFormExpanded(!isUpdateFormExpanded)}
            >
              <h2 className="text-xl font-semibold text-gray-800">
                Cập nhật ca làm việc
              </h2>
              {isUpdateFormExpanded ? (
                <FaChevronUp className="text-gray-600" />
              ) : (
                <FaChevronDown className="text-gray-600" />
              )}
            </div>

            {isUpdateFormExpanded && (
              <form onSubmit={handleUpdateSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Ngày
                  </label>
                  <select
                    name="day"
                    value={formData.day}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Thời gian bắt đầu
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="startHour"
                        value={formData.startTime.hour}
                        onChange={handleInputChange}
                        className="w-1/2 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {hours.map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>
                      <select
                        name="startMinute"
                        value={formData.startTime.minute}
                        onChange={handleInputChange}
                        className="w-1/2 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {minutes.map((minute) => (
                          <option key={minute} value={minute}>
                            {minute}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Thời gian kết thúc
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="endHour"
                        value={formData.endTime.hour}
                        onChange={handleInputChange}
                        className="w-1/2 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {hours.map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>
                      <select
                        name="endMinute"
                        value={formData.endTime.minute}
                        onChange={handleInputChange}
                        className="w-1/2 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {minutes.map((minute) => (
                          <option key={minute} value={minute}>
                            {minute}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUpdateFormExpanded(false);
                      setSelectedWorkshift(null);
                      setFormData({
                        day: "Monday",
                        startTime: { hour: "00", minute: "00" },
                        endTime: { hour: "00", minute: "00" },
                      });
                    }}
                    className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 ${
                      isSubmitting ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    {isSubmitting ? "Đang cập nhật..." : "Cập nhật ca làm việc"}
                  </button>
                </div>
              </form>
            )}

            {message && isUpdateFormExpanded && (
              <div
                className={`mt-4 text-center ${
                  message.includes("thành công")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        )}

        {/* Workshift Table */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Danh sách ca làm việc
          </h2>
          {workshifts.length === 0 ? (
            <p className="text-center text-gray-500">
              Bạn chưa có ca làm việc nào.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Ngày
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Thời gian bắt đầu
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Thời gian kết thúc
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentWorkshifts.map((workshift) => (
                      <tr
                        key={workshift.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-4 py-2 text-gray-800">
                          {workshift.day}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {workshift.startTime}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {workshift.endTime}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          <button
                            onClick={() => handleUpdateClick(workshift)}
                            className="mr-2 text-blue-500 hover:text-blue-700"
                            title="Cập nhật"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(workshift.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`rounded-lg px-4 py-2 text-white ${
                    currentPage === 1
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  Trang trước
                </button>
                <span className="text-gray-600">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`rounded-lg px-4 py-2 text-white ${
                    currentPage === totalPages
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  Trang sau
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/profile")}
            className="rounded-lg bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
          >
            Quay lại hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkShift;
