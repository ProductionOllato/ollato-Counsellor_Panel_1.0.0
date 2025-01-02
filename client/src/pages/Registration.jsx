import React, { useState } from "react";
import "../styles/Resgistration.css"
import { useNavigate } from "react-router-dom";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { FiEye, FiEyeOff } from "react-icons/fi";
import OtpModal from "../components/OtpModal";
import InputField from "../components/InputField";
import statesAndDistricts from "../../public/states-and-districts.json";
import { useAuth } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";
import LOGO from "../assets/Ollato_Logo_CC-03.png";

const Registration = () => {
  // State Variables
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

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
    return emailRegex.test(email);
  };

  const isValidPhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\d{10}$/; //  Validates 10-digit phone numbers
    return phoneRegex.test(phoneNumber);
  };

  // Utility Functions
  const handleChange = (e) => {
    const { name, value } = e.target;

    // real-time validation for email
    if (name === "email" && value && !isValidEmail(value)) {
      triggerNotification("Invalid email format.", "error");
    }

    // real-time validation for phone number
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

  const handleVerifyEmail = () => {
    if (!formData.email) {
      triggerNotification("Please enter an email address.", "error");
      return;
    }
    if (!isValidEmail(formData.email)) {
      triggerNotification("Please enter a valid email address.", "error");
      return;
    }

    sendEmailOtp(formData.email);
    setOtpType("email");
  };

  const handleVerifyPhone = () => {
    if (!formData.phone_number) {
      triggerNotification("Please enter a phone number.", "error");
      return;
    }

    if (!isValidPhoneNumber(formData.phone_number)) {
      triggerNotification(
        "Please enter a valid 10-digit phone number.",
        "error"
      );
      return;
    }

    sendPhoneOtp(formData.phone_number);
    setOtpType("phone");
  };

  const sendEmailOtp = async (email) => {
    try {
      const response = await fetch(`${API_URL}/otp/email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
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
    if (!isValidPhoneNumber(formData.phone_number)) {
      triggerNotification(
        "Please enter a valid 10-digit phone number.",
        "error"
      );
      return;
    }
    try {
      const response = await fetch(`${API_URL}/otp/mobile-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
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
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        triggerNotification("OTP verified successfully!", "success");
        setOtpModal(false);
        setOtp("");
        if (otpType === "email") setIsEmailVerified(true);
        else setIsPhoneVerified(true);
      } else {
        const errorData = await response.json();
        triggerNotification(errorData.message || "Invalid OTP.", "error");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      triggerNotification(
        "An error occurred during OTP verification.",
        "error"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePersonalDetailsSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.phone_number ||
      !formData.gender ||
      !formData.date_of_birth ||
      !formData.state ||
      !formData.district ||
      !formData.password ||
      !formData.confirm_password
    ) {
      triggerNotification("Please fill in all the required fields.", "error");
      return;
    }

    // Validate email
    if (!isValidEmail(formData.email)) {
      triggerNotification("Please enter a valid email address.", "error");
      return; // Early return
    }

    // Validate phone number
    if (!isValidPhoneNumber(formData.phone_number)) {
      triggerNotification(
        "Please enter a valid 10-digit phone number.",
        "error"
      );
      return;
    }
    if (!isPasswordStrong(formData.password)) {
      triggerNotification("Password must be at least 8 characters long.", "error");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      triggerNotification("Passwords do not match.", "error");
      return;
    }

    if (!isEmailVerified) {
      triggerNotification(
        "Please verify your email address before registering.",
        "error"
      );
      return;
    }

    if (!isPhoneVerified) {
      triggerNotification(
        "Please verify your phone number before registering.",
        "error"
      );
      return;
    }

    const payload = {
      ...formData,
    };

    // console.log("Payload:", payload);

    try {
      const response = await fetch(`${API_URL}/auth/upload-personal-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // console.log("Response:", response);

      if (response.ok) {
        triggerNotification("Registration successful!", "success");
        navigate("/");
      } else {
        const errorData = await response.json();
        triggerNotification(
          errorData.message || "Registration failed.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error submitting details:", error);
      triggerNotification("An error occurred during registration.", "error");
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col-reverse md:flex-row bg-gray-100">
        {/* Form Section */}
        <div className="container">
          <div className="form-section">
            <img src={LOGO} alt="Logo" className="logo" />
            {/* Registration Form */}
            <form onSubmit={handlePersonalDetailsSubmit}>
              {/* Header */}
              <div className="form-header">
                <h1 className="form-heading">Registration Form</h1>
              </div>

              <div className="form-grid">
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
                  {/* Email Verification Button */}
                  <div className="button-container">
                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      disabled={isEmailVerified || isVerifying}
                      className="verify-button"
                    >
                      {isEmailVerified ? "Email Verified" : "Verify Email"}
                    </button>
                  </div>
                </div>

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
                  {/* Phone Verification Button */}
                  <div className="button-container">
                    <button
                      type="button"
                      onClick={handleVerifyPhone}
                      disabled={isPhoneVerified || isVerifying}
                      className="verify-button"
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
                    setFormData((prev) => ({ ...prev, district: e.target.value }))
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
                <div className="password-container">
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
                    className="eye-icon"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </span>
                </div>

                {/* Confirm Password Input */}
                <div className="password-container">
                  <InputField
                    label="Confirm Password"
                    name="confirm_password"
                    placeholder="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirm_password}
                    handleChange={handleChange}
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="eye-icon"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="submit-button-container">
                <button type="submit" className="submit-button">
                  Register
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="login-link-container">
              <p className="login-text">Already have an account?</p>
              <button onClick={() => navigate("/")} className="login-button">
                <FaArrowRightFromBracket />
                Login
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar (Logo on right) */}
        {/* <div className="sidebar">
    <img src={LOGO} alt="Logo" className="logo" />
  </div> */}
      </div>

    </>
  );
};

export default Registration;
