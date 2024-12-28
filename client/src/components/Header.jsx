import React, { useState, useEffect, useRef } from "react";
import LOGO from "../assets/Ollato_Logo_CC-03.png";
import { FaRegUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";
import "../styles/Header.css";
import {
  Typography,
  Dialog,
} from "@material-tailwind/react";

function Header({ sidebarOpen, setSidebarOpen }) {
  const { user, logout, profileComplete } = useAuth();
  const { triggerNotification } = useNotification();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userIconRef = useRef(null);
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  const handleProfileClick = () => {
    navigate("/account-settings");
  };

  const handleLogout = () => {
    triggerNotification("Logout successfully", "success");
    logout();
    setTimeout(() => {
      navigate("/");
    }, 3000);
  };
  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  const handleSupportClick = () => {
    navigate("/support");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        userIconRef.current &&
        !userIconRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="header">
        <Link to="/dashboard" className="logo">
          <img src={LOGO} alt="Logo" className="logo-image" />
        </Link>

        <div className="header-container">
          {/* Logo */}

          {/* Heading */}
          <div className="header-title">
            <h1 className="title">
              {/* Ollato's Mind Mapping - Counselor's Management Panel */}
              <p className="sub-title">Mind Mapping </p> <p className="sub-title-2"> Expert  Panel </p>
            </h1>
            {/* <h2 className="sub-title ">Counselor's Management Panel </h2> */}
          </div>

          {/* Profile Section */}
          <div className="profile-section">
            <button
              onClick={handleDropdownToggle}
              ref={userIconRef}
              className="profile-btn"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <span className="capitalize">{user?.first_name}</span>
              {user?.profile_pic ? (
                <img
                  src={user.profile_pic}
                  alt="User Profile"
                  className="profile-pic"
                />
              ) : (
                <FaRegUser className="user-icon" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div ref={dropdownRef} className="dropdown-menu">
                <DropdownButton
                  onClick={handleProfileClick}
                  disabled={!profileComplete}
                  isComplete={profileComplete}
                >
                  Profile
                </DropdownButton>
                <DropdownButton onClick={handleSupportClick}>
                  Support
                </DropdownButton>
                <DropdownButton onClick={() => setShowLogoutConfirm(true)}>Logout</DropdownButton>
              </div>
            )}
          </div>
          <Dialog
            open={showLogoutConfirm}
            handler={setShowLogoutConfirm}
            className="bg-[#f3d6e0] rounded-lg shadow-lg p-6 h-fit w-fit fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <Typography variant="h6" className="mb-4">
              Are you sure you want to logout?
            </Typography>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </Dialog>
        </div>
      </nav>
    </>
  );
}

export default Header;

const DropdownButton = ({ onClick, children, disabled }) => {
  return (
    <>
      <button
        onClick={onClick}
        className={`dropdown-btn ${disabled ? "disabled" : ""}`}
        disabled={disabled}
      >
        {children}
      </button>
    </>
  );
};
