import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoKeySharp } from "react-icons/io5";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

const Register = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phoneNumber: "",
  });

  const { name, email, password, address, phoneNumber } = user;
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !address || !phoneNumber) {
      setError("Please fill out all fields.");
      return;
    }
    console.log("Registering user", user);
    setError("");
    navigate("/login"); // Redirect after registration logic
  };

  

  return (
    <div className="flex flex-col md:flex-row items-start items-stretch gap-[5vw] max-w-5xl mx-auto">
      {/* Left image */}
      <div className="hidden md:block w-1/2 p-4">
        <img src="/bg1.jpg" alt="Register visual" className="rounded-lg" />
      </div>

      {/* Right form section */}
      <div className="w-full md:w-1/2 p-4">
        <p className="text-xl font-semi-bold text-center mt-7">
          Welcome to <b className="text-dark font-bold">NADA</b>{" "}
        </p>
        <h2
          style={{ fontFamily: "var(--font-roboto)" }}
          className="text-2xl font-bold mb-4 text-center mt-6 "
        >
          Create your account
        </h2>
        <div className="bg-white/70 p-8 rounded-2xl w-full max-w-md mb-4">
          <form onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            {[
              {
                label: "Name",
                name: "name",
                type: "text",
                placeholder: "Your name",
              },
              {
                label: "Email",
                name: "email",
                type: "email",
                placeholder: "Enter your email",
              },
              {
                label: "Phone Number",
                name: "phoneNumber",
                type: "tel",
                placeholder: "Enter phone number",
              },
              {
                label: "Address",
                name: "address",
                type: "text",
                placeholder: "Enter address",
              },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name} className="mb-4">
                <label
                  htmlFor={name}
                  className="block text-sm font-medium text-gray-700"
                >
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  id={name}
                  value={user[name]}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={placeholder}
                />
              </div>
            ))}

            {/* Password */}
            <div className="mb-4 relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <IoKeySharp
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaRegEyeSlash size={20} />
                  ) : (
                    <FaRegEye size={20} />
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <Button type="submit" className="w-full">
                Register
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
