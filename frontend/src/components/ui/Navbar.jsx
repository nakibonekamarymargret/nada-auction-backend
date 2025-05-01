import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineHeart, AiOutlineUser, AiOutlineBell } from "react-icons/ai";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isAuthenticated = true; 
  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  if (isLoginPage || isRegisterPage) return null;

  return (
    <div className="w-full bg-white text-black border-b border-gray-300 relative z-10">
      <div className="flex justify-between items-center px-6 py-4 max-w-[1400px] mx-auto relative">
        {/* Logo */}
        <h2
          onClick={() => navigate("/")}
          className="text-3xl font-bold text-black cursor-pointer"
        >
          NADA
        </h2>

        {/* Centered Search Bar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-[40%]">
          <input
            type="text"
            placeholder="Search for items"
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none text-black"
          />
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-10 text-sm">
          <div className="flex flex-col items-center cursor-pointer">
            <AiOutlineHeart size={20} />
            <span>My Watch List</span>
          </div>

          {/* Dropdown User Menu */}
          <div className="flex flex-col items-center cursor-pointer relative">
            <AiOutlineUser
              size={20}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
            <span>My Activity</span>

            {dropdownOpen && (
              <div className="absolute right-0 mt-12 w-48 bg-white text-black rounded-md shadow-lg border z-50">
                <ul className="py-1 text-sm">
                  {isAuthenticated ? (
                    <>
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
                        onClick={handleLogout}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        Logout
                      </li>
                    </>
                  ) : (
                    <>
                      <li
                        onClick={() => navigate("/login")}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        Login
                      </li>
                      <li
                        onClick={() => navigate("/register")}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        Register
                      </li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center cursor-pointer">
            <AiOutlineBell size={20} />
            <span>Alerts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
