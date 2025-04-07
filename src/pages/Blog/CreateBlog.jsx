import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axiosInstance from "../../config/axios";

const CreateBlog = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);
  const quillRef = useRef(null); // Ref for React Quill editor

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleQuillChange = (value) => {
    setFormData((prevState) => ({
      ...prevState,
      content: value,
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setMessage("Uploading images...");

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
        console.log("Response data:", response.data);
        if (response.data.status === "200") {
          console.log("Image uploaded successfully", response.data.data);
          uploadedUrls.push(response.data.data);
        } else {
          throw new Error(response.data.message || "Image upload failed");
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
      setMessage("Images uploaded and added to content successfully");
    } catch (error) {
      setMessage("Error uploading images: " + error.response.data.message);
      console.error("Image upload error:", error);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setMessage("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await axiosInstance.post("/blog", {
        title: formData.title,
        content: formData.content,
      });

      if (response.data.status === 200) {
        setMessage(response.data.message);
        setFormData({ title: "", content: "" });
        setImages([]);
        setImageUrls([]);
        setIsExpanded(false);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage(error.response.data.message || "Có lỗi xảy ra khi tạo blog");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="mb-6 rounded-lg bg-white shadow-md">
      {/* Collapsed State */}
      {!isExpanded && (
        <div
          className="cursor-pointer p-4 hover:bg-gray-50"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center space-x-3">
            <img
              src="https://i.pinimg.com/736x/a9/1b/35/a91b35dbe4c722ce0b557dd72a3dca92.jpg"
              alt="Avatar"
              className="h-8 w-8 rounded-full object-cover sm:h-10 sm:w-10"
            />
            <div className="flex-1">
              <div className="rounded-full bg-gray-100 p-2 text-gray-500">
                Bạn đang nghĩ gì, hãy chia sẻ với mọi người nào!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="https://i.pinimg.com/736x/a9/1b/35/a91b35dbe4c722ce0b557dd72a3dca92.jpg"
                alt="Avatar"
                className="h-8 w-8 rounded-full object-cover sm:h-10 sm:w-10"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{user.userName}</p>
              </div>
            </div>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="What's on your mind?"
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
                placeholder="Write something..."
                className="bg-white"
              />
            </div>

            {/* Image Selection */}
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
                  {images.length} image{images.length > 1 ? "s" : ""} selected
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
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
                {isSubmitting ? "Đang đăng bài..." : "Đăng"}
              </button>
            </div>

            {message && (
              <div
                className={`text-center ${
                  message.includes("success")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateBlog;
