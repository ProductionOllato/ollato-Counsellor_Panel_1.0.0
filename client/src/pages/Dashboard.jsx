import React, { useState, useEffect } from "react";
import LOGO from "../assets/Ollato_Logo_CC-03.png";
import { useAuth } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { FaRegUser } from "react-icons/fa";
import axios from "axios";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { user, profileComplete, profileStatus, approveProfile } = useAuth();
  const { triggerNotification } = useNotification();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [sessions, setSessions] = useState([]);

  // Call approveProfile only once - testing
  useEffect(() => {
    approveProfile();
  }, [approveProfile]);

  const completeProfile = () => {
    navigate("/registration-complete");
  };

  // Dynamically render the session cards
  const sessionData = [
    {
      status: "Completed Session",
      count: 50,
      color: getStatusColor("Completed Session"),
      icon: "https://via.placeholder.com/50",
    },
    {
      status: "Ongoing Session",
      count: 10,
      color: getStatusColor("Ongoing Session"),
      icon: "https://via.placeholder.com/50",
    },
    {
      status: "Pending Session",
      count: 19,
      color: getStatusColor("Pending Session"),
      icon: "https://via.placeholder.com/50",
    },
    {
      status: "Rescheduled Session",
      count: 15,
      color: getStatusColor("Rescheduled Session"),
      icon: "https://via.placeholder.com/50",
    },
    {
      status: "Cancelled Session",
      count: 10,
      color: getStatusColor("Cancelled Session"),
      icon: "https://via.placeholder.com/50",
    },
    {
      status: "Accept Session",
      count: 30,
      color: getStatusColor("Accept Session"),
      icon: "https://via.placeholder.com/50",
    },
  ];

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_APP_API_ENDPOINT_URL
          }/get-counsellors/personal-info/${user.user_id}`
        );
        const userData = response.data?.data || {};

        setUserDetails((prev) => ({
          ...prev,
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          email: userData.email || "",
          phone: userData.phone_number || "",
          DOB: userData.date_of_birth || "",
        }));
      } catch (error) {
        console.error("Error fetching user details:", error);
        triggerNotification("Error fetching user details", "error");
      }
    }

    async function fetchProfessionDetails() {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_APP_API_ENDPOINT_URL
          }/get-counsellors/professional-info/${user.user_id}`
        );
        const userData = response.data?.data || {};
        setUserDetails((prev) => ({
          ...prev,
          qualification: userData.qualification || "",
          experience: userData.experience || "",
          specialization: userData.specification || "",
        }));
      } catch (error) {
        console.error("Error fetching profession details:", error);
        triggerNotification("Error fetching profession details", "error");
      }
    }

    async function fetchSessions() {
      try {
        // const response = await axios.get("/api/sessions");
        // setSessions(response.data);
        setSessions(sessionData);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        triggerNotification("Error fetching sessions", "error");
      }
    }

    fetchUserDetails();
    fetchProfessionDetails();
    fetchSessions();
  }, []);

  function calculateAge(dateString) {
    const birthDate = new Date(dateString); // Parse the input date string
    const today = new Date(); // Get the current date

    let age = today.getFullYear() - birthDate.getFullYear(); // Difference in years

    // Adjust for the case where the birthdate hasn't occurred yet this year
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }

    return age;
  }

  if (profileStatus === "pending") {
    return (
      <>
        <div className="dashboard-container flex-1 min-h-fit mt-20 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl h-auto w-full max-w-md md:max-w-lg p-6 pt-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
              Welcome to Your Dashboard
            </h2>

            <hr className="border-t-2 border-gray-300 mb-6" />

            <div className="flex flex-col items-center">
              <p className="text-[#b640b0] text-center text-base sm:text-lg font-semibold shadow">
                Access Denied! Please complete your registration to get started.
              </p>

              <button
                onClick={completeProfile}
                className="mt-6 sm:mt-10 bg-[#AE445A] hover:bg-[#3E5879] text-white font-semibold py-2 px-4 sm:py-3 sm:px-6 rounded-md transition duration-200 ease-in-out shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#AE445A] focus:ring-opacity-50 text-base"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (profileStatus === "waiting_approval") {
    return (
      <div className="dashboard-container flex-1 h-full p-4 md:p-6 mt-20">
        <div className="bg-white rounded-lg shadow-2xl h-auto mb-6 p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Welcome to your dashboard
          </h2>
          <hr className="border-gray-300 mb-4" />
          <div className="flex flex-col items-center">
            <p className="text-[#b640b0] text-lg font-semibold shadow text-center mt-10 mb-6">
              Your profile is under review. Please wait for approval to access
              your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard Content after profile approval
  if (profileComplete) {
    return (
      <>
        <div className="dashboard-container flex-1 px-1 h-full mt-10 sm:mt-12">
          <div className="p-4 rounded-lg w-full shadow-lg h-auto mb-6 mt-2  bg-white">
            {/* Welcome Section */}
            <div className="flex items-center justify-center h-full">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center font-sans">
                Welcome{" "}
                {user?.first_name.charAt(0).toUpperCase() +
                  user?.first_name.slice(1)}{" "}
                {user?.last_name.charAt(0).toUpperCase() +
                  user?.last_name.slice(1)}
              </h2>
            </div>

            <hr className="border-gray-300 mb-4" />

            {/* Main Content Section */}
            <div className="flex flex-col gap-6 bg-gray-50 rounded-lg shadow-md p-4">
              {/* Profile Picture Section */}
              <div className="flex justify-center">
                {user?.profile_pic ? (
                  <img
                    className="object-cover w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-blue-400 shadow-md"
                    src={user.profile_pic}
                    alt="Profile"
                  />
                ) : (
                  <FaRegUser className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 shadow-md text-gray-500 p-2" />
                )}
              </div>

              {/* Information Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Counselor Information */}
                <div className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg sm:text-xl">
                    Counselor Information
                  </h3>
                  <div className="text-gray-600 text-sm sm:text-base">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {user?.first_name.charAt(0).toUpperCase() +
                        user?.first_name.slice(1)}{" "}
                      {user?.last_name.charAt(0).toUpperCase() +
                        user?.last_name.slice(1)}
                    </p>
                    <p>
                      <span className="font-medium">Age:</span>{" "}
                      {userDetails?.age || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Mobile No.:</span>{" "}
                      {userDetails?.phone || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Education Information */}
                <div className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg sm:text-xl">
                    Education Information
                  </h3>
                  <div className="text-gray-600 text-sm sm:text-base">
                    <p>
                      <span className="font-medium">Qualification:</span>{" "}
                      {userDetails?.qualification || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Experience:</span>{" "}
                      {userDetails?.experience || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Subject Expertise:</span>{" "}
                      {userDetails?.subject_expertise || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg w-full shadow-lg h-auto mb-6 bg-white mt-10">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4 text-center font-sans sm:text-2xl">
              Overall Session Details
            </h2>
            <hr className="border-gray-300 mb-4" />

            <div className="w-full max-w-screen-lg mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {sessions.map((session, index) => (
                <div
                  key={index}
                  className={`flex flex-col justify-between items-center p-4 border-2 cursor-pointer bg-white rounded-lg shadow hover:shadow-lg transform hover:scale-105 transition duration-200 ease-in-out`}
                  style={{
                    borderColor: session.color, // Apply border color dynamically
                  }}
                >
                  {/* Content Section */}
                  <div className="flex-1 w-full text-center">
                    <h3
                      className={`font-semibold text-base sm:text-lg md:text-xl lg:text-2xl truncate`}
                      style={{
                        color: session.color, // Dynamically set text color
                      }}
                    >
                      {session.status}
                    </h3>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold">
                      {session.count}
                    </p>
                  </div>

                  {/* Icon Section */}
                  <div className="flex justify-center items-center mt-4">
                    <img
                      src={session.icon}
                      alt={`${session.status} icon`}
                      className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }
}

// Function to assign colors based on status
function getStatusColor(status) {
  switch (status) {
    case "Completed Session":
      return "#578E7E"; // Greenish gray
    case "Ongoing Session":
      return "#008000"; // Green
    case "Pending Session":
      return "#F05A7E"; // Light brown
    case "Rescheduled Session":
      return "#CB6040"; // Orange
    case "Cancelled Session":
      return "#A31D1D"; // Red
    case "Accept Session":
      return "#3A6D8C"; // Blue
    default:
      return "#808080"; // Default gray for unknown statuses
  }
}
