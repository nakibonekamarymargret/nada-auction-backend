import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineHeart, AiOutlineUser, AiOutlineBell, AiOutlineSearch } from "react-icons/ai"; // Import AiOutlineSearch
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
  const [, setAuctions] = useState([]);
  const [isSearchIconVisible, setIsSearchIconVisible] = useState(false); // New state to control search icon visibility

  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  // Sync auth state
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, [location]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && event.target.closest(".relative") === null) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);


  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setDropdownOpen(false);
    navigate("/");
  };

  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/register");

  const handleSearch = async (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      try {
        const results = await SearchService.searchAuctions(searchTerm);
        setAuctions(results);
        navigate("/search-results", { state: { auctions: results } });
        setSearchTerm("");
        setIsSearchIconVisible(false); // Hide search input after search
      } catch (err) {
        console.error("Search failed", err);
      }
    }
  };

  const toggleDropDown = () =>{
    setDropdownOpen((prev) => !prev);
  }

  const toggleSearchInput = () => {
    setIsSearchIconVisible((prev) => !prev);
    if (isSearchIconVisible) { // If it's about to hide, clear search term
      setSearchTerm('');
    }
  };

  if (isLoginPage || isRegisterPage) return null;

  return (
    <div className="w-full bg-white text-black border-b border-gray-300 sticky top-0 left-0 z-50 ">
      <div className="flex justify-between items-center px-6 py-4 max-w-[1400px] mx-auto relative">
        {/* Logo */}
        <h2
          onClick={() => navigate("/")}
          className="text-3xl font-bold text-[#008080] cursor-pointer
             border-2 border-[#008080] rounded-full
             px-4 py-2 inline-block" // Added styles for border and padding
        >
          NAD<span className="text-[#FFA500]">A</span>
        </h2>

        {location.pathname === "/" && (
          <div className="flex-grow flex justify-center items-center relative">
            {/* Search Bar for larger screens */}
            <div className="hidden lg:block w-[40%]">
              {" "}
              {/* Hidden on small/medium, block on large */}
              <input
                type="text"
                placeholder="Search for items"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none text-black"
              />
            </div>

            {/* Search Icon for small/medium screens */}
            <div className="lg:hidden flex items-center justify-center">
              {" "}
              {/* Visible on small/medium, hidden on large */}
              <button
                onClick={toggleSearchInput}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <AiOutlineSearch size={24} />
              </button>
            </div>

            {/* Collapsible Search Input for small/medium screens */}
            {isSearchIconVisible && (
              <div className="absolute top-full left-0 right-0 mt-2 lg:hidden w-full px-4">
                <input
                  type="text"
                  placeholder="Search for items"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none text-black"
                  autoFocus // Automatically focus when visible
                />
              </div>
            )}
          </div>
        )}

        {/* Right side content based on login status */}
        <div className="flex items-center gap-10 text-sm">
          {isAuthenticated ? (
            <>
              {/* Watch List */}
              <div
                className="flex flex-col items-center cursor-pointer"
                onClick={() => navigate("/watch")}
              >
                <AiOutlineHeart size={20} />
                <span>My Watch List</span>
              </div>

              {/* Activity Dropdown */}
              <div
                className="flex flex-col items-center cursor-pointer relative"
                onClick={toggleDropDown}
              >
                <AiOutlineUser size={20} />
                <span>My Activity</span>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-12 w-48 bg-white text-black rounded-md shadow-lg border z-50">
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
                        onClick={handleLogout}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        Logout
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Alerts */}
              <div className="flex flex-col items-center cursor-pointer">
                <AiOutlineBell size={20} />
                <span>Alerts</span>
              </div>
            </>
          ) : (
            <div className="flex gap-6 items-center">
              <button
                onClick={handleLogin}
                className="px-4 py-2 text-md font-semibold text-[#008080] rounded hover:text-[#009181] transition flex items-center gap-1"
                style={{ fontFamily: "'var(--font-playfair)'" }}
              >
                <CiLogin size={24} />
                Login
              </button>
              <button
                onClick={handleRegister}
                className="px-4 py-2 text-md font-semibold text-[#008080] rounded hover:text-[#009181
                ] transition flex items-center gap-1"
                style={{ fontFamily: "'var(--font-playfair)'" }}
              >
                <FaUserPlus size={24} />
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