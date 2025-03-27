import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaEye, FaHeart } from "react-icons/fa";

const MyBlogDetail = () => {
  const { id } = useParams(); // Get blog ID from URL
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch blog details on mount
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/blog/${id}`);
        if (response.data.status === "200") {
          setBlog(response.data.data);
          setFormData({
            title: response.data.data.title,
            content: response.data.data.content,
          });
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải bài blog");
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setMessage("Đang tải ảnh lên...");

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const imageFormData = new FormData();
        imageFormData.append("formFile", file);

        const response = await axiosInstance.post(
          "/upload-img",
          imageFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        if (response.data.status === "200") {
          uploadedUrls.push(response.data.data);
        } else {
          throw new Error(response.data.message || "Tải ảnh lên thất bại");
        }
      }
      setImageUrls((prev) => [...prev, ...uploadedUrls]);

      // Insert images into Quill editor
      const quill = quillRef.current.getEditor();
      const currentContent = formData.content;
      const newImagesHtml = uploadedUrls
        .map(
          (url) =>
            `<img src="${url}" alt="Uploaded Image" style="max-width: 100%;" />`,
        )
        .join("<br>");
      const newContent = currentContent
        ? `${currentContent}<br>${newImagesHtml}`
        : newImagesHtml;

      setFormData((prev) => ({ ...prev, content: newContent }));
      setMessage("Ảnh đã được tải lên và thêm vào nội dung thành công");
    } catch (error) {
      setMessage("Lỗi khi tải ảnh lên: " + error.message);
      console.error("Image upload error:", error);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setMessage("Vui lòng điền đầy đủ tiêu đề và nội dung");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await axiosInstance.put(`/blog/${id}`, {
        title: formData.title,
        content: formData.content,
      });

      if (response.data.status === "200") {
        setMessage("Cập nhật blog thành công");
        setBlog({ ...blog, title: formData.title, content: formData.content });
        setIsEditing(false);
        setImages([]);
        setImageUrls([]);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage("Có lỗi xảy ra khi cập nhật blog");
      console.error("Error updating blog:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài blog này?")) return;

    try {
      const response = await axiosInstance.delete(`/blog/${id}`);
      if (response.data.status === "200") {
        setMessage("Xóa blog thành công");
        setTimeout(() => navigate("/blog/user"), 1000); // Redirect after 1s
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage("Có lỗi xảy ra khi xóa blog");
      console.error("Error deleting blog:", error);
    }
  };

  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
      ["link"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
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

  if (!blog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Không tìm thấy bài blog</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          {isEditing ? "Chỉnh sửa Blog" : "Chi tiết Blog"}
        </h1>

        <div className="rounded-lg bg-white p-6 shadow-md">
          {!isEditing ? (
            <>
              <h2 className="mb-4 text-2xl font-semibold text-gray-800">
                {blog.title}
              </h2>
              <div
                className="prose prose-sm text-gray-600"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <FaEye /> {blog.views} lượt xem
                </span>
                <span className="flex items-center gap-2">
                  <FaHeart /> {blog.likes} lượt thích
                </span>
              </div>
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Tiêu đề"
                className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="min-h-[200px]">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={formData.content}
                  onChange={handleQuillChange}
                  modules={modules}
                  placeholder="Viết nội dung..."
                  className="bg-white"
                />
              </div>
              {/* Image Upload Section */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Thêm ảnh
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                {images.length > 0 && (
                  <span className="text-gray-600">
                    {images.length} ảnh được chọn
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isSubmitting ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          )}

          {message && (
            <div
              className={`mt-4 text-center ${
                message.includes("thành công")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/myblog")}
            className="rounded-lg bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
          >
            Quay lại danh sách blog
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyBlogDetail;
