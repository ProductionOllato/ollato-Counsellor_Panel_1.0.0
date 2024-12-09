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
import { IoIosArrowBack, IoIosArrowForward, IoIosClose, IoIosMenu } from "react-icons/io";
import { BiSupport } from "react-icons/bi";
import LOGO from "../assets/Ollato_Logo_CC-03.png";

import {
  Card,
  List,
  ListItem,
  ListItemPrefix,
  Typography,
} from "@material-tailwind/react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, profileComplete, logout } = useAuth();
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
    <>
  {/* Hamburger Menu for Small Screens */}
  <button
    className="fixed top-4 left-4 z-50 p-3 bg-[#423554] text-[#E1F1DD]  hover:bg-[#B9B4C7] hover:text-[#3E3B4B] rounded-full shadow-md sm:hidden"
    onClick={() => setSidebarOpen((prev) => !prev)}
  >
    {sidebarOpen ? <IoIosClose size={28} /> : <IoIosMenu size={28} />}
  </button>

  {/* Sidebar */}
  <Card
    className={`h-screen fixed mt-24 top-0 left-0 z-40 shadow-lg bg-[#584976] rounded-none transition-transform duration-300 ${
      sidebarOpen
        ? "translate-x-0 w-64"
        : "-translate-x-full w-0"
    } sm:w-20 lg:translate-x-0 lg:${sidebarOpen ? "w-64" : "w-20"}`}
  >
    <hr className="mb-4 border-gray-300 opacity-40" />

    {/* Sidebar Items */}
    <List>
      {sidebarItems.map(({ label, icon, path }) => (
        <NavLink
          key={path}
          to={profileComplete ? path : "#"}
          onClick={(e) => {
            if (!profileComplete) e.preventDefault();
          }}
          className={({ isActive }) =>
            `block rounded-md ${
              isActive
                ? "bg-[#F0D9DA] text-gray-900"
                : "hover:bg-[#EDE3F0] hover:text-gray-900 text-[#F0D9DA]"
            } text-lg font-base transition-all duration-300`
          }
        >
          <ListItem className="flex items-center gap-4 px-1 py-3">
            <ListItemPrefix className="text-xl">{icon}</ListItemPrefix>
            {sidebarOpen && (
              <Typography className="hidden lg:block text-base font-semibold">
                {label}
              </Typography>
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
          <Typography className="hidden lg:block ml-4 text-md font-medium">
            Logout
          </Typography>
        )}
      </button>
    </div>
  </Card>
</>

  );
};

export default Sidebar;
