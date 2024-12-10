// import React, { useState } from "react";
// import LOGO from "../assets/Ollato_Logo_CC-03.png";
// import { useNavigate } from "react-router-dom";
// import { FaArrowRightFromBracket } from "react-icons/fa6";
// import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
// import { useAuth } from "../context/UserContext.jsx";
// import { useNotification } from "../context/NotificationContext.jsx";

// function Login() {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     phoneNumber: "",
//     otp: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [showOtpLogin, setShowOtpLogin] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const apiEndpointURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;

//   const { login } = useAuth(); // Access context login function
//   const { triggerNotification } = useNotification();
//   const navigate = useNavigate();

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Email/Password Login
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (showOtpLogin) return; // Prevent form submission if in OTP login mode

//     setLoading(true);
//     try {
//       const response = await fetch(`${apiEndpointURL}/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password,
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         console.log("Login Response:", data);

//         // Validate if expected response data exists
//         if (data.user) {
//           login(data.user); // Save user in context
//           triggerNotification("Login successful! Redirecting...", "success");
//           navigate("/dashboard");
//         } else {
//           triggerNotification("Unexpected response format.", "error");
//         }
//       } else {
//         const errorData = await response.json();
//         triggerNotification(
//           errorData.message || "Invalid login credentials.",
//           "error"
//         );
//       }
//     } catch (error) {
//       triggerNotification(
//         "An error occurred during login. Please try again.",
//         "error"
//       );
//     } finally {
//       setLoading(false);
//     }
//     console.log("Login Data:", formData);
//   };

//   // Send OTP
//   const handleSendOtp = async () => {
//     setLoading(true);
//     try {
//       if (!/^\d{10}$/.test(formData.phoneNumber)) {
//         triggerNotification("Invalid phone number.", "error");
//         return;
//       }

//       const response = await fetch(`${apiEndpointURL}/otp/mobile-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
//       });

//       if (response.ok) {
//         setOtpSent(true);
//         triggerNotification("OTP sent to your phone number.", "success");
//       } else {
//         const errorData = await response.json();
//         triggerNotification(
//           errorData.message || "Failed to send OTP.",
//           "error"
//         );
//       }
//     } catch (error) {
//       triggerNotification(
//         "An error occurred while sending OTP. Please try again.",
//         "error"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Verify OTP
//   const handleVerifyOtp = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${apiEndpointURL}/otp/verify-mobile-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           phoneNumber: formData.phoneNumber,
//           enteredOtp: formData.otp,
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         localStorage.setItem("token", data.token);
//         login(data.user); // Save user in context
//         triggerNotification("Login successful!", "success");
//         navigate("/dashboard");
//       } else {
//         const errorData = await response.json();
//         triggerNotification(errorData.message || "Invalid OTP.", "error");
//       }
//     } catch (error) {
//       triggerNotification(
//         "An error occurred during OTP verification. Please try again.",
//         "error"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Toggle between email/password login and OTP login
//   const toggleLoginMethod = () => {
//     setShowOtpLogin((prev) => !prev);
//     setOtpSent(false);
//     setFormData({ email: "", password: "", phoneNumber: "", otp: "" });
//   };

