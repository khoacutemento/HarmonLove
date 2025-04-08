import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Google_Logo from "../../../assets/images/Google_Logo.png";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { login } from "../../../services/authService";
import { loginSuccess } from "../../../app/slices/authSlice";
import LoadingSpinner from "../../../components/Loading/LoadingSpinner";
import LoadingDots from "../../../components/Loading/LoadingDots";
import { fetchAccount } from "../../../app/slices/accountSlice";
import LoginGoogle from "../LoginGoogle/LoginGoogle";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, refreshToken, user } = await login(username, password);
      if (token) {
        toast.success("Đăng nhập thành công!");
        dispatch(loginSuccess({ token, refreshToken, user }));

        if (user?.accountId) {
          dispatch(fetchAccount(user.accountId));
        }

        navigate("/");
      } else {
        toast.error("Đăng nhập thất bại");
      }
      setLoading(false);
    } catch (error) {
      toast.error(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="flex h-screen w-full items-center justify-center bg-custom-gradient px-4">
      <div className="flex w-full max-w-md flex-col items-center rounded-xl border border-white/20 bg-white/10 px-6 py-7 shadow-2xl backdrop-blur-2xl sm:w-3/4 md:w-2/4 lg:w-1/4">
        <form className="flex w-full flex-col items-center">
          <h3 className="mb-6 text-2xl font-bold text-heading sm:text-3xl">
            ĐĂNG NHẬP
          </h3>

          <div className="mb-4 flex w-full flex-col gap-2 text-heading">
            <label className="text-lg font-medium">Tên đăng nhập</label>
            <input
              type="text"
              className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2 placeholder-gray-300 outline-none backdrop-blur-lg"
              placeholder="Tên đăng nhập ..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 flex w-full flex-col gap-2 text-heading">
            <label className="text-lg font-medium">Mật khẩu</label>
            <input
              type="password"
              className="w-full rounded-xl border border-white/20 bg-transparent px-4 py-2 placeholder-gray-300 outline-none backdrop-blur-lg"
              placeholder="Mật khẩu ..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 flex w-full justify-between text-sm text-heading">
            <span className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                className="mr-2 accent-heading"
              />
              <label htmlFor="remember">Ghi nhớ mật khẩu</label>
            </span>
            <p
              className="cursor-pointer hover:underline"
              onClick={() => navigate("/forgot-password")}
            >
              Quên mật khẩu
            </p>
          </div>
          {loading ? (
            <LoadingDots />
          ) : (
            <button
              className="w-full rounded-lg bg-text p-3 text-white transition-all hover:bg-opacity-80"
              onClick={handleLogin}
            >
              Đăng Nhập
            </button>
          )}
        </form>

        <div className="my-5 text-sm text-heading sm:text-base">Hoặc</div>

        <div className="flex w-full max-w-xs cursor-pointer items-center justify-center gap-3 rounded-lg bg-white p-2 shadow-md transition-all hover:shadow-lg">
          <LoginGoogle />
        </div>
        <div className="mt-5 text-heading">
          Bạn chưa có tài khoản?{" "}
          <button
            className="font-semibold"
            onClick={() => navigate("/sign-up")}
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    </main>
  );
}

export default Login;
