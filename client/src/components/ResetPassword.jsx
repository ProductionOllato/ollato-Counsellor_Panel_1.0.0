// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation, useParams } from "react-router-dom";
// import { useNotification } from "../context/NotificationContext.jsx";
// import { FiEye, FiEyeOff } from "react-icons/fi";


// function ResetPassword() {
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { token } = useParams();

//   const apiEndpointURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;
//   const { triggerNotification } = useNotification();
//   const navigate = useNavigate();

//   const isPasswordStrong = (password) => password.length >= 8;
//   const [showPassword, setShowPassword] = useState({
//     password: false,
//     confirmPassword: false,
//   })

//   const togglePassword = (field) => {
//     setShowPassword((prevState) => ({
//       ...prevState,
//       [field]: !prevState[field],
//     }));
//   }

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "password") setPassword(value);
//     if (name === "confirmPassword") setConfirmPassword(value);
//   };

//   // Submit Reset Password
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!isPasswordStrong(password)) {
//       triggerNotification(
//         "Password must be at least 8 characters long.",
//         "error"
//       );
//       return;
//     }

//     if (password !== confirmPassword) {
//       triggerNotification("Passwords do not match.", "error");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await fetch(`${apiEndpointURL}/reset/reset-password/${token}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           newPassword: password,
//         }),
//       });

//       if (response.ok) {
//         triggerNotification("Password reset successfully.", "success");
//         navigate("/");
//       } else {
//         const errorData = await response.json();
//         triggerNotification(
//           errorData.message || "Failed to reset password.",
//           "error"
//         );
//       }
//     } catch (error) {
//       triggerNotification(
//         "An error occurred while resetting your password.",
//         "error"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col justify-center items-center bg-[#FFEADB]">
//       <div className="bg-white p-8 border border-[#ff9a3c] rounded-lg shadow-lg w-full max-w-md mx-auto">
//         <h1 className="text-2xl text-[#ff9a3c] font-semibold mb-6 text-center">
//           Reset Password
//         </h1>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4 relative">
//             <label className="block text-[#ff9a3c]">New Password *</label>
//             <input
//               type={showPassword.password ? "text" : "password"}
//               name="password"
//               placeholder="Enter new password"
//               value={password}
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded-md"
//               required
//               aria-label="New Password"
//             />
//             <button
//               type="button"
//               className="absolute right-3 top-4 text-gray-500 bg-transparent border-none"
//               onClick={() => togglePassword("password")}
//             >
//               {showPassword.password ? <FiEyeOff /> : <FiEye />}
//             </button>
//           </div>
//           <div className="mb-4 relative">
//             <label className="block text-[#ff9a3c]">
//               Confirm New Password *
//             </label>
//             <input
//               type={showPassword.confirmPassword ? "text" : "password"}
//               name="confirmPassword"
//               placeholder="Confirm new password"
//               value={confirmPassword}
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded-md"
//               required
//               aria-label="Confirm New Password"
//             />
//             <button
//               type="button"
//               className="absolute right-3 top-4 text-gray-500 bg-transparent border-none"
//               onClick={() => togglePassword("confirmPassword")}
//             >
//               {showPassword.confirmPassword ? <FiEyeOff /> : <FiEye />}
//             </button>
//           </div>
//           <div className="mt-4 flex justify-center">
//             <button
//               type="submit"
//               className={`w-1/2 bg-[#406882] text-[#ffffff] p-2 rounded-md ${loading ? "opacity-50" : ""
//                 }`}
//               disabled={loading}
//             >
//               {loading ? "Processing..." : "Reset Password"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default ResetPassword;

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNotification } from "../context/NotificationContext.jsx";
import { FiEye, FiEyeOff } from "react-icons/fi";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useParams();

  const apiEndpointURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;
  const { triggerNotification } = useNotification();
  const navigate = useNavigate();

  const isPasswordStrong = (password) => password.length >= 8;
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const togglePassword = (field) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "password") setPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);
  };

  // Submit Reset Password
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordStrong(password)) {
      triggerNotification("Password must be at least 8 characters long.", "error");
      return;
    }

    if (password !== confirmPassword) {
      triggerNotification("Passwords do not match.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiEndpointURL}/reset/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });

      if (response.ok) {
        triggerNotification("Password reset successfully.", "success");
        navigate("/");
      } else {
        const errorData = await response.json();
        triggerNotification(errorData.message || "Failed to reset password.", "error");
      }
    } catch (error) {
      triggerNotification("An error occurred while resetting your password.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-8 border border-gray-300 rounded-lg shadow-lg w-full max-w-md mx-auto">
        <h1 className="text-2xl text-gray-800 font-semibold mb-6 text-center">
          Reset Password
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label className="block text-gray-700">New Password *</label>
            <input
              type={showPassword.password ? "text" : "password"}
              name="password"
              placeholder="Enter new password"
              value={password}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3E5879]"
              required
              aria-label="New Password"
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-500 bg-transparent border-none hover:text-gray-700 hover:bg-gray-200"
              onClick={() => togglePassword("password")}
            >
              {showPassword.password ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <div className="mb-4 relative">
            <label className="block text-gray-700">Confirm New Password *</label>
            <input
              type={showPassword.confirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3E5879]"
              required
              aria-label="Confirm New Password"
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-500 bg-transparent border-none hover:text-gray-700 hover:bg-gray-200"
              onClick={() => togglePassword("confirmPassword")}
            >
              {showPassword.confirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="submit"
              className={`w-1/2 bg-[#3E5879] text-white p-2 rounded-md transition-opacity duration-200 ${loading ? "opacity-50" : ""}`}
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