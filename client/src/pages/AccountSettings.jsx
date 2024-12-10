import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNotification } from "../context/NotificationContext";

const AccountSettings = () => {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    profilePicture: "",
    licenseNumber: "",
    qualification: "",
    specialization: "",
    experience: "",
  });

  const [profilePreview, setProfilePreview] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("Profile");
  const { triggerNotification } = useNotification();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    // if (file) {
    //   setProfileData((prev) => ({ ...prev, profilePicture: file }));
    //   const reader = new FileReader();
    //   reader.onload = () => setProfilePreview(reader.result);
    //   reader.readAsDataURL(file);
    // }
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        triggerNotification("Please upload a JPEG, PNG, or JPG file.", "error");
      }
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      alert("File size must be less than 2MB.");
      return;
    }
    setProfileData((prev) => ({ ...prev, profilePicture: file }));
    const reader = new FileReader();
    reader.onload = () => setProfilePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (profileData.password !== profileData.confirmPassword) {
      triggerNotification("Passwords do not match.", "error");
      return;
    }

    // const formData = new FormData();
    // formData.append("firstName", profileData.firstName);
    // formData.append("lastName", profileData.lastName);
    // formData.append("email", profileData.email);
    // formData.append("phone", profileData.phone);
    // formData.append("password", profileData.password);
    // if (profileData.profilePicture) {
    //   formData.append("profilePicture", profileData.profilePicture);
    // }
    const formData = new FormData();
    // Object.entries(profileData).forEach(([key, value]) => {
    //   formData.append(key, value);
    // });
    Object.entries(profileData).forEach(([key, value]) => {
      formData.append(key, key === "profilePicture" ? value : value.toString());
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_ENDPOINT_URL}/update-profile`,
        {
          method: "POST",
          body: formData,
        }
      );

      // const response = {
      //   ok: true,
      // };

      if (response.ok) {
        triggerNotification("Profile updated successfully!", "success");
      } else {
        triggerNotification("Failed to update profile.", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      triggerNotification("An error occurred.", "error");
    }
  };

  return (
    <section className="max-w-4xl mx-auto bg-white shadow-lg p-8 pt-4 rounded-lg">
      {/* Navigation between sections */}
      <div className="flex items-center mb-6 border-b border-[#2e7478]">
        {["Profile", "Password", "Contact", "Professional Details"].map(
          (section) => (
            <div
              key={section}
              role="tab"
              aria-selected={activeSection === section}
              onClick={() => setActiveSection(section)}
              className={`flex-1 text-center cursor-pointer text-lg font-medium text-gray-700 py-2 
              ${
                activeSection === section
                  ? "border-b-4 border-[#387478] text-[#387478]"
                  : ""
              }`}
            >
              {section}
            </div>
          )
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 p-8">
        {/* Profile Section */}
        {activeSection === "Profile" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Edit Profile
            </h2>
            <div className="flex items-center mb-6">
              <div className="relative">
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full border border-[#2e7478] object-cover"
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
              </div>
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureChange}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-600">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[#2e7478] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-600">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter your last name"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[#2e7478] rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Password Section */}
        {activeSection === "Password" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Change Password
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="mb-6">
                <label className="block text-gray-600">Password</label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={profileData.password}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-[#2e7478] rounded-lg"
                  />
                  <span
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-4 text-gray-500 cursor-pointer"
                  >
                    {passwordVisible ? <FiEye /> : <FiEyeOff />}
                  </span>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-600">Confirm Password</label>
                <div className="relative">
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={profileData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-[#2e7478] rounded-lg"
                  />
                  <span
                    onClick={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                    className="absolute right-3 top-4 text-gray-500 cursor-pointer"
                  >
                    {confirmPasswordVisible ? <FiEye /> : <FiEyeOff />}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Section */}
        {activeSection === "Contact" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Update Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="mt-4">
                <label className="block text-gray-600">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[#2e7478] rounded-lg"
                />
              </div>
              <div className="mt-4">
                <label className="block text-gray-600">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[#2e7478] rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Professional Details Section */}
        {activeSection === "Professional Details" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Professional Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-600">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  placeholder="Enter your license number"
                  value={profileData.licenseNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[#2e7478] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-600">Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  placeholder="Enter your qualification"
                  value={profileData.qualification}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[#2e7478] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-600">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  placeholder="Enter your specialization"
                  value={profileData.specialization}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[#2e7478] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-600">Experience</label>
                <input
                  type="number"
                  name="experience"
                  value={profileData.experience}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[#2e7478] rounded-lg"
                  placeholder="Years of experience"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-fit bg-[#1E3E62] text-white py-3 px-2 rounded-lg font-semibold hover:bg-[#243642] transition duration-300 mx-auto"
        >
          Save Changes
        </button>
      </form>
    </section>
  );
};

export default AccountSettings;
