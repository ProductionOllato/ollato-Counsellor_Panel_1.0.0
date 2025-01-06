import React, { useState } from "react";
import "../styles/Resgistration.css";
import { useNavigate } from "react-router-dom";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { FiEye, FiEyeOff } from "react-icons/fi";
import OtpModal from "../components/OtpModal";
import InputField from "../components/InputField";
import statesAndDistricts from "../data/states-and-districts.json";
import { useAuth } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";
import LOGO from "../assets/Ollato_Logo_CC-03.png";

const Registration = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    gender: "",
    date_of_birth: "",
    state: "",
    district: "",
    password: "",
    confirm_password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpType, setOtpType] = useState("");
  const [otpModal, setOtpModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const { triggerNotification } = useNotification();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_APP_API_ENDPOINT_URL;

  const isPasswordStrong = (password) => password.length >= 8;

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPhoneNumber = (phoneNumber) => /^\d{10}$/.test(phoneNumber);

  // Validate input and update state
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email" && value && !isValidEmail(value)) {
      triggerNotification("Invalid email format.", "error");
    }

    if (name === "phone_number" && !/^\d*$/.test(value)) {
      triggerNotification("Phone number can only contain digits.", "error");
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    const selectedStateData = statesAndDistricts.states.find(
      (state) => state.state === selectedState
    );

    setFormData((prevData) => ({
      ...prevData,
      state: selectedState,
      district: "", // Reset district when state changes
    }));
    setDistricts(selectedStateData ? selectedStateData.districts : []);
  };

  // OTP related functions
  const handleVerifyEmail = () => {
    if (!formData.email) {
      triggerNotification("Please enter an email address.", "error");
      return;
    }
    if (!isValidEmail(formData.email)) {
      triggerNotification("Please enter a valid email address.", "error");
      return;
    }
    sendOtp("email", formData.email);
  };

  const handleVerifyPhone = () => {
    if (!formData.phone_number) {
      triggerNotification("Please enter a phone number.", "error");
      return;
    }
    if (!isValidPhoneNumber(formData.phone_number)) {
      triggerNotification("Please enter a valid 10-digit phone number.", "error");
      return;
    }
    sendOtp("phone", formData.phone_number);
  };

  const sendOtp = async (type, identifier) => {
    // Determine the API endpoint and payload key based on type
    const endpoint = type === "email" ? "otp/email-otp" : "otp/mobile-otp";
    const payloadKey = type === "email" ? "email" : "phoneNumber";

    try {
      // Make the API call
      const response = await axios.post(`${API_URL}/${endpoint}`, {
        [payloadKey]: identifier,
      });

      triggerNotification(`OTP sent to your ${type}.`, "success");
      setOtpType(type);
      setOtpModal(true);
    } catch (error) {
      // Extract and handle the error
      const errorMessage =
        error.response?.data?.message || "Failed to send OTP. Please try again.";
      triggerNotification(errorMessage, "error");
    }
  };

  const handleOtpVerification = async () => {
    if (!otp || otp.length !== 4) {
      triggerNotification("Please enter a valid 4-digit OTP.", "error");
      return;
    }

    setIsVerifying(true);

    const url =
      otpType === "email"
        ? `${API_URL}/otp/verify-email-otp`
        : `${API_URL}/otp/verify-mobile-otp`;

    const payload =
      otpType === "email"
        ? { enteredOtp: otp, email: formData.email }
        : { enteredOtp: otp, phoneNumber: formData.phone_number };

    try {
      const response = await axios.post(url, payload);

      triggerNotification("OTP verified successfully!", "success");
      setOtpModal(false);
      setOtp("");
      otpType === "email" ? setIsEmailVerified(true) : setIsPhoneVerified(true);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Invalid OTP. Please try again.";
      triggerNotification(errorMessage, "error");
    } finally {
      setIsVerifying(false);
    }
  };


  const handleResendOtp = async () => {
    try {
      if (otpType === "email") {
        await sendOtp("email", formData.email);
      } else if (otpType === "phone") {
        await sendOtp("phone", formData.phone_number);
      }
      triggerNotification("OTP resent successfully!", "success");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to resend OTP. Please try again.";
      triggerNotification(errorMessage, "error");
    }
  };

  const handlePersonalDetailsSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(formData).some((field) => !field)) {
      triggerNotification("Please fill in all the required fields.", "error");
      return;
    }

    if (!isValidEmail(formData.email)) {
      triggerNotification("Please enter a valid email address.", "error");
      return;
    }

    if (!isValidPhoneNumber(formData.phone_number)) {
      triggerNotification("Please enter a valid 10-digit phone number.", "error");
      return;
    }

    if (!isPasswordStrong(formData.password)) {
      triggerNotification(
        "Password must be at least 8 characters long and meet complexity requirements.",
        "error"
      );
      return;
    }

    if (formData.password !== formData.confirm_password) {
      triggerNotification("Passwords do not match.", "error");
      return;
    }

    if (!isEmailVerified) {
      triggerNotification("Please verify your email address before registering.", "error");
      return;
    }

    if (!isPhoneVerified) {
      triggerNotification("Please verify your phone number before registering.", "error");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/upload-personal-details`, formData);

      triggerNotification("Registration successful!", "success");
      navigate("/");
    } catch (error) {
      if (error.response && error.response.status === 409) {
        triggerNotification("This email is already registered. Please use a different email.", "error");
      } else {
        const errorMessage =
          error.response?.data?.message || "An error occurred during registration.";
        triggerNotification(errorMessage, "error");
      }
    }
  };

  return (
    <>
      <div className="registration-container min-h-screen bg-gradient-to-r from-blue-500 to-pink-500">
        <div className="container mx-auto flex justify-center items-center py-10">
          {/* Logo Section */}
          <div className="registration-logo-container w-full md:w-1/2 flex justify-center items-center">
            <img
              src={LOGO}
              alt="Logo"
              className="registration-logo w-3/4 max-w-md"
            />
          </div>

          {/* Form Section */}
          <div className="registration-form-container w-full md:w-1/2 p-1">
            <div className="registration-form-section bg-white p-8 rounded-lg shadow-xl">
              {/* Registration Form */}
              <form onSubmit={handlePersonalDetailsSubmit}>
                {/* Header */}
                <div className="registration-form-header text-center mb-6">
                  <h1 className="registration-form-heading text-3xl font-semibold text-blue-800">
                    Registration Form
                  </h1>
                </div>

                <div className="registration-form-grid grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Input Fields */}
                  <InputField
                    label="First Name"
                    name="first_name"
                    placeholder="Enter your first name"
                    value={formData.first_name}
                    handleChange={handleChange}
                  />
                  <InputField
                    label="Last Name"
                    name="last_name"
                    placeholder="Enter your last name"
                    value={formData.last_name}
                    handleChange={handleChange}
                  />

                  {/* Email verification */}
                  <div>
                    <InputField
                      label="Email"
                      name="email"
                      placeholder="Enter your email"
                      type="email"
                      value={formData.email}
                      handleChange={handleChange}
                      disabled={isEmailVerified}
                    />
                    <div className="registration-button-container">
                      <button
                        type="button"
                        onClick={handleVerifyEmail}
                        disabled={isEmailVerified || isVerifying}
                        className="registration-verify-button"
                      >
                        {isEmailVerified ? "Email Verified" : "Verify Email"}
                      </button>
                    </div>
                  </div>

                  {/* Phone verification */}
                  <div>
                    <InputField
                      label="Phone Number"
                      name="phone_number"
                      placeholder="Enter your phone number"
                      type="text"
                      value={formData.phone_number}
                      handleChange={handleChange}
                      disabled={isPhoneVerified}
                    />
                    <div className="registration-button-container">
                      <button
                        type="button"
                        onClick={handleVerifyPhone}
                        disabled={isPhoneVerified || isVerifying}
                        className="registration-verify-button"
                      >
                        Verify Phone
                      </button>
                    </div>
                  </div>

                  {/* OTP Modal */}
                  {otpModal && (
                    <OtpModal
                      otp={otp}
                      setOtp={setOtp}
                      handleOtpVerification={handleOtpVerification}
                      setOtpModal={setOtpModal}
                      isVerifying={isVerifying}
                      message={`Please enter the 4-digit OTP sent to your ${otpType}.`}
                      resendOtp={handleResendOtp}
                    />
                  )}

                  {/* Gender Selection */}
                  <InputField
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    handleChange={handleChange}
                    component="select"
                  >
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </InputField>

                  {/* Date of Birth */}
                  <InputField
                    label="Date of Birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    handleChange={handleChange}
                    type="date"
                  />

                  {/* State Selection */}
                  <InputField
                    label="State"
                    name="state"
                    value={formData.state}
                    handleChange={handleStateChange}
                    component="select"
                  >
                    <option value="" disabled>
                      Select State
                    </option>
                    {statesAndDistricts.states.map((state) => (
                      <option key={state.state} value={state.state}>
                        {state.state}
                      </option>
                    ))}
                  </InputField>

                  {/* District Selection */}
                  <InputField
                    label="District"
                    name="district"
                    value={formData.district}
                    handleChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        district: e.target.value,
                      }))
                    }
                    component="select"
                  >
                    <option value="" disabled>
                      Select District
                    </option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </InputField>

                  {/* Password Input */}
                  <div className="registration-password-container relative">
                    <InputField
                      label="Password"
                      name="password"
                      placeholder="Enter Password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      handleChange={handleChange}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="registration-eye-icon absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="registration-password-container relative">
                    <InputField
                      label="Confirm Password"
                      name="confirm_password"
                      placeholder="Confirm Password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirm_password}
                      handleChange={handleChange}
                    />
                    <span
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="registration-eye-icon absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer"
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="registration-submit-button-container flex justify-center mt-8">
                  <button
                    type="submit"
                    className="registration-submit-button w-full py-3 bg-blue-600 text-white font-semibold rounded-lg"
                  >
                    Register
                  </button>
                </div>
              </form>

              {/* Login Link */}
              <div className="registration-login-link-container flex justify-center mt-6">
                <p className="registration-login-text text-sm">
                  Already have an account?
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="registration-login-button flex items-center text-blue-600 ml-2"
                >
                  <FaArrowRightFromBracket className="mr-2" />
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Registration;
