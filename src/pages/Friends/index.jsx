import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import axiosInstance from "../../config/axios";

function Friends() {
  const [searchPhone, setSearchPhone] = useState(""); // State for the phone number input
  const [searchResults, setSearchResults] = useState(null); // State for search results
  const [searchError, setSearchError] = useState(null); // State for search errors
  const [searchLoading, setSearchLoading] = useState(false); // State for search loading
  const navigate = useNavigate(); // For navigating to user profiles

  // Function to handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      const response = await axiosInstance.get(
        `/friendship/search?phone=${searchPhone}`,
      );

      if (response.status === 200) {
        setSearchResults(response.data.data);
      } else {
        setSearchError(response.data.message || "Failed to search for user");
      }
    } catch (err) {
      setSearchError("Error searching for user");
      console.error("Error searching for user:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Function to handle clicking on a search result
  const handleResultClick = (userId) => {
    navigate(`/user/${userId}/add`); // Navigate to the user's profile with "add" action
  };

  return (
    <div className="grid max-w-7xl grid-cols-12 gap-5 overflow-hidden py-5">
      {/* Sidebar */}
      <div className="col-span-4 h-full">
        <div className="sticky top-0">
          <SideBar />
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-8 overflow-y-auto rounded-lg bg-gray-200 p-5">
        {/* Search Bar */}
        <div className="mb-5">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <input
              type="text"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="Enter phone number to search..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={searchLoading}
              className={`rounded-md px-4 py-2 text-white transition-colors ${
                searchLoading
                  ? "cursor-not-allowed bg-blue-300"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>

        {/* Search Error */}
        {searchError && (
          <div className="mb-5 text-center text-red-500">{searchError}</div>
        )}

        {/* Search Results */}
        {searchResults && (
          <div className="mb-5 rounded-lg bg-white p-4 shadow-md">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              Search Results
            </h3>
            <div
              className="flex cursor-pointer items-center gap-4 rounded-md p-3 transition-colors hover:bg-gray-100"
              onClick={() => handleResultClick(searchResults.id)}
            >
              <img
                src={
                  searchResults.avatarUrl || "https://via.placeholder.com/50"
                }
                alt={searchResults.fullName}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-800">
                  {searchResults.fullName}
                </p>
                <p className="text-sm text-gray-600">{searchResults.email}</p>
                <p className="text-sm text-gray-600">{searchResults.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Outlet for nested routes */}
        <Outlet />
      </div>
    </div>
  );
}

export default Friends;
