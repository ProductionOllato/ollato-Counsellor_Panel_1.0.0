import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotification } from "../context/NotificationContext.jsx";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  const apiEndpointURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;
  const { triggerNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Get token from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setToken(params.get("token"));
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "password") setPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);
  };

  // Submit Reset Password
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      triggerNotification("Passwords do not match.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiEndpointURL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      if (response.ok) {
        triggerNotification("Password reset successfully.", "success");
        navigate("/login");
      } else {
        const errorData = await response.json();
        triggerNotification(
          errorData.message || "Failed to reset password.",
          "error"
        );
      }
    } catch (error) {
      triggerNotification(
        "An error occurred while resetting your password.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FFEADB]">
      <div className="bg-white p-8 border border-[#ff9a3c] rounded-lg shadow-lg w-full max-w-md mx-auto">
        <h1 className="text-2xl text-[#ff9a3c] font-semibold mb-6 text-center">
          Reset Password
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#ff9a3c]">New Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Enter new password"
              value={password}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#ff9a3c]">
              Confirm New Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="submit"
              className={`w-1/2 bg-[#406882] text-[#ffffff] p-2 rounded-md ${
                loading ? "opacity-50" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Processing..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
