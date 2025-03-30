import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axios";

const FriendsProfile = () => {
  const { id, action } = useParams(); // Get both user id and action from route params
  const navigate = useNavigate(); // For redirecting after actions
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false); // For handling action button loading state
  const [actionError, setActionError] = useState(null); // For handling action errors
  const [friendshipId, setFriendshipId] = useState(null); // To store the friendship ID

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get(`/user/account/${id}`);
        setUserData(response.data.data);

        // Fetch the friendship ID
        const storedUser = localStorage.getItem("user");
        const { accountId } = storedUser
          ? JSON.parse(storedUser)
          : { accountId: null };

        if (accountId) {
          // Fetch friendship details to get the friendship ID
          const friendshipResponse = await axiosInstance.get(
            `/friendship/account/${accountId}/status?status=Request&friendId=${id}`,
          );
          if (
            friendshipResponse.data.status === "200" &&
            friendshipResponse.data.data.items.length > 0
          ) {
            setFriendshipId(friendshipResponse.data.data.items[0].id); // Assuming the first item is the relevant friendship
          }
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch friend data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  // Function to handle adding a friend
  const handleAddFriend = async () => {
    setActionLoading(true);
    setActionError(null);

    try {
      const storedUser = localStorage.getItem("user");
      const { accountId } = storedUser
        ? JSON.parse(storedUser)
        : { accountId: null };

      if (!accountId) {
        setActionError("User not logged in");
        setActionLoading(false);
        return;
      }

      const response = await axiosInstance.post(
        `/friendship?userId=${accountId}&friendId=${id}`,
      );

      if (response.data.status === "200") {
        alert("Friend request sent successfully!");
        navigate(`/user/account/${id}/view`); // Redirect to the profile without action param
      } else {
        setActionError(
          response.data.message || "Failed to send friend request",
        );
      }
    } catch (err) {
      setActionError("Error sending friend request");
      console.error("Error sending friend request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Function to update friendship status (Block, Decline, Accept)
  const updateFriendshipStatus = async (status) => {
    setActionLoading(true);
    setActionError(null);

    try {
      if (!friendshipId) {
        setActionError("Friendship ID not found");
        setActionLoading(false);
        return;
      }

      const response = await axiosInstance.patch(
        `/friendship/${friendshipId}`,
        {
          status,
          isActive: true, // Set isActive based on the status
        },
      );

      if (response.status === 200) {
        alert(`${status} action successful!`);
        navigate(`/user/account/${id}/view`); // Redirect to the profile without action param
      } else {
        setActionError(`Failed to ${status.toLowerCase()} friend`);
      }
    } catch (err) {
      setActionError(`Error performing ${status.toLowerCase()} action`);
      console.error(`Error performing ${status} action:`, err);
    } finally {
      setActionLoading(false);
    }
  };

  // Function to handle blocking a user
  const handleBlock = () => {
    updateFriendshipStatus("Block");
  };

  // Function to handle declining a friend request
  const handleDecline = () => {
    updateFriendshipStatus("Declined");
  };

  // Function to handle accepting a friend request
  const handleAccept = () => {
    updateFriendshipStatus("Accepted");
  };

  if (loading)
    return <div className="py-10 text-center">Loading friend's profile...</div>;
  if (error)
    return <div className="py-10 text-center text-red-500">{error}</div>;
  if (!userData) return null;

  return (
    <div className="mx-auto my-8 w-full max-w-4xl rounded-lg bg-white p-6 shadow-md">
      {/* Profile Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 flex items-center sm:mb-0">
          <div className="mr-6 h-32 w-32 overflow-hidden rounded-full">
            <img
              src={userData.avatarUrl || "https://via.placeholder.com/150"}
              alt="Friend's Avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userData.fullName}</h1>
            <p className="text-gray-600">{userData.email}</p>
            <span className="mt-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
              {action === "add"
                ? "Potential Friend"
                : action === "view"
                  ? "Profile View"
                  : action === "accept"
                    ? "Pending Friend Request"
                    : "Friend"}{" "}
              • {userData.role}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          {action === "add" ? (
            <>
              <button
                onClick={handleAddFriend}
                disabled={actionLoading}
                className={`rounded-md px-4 py-2 text-white transition-colors ${
                  actionLoading
                    ? "cursor-not-allowed bg-blue-300"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {actionLoading ? "Sending..." : "Add Friend"}
              </button>
              <button
                onClick={handleDecline}
                disabled={actionLoading}
                className={`rounded-md px-4 py-2 text-gray-800 transition-colors ${
                  actionLoading
                    ? "cursor-not-allowed bg-gray-200"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {actionLoading ? "Processing..." : "Decline"}
              </button>
              <button
                onClick={handleBlock}
                disabled={actionLoading}
                className={`rounded-md px-4 py-2 text-white transition-colors ${
                  actionLoading
                    ? "cursor-not-allowed bg-red-300"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {actionLoading ? "Processing..." : "Block"}
              </button>
            </>
          ) : action === "view" ? (
            // Minimal buttons for view-only mode
            <button
              onClick={() => navigate(-1)} // Go back to previous page
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
            >
              Back
            </button>
          ) : action === "accept" ? (
            // Buttons for accepting a friend request
            <>
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className={`rounded-md px-4 py-2 text-white transition-colors ${
                  actionLoading
                    ? "cursor-not-allowed bg-green-300"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {actionLoading ? "Processing..." : "Accept"}
              </button>
              <button
                onClick={handleDecline}
                disabled={actionLoading}
                className={`rounded-md px-4 py-2 text-gray-800 transition-colors ${
                  actionLoading
                    ? "cursor-not-allowed bg-gray-200"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {actionLoading ? "Processing..." : "Decline"}
              </button>
              <button
                onClick={handleBlock}
                disabled={actionLoading}
                className={`rounded-md px-4 py-2 text-white transition-colors ${
                  actionLoading
                    ? "cursor-not-allowed bg-red-300"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {actionLoading ? "Processing..." : "Block"}
              </button>
            </>
          ) : (
            // Default case for existing friends
            <>
              <button className="rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600">
                Send Message
              </button>
              <button
                onClick={handleBlock}
                disabled={actionLoading}
                className={`rounded-md px-4 py-2 text-white transition-colors ${
                  actionLoading
                    ? "cursor-not-allowed bg-red-300"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {actionLoading ? "Processing..." : "Block"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Action Error Message */}
      {actionError && (
        <div className="mb-4 text-center text-red-500">{actionError}</div>
      )}

      {/* Basic Info */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="text-gray-600">Phone</p>
          <p className="font-medium">{userData.phone}</p>
        </div>
        <div>
          <p className="text-gray-600">Date of Birth</p>
          <p className="font-medium">
            {new Date(userData.dateOfBirth).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-gray-600">Gender</p>
          <p className="font-medium">{userData.gender}</p>
        </div>
        <div>
          <p className="text-gray-600">Account Duration</p>
          <p className="font-medium">{userData.duration} days</p>
        </div>
      </div>

      {/* Premium Info */}
      {userData.userInfo && (
        <div className="border-t pt-4">
          <h2 className="mb-4 text-xl font-semibold">
            {action === "add"
              ? "Potential Friend's"
              : action === "view"
                ? "User's"
                : action === "accept"
                  ? "Pending Friend's"
                  : "Friend's"}{" "}
            Premium Information
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-gray-600">Type</p>
              <p className="font-medium">{userData.userInfo.premium.type}</p>
            </div>
            <div>
              <p className="text-gray-600">Max Friends</p>
              <p className="font-medium">{userData.userInfo.premium.friend}</p>
            </div>
            <div>
              <p className="text-gray-600">Max Matches</p>
              <p className="font-medium">{userData.userInfo.premium.match}</p>
            </div>
            <div>
              <p className="text-gray-600">Price</p>
              <p className="font-medium">${userData.userInfo.premium.price}</p>
            </div>
            <div>
              <p className="text-gray-600">Start Date</p>
              <p className="font-medium">
                {new Date(userData.userInfo.dateStart).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">End Date</p>
              <p className="font-medium">
                {new Date(userData.userInfo.dateEnd).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-medium">
                {userData.userInfo.isActive ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-red-600">Inactive</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsProfile;
