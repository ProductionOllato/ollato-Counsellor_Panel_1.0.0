import React from "react";
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
    {
      label: "Help & Support",
      icon: <BiSupport />,
      path: "/support",
    },
  ];

  const handleLogout = () => {
    triggerNotification("Logout successfully", "success");
    logout();
    setTimeout(() => {
      navigate("/");
    }, 3000);
  };

  return (
    <Card
      className={`h-[calc(100vh)] ${
        sidebarOpen ? "w-64" : "w-20"
      } fixed top-0 left-0 z-40 shadow-lg transition-all duration-300 bg-[#584976] rounded-none pt-4`}
    >
      {/* Sidebar Logo Section */}
      {/* <div className="bg-[#f2d9da] p-4 flex justify-center">
        <Link to="/dashboard" className="flex items-center">
          <img
            src={LOGO}
            alt="Logo"
            className={`h-16 w-28 transition-transform duration-300 ${
              sidebarOpen ? "scale-100" : "scale-75"
            }`}
          />
        </Link>
      </div> */}

      <hr className="mb-20 border-gray-300 opacity-40" />

      {/* Sidebar Items */}
      <List className="space-y-2">
        {sidebarItems.map(({ label, icon, path }) => (
          <NavLink
            key={path}
            to={profileComplete ? path : "#"}
            onClick={(e) => {
              if (!profileComplete) e.preventDefault(); // Prevent navigation for incomplete profiles
            }}
            className={({ isActive }) =>
              `block rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-[#faf8ed] text-[#e9385b] shadow"
                  : "hover:bg-pink-100 hover:text-gray-900 text-[#e4d8d8]"
              } ${!profileComplete ? "cursor-not-allowed opacity-50" : ""}`
            }
            aria-disabled={!profileComplete} // Adds accessibility support
          >
            <ListItem className="flex items-center gap-4 px-4 py-3">
              <ListItemPrefix className="text-2xl">
                {!profileComplete ? (
                  <CiLock className="text-[#e9385b]" />
                ) : (
                  icon
                )}
              </ListItemPrefix>
              {sidebarOpen && (
                <Typography className="text-sm font-medium">{label}</Typography>
              )}
            </ListItem>
          </NavLink>
        ))}
      </List>

      <hr className="my-4 border-gray-300 opacity-40" />

      {/* Logout Button */}
      <div className="px-4">
        <button
          className="flex items-center w-full px-4 py-3 text-left rounded-md text-[#E1F1DD] hover:bg-[#B9B4C7] hover:text-[#3E3B4B] transition-all duration-300"
          onClick={handleLogout}
        >
          <CgLogOut className="text-lg" />
          {sidebarOpen && (
            <Typography className="ml-4 text-md font-medium">Logout</Typography>
          )}
        </button>
      </div>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen((prev) => !prev)}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 p-3 bg-[#423554] text-[#E1F1DD] hover:bg-[#B9B4C7] hover:text-[#3E3B4B] rounded-full shadow-md transition-all duration-300"
      >
        {sidebarOpen ? <IoIosArrowBack /> : <IoIosArrowForward />}
      </button>
    </Card>
  );
};

export default Sidebar;
