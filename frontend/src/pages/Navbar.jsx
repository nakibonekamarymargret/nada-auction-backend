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
    localStorage.removeItem("token"); // Remove the token from localStorage
    setUser(null); // Set the user state to null to update the navbar
    setDropdownOpen(false); // Close the dropdown if it's open
  };

  // Toggle dropdown on avatar click
  const handleAvatarClick = () => {
    setDropdownOpen((prevState) => !prevState);
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

            <Link to="/notifications" className="hover:text-fuchsia-300">
              <FiBell size={20} />
            </Link>

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
