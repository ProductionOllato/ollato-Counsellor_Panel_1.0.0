import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";
import { RiHome8Line } from "react-icons/ri";
import { MdAssessment } from "react-icons/md";
import { LuPackageSearch } from "react-icons/lu";
import { TbReportMoney } from "react-icons/tb";
import { FaBuildingUser } from "react-icons/fa6";
import { FaUserCog } from "react-icons/fa";
import { CgLogOut } from "react-icons/cg";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { BiSupport } from "react-icons/bi";
import { CiLock } from "react-icons/ci";
import { RxHamburgerMenu } from "react-icons/rx";
import LOGO from "../assets/Ollato_Logo_CC-03.png";

import {
  Card,
  List,
  ListItem,
  ListItemPrefix,
  Typography,
  Dialog,
} from "@material-tailwind/react";
import ConfirmationDialog from "./ConfirmationDialog";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { profileComplete, logout } = useAuth();
  const { triggerNotification } = useNotification();
  const navigate = useNavigate();

  // State to track screen width
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const sidebarItems = [
    { label: "Dashboard", icon: <RiHome8Line />, path: "/dashboard" },
    {
      label: "Availability Management",
      icon: <MdAssessment />,
      path: "/availability-management",
    },
    {
      label: "Session Management",
      icon: <LuPackageSearch />,
      path: "/session-management",
    },
    { label: "My Activity", icon: <FaBuildingUser />, path: "/my-activity" },
    {
      label: "Revenue Details",
      icon: <TbReportMoney />,
      path: "/revenue-details",
    },
    {
      label: "Account Settings",
      icon: <FaUserCog />,
      path: "/account-settings",
    },
    { label: "Help & Support", icon: <BiSupport />, path: "/support" },
  ];

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

  useEffect(() => {
    // Listen to window resize events and update the state for mobile screen size
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // If the screen is resized back to >= 768px, automatically open the sidebar
    if (!isMobile) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isMobile, setSidebarOpen]);

  return (
    <>
      {/* Sidebar for large screens */}
      <Card
        className={`h-[calc(100vh)] ${
          sidebarOpen ? "w-64" : "w-20"
        } fixed top-0 left-0 z-40 shadow-lg transition-all duration-300 bg-[#eecdc0] rounded-none pt-8 backdrop-blur-lg bg-opacity-40 md:block hidden`}
        style={{ zIndex: 40 }}
      >
        <hr className="mb-12 border-gray-300 opacity-40" />
        {/* Sidebar Items */}
        <List className="space-y-2 pt-5">
          {sidebarItems.map(({ label, icon, path }) => (
            <NavLink
              key={path}
              to={profileComplete ? path : "#"}
              onClick={(e) => {
                if (!profileComplete) e.preventDefault();
              }}
              className={({ isActive }) =>
                `block rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-[#584976] bg-opacity-30 backdrop-blur-lg text-white shadow"
                    : "hover:bg-pink-100 text-[#000000]"
                } ${!profileComplete ? "cursor-not-allowed opacity-70" : ""}`
              }
              aria-disabled={!profileComplete}
            >
              <ListItem className="flex items-center gap-4 px-4 py-3">
                <ListItemPrefix className="text-2xl">
                  {!profileComplete ? (
                    <CiLock className="text-[#8B0000] font-bold" />
                  ) : (
                    icon
                  )}
                </ListItemPrefix>
                {/* Show label only on desktop */}
                {!isMobile && sidebarOpen && (
                  <Typography className="text-[#000000] text-sm font-medium">
                    {label}
                  </Typography>
                )}
              </ListItem>
            </NavLink>
          ))}
        </List>
        {/* Logout button */}
        <div
          className={`px-4 ${!isMobile && sidebarOpen ? "block" : "hidden"}`}
        >
          <button
            className="flex items-center w-full px-4 py-3 text-left rounded-md  transition-all duration-300 bg-transparent text-[#000000] hover:bg-[#584976] hover:bg-opacity-30 hover:text-[#111111] hover:shadow"
            // onClick={handleLogout}
            onClick={() => setShowLogoutConfirm(true)}
          >
            <CgLogOut className="text-lg" />
            {/* Show label only on desktop */}
            {!isMobile && sidebarOpen && (
              <Typography className="ml-4 text-1.5xl font-medium">
                Logout
              </Typography>
            )}
          </button>
        </div>
        {/* Sidebar Toggle Button (Desktop) */}
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className={`absolute bottom-8 sm:bottom-1.5 sm:left-auto sm:right-5 p-3 bg-[#000000] text-[#E1F1DD] rounded-full shadow-md transition-all duration-300 hover:scale-105 active:scale-95 ${
            !isMobile ? "block z-50" : "hidden"
          }`}
          style={{ zIndex: 50 }}
        >
          {sidebarOpen ? <IoIosArrowBack /> : <IoIosArrowForward />}
        </button>
      </Card>
      {/* logout dialog */}
      <ConfirmationDialog
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Are you sure you want to logout?"
        message="You will be logged out of your account."
      />

      {/* Mobile Sidebar (767px and below) */}
      {isMobile && (
        <div className="fixed top-0 left-0 w-full p-2 md:hidden z-50 mt-24">
          {/* Hamburger Button */}
          <button
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className="text-3xl text-black font-semibold bg-transparent focus:outline-none border-none"
          >
            <RxHamburgerMenu />
          </button>

          {/* Sidebar */}
          {isSidebarVisible && (
            <div className="fixed top-0 left-0 w-[70%] sm:w-[60%] md:w-[50%] h-full bg-[#fbf5f3] shadow-lg z-50 transition-transform transform duration-300">
              <Link
                to="/dashboard"
                className="flex items-center justify-center p-8"
              >
                <img src={LOGO} alt="Logo" className="w-1/3 h-auto" />
              </Link>

              {/* Close Button */}
              <button
                onClick={() => setIsSidebarVisible(false)}
                className="absolute top-4 right-4 text-2xl font-bold text-[#17202a] bg-transparent focus:outline-none"
              >
                ✕
              </button>

              {/* Sidebar Content */}
              <div className="flex flex-col h-full p-6 space-y-2 px-1 mt-4">
                {sidebarItems.map(({ label, icon, path }) => (
                  <NavLink
                    key={path}
                    to={profileComplete ? path : "#"}
                    onClick={(e) => {
                      if (!profileComplete) e.preventDefault();
                      setIsSidebarVisible(false);
                    }}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-2 py-2 rounded-md font-semibold text-[#17202a] transition-all duration-300 ${
                        isActive
                          ? "bg-[#5e4d7e] bg-opacity-30 backdrop-blur-lg text-[#17202a] shadow-md"
                          : "hover:bg-pink-100 hover:text-pink-500"
                      } ${
                        !profileComplete
                          ? "cursor-not-allowed opacity-70 pointer-events-none"
                          : ""
                      }`
                    }
                  >
                    <span className="text-lg">{icon}</span>
                    <p className="text-sm font-medium">{label}</p>
                  </NavLink>
                ))}

                {/* Logout Button */}
                <button
                  onClick={() => {
                    setShowLogoutConfirm(true);
                  }}
                  className="mt-auto py-2 px-4 bg-transparent text-[#17202a] text-sm font-medium rounded shadow hover:bg-[#FF8383] hover:bg-opacity-30 transition duration-300"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Sidebar;
