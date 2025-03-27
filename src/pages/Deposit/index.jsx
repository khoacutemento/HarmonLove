import React, { useState } from "react";
import InfoCheckout from "../../components/InfoCheckout";
import { useSelector } from "react-redux";
import { deposit } from "../../services/userService";

function Deposit() {
  const [amount, setAmount] = useState(0);
  const [description, setDesciption] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const account = useSelector((state) => state.account);
  console.log(account);

  const handleDeposit = async () => {
    setIsLoading(true); // Set loading to true when API call starts
    try {
      const res = await deposit(amount, description);
      console.log(res);
      if (res) {
        localStorage.setItem("paymentData", JSON.stringify(res));
        window.location.href = res.checkoutUrl;
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false); // Reset loading state when API call completes
    }
  };

  return (
    <div className="my-5 grid w-full max-w-7xl grid-cols-3 justify-center gap-10">
      <div className="col-span-2">
        <InfoCheckout />
      </div>
      <div className="flex flex-col rounded-lg border border-violet-200 bg-[#F1E0FD] p-5 text-gray-600">
        <h3 className="mb-5 text-2xl font-bold">Thông Tin Thanh Toán</h3>
        <div className="mb-5 flex w-full flex-col gap-2">
          <label className="font-semibold" htmlFor="amount">
            Số Tiền Nạp (đ)
          </label>
          <input
            type="number"
            min={5000}
            value={amount.toLocaleString("vi-VN")}
            name="amount"
            id="amount"
            className="rounded-lg border border-violet-400 bg-transparent px-4 py-2 outline-none"
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="mb-5 flex w-full flex-col gap-2">
          <label className="flex items-center gap-2 font-semibold">
            Mô Tả
            <p className="text-xs">(Không bắt buộc)</p>
          </label>
          <textarea
            value={description}
            name="description"
            id="desciption"
            className="rounded-lg border border-violet-400 bg-transparent px-4 py-2 outline-none"
            onChange={(e) => setDesciption(e.target.value)}
            rows={5}
          />
        </div>

        <button
          onClick={handleDeposit}
          disabled={isLoading} // Disable button when loading
          className={`rounded-lg bg-heading px-5 py-2 text-white ${
            isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Đang xử lý...
            </span>
          ) : (
            "Thanh Toán"
          )}
        </button>
      </div>
    </div>
  );
}

export default Deposit;
