import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext.jsx";
import LOGO from "../assets/Ollato_Logo_CC-03.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const apiEndpointURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;
  const { triggerNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => setEmail(e.target.value);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
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
    // <div className="min-h-screen flex flex-col md:flex-row justify-center items-center bg-[#FFEADB]">
    //   <div className="w-2/4 md:w-2/4 bg-[#406882] flex items-center justify-center p-14 h-full">
    //     <img src={LOGO} alt="Logo" className="w-1/2 md:w-3/4 h-auto " />
    //   </div>

    //   <div className="bg-white p-8 border border-[#ff9a3c] rounded-lg shadow-lg w-full max-w-md mx-auto z-10">
    //     <h1 className="text-2xl text-[#ff9a3c] font-semibold mb-6 text-center">
    //       Forgot Password
    //     </h1>
    //     <form onSubmit={handleSubmit}>
    //       <div className="mb-4">
    //         <label className="block text-[#ff9a3c]">Email *</label>
    //         <input
    //           type="email"
    //           name="email"
    //           placeholder="Enter your registered email"
    //           value={email}
    //           onChange={handleChange}
    //           className="w-full p-2 border border-gray-300 rounded-md"
    //           required
    //         />
    //       </div>
    //       <div className="mt-4 flex justify-center">
    //         <button
    //           type="submit"
    //           className={`w-1/2 bg-[#406882] text-[#ffffff] p-2 rounded-md ${
    //             loading ? "opacity-50" : ""
    //           }`}
    //           disabled={loading}
    //         >
    //           {loading ? "Processing..." : "Send Reset Link"}
    //         </button>
    //       </div>
    //     </form>
    //     <div className="mt-4 text-center">
    //       <button
    //         className="text-[#ff9a3c] underline hover:translate-x-1 transition duration-200 ease-in-out"
    //         onClick={() => navigate("/")}
    //       >
    //         Back to Login
    //       </button>
    //     </div>
    //   </div>
    // </div>
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side Image Section */}
      <div className="flex-1 bg-[#406882] flex items-center justify-center p-16 md:p-20">
        <img src={LOGO} alt="Logo" className="w-3/4 h-auto md:w-2/3" />
      </div>

      {/* Right Side Reset Form Section */}
      <div className="flex-1 flex justify-center items-center p-8 md:p-16 bg-[#FFEADB]">
        <div className="bg-white p-8 border border-[#ff9a3c] rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl text-[#ff9a3c] font-semibold mb-6 text-center">
            Forgot Password
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-[#ff9a3c]" htmlFor="email">
                Email *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff9a3c] transition"
                required
              />
            </div>

            <div className="mt-4 flex justify-center">
              <button
                type="submit"
                className={`w-1/2 bg-[#406882] text-white p-2 rounded-md transition-opacity duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
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
              onClick={() => navigate("/")}
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
