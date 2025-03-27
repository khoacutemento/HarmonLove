import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../config/axios";
import parse from "html-react-parser";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axiosInstance.get(`/blog/${id}`);
        if (response.data.status === "200") {
          setBlog(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải blog");
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="m-10 mx-auto flex min-h-3.5 w-full max-w-7xl flex-col rounded-lg bg-white px-4 py-3 shadow-sm sm:rounded-xl sm:px-6 sm:py-4">
      <h1 className="mb-4 text-3xl font-bold text-gray-800">{blog.title}</h1>
      <div className="prose prose-lg mb-6 flex-1 text-gray-700">
        {parse(blog.content)}
      </div>
      <div className="mt-auto flex items-center justify-between text-gray-600">
        <p>
          Lượt xem: <span className="font-semibold">{blog.views}</span>
        </p>
        <p>
          Lượt thích: <span className="font-semibold">{blog.likes}</span>
        </p>
      </div>
    </div>
  );
};

export default BlogDetail;
