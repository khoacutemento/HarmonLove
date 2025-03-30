import React from "react";
import { FaUserFriends } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

function SideBar() {
  const navigate = useNavigate();

  const items = [
    {
      key: 1,
      label: "Tất cả bạn bè",
      link: "friends", // Added link property
      icon: <FaUserFriends />,
    },
    {
      key: 2,
      label: "Lời mời kết bạn",
      link: "friends/requests",
      icon: <FaUserFriends />,
    },
    {
      key: 4,
      label: "Danh sách bạn bè đã từ chối",
      link: "friends/declined",
      icon: <FaUserFriends />,
    },
    {
      key: 3,
      label: "Đã chấp nhận kết bạn",
      link: "friends/accepted",
      icon: <FaUserFriends />,
    },
    {
      key: 5,
      label: "Danh sách bạn bè đã chặn",
      link: "friends/blocks",
      icon: <FaUserFriends />,
    },
  ];

  const handleNavigation = (link) => {
    navigate(`/personal/${link}`);
  };

  return (
    <div className="sticky top-0 flex h-screen flex-col items-start justify-start rounded-lg bg-custom-gradient p-2">
      <h3 className="px-3 py-5 text-xl font-bold">Bạn Bè</h3>
      <div className="flex w-full flex-col items-start justify-start">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex w-full cursor-pointer items-center justify-between rounded-md p-3 hover:bg-stone-200/70"
            onClick={() => handleNavigation(item.link)}
          >
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-gray-200 p-2 text-heading">
                {item.icon}
              </span>
              <span className="font-semibold">{item.label}</span>
            </div>
            <FaChevronRight className="text-gray-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideBar;
