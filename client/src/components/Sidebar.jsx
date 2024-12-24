import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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

import {
  Card,
  List,
  ListItem,
  ListItemPrefix,
  Typography,
} from "@material-tailwind/react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { profileComplete, logout } = useAuth();
  const { triggerNotification } = useNotification();
  const navigate = useNavigate();

  // State to track screen width
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

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

  useEffect(() => {
    // Listen to window resize events and update the state for mobile screen size
    const handleResize = () => {
      setIsMobile(window.innerWidth < 910);
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
        className={`h-[calc(100vh)] ${sidebarOpen ? "w-64" : "w-20"
          } fixed top-0 left-0 z-40 shadow-lg transition-all duration-300 bg-[#ab97d4] rounded-none pt-10 backdrop-blur-lg bg-opacity-40 md:block hidden`}
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
                `block rounded-lg transition-all duration-300 ${isActive
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
            onClick={handleLogout}
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
          className={`absolute bottom-8 sm:bottom-1.5 sm:left-auto sm:right-5 p-3 bg-[#000000] text-[#E1F1DD] rounded-full shadow-md transition-all duration-300 hover:scale-105 active:scale-95 ${!isMobile ? "block z-50" : "hidden"
            }`}
          style={{ zIndex: 50 }}
        >
          {sidebarOpen ? <IoIosArrowBack /> : <IoIosArrowForward />}
        </button>
      </Card>

      {/* Mobile Sidebar (767px and below) */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 p-2 grid grid-cols-3 items-center md:hidden z-40 mt-24">
          <button
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className="text-3xl justify-self-start text-black bg-transparent focus:outline-none border-none"
          >
            <RxHamburgerMenu />
          </button>

          <div className="justify-self-center"></div>

          <div className="justify-self-end"></div>

          {isSidebarVisible && (
            <div className="col-span-3 grid grid-cols-3 sm:grid-cols-4 gap-1 p-4 bg-[#ab97d4]">
              {sidebarItems.map(({ label, icon, path }) => (
                <NavLink
                  key={path}
                  to={profileComplete ? path : "#"}
                  onClick={(e) => {
                    if (!profileComplete) e.preventDefault();
                    setIsSidebarVisible(false);
                  }}
                  className="flex flex-col items-center justify-center text-center text-xs text-[#2f2346] hover:text-pink-500 transition duration-300"
                >
                  <span className="text-lg">{icon}</span>
                  <p className="text-xs font-medium">{label}</p>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Sidebar;
