import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/UserContext";

const AccountSettings = () => {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    profilePicture: "",
    licenseNumber: "",
    qualification: "",
    specialization: "",
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
  const userId = user?.user_id;
  console.log("user-id", userId);

  const [progressStep, setProgressStep] = useState(1);

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
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        triggerNotification("Please upload a JPEG, PNG, or JPG file.", "error");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        triggerNotification("File size must be less than 2MB.", "error");
        return;
      }
      setProfileData((prev) => ({ ...prev, profilePicture: file }));
      const reader = new FileReader();
      reader.onload = () => setProfilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // API call for updating profile picture
  const updateProfilePicture = async () => {
    if (!profileData.profilePicture) return;

    const formData = new FormData();
    formData.append("profilePicture", profileData.profilePicture);
    console.log("user-id", user.user_id);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_APP_API_ENDPOINT_URL
        }/update/documents-details/profile-pic/${user.user_id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        triggerNotification("Profile picture updated successfully!", "success");
      } else {
        triggerNotification("Failed to update profile picture.", "error");
      }
    } catch (error) {
      triggerNotification(
        "An error occurred while updating the picture.",
        "error"
      );
    }
  };

  // API call for updating personal details
  const updatePersonalDetails = async () => {
    const {
      firstName,
      lastName,
      phone,
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
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            phone,
            currentPassword,
            newPassword,
          }),
        }
      );

      if (response.ok) {
        triggerNotification(
          "Personal details updated successfully!",
          "success"
        );
      } else {
        triggerNotification("Failed to update personal details.", "error");
      }
    } catch (error) {
      triggerNotification(
        "An error occurred while updating personal details.",
        "error"
      );
    }
  };

  // API call for updating professional details
  const updateProfessionalDetails = async () => {
    const { licenseNumber, qualification, specialization, experience } =
      profileData;

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_APP_API_ENDPOINT_URL
        }/update/professional-details/${user.user_id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            licenseNumber,
            qualification,
            specialization,
            experience,
          }),
        }
      );

      if (response.ok) {
        triggerNotification(
          "Professional details updated successfully!",
          "success"
        );
      } else {
        triggerNotification("Failed to update professional details.", "error");
      }
    } catch (error) {
      triggerNotification(
        "An error occurred while updating professional details.",
        "error"
      );
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfilePicture();
    await updatePersonalDetails();
    await updateProfessionalDetails();
  };

  return (
    <section className="max-w-4xl mx-auto bg-white shadow-lg p-8 rounded-lg">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm font-medium">
          <span
            className={`${
              progressStep >= 1 ? "text-[#1E3E62]" : "text-gray-400"
            }`}
          >
            Personal Details
          </span>
          <span
            className={`${
              progressStep === 2 ? "text-[#1E3E62]" : "text-gray-400"
            }`}
          >
            Professional Details
          </span>
        </div>
        <div className="relative mt-2">
          <div className="w-full bg-gray-200 h-1 rounded-full">
            <div
              className={`bg-[#1E3E62] h-1 rounded-full ${
                progressStep === 2 ? "w-full" : "w-1/2"
              }`}
            ></div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {progressStep === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* <div>
                <label className="block text-gray-600">Profile Picture</label>
                <input
                  type="file"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                {profilePreview && (
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="mt-4 w-32 h-32 rounded-full object-cover"
                  />
                )}
              </div> */}

              <div className="flex items-center mb-6">
                <div className="relative">
                  <img
                    src={profilePreview || "https://via.placeholder.com/150"}
                    alt="Profile Preview"
                    className="w-24 h-24 rounded-full border border-gray-300 object-cover"
                  />

                  <label
                    htmlFor="profilePicture"
                    className="absolute bottom-0 right-0 bg-[#1E3E62] text-white p-2 rounded-full cursor-pointer shadow"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="w-5 h-5"
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
                    id="profilePicture"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label className="block text-gray-600">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter your last name"
                />
              </div>

              <div>
                <label className="block text-gray-600">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-gray-600">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-gray-600">Current Password</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.current ? "text" : "password"}
                    name="currentPassword"
                    value={profileData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {passwordVisibility.current ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-600">New Password</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.new ? "text" : "password"}
                    name="newPassword"
                    value={profileData.newPassword}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {passwordVisibility.new ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-600">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisibility.confirm ? "text" : "password"}
                    name="confirmNewPassword"
                    value={profileData.confirmNewPassword}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {passwordVisibility.confirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {progressStep === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Professional Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-gray-600">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={profileData.licenseNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter your license number"
                />
              </div>
              <div>
                <label className="block text-gray-600">Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={profileData.qualification}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter your qualification"
                />
              </div>
              <div>
                <label className="block text-gray-600">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={profileData.specialization}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter your specialization"
                />
              </div>
              <div>
                <label className="block text-gray-600">Experience</label>
                <input
                  type="number"
                  name="experience"
                  value={profileData.experience}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Years of experience"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {progressStep > 1 && (
            <button
              type="button"
              className="bg-[#1E3E62] text-[#fff] py-2 px-4 rounded-lg"
              onClick={() => setProgressStep((prev) => prev - 1)}
            >
              Back
            </button>
          )}
          {progressStep < 2 && (
            <button
              type="button"
              className="bg-[#1E3E62] text-white py-2 px-4 rounded-lg"
              onClick={() => setProgressStep((prev) => prev + 1)}
            >
              Next
            </button>
          )}
          {progressStep === 2 && (
            <button
              type="submit"
              className="bg-[#1E3E62] text-white py-2 px-4 rounded-lg"
            >
              Save Changes
            </button>
          )}
        </div>
      </form>
    </section>
  );
};

export default AccountSettings;
