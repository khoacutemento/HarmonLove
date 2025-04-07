import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode as jwt_decode } from "jwt-decode";
import { FaGoogle } from "react-icons/fa"; // Using react-icons instead of an image
import {
  parseAndStoreUser,
  parseUserStringToObject,
} from "../../../utils/format";
import { loginSuccess } from "../../../app/slices/authSlice";
import { useDispatch } from "react-redux";
import { fetchAccount } from "../../../app/slices/accountSlice";

const LoginGoogle = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleSignin = () => {
    const width = 500;
    const height = 600;
    const left = Math.max((window.innerWidth - width) / 2, 0);
    const top = Math.max((window.innerHeight - height) / 2, 0);

    const popup = window.open(
      `https://harmon.love/api/v1/google-auth/login`,
      "google-signin",
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`,
    );

    window.addEventListener(
      "message",
      (event) => {
        try {
          const { accessToken, refreshToken, user } = event.data;

          if (accessToken) {
            localStorage.setItem("token", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            console.log("Token:", accessToken);

            console.log("Refresh Token:", refreshToken);

            const userData = parseAndStoreUser(parseUserStringToObject(user));
            console.log("user:", userData);

            toast.success("Đăng nhập bằng Google thành công!");
            dispatch(
              loginSuccess({
                token: accessToken,
                refreshToken,
                user: userData,
              }),
            );

            navigate("/");
          } else {
            toast.error("Không thể tìm thấy token. Đăng nhập thất bại.");
          }
        } catch (error) {
          console.error("Lỗi xử lý dữ liệu sau đăng nhập:", error);
          toast.error("Đã xảy ra lỗi khi xử lý dữ liệu sau đăng nhập.");
        }
      },
      { once: true }, // Ensures the event listener is removed after firing once
    );
  };

  return (
    <button
      onClick={handleGoogleSignin}
      className="flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-100"
    >
      <FaGoogle className="text-lg text-red-500" />
      <span className="font-medium">Đăng nhập với Google</span>
    </button>
  );
};

export default LoginGoogle;
