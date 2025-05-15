import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MdAlternateEmail } from "react-icons/md";
import { IoKeySharp } from "react-icons/io5";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [id, setId] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill out both fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:7107/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Backend response data:", data); // Keep this log to see the full response structure

      if (response.ok) {
        const { token, role ,email} = data.ReturnObject;

        console.log("Role variable value BEFORE if:", role); // DEBUG
        console.log("Type of role variable:", typeof role); // DEBUG
        console.log("Type of email variable:", typeof email); // DEBUG
        console.log("Result of role === 'ADMIN' comparison:", role === "ADMIN"); // DEBUG

        // Save the token and role in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("email", id); //
        console.log(email);


        // Navigate based on the role
        if (role === "ADMIN") {
          console.log("Login: Role is ADMIN. Navigating to /admin"); // DEBUG
          navigate("/admin");
        } else {
          console.log("Login: Role is NOT ADMIN. Navigating to /"); // DEBUG
          navigate("/");
        }
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-[5vw] max-w-5xl mx-auto">
      <div className="hidden md:block w-1/2 p-4">
        <img src="/bg1.jpg" alt="auction" className="rounded-lg" />
      </div>

      <div className="w-full md:w-1/2 p-4 h-full">
        <div className="bg-white/70 p-8 rounded-2xl w-full max-w-md mb-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white/90 p-8 rounded-lg w-full max-w-md transform transition-all duration-700 motion-preset-slide-left-lg motion-translate-y-in-100 motion-duration-[2s] motion-ease-spring-smooth"
          >
            <h2
              style={{ fontFamily: "var(--font-roboto)" }}
              className="text-2xl font-normal mb-4 text-center mt-6"
            >
              Welcome back to <b className="text-dark font-semi-bold">NADA</b>{" "}
            </h2>

            <p className="text-gray-500 text-center mb-6">
              Login to your account
            </p>
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            {/* Email Field */}
            <div className="p-5 relative">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="relative">
                <MdAlternateEmail
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />

                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="p-5 relative">
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Remember Me */}
            <div className="flex items-center p-5">
              <input
                id="rememberMe"
                type="checkbox"
                className="mr-2"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-700">
                Remember me
              </label>
            </div>

            {/* Login Button */}
            <div className="pb-5">
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>

            {/* Forgot Password & Register */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center px-3 justify-between font-semi-bold text-sm">
              <a href="#" className="text-blue-500 mb-2 mx-3  sm:mb-0">
                Forgot password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
