import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext.jsx";
import LOGO from "../assets/Ollato_Logo_CC-03.png";
import "../styles/Forgot.css"

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const apiEndpointURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;
  const { triggerNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => setEmail(e.target.value);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    return emailRegex.test(email);
  };

  // Send Reset Link
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      triggerNotification("Please enter a valid email address.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${apiEndpointURL}/reset/request-password-reset`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        triggerNotification("Reset link sent to your email.", "success");
        navigate("/");
      } else {
        const errorData = await response.json();
        triggerNotification(
          errorData.message || "Failed to send reset link.",
          "error"
        );
      }
    } catch (error) {
      if (error instanceof TypeError) {
        triggerNotification(
          "Network error. Please check your connection.",
          "error"
        );
      } else {
        triggerNotification("An unexpected error occurred.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      {/* Left Side Image Section */}
      <div className="forgot-left">
        <img src={LOGO} alt="Logo" className="forgot-logo" />
      </div>
  
      {/* Right Side Reset Form Section */}
      <div className="forgot-right">
        <div className="forgot-form-container">
          <h1 className="forgot-heading">Forgot Password</h1>
  
          <form onSubmit={handleSubmit}>
            <div className="forgot-form-field">
              <label className="forgot-form-label" htmlFor="email">
                Email *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={handleChange}
                className="forgot-input"
                required
              />
            </div>
  
            <div className="forgot-submit-button-container">
              <button
                type="submit"
                className={`forgot-submit-button ${loading ? 'disabled' : ''}`}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
  
          <div className="forgot-back-to-login">
            <button
              className="forgot-back-to-login-button"
              onClick={() => navigate('/')}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
}

export default ForgotPassword;
