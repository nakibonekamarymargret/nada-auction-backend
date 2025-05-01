import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To detect current page
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/register");
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token or auth state
    navigate("/login");
  };

  const isAuthenticated = false; // Replace this with real auth check later

  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  return (
    <div className="bg-white flex justify-between items-center h-20 max-w-[1240px] mx-auto px-6 text-black w-full">
      {/* Logo */}
      <h2 className="text-3xl font-bold text-black">NADA</h2>

      {/* Desktop Right Section */}
      <div className="hidden md:flex items-center gap-6 text-md">
        {/* Conditional Login/Register Prompt */}
        {!isAuthenticated && (
          <>
            {isLoginPage ? (
              <div className="flex items-center gap-2">
                <span className="text-black/70">Don't have an account?</span>
                <button type="button" onClick={handleRegister}>
                  <span className="text-black hover:text-black/50">
                    Register
                  </span>
                </button>
              </div>
            ) : isRegisterPage ? (
              <div className="flex items-center gap-2">
                <span className="text-black/70">Already have an account?</span>
                <button type="button" onClick={handleLogin}>
                  <span className="text-black hover:text-black/50">Login</span>
                </button>
              </div>
            ) : null}
          </>
        )}

        {/* Authenticated User View */}
        {isAuthenticated && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="font-medium flex items-center gap-1"
            >
              <span className="text-black">User</span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                <ul className="py-1 text-sm">
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Bids
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Recently Viewed
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Buy Again
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Search Bar (Visible only if not on login/register) */}
        {!isLoginPage && !isRegisterPage && (
          <input
            type="text"
            placeholder="Search for anything..."
            className="border border-gray-300 px-4 py-1 rounded-full focus:outline-none"
          />
        )}
      </div>

      {/* Mobile Hamburger Button */}
      <div className="md:hidden">
        <AiOutlineMenu size={24} onClick={() => {}} />
      </div>
    </div>
  );
};

export default Navbar;
