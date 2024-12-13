import React, { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/UserContext";
import OtpModal from "../components/OtpModal";

const AccountSettings = () => {
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    profile_pic: "",
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
      const response = await fetch(
        `${ApiURL}/get/personal-info/${user.user_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const userData = data.data;
        // Safely update state, using default values where necessary
        setProfileData((prevData) => ({
          ...prevData,
          first_name: userData?.first_name || "",
          last_name: userData?.last_name || "",
          email: userData?.email || "",
          phone_number: userData?.phone_number || "",
          profile_pic: userData?.profile_pic || "",
        }));
      }
    } catch (error) {
      triggerNotification(error.message, "error");
    }
  };

  const getProfessionDetails = async () => {
    try {
      const response = await fetch(
        `${ApiURL}/get/professional-info/${user.user_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // console.log("Response professional:", response);

      if (response.ok) {
        const data = await response.json();
        const userData = data.data;
        // console.log("Profession data:", userData);

        setProfileData((prevData) => ({
          ...prevData,
          license_number: userData?.license_number || "",
          qualification: userData?.qualification || "",
          specification: userData?.specification || "",
          experience: userData?.experience || "",
        }));
      }
    } catch (error) {
      triggerNotification(error.message, "error");
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
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      triggerNotification("Please upload a JPEG, PNG, or JPG file.", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      triggerNotification("File size must be less than 2MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setProfilePreview(reader.result);
    reader.readAsDataURL(file);
    setProfileData((prev) => ({ ...prev, profile_pic: file }));
  };

  // API call for updating profile picture
  const updateProfilePicture = async () => {
    if (!profileData.profile_pic) return;

    const payload = new FormData();
    payload.append("profile_pic", profileData.profile_pic);

    try {
      const response = await fetch(
        `${ApiURL}/documents-details/profile-pic/${user.user_id}`,
        {
          method: "PUT",
          body: payload,
        }
      );
      console.log("Response profile:", response);

      if (response.ok) {
        triggerNotification("Profile picture updated successfully!", "success");
      } else {
        throw new Error("Failed to update profile picture.");
      }
    } catch (error) {
      triggerNotification(error.message, "error");
    }
  };

  // API call for updating personal details
  const updatePersonalDetails = async () => {
    const {
      first_name,
      last_name,
      email,
      phone_number,
      currentPassword,
      newPassword,
      confirmNewPassword,
    } = profileData;

    if (newPassword !== confirmNewPassword) {
      triggerNotification("New passwords do not match.", "error");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_ENDPOINT_URL}/update/personal-details/${
          user.user_id
        }`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.user_id,
            first_name,
            last_name,
            email,
            phone_number,
            currentPassword,
            newPassword,
          }),
        }
      );

      console.log("Response personal:", response);

      if (response.ok) {
        triggerNotification(
          "Personal details updated successfully!",
          "success"
        );
      } else {
        throw new Error("Failed to update personal details.");
      }
    } catch (error) {
      triggerNotification(error.message, "error");
    }
  };

  // API call for updating professional details
  const updateProfessionalDetails = async () => {
    const { license_number, qualification, specification, experience } =
      profileData;

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_APP_API_ENDPOINT_URL
        }/update/professional-details/${user.user_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            license_number,
            qualification,
            specification,
            experience,
          }),
        }
      );
      console.log("Response professional:", response);

      if (response.ok) {
        triggerNotification(
          "Professional details updated successfully!",
          "success"
        );
      } else {
        throw new Error("Failed to update professional details.");
      }
    } catch (error) {
      triggerNotification(error.message, "error");
    }
  };

  const handleVerifyEmail = async () => {
    if (!profileData.email) {
      triggerNotification("Please enter an email address.", "error");
      return;
    }
    if (!isValidEmail(profileData.email)) {
      triggerNotification("Please enter a valid email address.", "error");
      return;
    }

    sendEmailOtp(profileData.email);
    setOtpType("email");
  };

  const handleVerifyPhone = async () => {
    if (!profileData.phone_number) {
      triggerNotification("Please enter a phone number.", "error");
      return;
    }

    if (!isValidPhoneNumber(profileData.phone_number)) {
      triggerNotification(
        "Please enter a valid 10-digit phone number.",
        "error"
      );
      return;
    }

    sendPhoneOtp(profileData.phone_number);
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
    if (!isValidPhoneNumber(profileData.phone_number)) {
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
              ? { email: profileData.email }
              : { phoneNumber: profileData.phone_number }),
          }),
        }
      );

      if (response.ok) {
        triggerNotification(
          `${type === "email" ? "Email" : "Phone"} verified successfully!`,
          "success"
        );
        type === "email" ? setIsEmailVerified(true) : setIsPhoneVerified(true);
        setOtpModal(false);
      } else {
        const errorData = await response.json();
        triggerNotification(
          errorData.message || "Failed to verify OTP.",
          "error"
        );
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      triggerNotification("Error verifying OTP. Please try again.", "error");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfilePicture();
    await updatePersonalDetails();
    await updateProfessionalDetails();
  };

  // Reusable button component
  const NavigationButton = ({ label, onClick, isSubmit = false }) => (
    <button
      type={isSubmit ? "submit" : "button"}
      onClick={onClick}
      className="bg-[#1E3E62] text-white py-2 px-4 rounded-lg focus:outline-none focus:ring focus:ring-[#1E3E62]/50"
      aria-label={label}
    >
      {label}
    </button>
  );

  return (
    <section className=" bg-white shadow-lg rounded-lg w-full">
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {progressStep === 1 && (
          <div>
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
                    value={profileData.first_name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                    placeholder="Enter your first name"
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
                    value={profileData.last_name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                    placeholder="Enter your last name"
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
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                  placeholder="Enter your email address"
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
                  value={profileData.phone_number}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                  placeholder="Enter your phone number"
                  disabled={isPhoneVerified}
                />
                {/* Phone Verification Button */}
                <div className="flex justify-start mt-2">
                  <button
                    type="button"
                    onClick={handleVerifyPhone}
                    disabled={isPhoneVerified} // Corrected condition
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
          </div>
        )}

        {progressStep === 2 && (
          <div>
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
                    value={profileData.currentPassword}
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
                    value={profileData.newPassword}
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
                    value={profileData.confirmNewPassword}
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
          </div>
        )}

        {progressStep === 3 && (
          <div>
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
                  value={profileData.license_number}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                  placeholder="Enter your license number"
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
                  value={profileData.qualification}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                  placeholder="Enter your qualification"
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
                  value={profileData.specification}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                  placeholder="Enter your specialization"
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
                  value={profileData.experience}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E3E62] focus:border-[#1E3E62] transition placeholder-gray-400"
                  placeholder="Years of experience"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4">
          {/* Back Button */}
          {progressStep > 1 && (
            <NavigationButton
              label="Back"
              onClick={() => setProgressStep((prev) => prev - 1)}
            />
          )}
          {progressStep < 3 && (
            <NavigationButton
              label="Next"
              onClick={() => setProgressStep((prev) => prev + 1)}
            />
          )}
          {progressStep === 3 && (
            <NavigationButton label="Save Changes" isSubmit />
          )}
        </div>
      </form>
    </section>
  );
};

export default AccountSettings;
