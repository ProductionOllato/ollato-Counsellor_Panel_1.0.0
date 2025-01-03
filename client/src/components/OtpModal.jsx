// import React from "react";

// const OtpModal = ({
//   otp,
//   setOtp,
//   handleOtpVerification,
//   setOtpModal,
//   isVerifying,
// }) => {
//   // Update OTP on input change
//   const handleInputChange = (index, value) => {
//     const newOtp = otp.split("");
//     newOtp[index] = value.slice(-1); // Ensure only one digit is accepted
//     setOtp(newOtp.join(""));

//     // Focus next input field if the value is entered
//     if (value && index < 3) {
//       document.getElementById(`otp-input-${index + 1}`).focus();
//     }
//   };

//   // Handle backspace to focus previous input
//   const handleInputKeyDown = (index, event) => {
//     if (event.key === "Backspace" && index > 0 && !otp[index]) {
//       document.getElementById(`otp-input-${index - 1}`).focus();
//     }
//   };

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
//       <div className="bg-[#FFEADB] p-6 rounded-xl shadow-xl w-11/12 md:w-1/3">
//         <h3 className="text-2xl font-bold text-center mb-6 text-slate-900">
//           Verify OTP
//         </h3>

//         <div className="flex items-center justify-center gap-4">
//           {Array(4)
//             .fill(0)
//             .map((_, index) => (
//               <input
//                 key={index}
//                 type="text"
//                 id={`otp-input-${index}`}
//                 className="w-16 h-16 text-center text-2xl font-extrabold bg-slate-100 rounded-lg border-2 border-gray-300 focus:border-[#182d46] focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200"
//                 pattern="\d*"
//                 maxLength="1"
//                 value={otp[index] || ""} // control input value
//                 onChange={(e) => handleInputChange(index, e.target.value)}
//                 onKeyDown={(e) => handleInputKeyDown(index, e)}
//                 aria-label={`OTP digit ${index + 1}`}
//               />
//             ))}
//         </div>

//         <div className="flex justify-evenly gap-4 mt-8 ">
//           <button
//             type="button"
//             onClick={() => setOtpModal(false)}
//             className="w-full md:w-1/2 bg-[#c2394e] text-white text-lg py-2 rounded-md shadow-sm hover:bg-[#c34a5e] focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200 mt-2 md:mt-0"
//           >
//             Close
//           </button>
//           <button
//             type="button"
//             onClick={handleOtpVerification}
//             className="w-full md:w-1/2 bg-[#7360DF] text-white text-lg py-2 rounded-md shadow-sm hover:bg-[#7c5db9] focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-200"
//           >
//             {isVerifying ? "Verifying..." : "Verify"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OtpModal;

// import React from "react";
// import '../styles/OtpModal.css';

// const OtpModal = ({
//   otp,
//   setOtp,

//   handleOtpVerification,
//   setOtpModal,
//   isVerifying,
//   message,
// }) => {
//   const handleInputChange = (index, value) => {
//     const newOtp = otp.split("");
//     newOtp[index] = value.slice(-1);
//     setOtp(newOtp.join(""));

//     if (value && index < 3) {
//       document.getElementById(`otp-input-${index + 1}`).focus();
//     }
//   };

//   const handleInputKeyDown = (index, event) => {
//     if (event.key === "Backspace" && index > 0 && !otp[index]) {
//       document.getElementById(`otp-input-${index - 1}`).focus();
//     }
//   };

//   return (
//     <div className="otp-modal-overlay">
//       <div className="">
//         <button className="close-otp-modal" onClick={() => setOtpModal(false)} aria-label="Close">X</button>
//       </div>
//       <div className="otp-modal-container">
//         <h3 className="otp-modal-title">Please Enter OTP</h3>
//         <div className="otp-modal-message">
//           <p className="otp-modal-message-text">{message}</p>
//         </div>

//         <div className="otp-modal-input-wrapper">
//           {Array(4)
//             .fill(0)
//             .map((_, index) => (
//               <input
//                 key={index}
//                 type="text"
//                 id={`otp-input-${index}`}
//                 className="otp-modal-input"
//                 pattern="\d*"
//                 maxLength="1"
//                 value={otp[index] || ""}
//                 onChange={(e) => handleInputChange(index, e.target.value)}
//                 onKeyDown={(e) => handleInputKeyDown(index, e)}
//                 aria-label={`OTP digit ${index + 1}`}
//                 autoComplete="one-time-code" // To optimize for auto-fill
//               />
//             ))}
//         </div>
//         <div>
//           <P>verification code : <span>timer function </span></P>
//         </div>
//         <div className="otp-modal-resend">
//           <p className="otp-modal-resend-text">Did Not receive OTP ? <span className="otp-modal-resend-link" onClick={() => setOtpModal(false)}>Resend OTP</span></p>
//         </div>

//         <div className="otp-modal-button-wrapper">
//           <button
//             type="button"
//             onClick={() => setOtpModal(false)}
//             className={`otp-modal-button otp-modal-button-close`}
//           >
//             Close
//           </button>
//           <button
//             type="button"
//             onClick={handleOtpVerification}
//             className={`otp-modal-button otp-modal-button-verify`}
//           >
//             {isVerifying ? "Verifying..." : "Verify"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OtpModal;

import React, { useState, useEffect } from "react";
import "../styles/OtpModal.css";

const OtpModal = ({
  otp,
  setOtp,
  handleOtpVerification,
  setOtpModal,
  isVerifying,
  message,
  resendOtp,
}) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(true);

  // Effect to handle the OTP timer countdown
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
  }, [timeLeft, isTimerActive]);

  // Resend OTP and reset the timer
  const handleResendOtp = () => {
    resendOtp();
    setTimeLeft(60);
    setIsTimerActive(true);
  };

  // Handle input change for OTP inputs
  const handleInputChange = (index, value) => {
    const newOtp = otp.split("");
    newOtp[index] = value.slice(-1); // Update the specific index
    setOtp(newOtp.join("")); // Concat to a string

    if (value && index < 3) {
      document.getElementById(`otp-input-${index + 1}`).focus(); // Focus on next input
    }
  };

  // Handle keydown event for navigation purposes
  const handleInputKeyDown = (index, event) => {
    if (event.key === "Backspace" && index > 0 && !otp[index]) {
      document.getElementById(`otp-input-${index - 1}`).focus(); // Move focus back
    }
  };

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal-container">
        <button
          className="close-otp-modal"
          onClick={() => setOtpModal(false)}
          aria-label="Close"
        >
          &times;
        </button>

        <h3 className="otp-modal-title">Please Enter OTP</h3>
        <p className="otp-modal-message">{message}</p>

        <div className="otp-modal-input-wrapper">
          {Array.from({ length: 4 }, (_, index) => (
            <input
              key={index}
              type="text"
              id={`otp-input-${index}`}
              className="otp-modal-input"
              maxLength="1"
              value={otp[index] || ""}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(index, e)}
              aria-label={`OTP digit ${index + 1}`}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        <div className="otp-timer-wrapper">
          <p className="otp-timer">
            Verification code expires in: <span>{timeLeft}s</span>
          </p>
          <button
            className={`otp-resend-button ${isTimerActive ? "disabled" : ""}`}
            onClick={handleResendOtp}
            disabled={isTimerActive}
          >
            Resend
          </button>
        </div>

        <div className="otp-modal-button-wrapper">
          <button
            type="button"
            onClick={handleOtpVerification}
            className="otp-modal-button otp-modal-button-verify"
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
};


export default OtpModal;
