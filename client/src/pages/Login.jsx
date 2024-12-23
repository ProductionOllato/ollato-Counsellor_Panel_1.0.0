import React, { useState } from "react";
import LOGO from "../assets/Ollato_Logo_CC-03.png";
import { useNavigate } from "react-router-dom";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Notification from "../components/Notification/Notification";
import { useAuth } from "../context/UserContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";
import "../styles/Login.css"

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phoneNumber: "",
    otp: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showOtpLogin, setShowOtpLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiEndpointURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;

  const { login } = useAuth();
  const { triggerNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (showOtpLogin) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiEndpointURL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          login(data.user);
          triggerNotification("Login successful! Redirecting...", "success");
          navigate("/dashboard");
        } else {
          triggerNotification("Unexpected response format.", "error");
        }
      } else {
        const errorData = await response.json();
        triggerNotification(
          errorData.message || "Invalid login credentials.",
          "error"
        );
      }
    } catch (error) {
      triggerNotification(
        "An error occurred during login. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      if (!/^\d{10}$/.test(formData.phoneNumber)) {
        triggerNotification("Invalid phone number.", "error");
        return;
      }

      const response = await fetch(`${apiEndpointURL}/otp/mobile-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
      });

      if (response.ok) {
        setOtpSent(true);
        triggerNotification("OTP sent to your phone number.", "success");
      } else {
        const errorData = await response.json();
        triggerNotification(
          errorData.message || "Failed to send OTP.",
          "error"
        );
      }
    } catch (error) {
      triggerNotification(
        "An error occurred while sending OTP. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiEndpointURL}/otp/mobile-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
      });

      if (response.ok) {
        triggerNotification("OTP resent successfully.", "success");
      } else {
        const errorData = await response.json();
        triggerNotification(
          errorData.message || "Failed to resend OTP.",
          "error"
        );
      }
    } catch (error) {
      triggerNotification(
        "An error occurred while resending OTP. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiEndpointURL}/otp/verify-mobile-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          enteredOtp: formData.otp,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("OTP verification response:", data);
        // localStorage.setItem("token", data.token);
        login(data.user);
        triggerNotification("Login successful!", "success");
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        triggerNotification(errorData.message || "Invalid OTP.", "error");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      triggerNotification(
        "An error occurred during OTP verification. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleLoginMethod = () => {
    setShowOtpLogin((prev) => !prev);
    setOtpSent(false);
    setFormData({ email: "", password: "", phoneNumber: "", otp: "" });
  };

  const handleForgotPassword = () => navigate("/forgot-password");

  return (
    <>
    <div className="login-container">
  <div className="login-logo-container">
    <img src={LOGO} alt="Logo" className="login-logo" />
  </div>

  <div className="login-form-container">
    <div className="login-form-wrapper">
      <h1 className="login-title">
        {showOtpLogin ? "Login with OTP" : "Welcome Back"}
      </h1>
      <form onSubmit={handleSubmit}>
        {showOtpLogin ? (
          <>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                name="phoneNumber"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            {otpSent && (
              <div className="form-group">
                <label className="form-label">Enter OTP *</label>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP sent to your phone"
                  value={formData.otp}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            )}
            <div className="form-action">
              <button
                type="button"
                onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                className={`form-button ${loading ? "disabled" : ""}`}
                disabled={loading || (!otpSent && !formData.phoneNumber)}
              >
                {loading
                  ? "Processing..."
                  : otpSent
                  ? "Verify OTP"
                  : "Send OTP"}
              </button>
            </div>
            {otpSent && (
              <div className="form-resend">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className={`resend-button ${loading ? "disabled" : ""}`}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group password-group">
              <label className="form-label">Password *</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible />
                ) : (
                  <AiOutlineEye />
                )}
              </span>
            </div> 
            <div className="forgot-password">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="forgot-password-link"
              >
                Forgot Password?
              </button>
            </div>
            <div className="form-action">
              <button
                type="submit"
                className={`form-button ${loading ? "disabled" : ""}`}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </>
        )}
      </form>
      <div className="toggle-login-method">
        <button
          className="toggle-login-method-link"
          onClick={toggleLoginMethod}
        >
          {showOtpLogin ? "Back to Email Login" : "Login with OTP"}
        </button>
      </div>
      <div className="register-link-container">
        <p className="register-text">Don't have an account?</p>
        <button
          className="register-button"
          onClick={() => navigate("/registration")}
        >
          <FaArrowRightFromBracket />
          Register
        </button>
      </div>
    </div>
  </div>
</div>
</>
  );
}

export default Login;
