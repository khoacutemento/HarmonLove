import React from "react";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";

function RootLayout() {
  return (
    <div className="relative flex min-h-screen flex-col bg-theme scrollbar-hide">
      <div className="sticky top-0 z-50">
        <Header />
      </div>
      <div className="flex justify-center overflow-y-auto">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default RootLayout;
