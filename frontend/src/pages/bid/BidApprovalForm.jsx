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
    // Check all fields including title and email
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

      // Call the validation endpoint first
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

      // If validation is successful (backend returns 200)
      if (validationResponse.data.returnCode === 200) {
        console.log(
          "Validation successful:",
          validationResponse.data.ReturnObject
        );

        Swal.fire({
          icon: "success",
          title: "Approval Submitted!",
          text: "You are now approved to bid. Start biddin to twin this product..",
          timer: 2000, // Auto close after 2 seconds
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
        // Handle cases where validation endpoint returns non-200 code (e.g., 400 on mismatch)
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

      // Handle errors from the API call
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
      case 1: // Your details form
        return (
          <div className="space-y-4 min-h-screen">
            <h2
              style={{ fontFamily: "var(--font-baskerville)" }}
              className="text-2xl font-semibold text-green-600 text-center"
            >
              Provide Your details to get approved for this bidding
            </h2>
            <div className="p-8 rounded-lg shadow-md">
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
                  className="bg-blue-900/70 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded transition duration-300"
                  disabled={isLoading}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        );
      case 2: // View details
        return (
          <div className="space-y-4 min-h-screen">
            <h2 className="text-2xl font-semibold text-gray-800 text-center">
              Confirm Your Details
            </h2>
            <div className="p-6 rounded-md shadow-md bg-gray-50">
              <p>
                <span className="font-semibold">Title:</span>{" "}
                {formData.title || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {formData.name || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Contact:</span>{" "}
                {formData.phoneNumber || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {formData.email || "N/A"}
              </p>{" "}
              {/* Display email */}
              <p>
                <span className="font-semibold">Address:</span>{" "}
                {formData.address || "N/A"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleConfirmAndSubmit}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Confirming..." : "Confirm and Submit"}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6 max-w-sm mx-auto">
          <div className="flex-1 text-center">
            <div
              className={`w-8 h-8 mx-auto rounded-full border-2 flex items-center justify-center ${
                step >= 1
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              1
            </div>
            <p
              className={`text-sm mt-1 ${
                step >= 1 ? "text-blue-600 font-semibold" : "text-gray-600"
              }`}
            >
              Your details
            </p>
          </div>
          <div className="flex-1 text-center">
            <div
              className={`w-8 h-8 mx-auto rounded-full border-2 flex items-center justify-center ${
                step >= 2
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              2
            </div>
            <p
              className={`text-sm mt-1 ${
                step >= 2 ? "text-blue-600 font-semibold" : "text-gray-600"
              }`}
            >
              View details
            </p>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>{renderStep()}</form>
        {step === 2 && (
          <div className="mt-6 flex justify-start">
            <button
              type="button"
              onClick={prevStep}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-300"
              disabled={isLoading}
            >
              Previous
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BidApprovalForm;
