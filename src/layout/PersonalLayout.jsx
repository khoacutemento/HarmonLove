import React from "react";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";

function PersonalLayout() {
  return (
    <div className="relative flex max-h-screen flex-col overflow-hidden bg-theme scrollbar-hide">
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      <div className="flex flex-1 justify-center overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default PersonalLayout;
