import { useLocation } from "react-router-dom";
import PaymentDetails from "./PaymentDetails";

function DepositDetail() {
  const location = useLocation();
  const paymentData = location.state?.paymentData;

  return (
    <>
      {paymentData ? (
        <PaymentDetails data={paymentData} />
      ) : (
        <p>Không có dữ liệu thanh toán</p>
      )}
    </>
  );
}

export default DepositDetail;