//   const handleForgotPassword = () => navigate("/forgot-password");

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row bg-[#FFEADB] h-full">
//       <div className="w-2/4 md:w-2/4 bg-[#406882] flex items-center justify-center p-14">
//         <img src={LOGO} alt="Logo" className="w-1/2 md:w-3/4 h-auto " />
//       </div>

//       <div className=" w-2/4 md:w-2/4 p-8 mt-20 h-full ">
//         <div className="bg-[#FFEADB] p-8 border border-[#ff9a3c] rounded-lg shadow-lg w-full max-w-md mx-auto ">
//           <h1 className="text-2xl text-[#ff9a3c] font-semibold mb-6 text-center">
//             {showOtpLogin ? "Login with OTP" : "Welcome Back"}
//           </h1>
//           <form onSubmit={handleSubmit}>
//             {showOtpLogin ? (
//               <>
//                 <div className="mb-4">
//                   <label className="block text-[#ff9a3c]">Phone Number *</label>
//                   <input
//                     type="text"
//                     name="phoneNumber"
//                     placeholder="Enter your phone number"
//                     value={formData.phoneNumber}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-gray-300 rounded-md"
//                   />
//                 </div>
//                 {otpSent && (
//                   <div className="mb-4">
//                     <label className="block text-[#ff9a3c]">Enter OTP *</label>
//                     <input
//                       type="text"
//                       name="otp"
//                       placeholder="Enter OTP sent to your phone"
//                       value={formData.otp}
//                       onChange={handleChange}
//                       className="w-full p-2 border border-gray-300 rounded-md"
//                     />
//                   </div>
//                 )}
//                 {/* OTP login buttons */}
//                 <div className="mt-4 flex justify-center">
//                   <button
//                     type="button"
//                     onClick={otpSent ? handleVerifyOtp : handleSendOtp}
//                     className={`w-1/2 bg-[#406882] text-[#ffffff] p-2 rounded-md ${
//                       loading ? "opacity-50" : ""
//                     }`}
//                     disabled={loading || (!otpSent && !formData.phoneNumber)}
//                   >
//                     {loading
//                       ? "Processing..."
//                       : otpSent
//                       ? "Verify OTP"
//                       : "Send OTP"}
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div className="mb-4">
//                   <label className="block text-[#ff9a3c]">Email *</label>
//                   <input
//                     type="email"
//                     name="email"
//                     placeholder="Enter your email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-gray-300 rounded-md"
//                   />
//                 </div>
//                 <div className="mb-4 relative">
//                   <label className="block text-[#ff9a3c]">Password *</label>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     placeholder="Enter your password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-gray-300 rounded-md"
//                   />
//                   <span
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-9 cursor-pointer text-[#0e0d0d]"
//                   >
//                     {showPassword ? (
//                       <AiOutlineEyeInvisible />
//                     ) : (
//                       <AiOutlineEye />
//                     )}
//                   </span>
//                 </div>
//                 <div className="mt-1">
//                   <button
//                     type="button"
//                     onClick={handleForgotPassword}
//                     className="text-[#ff9a3c] underline hover:translate-x-1 transition duration-200 ease-in-out"
//                   >
//                     Forgot Password?
//                   </button>
//                 </div>
//                 <div className="mt-4 flex justify-center">
//                   <button
//                     type="submit"
//                     className={`w-1/4 bg-[#406882] text-[#ffffff] p-2 rounded-md hover:translate-x-1 transition duration-200 ease-in-out ${
//                       loading ? "opacity-50" : ""
//                     }`}
//                     disabled={loading}
//                   >
//                     {loading ? "Logging in..." : "Login"}
//                   </button>
//                 </div>
//               </>
//             )}
//           </form>
//           <div className="mt-6 text-center">
//             <button
//               className="text-[#ff9a3c] underline hover:translate-x-1 transition duration-200 ease-in-out hover:text-[#c48042]"
//               onClick={toggleLoginMethod}
//             >
//               {showOtpLogin ? "Back to Email Login" : "Login with OTP"}
//             </button>
//           </div>
//           <div className="mt-4 text-center flex justify-center sm:text-sm md:text-base">
//             <p className="text-[#ff9a3c]">Don't have an account?</p>
//             <button
//               className="ml-2 text-md text-[#ff9a3c] hover:text-[#c48042] hover:translate-x-1 transition duration-200 ease-in-out flex items-center gap-1"
//               onClick={() => navigate("/registration")}
//             >
//               <FaArrowRightFromBracket />
//               Register
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;

import React, { useState } from "react";
import LOGO from "../assets/Ollato_Logo_CC-03.png";
import { useNavigate } from "react-router-dom";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Notification from "../components/Notification/Notification";
import { useAuth } from "../context/UserContext.jsx";
import { useNotification } from "../context/NotificationContext.jsx";

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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFEADB] h-full">
      <div className="w-2/4 md:w-2/4 bg-[#406882] flex items-center justify-center p-14">
        <img src={LOGO} alt="Logo" className="w-1/2 md:w-3/4 h-auto " />
      </div>

      <div className=" w-2/4 md:w-2/4 p-8 mt-20 h-full ">
        <div className="bg-[#FFEADB] p-8 border border-[#ff9a3c] rounded-lg shadow-lg w-full max-w-md mx-auto ">
          <h1 className="text-2xl text-[#ff9a3c] font-semibold mb-6 text-center">
            {showOtpLogin ? "Login with OTP" : "Welcome Back"}
          </h1>
          <form onSubmit={handleSubmit}>
            {showOtpLogin ? (
              <>
                <div className="mb-4">
                  <label className="block text-[#ff9a3c]">Phone Number *</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                {otpSent && (
                  <div className="mb-4">
                    <label className="block text-[#ff9a3c]">Enter OTP *</label>
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter OTP sent to your phone"
                      value={formData.otp}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                    className={`w-1/2 bg-[#406882] text-[#ffffff] p-2 rounded-md ${
                      loading ? "opacity-50" : ""
                    }`}
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
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className={`text-[#ff9a3c] underline hover:text-[#c48042] transition duration-200 ${
                        loading ? "opacity-50" : ""
                      }`}
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-[#ff9a3c]">Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4 relative">
                  <label className="block text-[#ff9a3c]">Password *</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 cursor-pointer text-[#0e0d0d]"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible />
                    ) : (
                      <AiOutlineEye />
                    )}
                  </span>
                </div>
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[#ff9a3c] underline hover:translate-x-1 transition duration-200 ease-in-out"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    type="submit"
                    className={`w-1/4 bg-[#406882] text-[#ffffff] p-2 rounded-md hover:translate-x-1 transition duration-200 ease-in-out ${
                      loading ? "opacity-50" : ""
                    }`}
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </div>
              </>
            )}
          </form>
          <div className="mt-6 text-center">
            <button
              className="text-[#ff9a3c] underline hover:translate-x-1 transition duration-200 ease-in-out hover:text-[#c48042]"
              onClick={toggleLoginMethod}
            >
              {showOtpLogin ? "Back to Email Login" : "Login with OTP"}
            </button>
          </div>
          <div className="mt-4 text-center flex justify-center sm:text-sm md:text-base">
            <p className="text-[#ff9a3c]">Don't have an account?</p>
            <button
              className="ml-2 text-md text-[#ff9a3c] hover:text-[#c48042] hover:translate-x-1 transition duration-200 ease-in-out flex items-center gap-1"
              onClick={() => navigate("/registration")}
            >
              <FaArrowRightFromBracket />
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
