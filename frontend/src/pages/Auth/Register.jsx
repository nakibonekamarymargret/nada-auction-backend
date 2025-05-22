import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoKeySharp } from "react-icons/io5";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import AuthService from "../../services/AuthService";

const Register = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phoneNumber: "",
  });

  const { password } = user;
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({});
  const [message, setMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setMessage("");

    // Client-side validation: check required fields
    const newErrors = {};
    if (!user.name) newErrors.name = "Name is required.";
    if (!user.email) newErrors.email = "Email is required.";
    if (!user.phoneNumber) newErrors.phoneNumber = "Phone number is required.";
    if (!user.address) newErrors.address = "Address is required.";
    if (!user.password) newErrors.password = "Password is required.";
    if (!confirmPassword) newErrors.confirmPassword = "Confirm your password.";

    // Check if passwords match
    if (user.password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    // If errors exist, stop submission and show them
    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    try {
      const response = await AuthService.register(user);
      console.log("Registration response:", response.data);

      //  Store token in localStorage to reflect login state
      localStorage.setItem('token', response.token);

      setMessage("Registration successful. Redirecting to Home page...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      const message =
          err.response?.data?.returnMessage || "An unexpected error occurred.";
      console.log("Error:", message);

      // Map backend errors to fields
      if (message.toLowerCase().includes("name")) {
        setError({ name: message });
      } else if (message.toLowerCase().includes("email")) {
        setError({ email: message });
      } else if (message.toLowerCase().includes("password")) {
        setError({ password: message });
      } else if (message.toLowerCase().includes("address")) {
        setError({ address: message });
      } else if (message.toLowerCase().includes("phone")) {
        setError({ phoneNumber: message });
      } else {
        setError({ general: message });
      }
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };
  return (
    <div className="flex flex-col md:flex-row items-stretch gap-[5vw] max-w-5xl mx-auto">
      <div className="hidden md:block w-1/2 p-4">
        <img
          src={`${import.meta.env.BASE_URL}bg1.jpg`}
          alt="auction"
          className="rounded-lg"
        />
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
          {error.general && (
            <div className="text-red-500 text-sm mb-4">{error.general}</div>
          )}

          <form onSubmit={handleSubmit}>
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
                  {label} <span className="text-red-500">*</span>
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
                <p className="text-red-500  text-xs mt-1">{error[name]}</p>
              </div>
            ))}

            {/* Password */}
            <div className="mb-4 relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password <span className="text-red-500">*</span>
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
                {error.password && (
                  <p className="text-red-500 text-xs mt-1">{error.password}</p>
                )}
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
            {/* Password Confirmation Field */}
            <div className="mb-3 relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <IoKeySharp
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your password"
                />
                {error.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {error.confirmPassword}
                  </p>
                )}

                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
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
              {message && (
                <div className="text-green-500 text-sm mb-4">{message}</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-black/70">Already have an account?</span>
              <button type="button" onClick={handleLogin} className="pointer">
                <span className="text-green-600 hover:text-green/50">
                  Login
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
