import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const BidApprovalForm = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "", 
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
            "http://localhost:7107/api/user/profile",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );

        if (response.data.returnCode === 200) {
          const user = response.data.ReturnObject;
          setFormData((prev) => ({
            ...prev,
            title: user.title || "",
            name: user.name || "",
            phoneNumber: user.phoneNumber || "",
            email: user.email || "",
            address: user.address || "",
          }));
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateStep1 = () => {
    const { title, name, phoneNumber, email, address } = formData;
    if (!title || !name || !phoneNumber || !email || !address) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all your details (Title, Name, Phone Number, Email, Address) to proceed.",
      });
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) {
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleConfirmAndSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      
      const validationResponse = await axios.post(
          "http://localhost:7107/api/auth/validate-user-details",
          {
            name: formData.name,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
            email: formData.email,
         
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
      );

      if (validationResponse.data.returnCode === 200) {
        console.log(
            "Validation successful:",
            validationResponse.data.ReturnObject
        );

        Swal.fire({
          icon: "success",
          title: "Approval Submitted!",
          text: "You are now approved to bid. Start bidding to win this product..",
          timer: 2000,
          timerProgressBar: true,
          didClose: () => {
            if (productId) {
              navigate(`/bids/place/${productId}`);
            } else {
              console.error("Product ID is undefined during navigation.");
            }
          },
        });
      } else {
        const validationErrorMessage =
            validationResponse.data.ReturnObject ||
            validationResponse.data.message ||
            "Details validation failed.";
        Swal.fire({
          icon: "error",
          title: "Validation Failed",
          text: validationErrorMessage,
        });
      }
    } catch (error) {
      console.error("Submission process failed:", error);

      const errorMessage =
          error.response?.data?.ReturnObject ||
          error.response?.data?.message ||
          "An error occurred during the submission process.";

      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: 
        return (
          
            <div className="space-y-4 min-h-screen ">
              <h2
                  style={{ fontFamily: "var(--font-baskerville)" }}
                  className="text-2xl font-semibold text-green-600 text-center"
              >
               Enter your details to get approved for this bidding
              </h2>
              <div className="p-8 rounded-lg ">
                <div className="relative flex items-center p-4">
                  <label
                      htmlFor="title"
                      className="block text-md font-medium text-gray-700 w-24"
                  >
                    Title:
                  </label>
                  <select
                       id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      required
                  >
                    <option value="">Select Title</option>
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Dr">Dr</option>
                  </select>
                </div>
                <div className="relative flex items-center p-4">
                  <label
                      htmlFor="name"
                      className="block text-md font-medium text-gray-700 w-24"
                  >
                    Names:{" "}
                  </label>
                  <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mb-2 mx-2 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your Names"
                      required
                  />
                </div>
                <div className="relative flex items-center p-4">
                  <label
                      htmlFor="phoneNumber"
                      className="block text-md font-medium text-gray-700 w-24"
                  >
                    Contact:{" "}
                  </label>
                  <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="mb-2 mx-2 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+256799999999"
                      required
                  />
                </div>
                {/* Email Field */}
                <div className="relative flex items-center p-4">
                  <label
                      htmlFor="email"
                      className="block text-md font-medium text-gray-700 w-24"
                  >
                    Email:{" "}
                  </label>
                  <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mb-2 mx-2 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                      required
                  />
                </div>
                <div className="relative flex items-center p-4">
                  <label
                      htmlFor="address"
                      className="block text-md font-medium text-gray-700 w-24"
                  >
                    Address:{" "}
                  </label>
                  <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mx-2 mb-3 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your Location"
                      required
                  />
                </div>

                <div className="flex justify-center mt-6">
                  <button
                      type="button"
                      onClick={nextStep}
                      style={{ fontFamily: "var(--font-button" }}
                      className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded transition duration-300"
                      disabled={isLoading}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
        );
      case 2: 
        return (
          <div className="space-y-4 min-h-screen">
            <h2
              className="text-2xl font-semibold text-gray-800 text-center"
              style={{ fontFamily: "var(--font-baskerville)" }}
            >
              Confirm Your Details
            </h2>
            <div className="p-6 rounded-md ">
              <p className="mb-1">
                <span
                  className="font-bold "
                  style={{ fontFamily: "var(--font-tenor)" }}
                >
                  Title:
                </span>
                {"  "}
                <span className="mx-3"> {formData.title || "N/A"}</span>
              </p>
              <p className="mb-1">
                <span
                  className="font-bold "
                  style={{ fontFamily: "var(--font-tenor)" }}
                >
                  Name:
                </span>
                {"  "}
                <span className="mx-3"> {formData.name || "N/A"}</span>
              </p>
              <p className="mb-1">
                <span
                  className="font-bold "
                  style={{ fontFamily: "var(--font-tenor)" }}
                >
                  Contact:
                </span>
                {"  "}
                <span className="mx-3"> {formData.phoneNumber || "N/A"}</span>
              </p>
              <p className="mb-1">
                <span
                  className="font-bold "
                  style={{ fontFamily: "var(--font-tenor)" }}
                >
                  Email:
                </span>
                {"  "}
                <span className="mx-3"> {formData.email || "N/A"}</span>
              </p>
              <p className="mb-1">
                <span
                  className="font-bold "
                  style={{ fontFamily: "var(--font-tenor)" }}
                >
                  Address:
                </span>
                {"  "}
                <span className="mx-3"> {formData.address || "N/A"}</span>
              </p>
            </div>
            <div className="flex gap-2">
              {/* Previous Button (Only on Step 2) */}
              {step === 2 && (
                <div className="mt-6 flex justify-start">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={isLoading}
                    style={{ fontFamily: "var(--font-button)" }}
                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded transition duration-300"
                  >
                    Previous
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={handleConfirmAndSubmit}
                className="mt-6 bg-lime-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full transition duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Confirming..." : "Confirm and Submit"}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-7 mt-18">
      <div className="flex flex-col lg:flex-row bg-white rounded-xl shadow-lg overflow-hidden max-w-6xl mx-auto">
        {/* Left Column - Image */}
        <div className="lg:w-1/2 w-full h-64 lg:h-auto relative bg-gray-100">
          <img
            src={`${import.meta.env.BASE_URL}bg2.jpg`}
            alt="Auction"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Right Column - Form */}
        <div className="lg:w-1/2 w-full p-6 md:p-10 flex flex-col justify-center bg-blue-50">
          {/* Step Indicator */}
          <div className="flex justify-between items-center mb-8 max-w-md mx-auto">
            {/* Step 1 */}
            <div className="flex-1 text-center">
              <div
                className={`w-10 h-10 mx-auto rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  step >= 1
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 text-gray-500"
                }`}
              >
                1
              </div>
              <p
                className={`text-sm mt-2 ${
                  step >= 1 ? "text-blue-600 font-semibold" : "text-gray-600"
                }`}
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Your Details
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex-1 text-center">
              <div
                className={`w-10 h-10 mx-auto rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  step >= 2
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 text-gray-500"
                }`}
              >
                2
              </div>
              <p
                className={`text-sm  ${
                  step >= 2 ? "text-blue-600 font-semibold" : "text-gray-600"
                  }`}
                
                style={{ fontFamily: "var(--font-inter)" }}
              >
                View Details
              </p>
            </div>
          </div>

          {/* Form Content */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="w-full max-w-md mx-auto"
          >
            {renderStep()}
          </form>

        
        </div>
      </div>
    </div>
  );
};

export default BidApprovalForm;