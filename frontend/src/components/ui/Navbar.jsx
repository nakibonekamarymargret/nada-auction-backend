import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineHeart, AiOutlineUser, AiOutlineBell } from "react-icons/ai";
import { CiLogin } from "react-icons/ci";
import { FaUserPlus } from "react-icons/fa6";
import SearchService from "@/services/SearchService";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState(null);

  const dropdownRef = useRef(null);

  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  // Decode JWT to get user role
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);

        const roles = payload.roles || payload.role || [];
        const isAdmin = Array.isArray(roles)
            ? roles.includes("ADMIN") || roles.includes("ROLE_ADMIN")
            : roles === "ADMIN" || roles === "ROLE_ADMIN";

        setCurrentUserRole(isAdmin ? "ADMIN" : "USER");
      } catch (e) {
        console.error("Failed to decode token", e);
        setCurrentUserRole(null);
      }
    }
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setCurrentUserRole(null);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/register");

  const handleSearch = async (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      try {
        const results = await SearchService.searchAuctions(searchTerm);
        navigate("/search-results", { state: { auctions: results } });
        setSearchTerm("");
      } catch (err) {
        console.error("Search failed", err);
      }
    }
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  if (isLoginPage || isRegisterPage) return null;

  return (
      <div className="w-full bg-white text-black border-b border-gray-300 relative z-10">
        <div className="flex justify-between items-center px-4 py-4 max-w-[1400px] mx-auto relative">
          <h2
              onClick={() => navigate("/")}
              className="text-3xl font-bold text-black cursor-pointer"
          >
            NADA
          </h2>

          {location.pathname === "/" && (
              <div className="absolute left-1/2 transform -translate-x-1/2 w-[40%] max-w-md hidden md:block">
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

          <div className="hidden md:flex items-center gap-6 text-sm">
            {isAuthenticated ? (
                <>
                  <div
                      className="flex flex-col items-center cursor-pointer hover:text-gray-700 transition"
                      onClick={() => {
                        navigate("/watchlist");
                        setDropdownOpen(false);
                      }}
                  >
                    <AiOutlineHeart size={20} />
                    <span>My Watch List</span>
                  </div>

                  <div
                      className="flex flex-col items-center cursor-pointer relative hover:text-gray-700 transition"
                      onClick={toggleDropdown}
                      ref={dropdownRef}
                  >
                    <AiOutlineUser size={20} />
                    <span>My Activity</span>

                    {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-3 w-48 bg-white text-black rounded-md shadow-lg border z-50">
                          <ul className="py-1 text-sm">
                            {currentUserRole === "ADMIN" && (
                                <li
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                      navigate("/dashboard");
                                      setDropdownOpen(false);
                                    }}
                                >
                                  Dashboard
                                </li>
                            )}
                            <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  navigate("/my-bids");
                                  setDropdownOpen(false);
                                }}
                            >
                              Bids
                            </li>
                            <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  navigate("/recently-viewed");
                                  setDropdownOpen(false);
                                }}
                            >
                              Recently Viewed
                            </li>
                            <li
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  navigate("/buy-again");
                                  setDropdownOpen(false);
                                }}
                            >
                              Buy Again
                            </li>
                            <li
                                onClick={handleLogout}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600 font-medium"
                            >
                              Logout
                            </li>
                          </ul>
                        </div>
                    )}
                  </div>

                  <div
                      className="flex flex-col items-center cursor-pointer hover:text-gray-700 transition"
                      onClick={() => {
                        navigate("/alerts");
                        setDropdownOpen(false);
                      }}
                  >
                    <AiOutlineBell size={20} />
                    <span>Alerts</span>
                  </div>
                </>
            ) : (
                <div className="flex gap-6 items-center">
                  <button
                      onClick={handleLogin}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-black rounded hover:text-blue-700 transition"
                  >
                    <CiLogin size={18} />
                    Login
                  </button>
                  <button
                      onClick={handleRegister}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-black rounded hover:text-green-700 transition"
                  >
                    <FaUserPlus size={18} />
                    Register
                  </button>
                </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={toggleMobileMenu} className="text-black focus:outline-none">
              <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
              >
                {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-300 py-4 px-6 shadow-md">
              <div className="flex flex-col space-y-4">
                {location.pathname === "/" && (
                    <div className="mb-4">
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
                {isAuthenticated ? (
                    <>
                      <div
                          className="cursor-pointer hover:text-gray-700"
                          onClick={() => {
                            navigate("/watchlist");
                            setMobileMenuOpen(false);
                          }}
                      >
                        <div className="flex items-center gap-2">
                          <AiOutlineHeart size={18} />
                          <span>My Watch List</span>
                        </div>
                      </div>
                      <div
                          className="cursor-pointer hover:text-gray-700"
                          onClick={() => {
                            navigate("/alerts");
                            setMobileMenuOpen(false);
                          }}
                      >
                        <div className="flex items-center gap-2">
                          <AiOutlineBell size={18} />
                          <span>Alerts</span>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <div
                            className="cursor-pointer hover:text-gray-700"
                            onClick={() => {
                              navigate("/my-bids");
                              setMobileMenuOpen(false);
                            }}
                        >
                          Bids
                        </div>
                        <div
                            className="cursor-pointer hover:text-gray-700"
                            onClick={() => {
                              navigate("/recently-viewed");
                              setMobileMenuOpen(false);
                            }}
                        >
                          Recently Viewed
                        </div>
                        <div
                            className="cursor-pointer hover:text-gray-700"
                            onClick={() => {
                              navigate("/buy-again");
                              setMobileMenuOpen(false);
                            }}
                        >
                          Buy Again
                        </div>
                        {currentUserRole === "ADMIN" && (
                            <div
                                className="cursor-pointer hover:text-gray-700"
                                onClick={() => {
                                  navigate("/dashboard");
                                  setMobileMenuOpen(false);
                                }}
                            >
                              Dashboard
                            </div>
                        )}
                        <div
                            className="text-red-600 font-medium cursor-pointer"
                            onClick={handleLogout}
                        >
                          Logout
                        </div>
                      </div>
                    </>
                ) : (
                    <div className="flex flex-col space-y-3">
                      <button
                          onClick={() => {
                            handleLogin();
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black rounded hover:text-blue-700"
                      >
                        <CiLogin size={18} />
                        <span>Login</span>
                      </button>
                      <button
                          onClick={() => {
                            handleRegister();
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black rounded hover:text-green-700"
                      >
                        <FaUserPlus size={18} />
                        <span>Register</span>
                      </button>
                    </div>
                )}
              </div>
            </div>
        )}
      </div>
  );
};

export default Navbar;
