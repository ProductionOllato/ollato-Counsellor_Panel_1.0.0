import React, { useState, useEffect } from "react";
import LOGO from "../assets/Ollato_Logo_CC-03.png";
import { useAuth } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { FaRegUser } from "react-icons/fa";

export default function Dashboard() {
  const { user, profileComplete, profileStatus, approveProfile } = useAuth();
  const { triggerNotification } = useNotification();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [sessions, setSessions] = useState([]);

  // console.log("Profile Complete:", profileComplete);
  // console.log("Profile Status:", profileStatus);

  useEffect(() => {
    // Call approveProfile only once - testing
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
      color: "green",
      icon: "https://via.placeholder.com/50",
    },
    {
      status: "Ongoing Session",
      count: 10,
      color: "blue",
      icon: "https://via.placeholder.com/50",
    },
    {
      status: "Pending Session",
      count: 19,
      color: "yellow",
      icon: "https://via.placeholder.com/50",
    },
    {
      status: "Rescheduled Session",
      count: 15,
      color: "orange",
      icon: "https://via.placeholder.com/50",
    },
    {
      status: "Cancelled Session",
      count: 10,
      color: "red",
      icon: "https://via.placeholder.com/50",
    },
    {
      status: "Accept Session",
      count: 30,
      color: "green",
      icon: "https://via.placeholder.com/50",
    },
  ];

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        // const response = await axios.get(`${process.env.VITE_APP_API_ENDPOINT_URL}/user/${user.id}`);
        // setUserDetails(response.data);
        setUserDetails({
          first_name: "John",
          last_name: "Doe",
          email: "jH2dX@example.com",
          qualification: "Bachelor of Science in Computer Science",
          experience: "2 years 5 months",
          specialization: "Web Development",
          age: 26,
          phone: "1234567890",
        });
      } catch (error) {
        console.error("Error fetching user details:", error);
        triggerNotification("Error fetching user details", "error");
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
    fetchSessions();
  }, []);

  if (profileStatus === "pending") {
    return (
      <div className="flex-1 h-full">
        <div className="p-6 rounded-lg w-full shadow-2xl h-auto mb-6 mt-20 sm:p-4 sm:mr-4 sm:mt-12 md:p-6 lg:h-2/3">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Welcome to your dashboard
          </h2>
          <hr className="border-gray-300 mb-4" />
          <div className="flex flex-col items-center">
            <p className="text-[#640D5F] text-md">
              Access Denied !!. Complete your registration to get started.
            </p>
            <button
              onClick={completeProfile}
              className="mt-4 bg-[#AE445A] hover:bg-[#3e5679] text-white font-semibold py-2 px-4 rounded"
            >
              Complete Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (profileStatus === "waiting_approval") {
    return (
      <div className="flex-1 h-full">
        <div className="p-6 rounded-lg w-full shadow-2xl h-auto mb-6 mt-20 sm:p-4 sm:mr-4 sm:mt-12 md:p-6 lg:h-2/3">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Welcome to your dashboard
          </h2>
          <hr className="border-gray-300 mb-4" />
          <div className="flex flex-col items-center">
            <p className="text-[#640D5F] text-md">
              Your profile is under review. Please wait for approval to access
              your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard Content
  if (profileComplete) {
    return (
      <div className="flex-1 px-8 h-full">
        <div className="p-2 rounded-lg w-full shadow-lg h-auto mb-6 mt-2 bg-white">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome{" "}
            {user?.first_name.charAt(0).toUpperCase() +
              user?.first_name.slice(1)}{" "}
            {user?.last_name.charAt(0).toUpperCase() + user?.last_name.slice(1)}
          </h2>
          <hr className="border-gray-300 mb-4" />

          {/* Flex Container for Left and Right */}
          <div className="flex lg:flex-row items-center lg:items-start justify-between mb-6 flex-wrap gap-6 bg-gray-50 rounded-lg shadow-md p-4">
            <div className="w-full flex justify-center sm:justify-start sm:w-auto">
              {user?.profile_pic ? (
                <img
                  className="object-cover w-24 h-24 mt-3 mr-3 rounded-full border-2 border-blue-400 shadow-md"
                  src={user.profile_pic}
                  alt="Profile"
                />
              ) : (
                <FaRegUser className="w-24 h-24 mt-3 mr-3 rounded-full border-2  shadow-md text-gray-500 p-2" />
              )}
            </div>
            {/* Counselor Information */}
            <div className="flex-1 p-4 border border-gray-300 rounded-lg shadow-sm w-full sm:w-auto flex flex-col sm:items-start bg-white">
              <h3 className="font-semibold text-gray-800 mb-2 text-xl">
                Counselor Information
              </h3>
              <div className="mb-4 text-gray-600">
                <p>
                  Name:
                  {user?.first_name.charAt(0).toUpperCase() +
                    user?.first_name.slice(1)}{" "}
                  {user?.last_name.charAt(0).toUpperCase() +
                    user?.last_name.slice(1)}
                </p>
                <p>Age: {userDetails?.age || "N/A"}</p>
                <p>Mobile No.: {userDetails?.phone || "N/A"}</p>
              </div>
            </div>

            <div className="flex-1 p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
              <h3 className="font-semibold text-gray-800 mb-2 text-xl">
                Education Information
              </h3>
              <div className="mb-4 text-gray-600">
                <p>Qualification: {userDetails?.qualification || "N/A"}</p>
                <p>Experience: {userDetails?.experience || "N/A"}</p>
                <p>
                  Subject Expertise: {userDetails?.subject_expertise || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg w-full shadow-lg h-auto mb-6 bg-white mt-10">
          {/* Header */}
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            Overall Session Details
          </h2>
          <hr className="border-gray-300 mb-4" />

          {/* Sessions Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-4 border-2 cursor-pointer max-w-sm bg-white rounded-lg shadow hover:shadow-lg transform hover:scale-105 transition duration-200 ${
                  session.color === "green" ? "border-green-500" : ""
                } ${session.color === "blue" ? "border-blue-500" : ""} ${
                  session.color === "yellow" ? "border-yellow-500" : ""
                } ${session.color === "orange" ? "border-orange-500" : ""} ${
                  session.color === "red" ? "border-red-500" : ""
                }`}
              >
                <div>
                  <h3 className={`text-${session.color}-700 font-semibold`}>
                    {session.status}
                  </h3>
                  <p className="text-2xl font-bold">{session.count}</p>
                </div>
                <img
                  src={session.icon}
                  alt={`${session.status} icon`}
                  className="h-12 w-12"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
