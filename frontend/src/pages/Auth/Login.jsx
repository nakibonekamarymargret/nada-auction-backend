import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MdAlternateEmail } from "react-icons/md";
import { IoKeySharp } from "react-icons/io5";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
<<<<<<< HEAD
import AuthService from "../../services/AuthService";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

const { email, password, confirmPassword } = credentials;
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  }

  const handleLogin = async(e) => {
    e.preventDefault();

    setError({});
    setMessage("");
    if (password !== confirmPassword) {
      setError({ confirmPassword: "Passwords do not match" });
      return;
    }

    try { 
      const response = await AuthService.login(credentials);
      console.log("Login response:", response.data);
      setMessage("Login successful. Redirecting to home...");

      if (rememberMe) {   
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      setTimeout(() => {
        navigate("/");
      },2000)

    } catch (err) {
      
      const message = err.response.data?.returnMessage || "Provide valid credentials";
      console.log("Error:", message);

      if (message.toLowerCase().includes("email")) {
        setError({ email: message });
      }
      else if (message.toLowerCase().includes("password")) {
        setError({ password: message });
      } else {
        setError({ general: message });
      }
    }


  };
const handleRegister = () => {
  navigate("/register");
};
=======

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill out both fields.");
      return;
    }

    // Simulated login - in real life, you'd call your API and get a token
    const fakeToken = "mock-jwt-token";

    localStorage.setItem("token", fakeToken);
    localStorage.setItem("rememberMe", rememberMe);

    console.log("Logging in with:", { email, password, rememberMe });

    setError("");
    navigate("/dashboard");
  };


>>>>>>> Development

  return (
    <div className="flex flex-col md:flex-row items-start gap-[5vw] max-w-5xl mx-auto">
      <div className="hidden md:block w-1/2 p-4">
        <img src="/bg1.jpg" alt="auction" className="rounded-lg" />
      </div>

      <div className="w-full md:w-1/2 p-4 h-full">
        <div className="bg-white/70 p-8 rounded-2xl w-full max-w-md mb-4">
<<<<<<< HEAD
          <h2
            style={{ fontFamily: "var(--font-roboto)" }}
            className="text-2xl font-normal mb-4 text-center mt-6"
          >
            Hi <b className="text-dark font-semi-bold">there</b>{" "}
          </h2>

          <p className="text-gray-500 text-center mb-6">
            Login to continue your journey with{" "}
            <b className="text-dark font-semi-bold">NADA</b>
          </p>
          {message && (
            <div className="text-green-500 text-sm mb-4">{message}</div>
          )}
          <form
            onSubmit={handleLogin}
            className="bg-white/90 p-8 rounded-lg w-full max-w-md transform transition-all duration-700 motion-preset-slide-left-lg motion-translate-y-in-100 motion-duration-[2s] motion-ease-spring-smooth"
          >
            {error.general && (
              <div className="text-red-500 text-sm mb-4">{error.general}</div>
            )}
            {/* Email Field */}

=======
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
>>>>>>> Development
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
<<<<<<< HEAD
                  name="email"
                  value={email}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
                {error.email && (
                  <p className="text-red-500 text-xs mt-1">{error.email}</p>
                )}
=======
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
>>>>>>> Development
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
<<<<<<< HEAD
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
            {/* Confirm Password Field */}
            <div className="p-5 relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <IoKeySharp
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Re-enter your password"
                />
                {error.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {error.confirmPassword}
                  </p>
                )}
=======
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
>>>>>>> Development
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
<<<<<<< HEAD
=======

>>>>>>> Development
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
<<<<<<< HEAD
            <div className="flex items-center gap-2">
              <span className="text-black/70">Don't have an account?</span>
              <button type="button" onClick={handleRegister}>
                <span className="text-green-600 hover:text-green/50">
                  Register
                </span>
              </button>
            </div>
=======
>>>>>>> Development
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
