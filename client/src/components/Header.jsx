import React, { useState, useEffect, useRef } from "react";
import LOGO from "../assets/Ollato_Logo_CC-03.png";
import { FaRegUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";

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
    // <nav className=" bg-[#584976] border-gray-200 fixed top-0 left-0 z-50 w-full shadow-lg px-4 lg:px-6 py-3 transition-all duration-300">
    //   <div className="flex flex-wrap justify-center items-center mx-auto max-w-screen-xl">
    //     <div className="width-full flex justify-between bg-[#e4d8d8]">
    //       {/* Logo and Title */}
    //       <Link to="/dashboard" className="flex items-center w-">
    //         <img
    //           src={LOGO}
    //           alt="Logo"
    //           className="mr-3 h-14 sm:h-16 transition-transform duration-300"
    //         />
    //       </Link>
    //     </div>

    //     <span className="self-center text-2xl text-[#e4d8d8] font-semibold whitespace-nowrap">
    //       Ollato's Mind Mapping
    //     </span>

    //     {/* Right Section */}
    //     <div className="flex items-center lg:order-2">
    //       <button
    //         onClick={handleDropdownToggle}
    //         ref={userIconRef}
    //         className="flex items-center gap-2 text-[#e4d8d8] hover:bg-[#e4d8d8] hover:text-[#131010] focus:ring-4 focus:ring-gray-300 font-medium text-2xl rounded-lg px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
    //         aria-haspopup="true"
    //         aria-expanded={isDropdownOpen}
    //       >
    //         <span>
    //           {user?.first_name?.charAt(0).toUpperCase() +
    //             user?.first_name?.slice(1)}
    //         </span>
    //         {user?.profile_pic ? (
    //           <img
    //             src={user.profile_pic}
    //             alt="User Profile"
    //             className="w-10 h-10 rounded-full"
    //           />
    //         ) : (
    //           <FaRegUser className="text-3xl text-[#e4d8d8]" />
    //         )}
    //       </button>

    //       {isDropdownOpen && (
    //         <div
    //           ref={dropdownRef}
    //           className="absolute right-0 top-10 mt-2 bg-white text-black p-4 rounded-lg shadow-lg w-40 z-50 flex flex-col"
    //         >
    //           <DropdownButton
    //             onClick={handleProfileClick}
    //             disabled={!profileComplete}
    //             isComplete={profileComplete}
    //           >
    //             Profile
    //           </DropdownButton>
    //           <DropdownButton onClick={handleSupportClick}>
    //             Support
    //           </DropdownButton>
    //           <DropdownButton onClick={handleLogout}>Logout</DropdownButton>
    //         </div>
    //       )}
    //     </div>
    //   </div>
    // </nav>
    <nav className="bg-[#6e5e8f] fixed top-0 left-0 z-50 w-full shadow-lg px-4 lg:px-6 py-3 transition-all duration-300">
      <div className="flex justify-between items-center max-w-screen-xl mx-auto">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center ">
          <img src={LOGO} alt="Logo" className="h-16 w-32 object-contain" />
        </Link>

        {/* Title */}
        <span className="text-2xl text-[#e4d8d8] font-semibold whitespace-nowrap">
          Ollato's Mind Mapping
        </span>

        {/* Profile Section */}
        <div className="flex items-center lg:order-2">
          <button
            onClick={handleDropdownToggle}
            ref={userIconRef}
            className="flex items-center gap-2 text-[#e4d8d8] hover:text-[#e4d8d8] focus:ring-4 focus:ring-gray-300 font-medium text-lg rounded-lg px-4 lg:px-5 py-2 focus:outline-none"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <span>
              {user?.first_name?.charAt(0).toUpperCase() +
                user?.first_name?.slice(1)}
            </span>
            {user?.profile_pic ? (
              <img
                src={user.profile_pic}
                alt="User Profile"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <FaRegUser className="text-3xl text-[#e4d8d8]" />
            )}
          </button>

          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-20 bg-[#e4d8d8] text-black p-4 rounded-lg shadow-lg w-40 z-50 flex flex-col"
            >
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
              <DropdownButton onClick={handleLogout}>Logout</DropdownButton>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;

const DropdownButton = ({ onClick, children, disabled }) => {
  const baseClasses =
    "block w-full px-4 py-2 text-left text-sm rounded-md transition duration-200 focus:outline-none";
  const enabledClasses =
    "text-[#131010] hover:bg-[#BCCCDC] hover:text-[#6A669D] focus:ring-2 focus:ring-gray-300";
  const disabledClasses = "cursor-not-allowed text-gray-400 bg-gray-50";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${
        disabled ? disabledClasses : enabledClasses
      }`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
