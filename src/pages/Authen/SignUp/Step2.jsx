import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { updateUserDetails } from "../../../app/slices/userSlice";
import { IoMdArrowRoundForward, IoMdArrowRoundBack } from "react-icons/io";

const validationSchema = Yup.object({
  // weight: Yup.number().required("Cân nặng không được để trống"),
  gender: Yup.string().required("Giới tính không được để trống"),
  dateOfBirth: Yup.date().required("Ngày sinh không được để trống"),
});

function Step2({ currentStep, setCurrentStep }) {
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.user);

  const formik = useFormik({
    initialValues: {
      // weight: userDetails.weight || "",
      gender: userDetails.gender || "",
      dateOfBirth: userDetails.dateOfBirth || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      dispatch(updateUserDetails(values));
      setCurrentStep(currentStep + 1);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="mt-5 w-full">
      {/* <div className="mb-5 flex w-full flex-col gap-2 text-heading">
        <label className="font-medium" htmlFor="weight">
          Cân Nặng (Kg)
        </label>
        <input
          type="text"
          id="weight"
          name="weight"
          className="w-full rounded-xl border border-gray-400 bg-transparent px-4 py-2 placeholder-slate-400 outline-none backdrop-blur-sm"
          placeholder="85"
          value={formik.values.weight}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.weight && formik.errors.weight && (
          <p className="text-xs text-red-500">{formik.errors.weight}</p>
        )}
      </div> */}

      <div className="mb-5 flex w-full flex-col gap-2 text-heading">
        <label className="font-medium" htmlFor="gender">
          Giới Tính
        </label>
        <select
          id="gender"
          name="gender"
          className="w-full cursor-pointer rounded-xl border border-gray-400 bg-transparent px-4 py-2 outline-none backdrop-blur-sm"
          value={formik.values.gender}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        >
          <option value="" disabled>
            -- Chọn giới tính --
          </option>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
          <option value="Khác">Khác</option>
        </select>
        {formik.touched.gender && formik.errors.gender && (
          <p className="text-xs text-red-500">{formik.errors.gender}</p>
        )}
      </div>

      <div className="mb-5 flex w-full flex-col gap-2 text-heading">
        <label className="font-medium" htmlFor="dateOfBirth">
          Năm Sinh
        </label>
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          className="w-full cursor-pointer rounded-xl border border-gray-400 bg-transparent px-4 py-2 placeholder-slate-400 outline-none backdrop-blur-sm"
          value={formik.values.dateOfBirth}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
          <p className="text-xs text-red-500">{formik.errors.dateOfBirth}</p>
        )}
      </div>

      <div className="mt-10 flex justify-between">
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-heading px-4 py-2 text-white hover:opacity-80"
          onClick={() => setCurrentStep(currentStep - 1)}
        >
          <IoMdArrowRoundBack /> Trở về
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-heading px-4 py-2 text-white hover:opacity-80"
        >
          Tiếp tục <IoMdArrowRoundForward />
        </button>
      </div>
    </form>
  );
}

export default Step2;
