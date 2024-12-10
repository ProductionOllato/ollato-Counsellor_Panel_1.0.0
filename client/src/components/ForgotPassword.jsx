// import React, { useState } from "react";
// import LOGO from "../assets/Ollato_Logo_CC-03.png";
// import { useNavigate } from "react-router-dom";
// import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
// import { FaArrowRightFromBracket } from "react-icons/fa6";
// import Notification from "./Notification/Notification";

// function ForgotPassword() {
//   const [formData, setFormData] = useState({
//     email: "",
//     otp: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const [notification, setNotification] = useState({ message: "", type: "" });

//   const navigate = useNavigate();

//   const apiUrls = {
//     sendOtp: import.meta.env.VITE_SEND_OTP_API,
//     verifyOtpAndResetPassword: import.meta.env
//       .VITE_VERIFY_OTP_RESET_PASSWORD_API,
//   };

//   // Function to trigger a notification
//   const triggerNotification = (message, type) => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification({ message: "", type: "" }), 3000);
//   };

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Send OTP
//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const response = await fetch(apiUrls.sendOtp, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: formData.email }),
//       });

//       if (response.ok) {
//         setOtpSent(true);
//         triggerNotification("OTP sent to your email.", "success");
//       } else {
//         const errorData = await response.json();
//         triggerNotification(
//           errorData.message || "Failed to send OTP.",
//           "error"
//         );
//       }
//     } catch (error) {
//       console.error("Error sending OTP:", error);
//       triggerNotification(
//         "An error occurred while sending OTP. Please try again.",
//         "error"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Verify OTP and Reset Password
//   const handleVerifyOtpAndUpdatePassword = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     if (formData.newPassword !== formData.confirmPassword) {
//       triggerNotification("Passwords do not match.", "error");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch(apiUrls.verifyOtpAndResetPassword, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email: formData.email,
//           otp: formData.otp,
//           newPassword: formData.newPassword,
//         }),
//       });

//       if (response.ok) {
//         triggerNotification(
//           "Password updated successfully! Redirecting to login...",
//           "success"
//         );
//         setTimeout(() => navigate("/"), 3000); // Redirect to login after success
//       } else {
//         const errorData = await response.json();
//         triggerNotification(
//           errorData.message || "Failed to reset password.",
//           "error"
//         );
//       }
//     } catch (error) {
//       console.error("Error resetting password:", error);
//       triggerNotification(
//         "An error occurred while resetting the password. Please try again.",
//         "error"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 h-full">
//       <div className="w-full md:w-1/3 bg-[#2C394B] flex items-center justify-center p-8">
//         <img src={LOGO} alt="Logo" className="w-1/2 md:w-3/4 h-auto" />
//       </div>

//       <div className="w-full md:w-2/3 p-8 mt-20 h-full">
//         <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-auto">
//           <h1 className="text-2xl text-[#2C394B] font-semibold mb-6 text-center">
//             Forgot Password
//           </h1>

//           <Notification
//             message={notification.message}
//             type={notification.type}
//           />

//           {otpSent ? (
//             <form onSubmit={handleVerifyOtpAndUpdatePassword}>
//               <div className="mb-4">
//                 <label className="block text-gray-600">Enter OTP *</label>
//                 <input
//                   type="text"
//                   name="otp"
//                   placeholder="Enter OTP sent to your email"
//                   value={formData.otp}
//                   onChange={handleChange}
//                   className="w-full p-2 border border-gray-300 rounded-md"
//                   required
//                 />
//               </div>

//               <div className="mb-4 relative">
//                 <label className="block text-gray-600">New Password *</label>
//                 <input
//                   type={showNewPassword ? "text" : "password"}
//                   name="newPassword"
//                   placeholder="Create a new password"
//                   value={formData.newPassword}
//                   onChange={handleChange}
//                   className="w-full p-2 border border-gray-300 rounded-md"
//                   required
//                 />
//                 <span
//                   onClick={() => setShowNewPassword(!showNewPassword)}
//                   className="absolute right-3 top-9 cursor-pointer text-gray-500"
//                 >
//                   {showNewPassword ? (
//                     <AiOutlineEyeInvisible />
//                   ) : (
//                     <AiOutlineEye />
//                   )}
//                 </span>
//               </div>

//               <div className="mb-4 relative">
//                 <label className="block text-gray-600">
//                   Confirm New Password *
//                 </label>
//                 <input
//                   type={showConfirmPassword ? "text" : "password"}
//                   name="confirmPassword"
//                   placeholder="Confirm your new password"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   className="w-full p-2 border border-gray-300 rounded-md"
//                   required
//                 />
//                 <span
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   className="absolute right-3 top-9 cursor-pointer text-gray-500"
//                 >
//                   {showConfirmPassword ? (
//                     <AiOutlineEyeInvisible />
//                   ) : (
//                     <AiOutlineEye />
//                   )}
//                 </span>
//               </div>

//               <div className="mt-4 flex justify-center">
//                 <button
//                   type="submit"
//                   className={`w-1/2 bg-[#2C394B] text-white p-2 rounded-md ${
//                     loading ? "opacity-50" : ""
//                   }`}
//                   disabled={loading}
//                 >
//                   {loading ? "Processing..." : "Reset Password"}
//                 </button>
//               </div>
//             </form>
//           ) : (
//             <form onSubmit={handleSendOtp}>
//               {/* email */}
//               <div className="mb-4">
//                 <label className="block text-gray-600">Email *</label>
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Enter your email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="w-full p-2 border border-gray-300 rounded-md"
//                   required
//                 />
//               </div>
//               {/* send otp */}
//               <div className="mt-4 flex justify-center">
//                 <button
//                   type="submit"
//                   className={`w-1/2 bg-[#2C394B] text-white p-2 rounded-md ${
//                     loading ? "opacity-50" : ""
//                   }`}
//                   disabled={loading}
//                 >
//                   {loading ? "Sending OTP..." : "Send OTP"}
//                 </button>
//               </div>
//               {/* back to login */}
//               <div className="absolute top-6 right-14 flex justify-center items-center mt-4">
//                 <p className="text-sm text-[#2C394B]">Back to Login?</p>
//                 <button
//                   className="ml-2 text-md text-[#2C394B] hover:text-[#597aac] hover:translate-x-1 transition duration-200 ease-in-out flex items-center gap-1"
//                   onClick={() => navigate("/")}
//                 >
//                   <FaArrowRightFromBracket />
//                   Login
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ForgotPassword;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useAuth } from "../context/UserContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const apiEndpointURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;
  const { triggerNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => setEmail(e.target.value);

  // Send Reset Link
  const handleSubmit = async (e) => {
    e.preventDefault();

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
        navigate("/login"); // Redirect to login page after sending link
      } else {
        const errorData = await response.json();
        triggerNotification(
          errorData.message || "Failed to send reset link.",
          "error"
        );
      }
    } catch (error) {
      triggerNotification(
        "An error occurred while sending the reset link.",
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
          Forgot Password
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#ff9a3c]">Email *</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your registered email"
              value={email}
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
              {loading ? "Processing..." : "Send Reset Link"}
            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <button
            className="text-[#ff9a3c] underline hover:translate-x-1 transition duration-200 ease-in-out"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
