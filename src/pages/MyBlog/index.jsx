import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaHeart } from "react-icons/fa";

const MyBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/blog/user");
        if (response.data.status === "200") {
          setBlogs(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải danh sách blog");
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleViewDetails = (blogId) => {
    navigate(`/myblog/${blogId}`);
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
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">Blog của tôi</h1>

        {blogs.length === 0 ? (
          <div className="rounded-lg bg-white p-6 shadow-md">
            <p className="text-center text-gray-500">
              Bạn chưa có bài blog nào.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="rounded-lg bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg"
              >
                <h2 className="mb-4 text-2xl font-semibold text-gray-800">
                  {blog.title}
                </h2>
                <div
                  className="prose prose-sm text-gray-600"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex gap-6">
                    <span className="flex items-center gap-2">
                      <FaEye /> {blog.views} lượt xem
                    </span>
                    <span className="flex items-center gap-2">
                      <FaHeart /> {blog.likes} lượt thích
                    </span>
                  </div>
                  <button
                    onClick={() => handleViewDetails(blog.id)}
                    className="text-blue-500 hover:underline"
                  >
                    Xem chi tiết & chỉnh sửa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/profile")}
            className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          >
            Quay lại hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyBlog;
