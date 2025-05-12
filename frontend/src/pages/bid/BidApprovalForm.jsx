import React, { useState } from "react";

const BidApprovalForm = () => {
  // State to track the current step (1 for Your details, 2 for View details)
  const [step, setStep] = useState(1);
  // State to store form data
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    address: "",
  });
  // State to handle loading state during submission
  const [isLoading, setIsLoading] = useState(false);

  // Handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Function to move to the next step (View details)
  const nextStep = () => {
    // You might want to add validation here before moving to step 2
    setStep(step + 1);
  };

  // Function to move to the previous step (Your details)
  const prevStep = () => {
    setStep(step - 1);
  };

  // Function to handle the final form submission
  const handleConfirmAndSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("Form submitted with data:", formData);

    // : Send formData to  backend API
    /*
    try {
      const response = await fetch('/your-backend-submit-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Submission successful!');
        // Redirect or show success message
        // navigate('/bid-approval-success'); // Example redirect
      } else {
        console.error('Submission failed:', response.statusText);
        // Show error message
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
    */

    setTimeout(() => {
      setIsLoading(false);
      alert(
        "Form data logged to console. Implement your actual submission logic."
      );
      
    }, 1500); // Simulate a network request delay
  };

  // Renders the content for the current step
  const renderStep = () => {
    switch (step) {
      case 1: // Your details form
        return (
          <div className="space-y-4 min-h-screen">
            <h2 className="text-2xl font-semibold text-gray-800">
              Your details
            </h2>

            <form className="bg-white/90 p-8 rounded-lg w-full max-w-md transform transition-all duration-700 ">
              <div>
                <label
                  htmlFor="title"
                  className="block text-md font-medium text-gray-700"
                >
                  Title
                </label>
                <select
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Title</option>
                  <option value="Mr">Mr</option>
                  <option value="Ms">Ms</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Dr">Dr</option>
                </select>
              </div>
              {/* name Field */}
              <div className=" relative flex  p-4">
                <label htmlFor="phoneNmber">Name: </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className=" mb-3 mx-2 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your Names"
                />
              </div>
              <div className=" relative flex  p-4">
                <label htmlFor="phoneNmber">Contact: </label>
                <input
                  type="tel"
                  id="contact"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className=" mb-3 mx-2 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your contact"
                />
              </div>
              <div className=" relative flex  p-4">
                <label htmlFor="phoneNmber">Address: </label>
                <input
                  type="text"
                  id="address"
                  value={formData.adress}
                  onChange={handleInputChange}
                  className="mx-2 mb-3 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your Location"
                />
              </div>
              <button
                type="button"
                onClick={nextStep}
                className=" align-end bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" // ml-auto to push it to the right
                disabled={isLoading}
              >
                Continue
              </button>
            </form>
          </div>
        );

      case 2: // View details
        return (
          <div className="space-y-4 min-h-screen">
            <h2 className="text-2xl font-semibold text-gray-800">
              View Details
            </h2>
            <div className=" p-4 rounded-md">
              <p>
                <span className="font-semibold">Title:</span>{" "}
                {formData.title || "N/A"}
              </p>
              <p>
                <span className="font-semibold"> Name:</span>{" "}
                {formData.name || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Contact:</span>{" "}
                {formData.contact || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Address:</span>{" "}
                {formData.address || "N/A"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleConfirmAndSubmit} 
              className=" mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 w-full"
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
    <div className="container mx-auto px-4 py-6 bg-white shadow-md rounded-lg">
      {/* Step Indicator */}
      <div className="flex justify-between items-center mb-6 max-w-sm mx-auto">
        {" "}
        {/* Adjusted max-width and mx-auto for better centering */}
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

      <form onSubmit={(e) => e.preventDefault()} className="max-w-md mx-auto">
        {renderStep()}

        <div className="mt-6 flex justify-between">
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

        </div>
      </form>
    </div>
  );
};

export default BidApprovalForm;
