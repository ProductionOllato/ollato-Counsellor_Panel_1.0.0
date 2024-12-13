import React, { useState, useEffect } from "react";
import LOGO from "../assets/Ollato_Logo_CC-03.png";
import { useAuth } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { FaRegUser } from "react-icons/fa";
import axios from "axios";

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
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_ENDPOINT_URL}/get/personal-info/${
            user.user_id
          }`
        );
        const userData = response.data?.data || {};
        // console.log("User data:", userData);

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
          `${import.meta.env.VITE_APP_API_ENDPOINT_URL}/get/professional-info/${
            user.user_id
          }`
        );
        const userData = response.data?.data || {};
        // console.log("Profession data:", userData);

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
      <div className="flex-1 h-full p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-2xl h-auto mb-6 p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Welcome to Your Dashboard
          </h2>
          <hr className="border-t-2 border-gray-300 mb-6" />
          <div className="flex flex-col items-center">
            <p className="text-[#b640b0] text-lg font-semibold shadow text-center">
              Access Denied! Please complete your registration to get started.
            </p>
            <button
              onClick={completeProfile}
              className="mt-10 bg-[#AE445A] hover:bg-[#4D4C7D] text-white font-semibold py-3 px-6 rounded-md transition duration-200 ease-in-out shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#AE445A] focus:ring-opacity-50"
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
      <div className="flex-1 h-full p-4 md:p-6">
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

  // Main Dashboard Content
  if (profileComplete) {
    return (
      <>
        <div className="flex-1 px-8 h-full">
          <div className="p-4 rounded-lg w-full shadow-lg h-auto mb-6 mt-2 bg-white">
            <div className="flex items-center justify-center h-full">
              <h2 className="text-3xl font-semibold text-gray-800 mb-4 text-center font-sans sm:text-2xl">
                Welcome{" "}
                {user?.first_name.charAt(0).toUpperCase() +
                  user?.first_name.slice(1)}{" "}
                {user?.last_name.charAt(0).toUpperCase() +
                  user?.last_name.slice(1)}
              </h2>
            </div>

            <div className="p-2 rounded-lg w-full shadow-lg h-auto mb-6 mt-2 bg-white">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {/* Welcome{" "}
            {user?.first_name.charAt(0).toUpperCase() +
              user?.first_name.slice(1)}{" "}
            {user?.last_name.charAt(0).toUpperCase() + user?.last_name.slice(1)} */}
                Welcome{" "}
                {user?.first_name
                  ? user.first_name.charAt(0).toUpperCase() +
                    user.first_name.slice(1)
                  : "Guest"}{" "}
                {user?.last_name
                  ? user.last_name.charAt(0).toUpperCase() +
                    user.last_name.slice(1)
                  : ""}
              </h2>
              <hr className="border-gray-300 mb-4" />

              <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 bg-gray-50 rounded-lg shadow-md p-4">
                <div className="w-full flex justify-center sm:justify-start sm:w-auto">
                  {user?.profile_pic ? (
                    <img
                      className="object-cover w-24 h-24 mt-3 mr-3 rounded-full border-2 border-blue-400 shadow-md"
                      src={user.profile_pic}
                      alt="Profile"
                    />
                  ) : (
                    <FaRegUser className="w-24 h-24 mt-3 mr-3 rounded-full border-2 shadow-md text-gray-500 p-2" />
                  )}
                </div>

                <div className="flex-1 p-4 border border-gray-300 rounded-lg shadow-sm w-full sm:w-auto flex flex-col sm:items-start bg-white">
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg sm:text-xl">
                    Counselor Information
                  </h3>
                  <div className="mb-4 text-gray-600">
                    <p>
                      Name:{" "}
                      {user?.first_name.charAt(0).toUpperCase() +
                        user?.first_name.slice(1) || "Guest"}{" "}
                      {user?.last_name.charAt(0).toUpperCase() +
                        user?.last_name.slice(1) || ""}
                    </p>
                    {/* <p>Age: {userDetails?.DOB || "N/A"}</p> */}
                    <p>
                      Age:{" "}
                      {userDetails?.DOB ? calculateAge(userDetails.DOB) : "N/A"}
                    </p>

                    <p>Mobile No.: {userDetails?.phone || "N/A"}</p>
                  </div>
                </div>

                <div className="flex-1 p-4 border border-gray-300 rounded-lg shadow-sm bg-white">
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg sm:text-xl">
                    Education Information
                  </h3>
                  <div className="mb-4 text-gray-600">
                    <p>Qualification: {userDetails?.qualification || "N/A"}</p>
                    <p>Experience: {userDetails?.experience || "N/A"}</p>
                    <p>
                      Subject Expertise: {userDetails?.specialization || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg w-full shadow-lg h-auto mb-6 bg-white mt-10">
              <h2 className="text-3xl font-semibold text-gray-800 mb-4 text-center font-sans sm:text-2xl">
                Overall Session Details
              </h2>
              <hr className="border-gray-300 mb-4" />

              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {sessions.map((session, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-4 border-2 cursor-pointer bg-white rounded-lg shadow hover:shadow-lg transform hover:scale-105 transition duration-200 ${
                      session.color === "green" ? "border-green-500" : ""
                    } ${session.color === "blue" ? "border-blue-500" : ""} ${
                      session.color === "yellow" ? "border-yellow-500" : ""
                    } ${
                      session.color === "orange" ? "border-orange-500" : ""
                    } ${session.color === "red" ? "border-red-500" : ""}`}
                  >
                    <div className="flex-1">
                      <h3
                        className={`text-${session.color}-700 font-semibold text-lg sm:text-xl`}
                      >
                        {session.status}
                      </h3>
                      <p className="text-xl sm:text-2xl font-bold">
                        {session.count}
                      </p>
                    </div>
                    <div className="flex justify-center items-center">
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
        </div>
      </>
    );
  }
}
