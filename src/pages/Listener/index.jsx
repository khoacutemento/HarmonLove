import React, { useEffect, useRef, useState } from "react";
import { getListeners } from "../../services/listenerService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Item from "./Item";
import { FaFilter } from "react-icons/fa";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axiosInstance from "../../config/axios";

function Listener() {
  const navigate = useNavigate();
  const [listeners, setListeners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [size, setSize] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [priceSortOpen, setPriceSortOpen] = useState(false);
  const [topicFilterOpen, setTopicFilterOpen] = useState(false);
  const [listenerTypeFilterOpen, setListenerTypeFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    topic: "",
    listenerType: "",
    sortByPrice: null,
  });
  const [selectedListener, setSelectedListener] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date("2025-03-25"));
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duration, setDuration] = useState("30 phút");
  const [topic, setTopic] = useState("Rối loạn lo âu");
  const [userRequest, setUserRequest] = useState("");
  const topicDropdownRef = useRef(null);
  const listenerTypeDropdownRef = useRef(null);
  const priceDropdownRef = useRef(null);

  const topicNameEnum = [
    { key: "StressAnxiety", label: "Stress Lo Âu" },
    { key: "Depression", label: "Trầm Cảm" },
    { key: "Relationships", label: "Quan Hệ" },
    { key: "WorkStudy", label: "Công Việc/Học Tập" },
    { key: "SelfConfidence", label: "Tự Tin" },
    { key: "EmotionalControl", label: "Kiểm Soát Cảm Xúc" },
    { key: "LossTrauma", label: "Mất Mát/Chấn Thương" },
    { key: "SleepDisorder", label: "Rối Loạn Giấc Ngủ" },
    { key: "LifeOrientation", label: "Định Hướng Cuộc Sống" },
    { key: "CommunicationSkills", label: "Kỹ Năng Giao Tiếp" },
  ];

  const listenerTypeEnum = [
    { key: "Tarot", label: "Tarot" },
    { key: "Share", label: "Chia Sẻ" },
  ];

  const durationOptions = ["30 phút", "1 tiếng", "2 tiếng", "Tùy chọn"];
  const topicOptions = ["Rối loạn lo âu", "Trầm cảm", "PTSD", "OCD", "Khác"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getListeners({
          topic: filters.topic || undefined,
          listenerType: filters.listenerType || undefined,
          sortByPrice: filters.sortByPrice,
        });
        setListeners(response.items || []);
        setCurrentPage(response.page || 1);
        setSize(response.size || 1);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        toast.error(error.message || "Lỗi khi lấy danh sách người nghe");
      }
    };
    fetchData();
  }, [filters]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        topicDropdownRef.current &&
        !topicDropdownRef.current.contains(event.target) &&
        listenerTypeDropdownRef.current &&
        !listenerTypeDropdownRef.current.contains(event.target) &&
        priceDropdownRef.current &&
        !priceDropdownRef.current.contains(event.target)
      ) {
        setPriceSortOpen(false);
        setTopicFilterOpen(false);
        setListenerTypeFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedListener && selectedDate) {
      const fetchAvailableSlots = async () => {
        try {
          const formattedDate = selectedDate.toISOString().split("T")[0];
          const response = await axiosInstance.get(
            `/workshift/account/${selectedListener.accountId}/available?date=${formattedDate}`,
          );
          if (response.data.status === "200") {
            setAvailableSlots(response.data.data.items || []);
          } else {
            toast.error(response.data.message || "Lỗi khi lấy ca làm việc");
            setAvailableSlots([]);
          }
        } catch (error) {
          toast.error(error.message || "Lỗi khi lấy ca làm việc");
          setAvailableSlots([]);
        }
      };
      fetchAvailableSlots();
    }
  }, [selectedListener, selectedDate]);

  const handleSortByPrice = (value) => {
    console.log("Sorting by price:", value);
    setFilters((prev) => ({ ...prev, sortByPrice: value }));
    setPriceSortOpen(false);
  };

  const handleTopicFilter = (topicVtopic) => {
    console.log("Selected topic:", topic);
    setFilters((prev) => ({ ...prev, topic }));
    setTopicFilterOpen(false);
  };

  const handleListenerTypeFilter = (listenerType) => {
    console.log("Selected listener type:", listenerType);
    setFilters((prev) => ({ ...prev, listenerType }));
    setListenerTypeFilterOpen(false);
  };

  const clearFilters = () => {
    console.log("Clearing filters");
    setFilters({
      topic: "",
      listenerType: "",
      sortByPrice: null,
    });
  };

  const handleBookListener = (listener) => {
    setSelectedListener(listener);
    setSelectedDate(new Date("2025-03-25"));
    setAvailableSlots([]);
    setSelectedSlot(null);
    setDuration("30 phút");
    setTopic("Rối loạn lo âu");
    setUserRequest("");
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      toast.error("Vui lòng chọn một khung giờ trước khi đặt lịch!");
      return;
    }
    if (!duration) {
      toast.error("Vui lòng chọn thời gian thuê!");
      return;
    }
    if (!topic) {
      toast.error("Vui lòng chọn vấn đề gặp phải!");
      return;
    }

    try {
      const formattedDate =
        selectedDate.toISOString().split("T")[0] + "T15:26:47.473Z"; // Match the format in the API
      const response = await axiosInstance.post(
        `/booking?id=${selectedSlot.id}`,
        {
          date: formattedDate,
          status: "NONE",
          duration: duration,
          topic: topic,
          userRequest: userRequest || undefined, // Include user request if provided
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.status === "200") {
        toast.success(
          `Đã đặt lịch thành công với ${selectedListener.name} vào ${selectedSlot.day}, từ ${selectedSlot.startTime} đến ${selectedSlot.endTime}!`,
        );
        setIsModalOpen(false);
        setSelectedListener(null);
        setSelectedSlot(null);
        setAvailableSlots([]);
      } else {
        toast.error(response.data.message || "Lỗi khi đặt lịch");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi đặt lịch");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListener(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  return (
    <div className="my-10 flex w-full max-w-[90rem] flex-col items-start px-4 md:px-8">
      <h1 className="text-xl font-bold text-heading md:text-3xl">
        DANH SÁCH NGƯỜI NGHE
      </h1>

      {/* FILTER & SORT SECTION */}
      <div className="my-6 flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="my-1 flex flex-wrap items-center gap-3">
          <div className="relative" ref={topicDropdownRef}>
            <button
              className="flex items-center gap-2 rounded-lg border border-heading px-3 py-1 text-heading"
              onClick={() => setTopicFilterOpen(!topicFilterOpen)}
            >
              <FaFilter />
              <span className="text-sm md:text-lg">Chủ Đề</span>
              {topicFilterOpen ? (
                <RiArrowDropUpLine />
              ) : (
                <RiArrowDropDownLine />
              )}
            </button>
            {topicFilterOpen && (
              <div className="absolute left-0 z-50 mt-2 w-48 rounded-lg border border-gray-400 bg-white p-2 shadow-lg">
                <button
                  className="w-full cursor-pointer p-1 text-left hover:bg-gray-100"
                  onClick={() => handleTopicFilter("")}
                >
                  Tất Cả
                </button>
                {topicNameEnum.map((topic) => (
                  <button
                    key={topic.key}
                    className="w-full cursor-pointer p-1 text-left hover:bg-gray-100"
                    onClick={() => handleTopicFilter(topic.key)}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={listenerTypeDropdownRef}>
            <button
              className="flex items-center gap-2 rounded-lg border border-heading px-3 py-1 text-heading"
              onClick={() => setListenerTypeFilterOpen(!listenerTypeFilterOpen)}
            >
              <FaFilter />
              <span className="text-sm md:text-lg">Loại Người Nghe</span>
              {listenerTypeFilterOpen ? (
                <RiArrowDropUpLine />
              ) : (
                <RiArrowDropDownLine />
              )}
            </button>
            {listenerTypeFilterOpen && (
              <div className="absolute left-0 z-50 mt-2 w-48 rounded-lg border border-gray-400 bg-white p-2 shadow-lg">
                <button
                  className="w-full cursor-pointer p-1 text-left hover:bg-gray-100"
                  onClick={() => handleListenerTypeFilter("")}
                >
                  Tất Cả
                </button>
                {listenerTypeEnum.map((type) => (
                  <button
                    key={type.key}
                    className="w-full cursor-pointer p-1 text-left hover:bg-gray-100"
                    onClick={() => handleListenerTypeFilter(type.key)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {(filters.topic ||
            filters.listenerType ||
            filters.sortByPrice !== null) && (
            <button
              className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 md:text-lg"
              onClick={clearFilters}
            >
              Xóa Bộ Lọc
            </button>
          )}
        </div>

        <div className="relative flex items-center">
          <p className="mr-3 text-sm md:text-lg">Sắp xếp theo:</p>
          <div className="relative" ref={priceDropdownRef}>
            <button
              className="flex cursor-pointer items-center gap-1 rounded-lg border border-gray-400 px-3 py-1"
              onClick={() => setPriceSortOpen(!priceSortOpen)}
            >
              Giá
              {priceSortOpen ? <RiArrowDropUpLine /> : <RiArrowDropDownLine />}
            </button>
            {priceSortOpen && (
              <div className="absolute left-0 z-50 mt-2 w-32 rounded-lg border border-gray-400 bg-white p-2 shadow-lg">
                <button
                  className="w-full cursor-pointer p-1 text-left hover:bg-gray-100"
                  onClick={() => handleSortByPrice(true)}
                >
                  Thấp - Cao
                </button>
                <button
                  className="w-full cursor-pointer p-1 text-left hover:bg-gray-100"
                  onClick={() => handleSortByPrice(false)}
                >
                  Cao - Thấp
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LISTENER LIST */}
      {listeners.length > 0 ? (
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {listeners.map((listener, index) => (
            <div key={index} className="relative">
              <Item listener={listener} />
              <button
                className="mt-2 w-full rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                onClick={() => handleBookListener(listener)}
              >
                Đặt Lịch
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-auto flex">
          <div className="mt-16 flex flex-col items-center text-center text-heading">
            <p className="text-lg font-medium">
              Hiện tại chưa có danh sách người nghe nào
            </p>
            <p className="text-base">Vui lòng quay lại sau</p>
            <button
              className="mt-6 rounded-lg bg-text px-6 py-3 font-medium text-white transition-all hover:bg-opacity-80"
              onClick={() => navigate("/")}
            >
              Trở về
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-3xl rounded-lg bg-[#F3E8FF] p-6 shadow-lg">
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Calendar Section */}
              <div className="w-full md:w-1/2">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="yyyy-MM-dd"
                  inline
                  className="w-full rounded-lg bg-white p-2"
                />
              </div>

              {/* Booking Details Section */}
              <div className="flex w-full flex-col gap-4 md:w-1/2">
                {/* Time Slots */}
                <div className="flex flex-wrap gap-2">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        className={`rounded-lg px-4 py-2 text-sm font-medium ${
                          selectedSlot?.id === slot.id
                            ? "bg-purple-500 text-white"
                            : "bg-white text-gray-700"
                        } transition-colors hover:bg-purple-400 hover:text-white`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot.startTime.split(":").slice(0, 2).join(":")} -{" "}
                        {slot.endTime.split(":").slice(0, 2).join(":")}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-red-500">
                      Không có khung giờ nào khả dụng cho ngày này.
                    </p>
                  )}
                </div>

                {/* Duration Selector */}
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Thời gian thuê
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {durationOptions.map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="duration"
                          value={option}
                          checked={duration === option}
                          onChange={() => setDuration(option)}
                          className="text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Topic Selector */}
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Vấn đề gặp phải
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {topicOptions.map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="topic"
                          value={option}
                          checked={topic === option}
                          onChange={() => setTopic(option)}
                          className="text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* User Request */}
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Yêu cầu cụ thể của bạn (Nếu có)
                  </p>
                  <textarea
                    value={userRequest}
                    onChange={(e) => setUserRequest(e.target.value)}
                    placeholder="Hãy viết yêu cầu của bạn ở đây nhé"
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                  />
                </div>

                {/* Confirm Button */}
                <div className="flex justify-end">
                  <button
                    className="rounded-lg bg-purple-500 px-6 py-2 text-white transition-colors hover:bg-purple-600"
                    onClick={handleConfirmBooking}
                  >
                    Đặt Lịch
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Listener;
