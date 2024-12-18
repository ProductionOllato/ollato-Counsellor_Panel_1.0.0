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
import LOGO from "../assets/Ollato_Logo_CC-03.png";
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

  const sidebarItems = [
    { label: "Dashboard", icon: <RiHome8Line />, path: "/dashboard" },
    { label: "Availability Management", icon: <MdAssessment />, path: "/availability-management" },
    { label: "Session Management", icon: <LuPackageSearch />, path: "/session-management" },
    { label: "My Activity", icon: <FaBuildingUser />, path: "/my-activity" },
    { label: "Revenue Details", icon: <TbReportMoney />, path: "/revenue-details" },
    { label: "Account Settings", icon: <FaUserCog />, path: "/account-settings" },
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
    <Card
      className={`h-[calc(100vh)] ${sidebarOpen ? "w-64" : "w-20"} fixed top-0 left-0 z-40 shadow-lg transition-all duration-300 bg-[#ab97d4] rounded-none pt-10 backdrop-blur-lg bg-opacity-40`}
    >
        <hr className="mb-12 border-gray-300 opacity-40" />
      {/* Sidebar Items */}
      <List className="space-y-2">
        {sidebarItems.map(({ label, icon, path }) => (
          <NavLink
            key={path}
            to={profileComplete ? path : "#"}
            onClick={(e) => { if (!profileComplete) e.preventDefault(); }}
            className={({ isActive }) => `block rounded-lg transition-all duration-300 ${isActive ? "bg-[#584976] bg-opacity-30 backdrop-blur-lg text-white shadow" : "hover:bg-pink-100 text-[#000000]"} ${!profileComplete ? "cursor-not-allowed opacity-70" : ""}`}
            aria-disabled={!profileComplete}
          >
            <ListItem className="flex items-center gap-4 px-4 py-3">
              <ListItemPrefix className="text-2xl">
                {!profileComplete ? <CiLock className="text-[#8B0000] font-bold" /> : icon}
              </ListItemPrefix>
              {sidebarOpen && <Typography className="text-[#000000] text-sm font-medium">{label}</Typography>}
            </ListItem>
          </NavLink>
        ))}
      </List>

      {/* Logout Button */}
      <div className="px-4">
        <button
          className="flex items-center w-full px-4 py-3 text-left rounded-md text-[#000000] hover:bg-[#B9B4C7] hover:text-[#000000] transition-all duration-300"
          onClick={handleLogout}
        >
          <CgLogOut className="text-lg" />
          {sidebarOpen && <Typography className="ml-4 text-1.5xl font-medium">Logout</Typography>}
        </button>
      </div>

      {/* Sidebar Toggle Button */} 
      {/* Only show the button if the screen width is >= 768px */}
      <button
        onClick={() => setSidebarOpen((prev) => !prev)}
        className={`absolute bottom-8 sm:bottom-1.5 sm:left-auto sm:right-5 p-3 bg-[#000000] text-[#E1F1DD] rounded-full shadow-md transition-all duration-300 hover:scale-105 active:scale-95 ${!isMobile ? "block" : "hidden"}`}
      >
        {sidebarOpen ? <IoIosArrowBack /> : <IoIosArrowForward />}
      </button>
    </Card>
    </>
  );
};

export default Sidebar;
