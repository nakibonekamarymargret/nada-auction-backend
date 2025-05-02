import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiBell } from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import { HiOutlineUser } from "react-icons/hi";

import { CgNotes } from "react-icons/cg";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to manage dropdown visibility
  const dropdownRef = useRef(null); // Reference to the dropdown
  const avatarRef = useRef(null); // Reference to the avatar image
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the user info if logged in
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:7107/user/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error("User not logged in", err);
      }
    };

    fetchUser();
  }, []);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setDropdownOpen(false); // Close the dropdown if clicked outside
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Toggle dropdown on avatar click
  const handleAvatarClick = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  // Handle profile view
  // This function is called when the user clicks on the profile link in the dropdown
  const handleActivityView = () => {
    navigate(`/activity/${user.id}`); // Navigate to the Activity page for the logged-in user
    setDropdownOpen(false); // Close dropdown after clicking the activity link
  };
  return (
    <nav className="bg-stone-50 backdrop-blur-sm text-white px-6 py-3 flex justify-between items-center sticky top-0 z-50 w-full">
      <Link to="/">
        <span
          className="text-2xl bg-fuchsia-500 md:bg-white font-bold hover:underline italic shadow-md rounded-lg px-4 py-2"
          style={{
            backgroundClip: "border-box",
            color: "black", // Text color to make sure the letters are visible
            display: "inline-block",
          }}
        >
          NADA
        </span>
      </Link>

      <div className="flex items-center gap-6 text-black font-medium">
        {user ? (
          <>
            <div className="absolute left-1/2 transform -translate-x-1/2 w-[40%]">
              <input
                type="text"
                placeholder="Search for items"
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none text-black"
              />
            </div>

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

            <div className="relative">
              <div ref={avatarRef} onClick={handleAvatarClick}>
                <img
                  src={user.profilePicUrl}
                  alt="User Avatar"
                  className="w-9 h-9 rounded-full object-cover cursor-pointer hover:scale-105 transition-transform"
                />
              </div>
              {dropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 bg-white text-black border rounded-md shadow-md w-44 z-50"
                >
                  <button
                    onClick={handleProfileView} // Navigate to the profile page
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <HiOutlineUser size="26" />{" "}
                    <span className="text-gray-600">Profile</span>
                  </button>

                  <Link
                    to={`/myposts`}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)} // Close dropdown when item is clicked
                  >
                    <CgNotes size="20" />{" "}
                    <span className="text-gray-600">Posts</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    <CiLogout size="20" />{" "}
                    <span className="text-gray-600">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="links font-sans">
              <Link to="/login" className="hover:text-fuchsia-300">
                Login
              </Link>
              <Link to="/register" className="hover:text-fuchsia-300">
                Register
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
