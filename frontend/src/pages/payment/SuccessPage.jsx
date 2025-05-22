import React, { useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    Swal.fire({
      icon: "success",
      title: "Payment Successful!",
      text: "Thank you for using Nada! Start bidding on other new products.",
      confirmButtonText: "Ok",
    }).then(() => {
      navigate("/");
    });
  }, [navigate]);

  return (
    <div>
      <h2>Redirecting to home...</h2>
    </div>
  );
};

export default SuccessPage;
