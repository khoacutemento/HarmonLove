import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Google_Logo from "../../../assets/images/Google_Logo.png";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { login } from "../../../services/authService";
import { loginSuccess } from "../../../app/slices/authSlice";
import ProgressBar from "./ProgressBar";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";

function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  console.log(currentStep);

  return (
    <main className="flex h-screen w-full items-center justify-center bg-custom-gradient px-4">
      <div className="flex w-full max-w-xl flex-col items-center rounded-xl border border-white/20 bg-white/10 px-6 py-7 shadow-lg backdrop-blur-2xl sm:w-3/4 md:w-2/4 lg:w-1/2">
        <div className="flex w-full flex-col items-center">
          <h3 className="mb-3 text-2xl font-bold text-heading sm:text-3xl">
            ĐĂNG KÝ
          </h3>
          <p className="mb-10 text-xs text-heading">
            Đăng ký trở thành thành viên Harmon ngay hôm nay để nhận ưu đãi độc
            quyền
          </p>
          <ProgressBar step={currentStep} />
          {currentStep === 1 && (
            <Step1 currentStep={1} setCurrentStep={setCurrentStep} />
          )}
          {currentStep === 2 && (
            <Step2 currentStep={2} setCurrentStep={setCurrentStep} />
          )}
          {currentStep === 3 && (
            <Step3 currentStep={3} setCurrentStep={setCurrentStep} />
          )}
        </div>

        <div className="my-5 text-sm text-heading sm:text-base">Hoặc</div>

        <div className="flex w-full max-w-xs cursor-pointer items-center justify-center gap-3 rounded-lg bg-white p-2 shadow-md transition-all hover:shadow-lg">
          <img src={Google_Logo} alt="Google" className="h-8 w-8" />
          <p className="text-center text-sm font-medium sm:text-lg">
            Đăng nhập bằng Google
          </p>
        </div>
        <div className="mt-5 text-heading">
          Bạn đã có tài khoản?{" "}
          <button className="font-semibold" onClick={() => navigate("/login")}>
            Đăng nhập ngay
          </button>
        </div>
      </div>
      <ToastContainer />
    </main>
  );
}

export default SignUp;
