import React, { useState } from "react";
import axiosInstance from "../../config/axios"; // Assuming this is your axios setup
import { FaHeart, FaRegHeart } from "react-icons/fa"; // Heart icons from react-icons

function Item({ post, navigate }) {
  const [liked, setLiked] = useState(false); // Tracks local like state
  const [likeCount, setLikeCount] = useState(post.likes); // Tracks like count locally

  const handleClick = () => {
    navigate(`/blogs/${post.id}`);
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation(); // Prevents triggering handleClick when liking
    const newLikedState = !liked;
    const newLikeCount = newLikedState ? likeCount + 1 : likeCount - 1;

    // Optimistic update
    setLiked(newLikedState);
    setLikeCount(newLikeCount);

    try {
      const response = await axiosInstance.get(`/blog/${post.id}/like`);
      // Assuming API returns updated like count or success status
      if (
        response.data.status === "200" &&
        response.data.data?.likes !== undefined
      ) {
        setLikeCount(response.data.data.likes); // Sync with server if provided
      }
    } catch (error) {
      // Revert on error
      setLiked(!newLikedState);
      setLikeCount(likeCount);
      console.error("Error liking post:", error);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="mb-5 cursor-pointer rounded-lg border px-10 py-7 shadow-md transition-colors duration-200 hover:bg-gray-50"
    >
      <h2 className="mb-2 text-xl font-bold">{post.title}</h2>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm">👀 {post.views} Views</span>
        <span
          onClick={handleLikeClick}
          className="flex cursor-pointer items-center gap-1 text-sm transition-colors duration-200 hover:text-red-500"
        >
          {liked ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-gray-600" />
          )}
          {likeCount} Likes
        </span>
      </div>
    </div>
  );
}

export default Item;
