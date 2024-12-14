import React, { useState, useEffect, useRef } from "react";
import LOGO from "../assets/Ollato_Logo_CC-03.png";
import { FaRegUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";
import "../styles/Header.css";

function Header({ sidebarOpen, setSidebarOpen }) {
  const { user, logout, profileComplete } = useAuth();
  const { triggerNotification } = useNotification();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userIconRef = useRef(null);
  const navigate = useNavigate();

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  const handleProfileClick = () => {
    navigate("/account-settings");
  };

  const handleLogout = () => {
    logout();
    triggerNotification("Logged out successfully", "success");
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
          <h1 className="title">Ollato's Mind Mapping</h1>
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
              <DropdownButton onClick={handleSupportClick}>Support</DropdownButton>
              <DropdownButton onClick={handleLogout}>Logout</DropdownButton>
            </div>
          )}
        </div>
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