import React, { useState, useEffect, useRef } from "react"; // Added useRef as it's good practice for dropdowns
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineHeart, AiOutlineUser, AiOutlineBell } from "react-icons/ai";
import { CiLogin } from "react-icons/ci";
import { FaUserPlus } from "react-icons/fa6";
import SearchService from "@/services/SearchService";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
      !!localStorage.getItem("token")
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [auctions, setAuctions] = useState([]);

  const dropdownRef = useRef(null); // Ref to the dropdown container for click outside

  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  // Sync auth state
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, [location]);

  // Effect to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    // Add event listener when dropdown is open
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Clean up event listener when dropdown is closed
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]); // Re-run effect when dropdownOpen state changes


  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setDropdownOpen(false); // Close dropdown on logout
    navigate('/'); // Optionally navigate to home or login after logout
  };

  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/register");

  const handleSearch = async (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      try {
        const results = await SearchService.searchAuctions(searchTerm);
        setAuctions(results); // Although auctions are passed via state, keeping this might be for other uses
        navigate("/search-results", { state: { auctions: results } });
        setSearchTerm(""); // Clear search term after navigating
      } catch (err) {
        console.error("Search failed", err);
        // Optionally show an error message to the user
      }
    }
  };

  // Function to toggle the dropdown visibility
  const toggleDropdown = () => {
    setDropdownOpen(prevState => !prevState);
  };


  // Don't render navbar on login or register pages
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

          {/* Centered Search Bar: Only show on home page */}
          {location.pathname === "/" && (
              <div className="absolute left-1/2 transform -translate-x-1/2 w-[40%] max-w-md"> {/* Added max-w-md for better responsiveness */}
                <input
                    type="text"
                    placeholder="Search for items"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none text-black"
                />
              </div>
          )}

          {/* Right side content based on login status */}
          <div className="flex items-center gap-10 text-sm"> {/* Increased gap slightly for clarity */}
            {isAuthenticated ? (
                <>
                  {/* Watch List */}
                  <div
                      className="flex flex-col items-center cursor-pointer hover:text-gray-700 transition" // Added hover effect
                      onClick={() => {
                        navigate("/watchlist");
                        setDropdownOpen(false); // Close dropdown when navigating
                      }}
                  >
                    <AiOutlineHeart size={20} />
                    <span>My Watch List</span>
                  </div>

                  {/* My Activity Dropdown - Added onClick handler */}
                  {/* Added ref to this div to detect clicks outside */}
                  <div
                      className="flex flex-col items-center cursor-pointer relative hover:text-gray-700 transition" // Added hover effect
                      onClick={toggleDropdown} // <-- Added onClick to toggle dropdownOpen state
                      ref={dropdownRef} // <-- Attach the ref here
                  >
                    <AiOutlineUser size={20} />
                    <span>My Activity</span>

                    {/* Dropdown Content - Conditionally rendered */}
                    {dropdownOpen && (
                        // Positioning and appearance classes
                        <div className="absolute right-0 top-full mt-3 w-48 bg-white text-black rounded-md shadow-lg border z-50"> {/* Adjusted positioning (top-full and mt) */}
                          <ul className="py-1 text-sm">
                            {/* Added onClick handlers for navigation and closing dropdown */}
                            <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  navigate("/my-bids"); // Example route for bids
                                  setDropdownOpen(false);
                                }}
                            >
                              Bids
                            </li>
                            <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  navigate("/recently-viewed"); // Example route
                                  setDropdownOpen(false);
                                }}
                            >
                              Recently Viewed
                            </li>
                            <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  navigate("/buy-again"); // Example route
                                  setDropdownOpen(false);
                                }}
                            >
                              Buy Again
                            </li>
                            <li
                                onClick={handleLogout}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600 font-medium" // Highlight logout
                            >
                              Logout
                            </li>
                          </ul>
                        </div>
                    )}
                  </div>

                  {/* Alerts */}
                  <div
                      className="flex flex-col items-center cursor-pointer hover:text-gray-700 transition" // Added hover effect
                      onClick={() => {
                        navigate("/alerts"); // Example route
                        setDropdownOpen(false); // Close dropdown when navigating
                      }}
                  >
                    <AiOutlineBell size={20} />
                    <span>Alerts</span>
                  </div>
                </>
            ) : (
                // Login/Register buttons when not authenticated
                <div className="flex gap-6 items-center">
                  <button
                      onClick={handleLogin}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-black rounded hover:text-blue-700 transition"
                  >
                    <CiLogin size={18}/> {/* Added size for consistency */}
                    Login
                  </button>
                  <button
                      onClick={handleRegister}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-black rounded hover:text-green-700 transition"
                  >
                    <FaUserPlus size={18}/> {/* Added size for consistency */}
                    Register
                  </button>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default Navbar;