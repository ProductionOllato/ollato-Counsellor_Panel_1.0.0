// import React, { useState, useEffect, useRef } from "react";
// import LOGO from "../assets/Ollato_Logo_CC-03.png";
// import { FaRegUser } from "react-icons/fa";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/UserContext";
// import { useNotification } from "../context/NotificationContext";

// function Header({ sidebarOpen, setSidebarOpen }) {
//   const { user, logout, profileComplete } = useAuth();
//   const { triggerNotification } = useNotification();
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const userIconRef = useRef(null);
//   const navigate = useNavigate();

//   const handleDropdownToggle = () => {
//     setIsDropdownOpen((prevState) => !prevState);
//   };

//   const handleProfileClick = () => {
//     console.log("Profile clicked");
//     // Navigate to profile page if needed
//     navigate("/profile");
//   };

//   const handleLogout = () => {
//     logout();
//     triggerNotification("Logged out successfully", "success");
//   };

//   const handleSupportClick = () => {
//     navigate("/support");
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target) &&
//         userIconRef.current &&
//         !userIconRef.current.contains(event.target)
//       ) {
//         setIsDropdownOpen(false); // Close dropdown if clicked outside
//       }
//     };

//     // Add event listener for detecting clicks outside
//     document.addEventListener("mousedown", handleClickOutside);

//     // Cleanup event listener on component unmount
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   return (
//     <nav
//       className={`fixed top-0 ${
//         sidebarOpen ? "ml-64" : "ml-20"
//       } z-20 w-[calc(100%-${
//         sidebarOpen ? "16rem" : "5rem"
//       })] h-20 w-full bg-[#827397] text-white shadow-lg transition-all duration-300`}
//     >
//       <div className="px-3 py-2 lg:px-5">
//         <div className="flex items-center justify-between">
//           {/* Left Section: Logo and Toggle */}
//           <div className="flex items-center justify-around">
//             {/* Sidebar Toggle Button (Visible on small screens) */}
//             <button
//               type="button"
//               className="inline-flex items-center w-10 p-2 text-white rounded-lg sm:hidden"
//             >
//               <span className="sr-only">Open sidebar</span>
//               <svg
//                 className="w-6 h-6"
//                 aria-hidden="true"
//                 fill="currentColor"
//                 viewBox="0 0 20 20"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   clipRule="evenodd"
//                   fillRule="evenodd"
//                   d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
//                 ></path>
//               </svg>
//             </button>

//             {/* Logo */}
//             <Link to={"/dashboard"}>
//               <img
//                 src={LOGO}
//                 alt="Logo"
//                 className="lg:w-32 h-14 object-contain"
//               />
//             </Link>

//             <span className="text-xl font-semibold hidden sm:block">
//               Ollato's Mind Mapping
//             </span>
//           </div>

//           {/* User Profile */}
//           <div>
//             <button
//               onClick={handleDropdownToggle}
//               ref={userIconRef}
//               className="flex items-center gap-2 text-lg"
//             >
//               <span>
//                 {user?.first_name.charAt(0).toUpperCase() +
//                   user?.first_name.slice(1)}
//               </span>
//               {user?.profile_pic ? (
//                 <img
//                   src={user.profile_pic}
//                   alt="User Profile"
//                   className="w-8 h-8 rounded-full"
//                 />
//               ) : (
//                 <FaRegUser className="text-2xl text-[#F5F5F5]" />
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default Header;

// const DropdownButton = ({ onClick, children, disabled, isComplete }) => {
//   const baseClasses =
//     "dropdown-item hover:text-[#3B1E54] transition-colors duration-200";
//   const disabledClasses = disabled ? "cursor-not-allowed text-grey" : "";

//   return (
//     <button
//       onClick={onClick}
//       className={`${baseClasses} ${disabledClasses}`}
//       disabled={disabled}
//     >
//       {children}
//     </button>
//   );
// };

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
    navigate("/profile");
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
    <nav
      className={`fixed top-0 left-0 z-50 w-full h-24 bg-[#827397] text-white shadow-lg ${
        sidebarOpen ? "pl-64" : "pl-20"
      } transition-all duration-300`}
    >
      
      <div className="px-3 py-6 lg:px-5">
        <div className="flex items-center justify-between">

        <div className="bg-[#827397]  flex justify-center ">
        <Link to="/dashboard" className="flex items-center">
          <img
            src={LOGO}
            alt="Logo"
            className={`h-16 w-28 transition-transform duration-300 ${
              sidebarOpen ? "scale-100" : "scale-75"
            }`}
          />
        </Link>
        <span className="text-xl font-semibold pt-6 sm:block flex justify-center">
              Ollato's Mind Mapping
            </span>
      </div>
      
          {/* Title */}
          
          {/* User Profile */}
          <div>
            <button
              onClick={handleDropdownToggle}
              ref={userIconRef}
              className="flex items-center gap-2 text-lg"
            >
              <span>
                {user?.first_name.charAt(0).toUpperCase() +
                  user?.first_name.slice(1)}
              </span>
              {user?.profile_pic ? (
                <img
                  src={user.profile_pic}
                  alt="User Profile"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <FaRegUser className="text-2xl text-[#F5F5F5]" />
              )}
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          
          <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 bg-transparent text-black p-4 rounded-lg shadow-lg w-40 z-50 flex flex-col"
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
    </nav>
   
  );
}

export default Header;

const DropdownButton = ({ onClick, children, disabled }) => {
  const baseClasses =
    "block w-full px-4 py-2 text-left text-sm hover:bg-gray-100";
  const disabledClasses = disabled ? "cursor-not-allowed text-gray-400" : "";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${disabledClasses}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
