import React, { useState, useEffect, useRef } from "react";
import LOGO from "../assets/Ollato_Logo_CC-03.png";
import { FaRegUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";
import "../styles/Header.css";
import { Typography, Dialog } from "@material-tailwind/react";

function Header({ sidebarOpen, setSidebarOpen }) {
  const { user, logout, profileComplete } = useAuth();
  const { triggerNotification } = useNotification();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userIconRef = useRef(null);
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
              <p className="sub-title">Mind Mapping </p>{" "}
              <p className="sub-title-2"> Expert Panel </p>
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
                <DropdownButton onClick={() => setShowLogoutConfirm(true)}>
                  Logout
                </DropdownButton>
              </div>
            )}
          </div>
          <Dialog
            open={showLogoutConfirm}
            handler={setShowLogoutConfirm}
            className="bg-[#eebdce] rounded-lg shadow-lg p-6 sm:p-8 h-fit w-full sm:w-3/4 md:w-2/3 lg:w-1/2 max-w-lg sm:max-w-xl md:max-w-2xl fixed inset-0 m-auto z-50 flex items-center justify-center"
          >
            <div className="flex flex-col items-center text-center">
              {/* SVG Icon for alert */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                fill="currentColor"
                className="text-red-600 mb-6"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1 17h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>

              {/* Typography Text */}
              <Typography
                variant="h4"
                className="mb-6 text-gray-800 font-semibold text-lg sm:text-2xl"
              >
                Are you sure you want to logout?
              </Typography>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-6 w-full sm:w-auto">
                <button
                  className="px-6 py-3 text-lg font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 w-full sm:w-auto"
                  onClick={confirmLogout}
                >
                  Logout
                </button>
                <button
                  className="px-6 py-3 text-lg font-semibold text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400 w-full sm:w-auto"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
              </div>
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
