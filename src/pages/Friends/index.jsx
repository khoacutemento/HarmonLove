import React from "react";
import SideBar from "./SideBar";
import { Outlet } from "react-router-dom";
function Friends() {
  return (
    <div className="grid max-w-7xl grid-cols-12 gap-5 overflow-hidden py-5">
      <div className="col-span-4 h-full">
        {" "}
        <div className="sticky top-0">
          <SideBar />
        </div>
      </div>

      <div className="col-span-8 overflow-y-auto rounded-lg bg-gray-200">
        <Outlet />
      </div>
    </div>
  );
}

export default Friends;
