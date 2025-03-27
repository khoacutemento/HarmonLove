// components/Blog.jsx
import React, { useEffect, useState } from "react";
import { getBlogs } from "../../services/blogService";
import Item from "./Item";
import CreateBlog from "./CreateBlog";
import { useNavigate } from "react-router-dom";

function Blog() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]); // Fixed variable name from 'blog' to 'blogs'
  const [currentPage, setCurrentPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getBlogs();
      setBlogs(response.items);
      setTotalPages(response.totalPages);
      setSize(response.size);
      setCurrentPage(response.page);
      console.log(response);
    };
    fetchData();
  }, []);

  return (
    <div className="mx-auto mt-10 max-w-3xl">
      <CreateBlog />
      {blogs && blogs.length > 0 ? (
        blogs.map((post) => (
          <Item key={post.id} post={post} navigate={navigate} />
        ))
      ) : (
        <p className="mt-4 text-center text-gray-500">No posts available</p>
      )}
    </div>
  );
}

export default Blog;
