import React, { useState } from "react";
import Swal from "sweetalert2"; 
const BidApprovalForm = () => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "", 
    name: "",
    phoneNumber: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateStep1 = () => {
    const { title, name, phoneNumber, address } = formData;
    if (!title || !name || !phoneNumber || !address) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all your details (Title, Name, Phone Number, Address) to proceed.",
      });
      return false;
    }
    // Add more specific validation if needed (e.g., phone number format)
    return true;
  };

  // Function to move to the next step (View details)
  const nextStep = () => {
    if (step === 1 && !validateStep1()) {
      return; // Stay on step 1 if validation fails
    }
    setStep(step + 1);
  };

  // Function to move to the previous step (Your details)
  const prevStep = () => {
    setStep(step - 1);
  };

  // Function to handle the final form submission (for approval details)
  const handleConfirmAndSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // ** Implement your actual backend submission logic here **
    // This would likely be a POST request to an endpoint that
    // processes the user's approval details and updates their user profile.
    console.log("Submitting Approval Details:", formData);

    try {
      // Example using axios (uncomment and adapt)
      // const response = await axios.post('YOUR_APPROVAL_BACKEND_ENDPOINT', formData);
      // console.log("Approval submission successful:", response.data);

      Swal.fire({
        icon: "success",
        title: "Approval Details Submitted",
        text: "Your details have been submitted for bidding approval.",
      });

      // After successful submission, you might want to:
      // - Redirect the user (e.g., to their dashboard or the auction page)
      // - Update local state to reflect that they are approved (if your app tracks this)
    } catch (error) {
      console.error("Error submitting approval details:", error);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "There was an error submitting your details. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Renders the content for the current step
  const renderStep = () => {
    switch (step) {
      case 1: // Your details form
        return (
          <div className="space-y-4 min-h-screen">
            {" "}
            {/* Adjusted min-h-screen if needed */}
            <h2
              style={{ fontFamily: "var(--font-baskerville)" }}
              className="text-2xl font-semibold text-green-600 text-center"
            >
              Provide Your details to get approved for this bidding
            </h2>
            {/* Removed bg-white/90 p-8 etc. from form tag, apply styling to a container div if preferred */}
            <div className="p-8 rounded-lg shadow-md">
              {" "}
              {/* Added a div for styling */}
              <div className="relative flex items-center p-4">
                {" "}
                {/* Added items-center */}
                <label
                  htmlFor="title"
                  className="block text-md font-medium text-gray-700 w-24" // Added fixed width for alignment
                >
                  Title:
                </label>
                <select
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  required // Added required attribute
                >
                  <option value="">Select Title</option>
                  <option value="Mr">Mr</option>
                  <option value="Ms">Ms</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Dr">Dr</option>
                </select>
              </div>
              {/* Name Field */}
              <div className="relative flex items-center p-4">
                {" "}
                {/* Added items-center */}
                <label
                  htmlFor="name"
                  className="block text-md font-medium text-gray-700 w-24"
                >
                  Names:{" "}
                </label>{" "}
                {/* Added fixed width */}
                <input
                  type="text"
                  id="name"
                  name="name" // Added name attribute
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mb-2 mx-2 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" // Adjusted pl/pr
                  placeholder="Enter your Names"
                  required // Added required attribute
                />
              </div>
              {/* Phone Number Field */}
              <div className="relative flex items-center p-4">
                {" "}
                {/* Added items-center */}
                <label
                  htmlFor="phoneNumber"
                  className="block text-md font-medium text-gray-700 w-24"
                >
                  Contact:{" "}
                </label>{" "}
                {/* Added fixed width */}
                <input
                  type="tel" // Use type="tel" for phone numbers
                  id="phoneNumber"
                  name="phoneNumber" // Added name attribute
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="mb-2 mx-2 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" // Adjusted pl/pr
                  placeholder="Enter your contact"
                  required // Added required attribute
                />
              </div>
              {/* Address Field */}
              <div className="relative flex items-center p-4">
                {" "}
                {/* Added items-center */}
                <label
                  htmlFor="address"
                  className="block text-md font-medium text-gray-700 w-24"
                >
                  Address:{" "}
                </label>{" "}
                {/* Added fixed width */}
                <input
                  type="text"
                  id="address"
                  name="address" // Added name attribute
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mx-2 mb-3 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" // Adjusted pl/pr
                  placeholder="Enter your Location"
                  required // Added required attribute
                />
              </div>
              {/* Removed the entire 'payments' section and card details form */}
              <div className="flex justify-center mt-6">
                {" "}
                {/* Center the button */}
                <button
                  type="button"
                  onClick={nextStep}
                  style={{ fontFamily: "var(--font-button" }}
                  className="bg-blue-900/70 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded transition duration-300" // Adjusted styling
                  disabled={isLoading}
                >
                  Continue
                </button>
              </div>
            </div>{" "}
            {/* End of styling div */}
          </div>
        );
      case 2: // View details
        return (
          <div className="space-y-4 min-h-screen">
            {" "}
            {/* Adjusted min-h-screen if needed */}
            <h2 className="text-2xl font-semibold text-gray-800 text-center">
              {" "}
              {/* Centered title */}
              Confirm Your Details
            </h2>
            <div className="p-6 rounded-md shadow-md bg-gray-50">
              {" "}
              {/* Added styling and background */}
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
              </p>{" "}
              {/* Corrected to phoneNumber */}
              <p>
                <span className="font-semibold">Address:</span>{" "}
                {formData.address || "N/A"}
              </p>
              {/* Removed display of card details */}
            </div>
            <button
              type="button" // Changed to type="button" if form handles submission
              onClick={handleConfirmAndSubmit}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full transition duration-300" // Adjusted styling
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
      {" "}
      {/* Removed shadow-md, rounded-lg, bg-white */}
      <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
        {" "}
        {/* Added a wrapper div with styling */}
        {/* Step Indicator */}
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
        {/* Render Step Content */}
        <form onSubmit={(e) => e.preventDefault()}>
          {" "}
          {/* Prevent default form submission */}
          {renderStep()}
          {/* Previous button moved inside renderStep case 2 for better flow */}
          {/* <div className="mt-6 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  disabled={isLoading}
                >
                  Previous
                </button>
              )}
            </div> */}
        </form>
        {/* Manual Previous button for step 2 */}
        {step === 2 && (
          <div className="mt-6 flex justify-start">
            {" "}
            {/* Align left */}
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
      </div>{" "}
      {/* End of wrapper div */}
    </div>
  );
};

export default BidApprovalForm;
