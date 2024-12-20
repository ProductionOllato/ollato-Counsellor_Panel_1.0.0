import React, { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/UserContext";
import OtpModal from "../components/OtpModal";
import axios from "axios";

const AccountSettings = () => {
  const [personalDetails, setPersonalDetails] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [professionalDetails, setProfessionalDetails] = useState({
    license_number: "",
    qualification: "",
    specification: "",
    experience: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profileDataPlaceholder, setProfileDataPlaceholder] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    license_number: "",
    qualification: "",
    specification: "",
    experience: "",
  });

  const [profilePreview, setProfilePreview] = useState(null);
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const { triggerNotification } = useNotification();
  const { user } = useAuth();

  const [progressStep, setProgressStep] = useState(1);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpModal, setOtpModal] = useState(false);
  const [otpType, setOtpType] = useState("");

  const ApiURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;

  useEffect(() => {
    getUserDetails();
    getProfessionDetails();
  }, []);

  const getUserDetails = async () => {
    try {
      const response = await axios.get(
        `${ApiURL}/get/personal-info/${user.user_id}`
      );
      if (response.status === 200) {
        const userData = response.data.data;

        setProfileDataPlaceholder((prevData) => ({
          ...prevData,
          first_name: userData?.first_name || "",
          last_name: userData?.last_name || "",
          email: userData?.email || "",
          phone_number: userData?.phone_number || "",
          profile_pic: userData?.profile_pic || "",
        }));
      } else {
        throw new Error("Failed to fetch user details.");
      }
    } catch (error) {
      triggerNotification(
        `Error fetching user details: ${error.message}`,
        "error"
      );
    }
  };

  const getProfessionDetails = async () => {
    try {
      const response = await axios.get(
        `${ApiURL}/get/professional-info/${user.user_id}`
      );

      if (response.status === 200) {
        const userData = response.data.data;

        setProfileDataPlaceholder((prevData) => ({
          ...prevData,
          license_number: userData?.license_number || "",
          qualification: userData?.qualification || "",
          specification: userData?.specification || "",
          experience: userData?.experience || "",
        }));
      } else {
        throw new Error("Failed to fetch professional details.");
      }
    } catch (error) {
      triggerNotification(
        `Error fetching professional details: ${error.message}`,
        "error"
      );
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
    return emailRegex.test(email);
  };

  const isValidPhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\d{10}$/; //  Validates 10-digit phone numbers
    return phoneRegex.test(phoneNumber);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // setPersonalDetails((prev) => ({ ...prev, [name]: value }));
    if (name in personalDetails) {
      setPersonalDetails((prev) => ({ ...prev, [name]: value }));
    } else if (name in professionalDetails) {
      setProfessionalDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Helper Function for File Validation
  const validateFile = (file) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!file) return "No file selected.";
    if (!allowedTypes.includes(file.type)) return "Invalid file type.";
    if (file.size > maxSize) return "File size must be less than 2MB.";
    return null;
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    const error = validateFile(file);

    if (error) {
      triggerNotification(error, "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProfilePreview(reader.result);
    reader.readAsDataURL(file);

    setProfilePicture(file);
  };

  // API call for updating profile picture
  const updateProfilePicture = async () => {
    if (!profilePicture || !(profilePicture instanceof File)) {
      triggerNotification("No profile picture selected.", "error");
      return;
    }

    const error = validateFile(profilePicture);
    if (error) {
      triggerNotification(error, "error");
      return;
    }

    const payload = new FormData();
    payload.append("profile_pic", profilePicture);

    console.log("Payload:", payload);

    try {
      const response = await axios.put(
        `${ApiURL}/update/documents-details/profile-pic/${user.user_id}`,
        payload
      );
      console.log("Response profile pic:", response.data);

      if (response.status >= 200 && response.status < 300) {
        triggerNotification("Profile picture updated successfully!", "success");
      } else {
        throw new Error(
          response.statusText || "Failed to update profile picture."
        );
      }
    } catch (error) {
      triggerNotification(error.message, "error");
    }
  };

  // API call for updating personal details
  // const updatePersonalDetails = async (event) => {
  //   event.preventDefault();

  //   const {
  //     first_name,
  //     last_name,
  //     email,
  //     phone_number,
  //     currentPassword,
  //     newPassword,
  //     confirmNewPassword,
  //   } = personalDetails;

  //   // Password Validation
  //   if (newPassword) {
  //     if (currentPassword === newPassword) {
  //       triggerNotification(
  //         "New password cannot be the same as the current password.",
  //         "error"
  //       );
  //       return;
  //     }
  //     if (newPassword !== confirmNewPassword) {
  //       triggerNotification("New passwords do not match.", "error");
  //       return;
  //     }
  //   }

  //   const { confirmNewPassword: _, ...filteredPersonalDeatils } =
  //     personalDetails;

  //   // Remove keys with empty, null, or undefined values
  //   const cleanedPersonalDetails = Object.fromEntries(
  //     Object.entries(filteredPersonalDeatils).filter(([_, value]) => value)
  //   );
  //   // Check if data to update exists
  //   if (Object.keys(cleanedPersonalDetails).length === 0) {
  //     // Optionally trigger a notification for no data to send
  //     // triggerNotification("No changes to update.", "info");
  //     return;
  //   }

  //   console.log("cleanedPersonalDetails:", cleanedPersonalDetails);

  //   try {
  //     const response = await axios.put(
  //       `${ApiURL}/update/personal-details/${user.user_id}`,
  //       cleanedPersonalDetails
  //     );
  //     console.log("Response personal details:", response);

  //     if (response.status === 200) {
  //       triggerNotification(
  //         "Personal details updated successfully!",
  //         "success"
  //       );
  //     } else {
  //       throw new Error(
  //         response.statusText || "Failed to update personal details."
  //       );
  //     }
  //   } catch (error) {
  //     triggerNotification(error.message, "error");
  //   }
  // };

  const updatePersonalDetails = async (event) => {
    event.preventDefault();

    const {
      first_name,
      last_name,
      email,
      phone_number,
      currentPassword,
      newPassword,
      confirmNewPassword,
    } = personalDetails;

    if (email || phone_number) {
      // Ensure email and phone are verified before proceeding
      if (!isEmailVerified && email !== profileDataPlaceholder.email) {
        triggerNotification(
          "Please verify your email before updating.",
          "error"
        );
        return;
      }

      if (
        !isPhoneVerified &&
        phone_number !== profileDataPlaceholder.phone_number
      ) {
        triggerNotification(
          "Please verify your phone number before updating.",
          "error"
        );
        return;
      }
    }

    // Password Validation
    if (newPassword) {
      if (currentPassword === newPassword) {
        triggerNotification(
          "New password cannot be the same as the current password.",
          "error"
        );
        return;
      }
      if (newPassword !== confirmNewPassword) {
        triggerNotification("New passwords do not match.", "error");
        return;
      }
    }

    const { confirmNewPassword: _, ...filteredPersonalDetails } =
      personalDetails;

    // Remove keys with empty, null, or undefined values
    const cleanedPersonalDetails = Object.fromEntries(
      Object.entries(filteredPersonalDetails).filter(([_, value]) => value)
    );

    // Check if data to update exists
    if (Object.keys(cleanedPersonalDetails).length === 0) {
      // triggerNotification("No changes to update.", "info");
      return;
    }

    // Include current and new passwords in the payload
    const payload = {
      ...cleanedPersonalDetails,
      currentPassword,
      newPassword,
    };

    try {
      const response = await axios.put(
        `${ApiURL}/update/personal-details/${user.user_id}`,
        payload
      );

      if (response.status === 200) {
        triggerNotification(
          "Personal details updated successfully!",
          "success"
        );
      } else {
        throw new Error(
          response.statusText || "Failed to update personal details."
        );
      }
    } catch (error) {
      triggerNotification(
        error.response?.data?.message || error.message,
        "error"
      );
    }
  };

  // Unified Form Submission Handler
  const handleFormSubmission = async (event) => {
    event.preventDefault();

    try {
      if (profilePicture) {
        await updateProfilePicture();
      }
      await updatePersonalDetails(event);
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  // API call for updating professional details
  const updateProfessionalDetails = async (event) => {
    event.preventDefault();
    const { license_number, qualification, specification, experience } =
      professionalDetails;

    const nonEmptyFields = Object.fromEntries(
      Object.entries(professionalDetails).filter(([_, value]) => value !== "")
    );
    console.log("nonEmptyFields:", nonEmptyFields);

    try {
      const response = await axios.put(
        `${ApiURL}/update/professional-details/${user.user_id}`,
        nonEmptyFields
      );

      // Check for successful response using response.status
      if (response.status === 200) {
        triggerNotification(
          "Professional details updated successfully!",
          "success"
        );
      } else {
        // Handle unexpected status codes
        throw new Error(
          response.statusText || "Failed to update professional details."
        );
      }
    } catch (error) {
      triggerNotification(error.message, "error");
    }
  };

  const handleVerifyEmail = async () => {
    if (!personalDetails.email) {
      triggerNotification("Please enter an email address.", "error");
      return;
    }
    if (!isValidEmail(personalDetails.email)) {
      triggerNotification("Please enter a valid email address.", "error");
      return;
    }

    sendEmailOtp(personalDetails.email);
    setOtpType("email");
  };

  const handleVerifyPhone = async () => {
    if (!personalDetails.phone_number) {
      triggerNotification("Please enter a phone number.", "error");
      return;
    }

    if (!isValidPhoneNumber(personalDetails.phone_number)) {
      triggerNotification(
        "Please enter a valid 10-digit phone number.",
        "error"
      );
      return;
    }

    sendPhoneOtp(personalDetails.phone_number);
    setOtpType("phone");
  };
  const sendEmailOtp = async (email) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_ENDPOINT_URL}/otp/email-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      if (response.ok) {
        triggerNotification("OTP sent to your email.", "success");
        setOtpModal(true);
      } else {
        const errorData = await response.json();
        triggerNotification(
          errorData.message || "Failed to send OTP.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      triggerNotification("Error sending OTP. Please try again.", "error");
    }
  };
  const sendPhoneOtp = async (phoneNumber) => {
    if (!isValidPhoneNumber(personalDetails.phone_number)) {
      triggerNotification(
        "Please enter a valid 10-digit phone number.",
        "error"
      );
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_ENDPOINT_URL}/otp/mobile-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber }),
        }
      );
      if (response.ok) {
        triggerNotification("OTP sent to your phone.", "success");
        setOtpModal(true);
      } else {
        const errorData = await response.json();
        triggerNotification(
          errorData.message || "Failed to send OTP.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      triggerNotification("Error sending OTP. Please try again.", "error");
    }
  };

  // const handleOtpVerification = async (type) => {
  //   if (!otp || otp.length !== 4) {
  //     triggerNotification("Please enter a valid 4-digit OTP.", "error");
  //     return;
  //   }

  //   const endpoint =
  //     type === "email" ? "/otp/verify-email-otp" : "/otp/verify-mobile-otp";

  //   try {
  //     const response = await fetch(
  //       `${import.meta.env.VITE_APP_API_ENDPOINT_URL}${endpoint}`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           enteredOtp: otp,
  //           ...(type === "email"
  //             ? { email: profileData.email }
  //             : { phoneNumber: profileData.phone_number }),
  //         }),
  //       }
  //     );

  //     if (response.ok) {
  //       triggerNotification(
  //         `${type === "email" ? "Email" : "Phone"} verified successfully!`,
  //         "success"
  //       );
  //       type === "email" ? setIsEmailVerified(true) : setIsPhoneVerified(true);
  //       setOtpModal(false);
  //     } else {
  //       const errorData = await response.json();
  //       triggerNotification(
  //         errorData.message || "Failed to verify OTP.",
  //         "error"
  //       );
  //     }
  //   } catch (error) {
  //     console.error("OTP verification error:", error);
  //     triggerNotification("Error verifying OTP. Please try again.", "error");
  //   }
  // };

  // OTP Verification Handling
  const handleOtpVerification = async (type) => {
    if (!otp || otp.length !== 4) {
      triggerNotification("Please enter a valid 4-digit OTP.", "error");
      return;
    }

    const endpoint =
      type === "email" ? "/otp/verify-email-otp" : "/otp/verify-mobile-otp";

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_ENDPOINT_URL}${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enteredOtp: otp,
            ...(type === "email"
              ? { email: personalDetails.email }
              : { phoneNumber: personalDetails.phone_number }),
          }),
        }
      );

      if (response.ok) {
        triggerNotification(
          `${type === "email" ? "Email" : "Phone"} verified successfully!`,
          "success"
        );
        if (type === "email") setIsEmailVerified(true);
        if (type === "phone") setIsPhoneVerified(true);
        setOtpModal(false);
      } else {
        const errorData = await response.json();
        triggerNotification(
          errorData.message || "Failed to verify OTP.",
          "error"
        );
      }
    } catch (error) {
      triggerNotification("Error verifying OTP. Please try again.", "error");
    }
  };
  // Reusable button component
  const NavigationButton = ({ label, onClick, isSubmit = false }) => (
    <button
      type={isSubmit ? "submit" : "button"}
      onClick={onClick}
      className="bg-[#1E3E62] text-white text-base py-2 px-4 rounded-lg focus:outline-none focus:ring focus:ring-[#1E3E62]/50"
      aria-label={label}
    >
      {label}
    </button>
  );

  return (
    <section className="bg-white shadow-lg rounded-lg w-full p-6 mt-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm font-medium relative">
          {/* Step 1 */}
          <div className="flex-1 text-center">
            <span
              className={`cursor-pointer ${
                progressStep === 1
                  ? "text-[#1E3E62] font-bold"
                  : "text-gray-400"
              }`}
              onClick={() => setProgressStep(1)}
            >
              Personal Details
            </span>
            {progressStep === 1 && (
              <div className="bg-[#1E3E62] h-1 mt-2 rounded-full w-1/3 mx-auto"></div>
            )}
          </div>

          {/* Step 2 */}
          <div className="flex-1 text-center">
            <span
              className={`cursor-pointer ${
                progressStep === 2
                  ? "text-[#1E3E62] font-bold"
                  : "text-gray-400"
              }`}
              onClick={() => setProgressStep(2)}
            >
              Password Reset
            </span>
            {progressStep === 2 && (
              <div className="bg-[#1E3E62] h-1 mt-2 rounded-full w-1/3 mx-auto"></div>
            )}
          </div>

          {/* Step 3 */}
          <div className="flex-1 text-center">
            <span
              className={`cursor-pointer ${
                progressStep === 3
                  ? "text-[#1E3E62] font-bold"
                  : "text-gray-400"
              }`}
              onClick={() => setProgressStep(3)}
            >
              Professional Details
            </span>
            {progressStep === 3 && (
              <div className="bg-[#1E3E62] h-1 mt-2 rounded-full w-1/3 mx-auto"></div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6">
        {progressStep === 1 && (
          <form onSubmit={handleFormSubmission} className="space-y-4 ">
            <h2 className="text-xl font-bold text-gray-800">
              Personal Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="flex items-center mb-6">
                <div className="relative group">
                  <img
                    src={profilePreview || "https://via.placeholder.com/150"}
                    alt="Profile Preview"
                    className="w-24 h-24 rounded-full border-2 border-gray-300 object-cover shadow-md"
                  />
                  <label
                    htmlFor="profile_pic"
                    className="absolute top-2 right-10 bg-[#1E3E62] text-white p-2 rounded-full cursor-pointer shadow-lg transition transform hover:scale-110 hover:bg-[#1E3E62] group-hover:shadow-xl"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </label>
                  <input
                    type="file"
                    id="profile_pic"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                  />
                  <label
                    htmlFor="profile_pic"
                    className="block text-sm text-center text-[#131010] mt-2 cursor-pointer hover:underline"
                  >
                    Change Profile Picture
                  </label>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <label
                    htmlFor="first_name"
                    className="block text-[#131010] font-medium mb-2"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={personalDetails.first_name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                    placeholder={
                      profileDataPlaceholder.first_name ||
                      "Enter your first name"
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="last_name"
                    className="block text-[#131010] font-medium mb-2"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={personalDetails.last_name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                    placeholder={
                      profileDataPlaceholder.last_name || "Enter your last name"
                    }
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-[#131010] font-medium mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={personalDetails.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                  placeholder={
                    profileDataPlaceholder.email || "Enter your email address"
                  }
                  disabled={isEmailVerified}
                />
                {/* Email Verification Button */}
                <div className="flex justify-start mt-2">
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={isEmailVerified}
                    className={`py-2 px-4 rounded transition duration-150 ${
                      isEmailVerified
                        ? "bg-[#BC7C7C] text-[#243642] cursor-not-allowed"
                        : "bg-[#B3C8CF] text-[#131010] hover:bg-[#387478] hover:text-[#f1f5f9]"
                    }`}
                  >
                    {isEmailVerified ? "Email Verified" : "Verify Email"}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone_number"
                  className="block text-[#131010] font-medium mb-2"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={personalDetails.phone_number}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                  placeholder={
                    profileDataPlaceholder.phone_number || "Enter your phone"
                  }
                  disabled={isPhoneVerified}
                />
                {/* Phone Verification Button */}
                <div className="flex justify-start mt-2">
                  <button
                    type="button"
                    onClick={handleVerifyPhone}
                    disabled={isPhoneVerified}
                    className={`py-2 px-4 rounded transition duration-150 ${
                      isPhoneVerified
                        ? "bg-[#BC7C7C] text-[#243642] cursor-not-allowed"
                        : "bg-[#B3C8CF] text-[#131010] hover:bg-[#387478] hover:text-[#f1f5f9]"
                    }`}
                  >
                    {isPhoneVerified ? "Phone Verified" : "Verify Phone"}
                  </button>
                </div>
                {/* OTP Modal */}
                {otpModal && (
                  <OtpModal
                    otp={otp}
                    setOtp={setOtp}
                    handleOtpVerification={() => handleOtpVerification(otpType)}
                    setOtpModal={setOtpModal}
                  />
                )}
              </div>
            </div>
            <div className="flex justify-end mt-4 text-base">
              <NavigationButton label="Save Changes" isSubmit />
            </div>
          </form>
        )}

        {progressStep === 2 && (
          <form onSubmit={updatePersonalDetails}>
            <h2 className="text-xl font-bold text-gray-800">Password Reset</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-[#131010] font-medium mb-2"
                >
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisibility.current ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={personalDetails.currentPassword}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-4 text-gray-500"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {passwordVisibility.current ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-[#131010] font-medium mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisibility.new ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={personalDetails.newPassword}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-4 text-gray-500"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {passwordVisibility.new ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="block text-[#131010] font-medium mb-2"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisibility.confirm ? "text" : "password"}
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    value={personalDetails.confirmNewPassword}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-4 text-gray-500"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {passwordVisibility.confirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-4 text-base">
              <NavigationButton
                label="Back"
                onClick={() => setProgressStep((prev) => prev - 1)}
              />
              <NavigationButton label="Save Changes" isSubmit />
            </div>
          </form>
        )}

        {progressStep === 3 && (
          <form onSubmit={updateProfessionalDetails}>
            <h2 className="text-xl font-bold text-gray-800">
              Professional Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label
                  htmlFor="license_number"
                  className="block text-[#131010] font-medium mb-2"
                >
                  License Number
                </label>
                <input
                  type="text"
                  id="license_number"
                  name="license_number"
                  value={professionalDetails.license_number}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                  placeholder={
                    profileDataPlaceholder.license_number ||
                    "Enter your license number"
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="qualification"
                  className="block text-[#131010] font-medium mb-2"
                >
                  Qualification
                </label>
                <input
                  type="text"
                  id="qualification"
                  name="qualification"
                  value={professionalDetails.qualification}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                  placeholder={
                    profileDataPlaceholder.qualification ||
                    "Enter your qualification"
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="specification"
                  className="block text-[#131010] font-medium mb-2"
                >
                  Specialization
                </label>
                <input
                  type="text"
                  id="specification"
                  name="specification"
                  value={professionalDetails.specification}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                  placeholder={
                    profileDataPlaceholder.specification ||
                    "Enter your specialization"
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="experience"
                  className="block text-[#131010] font-medium mb-2"
                >
                  Experience
                </label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={professionalDetails.experience}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                  placeholder={
                    profileDataPlaceholder.experience ||
                    "Enter your experience in years"
                  }
                />
              </div>
            </div>
            <div className="flex justify-between mt-4 text-base">
              <NavigationButton
                label="Back"
                onClick={() => setProgressStep((prev) => prev - 1)}
              />
              <NavigationButton label="Save Changes" isSubmit />
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default AccountSettings;
