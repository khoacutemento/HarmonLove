import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IoMdArrowRoundForward } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../../../app/slices/userSlice";

const validationSchema = Yup.object({
  fullName: Yup.string().required("Họ và tên không được để trống"),
  email: Yup.string()
    .email("Email không hợp lệ")
    .required("Email không được để trống"),
  phoneNumber: Yup.string()
    .matches(/^\d{10}$/, "Số điện thoại phải có đúng 10 số")
    .required("Số điện thoại không được để trống"),
});

function Step1({ currentStep, setCurrentStep }) {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user);

  const formik = useFormik({
    initialValues: {
      fullName: userData.fullName || "",
      email: userData.email || "",
      phoneNumber: userData.phoneNumber || "",
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(setUserData(values));
      setCurrentStep(currentStep + 1);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="mt-5 w-full">
      <div className="mb-5 flex w-full flex-col gap-2 text-heading">
        <label className="font-medium" htmlFor="fullName">
          Họ Và Tên
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          className="w-full rounded-xl border border-gray-400 bg-transparent px-4 py-2 placeholder-slate-400 outline-none backdrop-blur-sm"
          placeholder="Nguyễn Văn A"
          value={formik.values.fullName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.fullName && formik.errors.fullName && (
          <p className="text-xs text-red-500">{formik.errors.fullName}</p>
        )}
      </div>

      <div className="mb-5 flex w-full flex-col gap-2 text-heading">
        <label className="font-medium" htmlFor="email">
          Địa Chỉ Email
        </label>
        <input
          type="text"
          id="email"
          name="email"
          className="w-full rounded-xl border border-gray-400 bg-transparent px-4 py-2 placeholder-slate-400 outline-none backdrop-blur-sm"
          placeholder="abc@gmail.com"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="text-xs text-red-500">{formik.errors.email}</p>
        )}
      </div>

      <div className="mb-5 flex w-full flex-col gap-2 text-heading">
        <label className="font-medium" htmlFor="phoneNumber">
          Số Điện Thoại
        </label>
        <input
          type="text"
          id="phoneNumber"
          name="phoneNumber"
          className="w-full rounded-xl border border-gray-400 bg-transparent px-4 py-2 placeholder-slate-400 outline-none backdrop-blur-sm"
          placeholder="0987654321"
          value={formik.values.phoneNumber}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.phoneNumber && formik.errors.phoneNumber && (
          <p className="text-xs text-red-500">{formik.errors.phoneNumber}</p>
        )}
      </div>
      <div className="mt-10 flex justify-end">
        <button
          type="submit"
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-white hover:opacity-80 ${
            !formik.isValid ? "bg-gray-400" : "cursor-pointer bg-heading"
          }`}
          disabled={!formik.isValid || formik.isSubmitting}
        >
          Tiếp tục <IoMdArrowRoundForward />
        </button>
      </div>
    </form>
  );
}

export default Step1;
