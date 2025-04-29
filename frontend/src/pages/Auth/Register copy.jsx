import React, { useState } from "react";
import PersonalForm from "./PersonalForm";
import BusinessForm from "./BusinessForm";
const Register = () => {
  const [formType, setFormType] = useState("personal");

  return (
    <div className="flex flex-col md:flex-row justify-center items-center p-8 max-w-5xl mx-auto">
      {/* Left image */}
      <div className="hidden md:block w-1/2">
        <img
          src="/your-image-path.jpg"
          alt="Register visual"
          className="rounded-lg"
        />
      </div>

      {/* Right form section */}
      <div className="w-full md:w-1/2 p-4">
        <h2 className="text-2xl font-bold mb-4">Create an account</h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFormType("personal")}
            className={`px-4 py-2 border rounded ${
              formType === "personal" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => setFormType("business")}
            className={`px-4 py-2 border rounded ${
              formType === "business" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            Business
          </button>
        </div>
        {formType === "personal" ? <PersonalForm /> : <BusinessForm />}
      </div>
    </div>
  );
};

export default Register;
