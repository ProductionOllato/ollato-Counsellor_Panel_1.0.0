// import React, { useEffect, useState, useMemo } from "react";
// import { useNotification } from "../context/NotificationContext";
// import axios from "axios";
// import { useAuth } from "../context/UserContext";

// const statuses = [
//   "Booked",
//   "Ongoing",
//   "Requested",
//   "Completed",
//   "Cancelled",
//   "Rescheduled",
// ];

// function SessionManagement() {
//   const [activeStatus, setActiveStatus] = useState("");
//   const [sessions, setSessions] = useState([]);
//   const [editSession, setEditSession] = useState(null);
//   const [newStatus, setNewStatus] = useState("");
//   const [rescheduleSession, setRescheduleSession] = useState(null);
//   const [newDate, setNewDate] = useState("");
//   const [newTime, setNewTime] = useState("");

//   const [cancelSession, setCancelSession] = useState(null);
//   const [cancelReason, setCancelReason] = useState("");

//   const { triggerNotification } = useNotification();
//   const { user } = useAuth();
//   const counsellor_id = user?.user_id;
//   const APIURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;

//   // Fetch sessions from backend API
//   useEffect(() => {
//     fetchSessions();
//   }, [counsellor_id]);

//   const fetchSessions = async () => {
//     try {
//       const response = await axios.get(
//         `${APIURL}/session/get-sessions?counsellor_id=${counsellor_id}`
//       );
//       // console.log("Response get sessions:", response.data);
//       // Sort sessions by date to show the most recent ones at the top
//       const sortedSessions = response.data.sort(
//         (a, b) => new Date(b.b_date) - new Date(a.b_date)
//       );
//       setSessions(sortedSessions);
//     } catch (err) {
//       triggerNotification("Failed to fetch sessions.", "error");
//     }
//   };

//   // Handle status filtering
//   const filteredSessions = useMemo(() => {
//     return activeStatus === ""
//       ? sessions
//       : sessions.filter(
//           (session) => session.status_for_counsellor === activeStatus
//         );
//   }, [activeStatus, sessions]);

//   // Handle session actions (accept, decline, cancel, reschedule)
//   const handleAcceptRequest = async (sessionId) => {
//     console.log("sessionId:", sessionId);
//     const payload = {
//       session_id: sessionId,
//     };
//     try {
//       await axios.post(
//         `${APIURL}/session/accept-booking-request-counsellor`,
//         payload
//       );
//       setSessions((prevSessions) =>
//         prevSessions.map((session) =>
//           session.session_id === sessionId
//             ? { ...session, status_for_counsellor: "Booked" }
//             : session
//         )
//       );
//       triggerNotification("Request accepted successfully.", "success");
//     } catch (err) {
//       triggerNotification("Failed to accept the request.", "error");
//     }
//   };

//   const handleDeclineRequestByStudent = async (sessionId) => {
//     try {
//       await axios.post(`${APIURL}/session/decline-request`, { sessionId });
//       setSessions((prevSessions) =>
//         prevSessions.map((session) =>
//           session.session_id === sessionId
//             ? { ...session, status_for_counsellor: "Cancelled" }
//             : session
//         )
//       );
//       triggerNotification("Request declined successfully.", "success");
//     } catch (err) {
//       triggerNotification("Failed to decline request.", "error");
//     }
//   };

//   const handleCancelRequestByCounsellor = async (
//     sessionId,
//     reason_of_cancellation
//   ) => {
//     // console.log("sessionId:", sessionId);
//     // console.log("reason_of_cancellation:", reason_of_cancellation);

//     const payload = {
//       session_id: sessionId,
//       counsellor_id: counsellor_id,
//       reason_of_cancellation: reason_of_cancellation,
//     };
//     // console.log("Payload:", payload);

//     try {
//       await axios.post(`${APIURL}/session/cancel-by-counsellor`, payload);
//       console.log("Response cancel by counsellor:", response.data);

//       setSessions((prevSessions) =>
//         prevSessions.map((session) =>
//           session.session_id === sessionId
//             ? { ...session, status_for_counsellor: "Cancelled" }
//             : session
//         )
//       );
//       triggerNotification("Session cancelled successfully.", "success");
//     } catch (err) {
//       triggerNotification("Failed to cancel session.", "error");
//     }
//   };

//   const openCancelModal = (session) => {
//     setCancelSession(session); // Store session details in state
//     setCancelReason(""); // Reset reason input
//   };

//   const handleConfirmCancellation = () => {
//     console.log("cancelSession:", cancelSession);

//     if (!cancelReason.trim()) {
//       triggerNotification("Please provide a reason for cancellation.", "error");
//       return;
//     }
//     handleCancelRequestByCounsellor(cancelSession.session_id, cancelReason); // Call API
//     setCancelSession(null); // Close modal
//   };

//   const handleCancelCancel = () => {
//     setCancelSession(null); // Close modal
//   };

//   const handleReschedule = (session) => {
//     setRescheduleSession(session);
//   };

//   const handleRescheduleSave = async () => {
//     if (!newDate || !newTime) {
//       triggerNotification("Please select both a date and a time.", "error");
//       return;
//     }
//     try {
//       // Make API request to reschedule session (updated to PUT)
//       await axios.put(`${APIURL}/reschedule`, {
//         sessionId: rescheduleSession.session_id,
//         newDate,
//         newTime,
//       });
//       setSessions((prevSessions) =>
//         prevSessions.map((session) =>
//           session.session_id === rescheduleSession.session_id
//             ? { ...session, b_date: new Date(`${newDate}T${newTime}`) }
//             : session
//         )
//       );
//       setRescheduleSession(null);
//       triggerNotification("Session rescheduled successfully.", "success");
//     } catch (err) {
//       triggerNotification("Failed to reschedule session.", "error");
//     }
//   };

//   const handleCancelReschedule = () => {
//     setRescheduleSession(null);
//     setNewDate("");
//     setNewTime("");
//   };

//   const handleUpdateSession = async () => {
//     if (!newStatus) {
//       triggerNotification("Please select a valid status.", "error");
//       return;
//     }
//     try {
//       await axios.put(`${APIURL}/session/update-status`, {
//         sessionId: editSession.session_id,
//         newStatus,
//       });
//       setSessions((prevSessions) =>
//         prevSessions.map((session) =>
//           session.session_id === editSession.session_id
//             ? { ...session, status_for_counsellor: newStatus }
//             : session
//         )
//       );
//       setEditSession(null);
//       triggerNotification("Session updated successfully.", "success");
//     } catch (err) {
//       triggerNotification("Failed to update session.", "error");
//     }
//   };

//   return (
//     <div className="w-full mt-4 pt-2 bg-white shadow-lg rounded-lg">
//       {/* <h1 className="text-2xl font-bold mb-8 text-center">
//         Session Management
//       </h1> */}

//       <div className="text-center mb-8">
//         <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
//           Counsellor Session Management
//         </h1>
//         <p className="text-sm text-slate-600">
//           Manage and organize your counselling sessions effectively.
//         </p>
//       </div>

//       {/* Status Filter */}
//       <div className="flex justify-around mb-6">
//         <button
//           onClick={() => setActiveStatus("")}
//           className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
//             activeStatus === ""
//               ? "bg-[#7047A3] text-white"
//               : "bg-gray-200 text-gray-800"
//           }`}
//         >
//           All
//         </button>
//         {statuses.map((status) => (
//           <button
//             key={status}
//             onClick={() => setActiveStatus(status)}
//             className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
//               activeStatus === status
//                 ? "bg-[#7047A3] text-white"
//                 : "bg-gray-200 text-gray-800"
//             }`}
//           >
//             {status}
//           </button>
//         ))}
//       </div>

//       {/* Sessions Table */}
//       <SessionTable
//         sessions={filteredSessions}
//         handleAcceptRequest={handleAcceptRequest}
//         handleDeclineRequestByStudent={handleDeclineRequestByStudent}
//         handleCancelRequestByCounsellor={handleCancelRequestByCounsellor}
//         handleReschedule={handleReschedule}
//         handleRescheduleSave={handleRescheduleSave}
//         rescheduleSession={rescheduleSession}
//         newDate={newDate}
//         setNewDate={setNewDate}
//         newTime={newTime}
//         setNewTime={setNewTime}
//         handleCancelReschedule={handleCancelReschedule}
//         handleUpdateSession={handleUpdateSession}
//         newStatus={newStatus}
//         setNewStatus={setNewStatus}
//         openCancelModal={openCancelModal}
//         cancelReason={cancelReason}
//         setCancelReason={setCancelReason}
//         cancelSession={cancelSession}
//         setCancelSession={setCancelSession}
//         handleCancelCancel={handleCancelCancel}
//         handleConfirmCancellation={handleConfirmCancellation}
//       />
//     </div>
//   );
// }
// export default SessionManagement;

// const SessionTable = ({
//   sessions,
//   handleAcceptRequest,
//   handleDeclineRequestByStudent,
//   handleCancelRequestByCounsellor,
//   handleReschedule,
//   handleRescheduleSave,
//   rescheduleSession,
//   newDate,
//   setNewDate,
//   newTime,
//   setNewTime,
//   handleCancelReschedule,
//   openCancelModal,
//   cancelSession,
//   cancelReason,
//   handleCancelCancel,
//   handleConfirmCancellation,
//   setCancelReason,
//   setCancelSession,
// }) => {
//   const ActionButton = ({ label, onClick, colorClass }) => (
//     <button
//       onClick={onClick}
//       className={`px-2 py-1 text-white rounded text-sm ${colorClass} hover:opacity-80`}
//     >
//       {label}
//     </button>
//   );

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Accepted":
//         return "text-green-500";
//       case "Requested":
//         return "text-yellow-500";
//       case "Cancelled":
//         return "text-red-500";
//       default:
//         return "text-gray-700";
//     }
//   };

//   return (
//     <div className="pt-1 bg-white rounded-lg shadow-md relative">
//       <h1 className="text-2xl font-bold mb-6 text-[#7047A3]">
//         Session Managements
//       </h1>

//       <div className="overflow-x-auto">
//         <table className="min-w-full table-auto border-collapse border border-gray-300">
//           <thead className="bg-[#F3F4F6] text-[#7047A3]">
//             <tr>
//               <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
//                 #
//               </th>
//               <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
//                 Session ID
//               </th>
//               <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
//                 Mode
//               </th>
//               <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
//                 Date
//               </th>
//               <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
//                 Time Slot
//               </th>
//               <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
//                 Status
//               </th>
//               <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
//                 Action
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {sessions.map((session, index) => (
//               <tr
//                 key={session.session_id}
//                 className="hover:bg-gray-50 transition-colors"
//               >
//                 <td className="py-3 px-5">{index + 1}</td>
//                 <td className="py-3 px-5">{session.session_id}</td>
//                 <td className="py-3 px-5">{session.b_mode}</td>
//                 <td className="py-3 px-5">
//                   {new Date(session.b_date).toLocaleDateString()}
//                 </td>
//                 <td className="py-3 px-5">{session.b_time_slot}</td>
//                 <td
//                   className={`py-3 px-5 font-semibold ${getStatusColor(
//                     session.status_for_counsellor
//                   )}`}
//                 >
//                   {session.status_for_counsellor}
//                 </td>
//                 <td className="py-3 px-5 text-center">
//                   <div className="flex gap-2">
//                     {session.status_for_counsellor === "Requested" && (
//                       <>
//                         <ActionButton
//                           label="Accept"
//                           onClick={() =>
//                             handleAcceptRequest(session.session_id)
//                           }
//                           colorClass="bg-green-500 hover:bg-green-600"
//                         />
//                         <ActionButton
//                           label="Decline"
//                           // onClick={() =>
//                           //   handleDeclineRequestByStudent(session.session_id)
//                           // }
//                           onClick={() => openCancelModal(session)}
//                           colorClass="bg-red-500 hover:bg-red-600"
//                         />
//                       </>
//                     )}

//                     {session.status_for_counsellor === "Booked" && (
//                       <ActionButton
//                         label="Cancel"
//                         onClick={() => openCancelModal(session)} // Open cancel modal with session details
//                         colorClass="bg-red-500 hover:bg-red-600"
//                       />
//                     )}

//                     {session.status_for_counsellor == "Booked" && (
//                       <ActionButton
//                         label="Reschedule"
//                         onClick={() => handleReschedule(session)}
//                         colorClass="bg-yellow-500 hover:bg-yellow-600"
//                       />
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {rescheduleSession && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
//           onClick={handleCancelReschedule} // Allow click-outside to close the modal
//         >
//           <div
//             className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md"
//             onClick={(e) => e.stopPropagation()} // Prevent click bubbling
//           >
//             <h2 className="font-bold text-lg mb-4 text-[#7047A3]">
//               Reschedule Session
//             </h2>

//             <label
//               className="block text-sm font-semibold text-gray-700 mb-2"
//               htmlFor="date"
//             >
//               Select Date:
//             </label>
//             <input
//               type="date"
//               id="date"
//               value={newDate}
//               onChange={(e) => setNewDate(e.target.value)}
//               className="p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-400"
//             />

//             <div className="my-4">
//               <label
//                 className="block text-sm font-semibold text-gray-700 mb-2"
//                 htmlFor="time"
//               >
//                 Select Time:
//               </label>
//               <select
//                 name="time"
//                 id="time"
//                 value={newTime}
//                 onChange={(e) => setNewTime(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
//               >
//                 {Array.from({ length: 48 }, (_, i) => {
//                   const hours = String(Math.floor(i / 2)).padStart(2, "0");
//                   const minutes = i % 2 === 0 ? "00" : "30";
//                   return (
//                     <option
//                       key={`${hours}:${minutes}`}
//                       value={`${hours}:${minutes}`}
//                     >
//                       {`${hours}:${minutes}`}
//                     </option>
//                   );
//                 })}
//               </select>
//             </div>

//             <div className="flex gap-4">
//               <button
//                 onClick={handleRescheduleSave}
//                 className="bg-[#7047A3] text-white py-2 px-6 rounded-md transition hover:scale-105 disabled:bg-[#D7D3BF] disabled:text-[#22375c]"
//                 disabled={!newDate || !newTime}
//               >
//                 Reschedule
//               </button>
//               <button
//                 onClick={handleCancelReschedule}
//                 className="bg-[#CDC1FF] text-[#213555] py-2 px-6 rounded-md transition hover:scale-105"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Cancel Modal */}
//       {cancelSession && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
//           onClick={handleCancelCancel}
//         >
//           <div
//             className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md"
//             onClick={(e) => e.stopPropagation()} // Prevent click bubbling
//           >
//             <h2 className="font-bold text-lg mb-4 text-[#7047A3]">
//               Cancel Session
//             </h2>
//             <p className="text-gray-700 mb-4">
//               Are you sure you want to cancel this session? Please provide a
//               reason below:
//             </p>
//             <div>
//               <label htmlFor="cancelReason">
//                 Reason:{" "}
//                 <span className="text-[#f86464] text-sm">
//                   Reason must be at least 10 characters long
//                 </span>
//               </label>
//               <textarea
//                 className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 mb-4"
//                 rows="4"
//                 placeholder="Enter reason for cancellation..."
//                 value={cancelReason}
//                 onChange={(e) => setCancelReason(e.target.value)}
//               ></textarea>
//             </div>

//             <div className="flex justify-end gap-4">
//               <button
//                 onClick={handleCancelCancel}
//                 className="bg-[#CDC1FF] text-[#213555] py-2 px-6 rounded-md transition hover:scale-105"
//               >
//                 Close
//               </button>
//               <button
//                 onClick={handleConfirmCancellation}
//                 className="bg-[#7047A3] text-white py-2 px-6 rounded-md transition hover:scale-105"
//               >
//                 Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// import React, { useEffect, useState, useMemo } from "react";
// import { useNotification } from "../context/NotificationContext";
// import axios from "axios";
// import { useAuth } from "../context/UserContext";

// const statuses = [
//   "Booked",
//   "Ongoing",
//   "Requested",
//   "Completed",
//   "Cancelled",
//   "Rescheduled",
// ];

// function SessionManagement() {
//   const [activeStatus, setActiveStatus] = useState("");
//   const [sessions, setSessions] = useState([]);
//   const [cancelSession, setCancelSession] = useState(null);
//   const [cancelReason, setCancelReason] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { triggerNotification } = useNotification();
//   const { user } = useAuth();
//   const counsellor_id = user?.user_id;
//   const APIURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;

//   // Fetch sessions from backend API
//   useEffect(() => {
//     fetchSessions();
//   }, [counsellor_id]);

//   const fetchSessions = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         `${APIURL}/session/get-sessions?counsellor_id=${counsellor_id}`
//       );
//       console.log("Response get sessions:", response.data);

//       const sortedSessions = response.data.sort(
//         (a, b) => new Date(b.b_date) - new Date(a.b_date)
//       );
//       setSessions(sortedSessions);
//     } catch (err) {
//       triggerNotification("Failed to fetch sessions.", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle status filtering
//   const filteredSessions = useMemo(() => {
//     return activeStatus === ""
//       ? sessions
//       : sessions.filter(
//           (session) => session.status_for_counsellor === activeStatus
//         );
//   }, [activeStatus, sessions]);

//   // Handle session actions (accept, decline, cancel)
//   const handleAcceptRequest = async (sessionId) => {
//     const payload = { session_id: sessionId };
//     try {
//       await axios.post(
//         `${APIURL}/session/accept-student-booking-request-by-counsellor`,
//         payload
//       );
//       setSessions((prevSessions) =>
//         prevSessions.map((session) =>
//           session.session_id === sessionId
//             ? { ...session, status_for_counsellor: "Booked" }
//             : session
//         )
//       );
//       triggerNotification("Request accepted successfully.", "success");
//     } catch (err) {
//       triggerNotification("Failed to accept the request.", "error");
//     }
//   };

//   const handleDeclineRequest = async (sessionId) => {
//     const payload = { session_id: sessionId };
//     try {
//       await axios.post(`${APIURL}/session/decline-request`, payload);
//       setSessions((prevSessions) =>
//         prevSessions.map((session) =>
//           session.session_id === sessionId
//             ? { ...session, status_for_counsellor: "Cancelled" }
//             : session
//         )
//       );
//       triggerNotification("Request declined successfully.", "success");
//     } catch (err) {
//       triggerNotification("Failed to decline request.", "error");
//     }
//   };

//   const handleCancelRequest = async () => {
//     if (!cancelReason.trim()) {
//       triggerNotification("Please provide a reason for cancellation.", "error");
//       return;
//     }
//     const payload = {
//       session_id: cancelSession.session_id,
//       counsellor_id,
//       reason_of_cancellation: cancelReason,
//     };
//     try {
//       await axios.post(`${APIURL}/session/cancel-by-counsellor`, payload);
//       setSessions((prevSessions) =>
//         prevSessions.map((session) =>
//           session.session_id === cancelSession.session_id
//             ? { ...session, status_for_counsellor: "Cancelled" }
//             : session
//         )
//       );
//       triggerNotification("Session cancelled successfully.", "success");
//     } catch (err) {
//       triggerNotification("Failed to cancel session.", "error");
//     } finally {
//       setCancelSession(null);
//       setCancelReason("");
//     }
//   };

//   const openCancelModal = (session) => {
//     setCancelSession(session);
//     setCancelReason("");
//   };

//   return (
//     <div className="w-full mt-4 pt-2 bg-white shadow-lg rounded-lg">
//       <div className="text-center mb-8">
//         <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
//           Counsellor Session Management
//         </h1>
//         <p className="text-sm text-slate-600">
//           Manage and organize your counselling sessions effectively.
//         </p>
//       </div>

//       {/* Status Filter */}
//       <div className="flex justify-around mb-6">
//         <button
//           onClick={() => setActiveStatus("")}
//           className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
//             activeStatus === ""
//               ? "bg-[#7047A3] text-white"
//               : "bg-gray-200 text-gray-800"
//           }`}
//         >
//           All
//         </button>
//         {statuses.map((status) => (
//           <button
//             key={status}
//             onClick={() => setActiveStatus(status)}
//             className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
//               activeStatus === status
//                 ? "bg-[#7047A3] text-white"
//                 : "bg-gray-200 text-gray-800"
//             }`}
//           >
//             {status}
//           </button>
//         ))}
//       </div>

//       {/* Sessions Table */}
//       <SessionTable
//         sessions={filteredSessions}
//         handleAcceptRequest={handleAcceptRequest}
//         handleDeclineRequest={handleDeclineRequest}
//         openCancelModal={openCancelModal}
//       />

//       {/* Cancel Modal */}
//       {cancelSession && (
//         <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md">
//             <h2 className="font-bold text-lg mb-4 text-[#7047A3]">
//               Cancel Session
//             </h2>
//             <p className="text-gray-700 mb-4">
//               Are you sure you want to cancel this session? Please provide a
//               reason below:
//             </p>
//             <textarea
//               className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 mb-4"
//               rows="4"
//               placeholder="Enter reason for cancellation..."
//               value={cancelReason}
//               onChange={(e) => setCancelReason(e.target.value)}
//             ></textarea>
//             <div className="flex justify-end gap-4">
//               <button
//                 onClick={() => setCancelSession(null)}
//                 className="bg-[#CDC1FF] text-[#213555] py-2 px-6 rounded-md transition hover:scale-105"
//               >
//                 Close
//               </button>
//               <button
//                 onClick={handleCancelRequest}
//                 className="bg-[#7047A3] text-white py-2 px-6 rounded-md transition hover:scale-105"
//               >
//                 Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default SessionManagement;

// const SessionTable = ({
//   sessions,
//   handleAcceptRequest,
//   handleDeclineRequest,
//   openCancelModal,
// }) => {
//   return (
//     <div className="pt-1 bg-white rounded-lg shadow-md relative">
//       <h1 className="text-2xl font-bold mb-6 text-[#7047A3]">Sessions</h1>
//       <div className="overflow-x-auto">
//         <table className="min-w-full table-auto border-collapse border border-gray-300">
//           <thead className="bg-[#F3F4F6] text-[#7047A3]">
//             <tr>
//               <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
//                 #
//               </th>
//               <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
//                 Session ID
//               </th>
//               <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
//                 Mode
//               </th>
//               <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
//                 Date
//               </th>
//               <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
//                 Time Slot
//               </th>
//               <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
//                 Status
//               </th>
//               <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
//                 Action
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {sessions.map((session, index) => (
//               <tr
//                 key={session.session_id}
//                 className="hover:bg-gray-50 transition-colors"
//               >
//                 <td className="py-3 px-5">{index + 1}</td>
//                 <td className="py-3 px-5">{session.session_id}</td>
//                 <td className="py-3 px-5">{session.b_mode}</td>
//                 <td className="py-3 px-5">
//                   {new Date(session.b_date).toLocaleDateString()}
//                 </td>
//                 <td className="py-3 px-5">{session.b_time_slot}</td>
//                 <td
//                   className={`py-3 px-5 font-semibold ${getStatusColor(
//                     session.status_for_counsellor
//                   )}`}
//                 >
//                   {session.status_for_counsellor}
//                 </td>
//                 <td className="py-3 px-5 text-center">
//                   <div className="flex gap-2">
//                     {session.status_for_counsellor === "Requested" && (
//                       <>
//                         <ActionButton
//                           label="Accept"
//                           onClick={() =>
//                             handleAcceptRequest(session.session_id)
//                           }
//                           colorClass="bg-green-500 hover:bg-green-600"
//                         />
//                         <ActionButton
//                           label="Decline"
//                           onClick={() =>
//                             handleDeclineRequest(session.session_id)
//                           }
//                           colorClass="bg-red-500 hover:bg-red-600"
//                         />
//                       </>
//                     )}
//                     {session.status_for_counsellor === "Booked" && (
//                       <ActionButton
//                         label="Cancel"
//                         onClick={() => openCancelModal(session)}
//                         colorClass="bg-red-500 hover:bg-red-600"
//                       />
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// const ActionButton = ({ label, onClick, colorClass }) => (
//   <button
//     onClick={onClick}
//     className={`px-2 py-1 text-white rounded text-sm ${colorClass} hover:opacity-80`}
//   >
//     {label}
//   </button>
// );

// const getStatusColor = (status) => {
//   switch (status) {
//     case "Booked":
//       return "text-green-500";
//     case "Requested":
//       return "text-yellow-500";
//     case "Cancelled":
//       return "text-red-500";
//     default:
//       return "text-gray-700";
//   }
// };

import React, { useEffect, useState, useMemo } from "react";
import { useNotification } from "../context/NotificationContext";
import axios from "axios";
import { useAuth } from "../context/UserContext";

const statuses = [
  "Booked",
  "Ongoing",
  "Requested",
  "Completed",
  "Cancelled",
  "Rescheduled",
];

function SessionManagement() {
  const [activeStatus, setActiveStatus] = useState("");
  const [sessions, setSessions] = useState([]);
  const [cancelSession, setCancelSession] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [rescheduleSession, setRescheduleSession] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState({
    start_time: "",
    end_time: "",
  });
  const [newMode, setNewMode] = useState("video"); // Default mode

  const { triggerNotification } = useNotification();
  const { user } = useAuth();
  const counsellor_id = user?.user_id;
  const APIURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;

  // Fetch sessions from backend API
  useEffect(() => {
    fetchSessions();
  }, [counsellor_id]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${APIURL}/session/get-sessions?counsellor_id=${counsellor_id}`
      );
      const sortedSessions = response.data.sort(
        (a, b) => new Date(b.b_date) - new Date(a.b_date)
      );
      setSessions(sortedSessions);
    } catch (err) {
      triggerNotification("Failed to fetch sessions.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle status filtering
  const filteredSessions = useMemo(() => {
    return activeStatus === ""
      ? sessions
      : sessions.filter(
          (session) => session.status_for_counsellor === activeStatus
        );
  }, [activeStatus, sessions]);

  // Handle session actions (accept, decline, cancel)
  const handleAcceptRequest = async (sessionId) => {
    const payload = { session_id: sessionId };
    try {
      await axios.post(
        `${APIURL}/session/accept-booking-request-counsellor`,
        payload
      );
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.session_id === sessionId
            ? { ...session, status_for_counsellor: "Booked" }
            : session
        )
      );
      triggerNotification("Request accepted successfully.", "success");
    } catch (err) {
      triggerNotification("Failed to accept the request.", "error");
    }
  };

  // const handleDeclineRequest = async (sessionId) => {
  //   const payload = {
  //     session_id: sessionId,
  //     counsellor_id: counsellor_id,
  //     reason_of_cancellation: cancelReason,
  //   };
  //   try {
  //     await axios.post(`${APIURL}/session/cancel-by-counsellor`, payload);
  //     setSessions((prevSessions) =>
  //       prevSessions.map((session) =>
  //         session.session_id === sessionId
  //           ? { ...session, status_for_counsellor: "Cancelled" }
  //           : session
  //       )
  //     );
  //     triggerNotification("Request declined successfully.", "success");
  //   } catch (err) {
  //     triggerNotification("Failed to decline request.", "error");
  //   }
  // };

  const handleDeclineRequest = async (sessionId) => {
    if (!cancelReason.trim()) {
      triggerNotification("Please provide a reason for cancellation.", "error");
      return;
    }

    const payload = {
      session_id: sessionId,
      counsellor_id: counsellor_id,
      reason_of_cancellation: cancelReason,
    };

    try {
      const response = await axios.post(
        `${APIURL}/session/cancel-by-counsellor`,
        payload
      );
      console.log("Decline request response:", response);

      if (response.status === 200) {
        setSessions((prevSessions) =>
          prevSessions.map((session) =>
            session.session_id === sessionId
              ? { ...session, status_for_counsellor: "Cancelled" }
              : session
          )
        );
        triggerNotification("Request declined successfully.", "success");
      } else {
        throw new Error(response.data?.message || "Failed to decline request.");
      }
    } catch (err) {
      console.error("Decline request error:", err);
      triggerNotification(err.message || "Failed to decline request.", "error");
    }
  };

  const handleCancelRequest = async () => {
    if (!cancelReason.trim()) {
      triggerNotification("Please provide a reason for cancellation.", "error");
      return;
    }
    const payload = {
      session_id: cancelSession.session_id,
      counsellor_id,
      reason_of_cancellation: cancelReason,
    };
    try {
      await axios.post(`${APIURL}/session//cancel-by-counsellor`, payload);
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.session_id === cancelSession.session_id
            ? { ...session, status_for_counsellor: "Cancelled" }
            : session
        )
      );
      console.log("cancelSession:", cancelSession);

      triggerNotification("Session cancelled successfully.", "success");
    } catch (err) {
      triggerNotification("Failed to cancel session.", "error");
    } finally {
      setCancelSession(null);
      setCancelReason("");
    }
  };

  const openCancelModal = (session) => {
    setCancelSession(session);
    setCancelReason("");
  };

  const openRescheduleModal = (session) => {
    setRescheduleSession(session);
    setNewDate(""); // Reset new date
    setNewTimeSlot({ start_time: "", end_time: "" }); // Reset new time
    setNewMode(session.b_mode); // Set current mode
  };

  // const handleRescheduleSave = async () => {
  //   if (!newDate || !newTime) {
  //     triggerNotification("Please select both a date and a time.", "error");
  //     return;
  //   }
  //   console.log("rescheduleSession:", rescheduleSession);

  //   const payload = {
  //     sessionId: rescheduleSession.session_id,
  //     newDate,
  //     newTime,
  //     newMode,
  //   };
  //   try {
  //     await axios.put(`${APIURL}/reschedule`, payload);
  //     setSessions((prevSessions) =>
  //       prevSessions.map((session) =>
  //         session.session_id === rescheduleSession.session_id
  //           ? {
  //               ...session,
  //               b_date: newDate,
  //               b_time_slot: `${newTime} to ${newTime}`,
  //             }
  //           : session
  //       )
  //     );
  //     setRescheduleSession(null);
  //     triggerNotification("Session rescheduled successfully.", "success");
  //   } catch (err) {
  //     triggerNotification("Failed to reschedule session.", "error");
  //   }
  // };

  const handleRescheduleSave = async () => {
    if (!newDate || !newTimeSlot.start_time || !newTimeSlot.end_time) {
      triggerNotification(
        "Please select a date and a valid time range.",
        "error"
      );
      return;
    }

    if (newTimeSlot.start_time >= newTimeSlot.end_time) {
      triggerNotification("Start time must be earlier than end time.", "error");
      return;
    }

    console.log("Rescheduling session:", rescheduleSession);

    const payload = {
      session_id: rescheduleSession.session_id,
      new_r_date: newDate,
      new_r_time: `${newTimeSlot.start_time} to ${newTimeSlot.end_time}`,
      new_r_duration: rescheduleSession.b_duration,
      new_r_mode: newMode,
    };

    try {
      const response = await axios.put(`${APIURL}/session/reschedule`, payload);

      if (response.status === 200) {
        setSessions((prevSessions) =>
          prevSessions.map((session) =>
            session.session_id === rescheduleSession.session_id
              ? {
                  ...session,
                  b_date: newDate,
                  b_time_slot: `${newTimeSlot.start_time} to ${newTimeSlot.end_time}`,
                  b_mode: newMode,
                }
              : session
          )
        );
        setRescheduleSession(null); // Clear modal state
        triggerNotification("Session rescheduled successfully.", "success");
      } else {
        throw new Error(response.data?.message || "Rescheduling failed.");
      }
    } catch (err) {
      console.error("Rescheduling error:", err);
      triggerNotification(
        err.message || "Failed to reschedule session.",
        "error"
      );
    }
  };

  return (
    <div className="w-full mt-4 pt-2 bg-white shadow-lg rounded-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
          Counsellor Session Management
        </h1>
        <p className="text-sm text-slate-600">
          Manage and organize your counselling sessions effectively.
        </p>
      </div>

      {/* Status Filter */}
      <div className="flex justify-around mb-6">
        <button
          onClick={() => setActiveStatus("")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeStatus === ""
              ? "bg-[#7047A3] text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          All
        </button>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeStatus === status
                ? "bg-[#7047A3] text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Sessions Table */}
      <SessionTable
        sessions={filteredSessions}
        handleAcceptRequest={handleAcceptRequest}
        handleDeclineRequest={handleDeclineRequest}
        openCancelModal={openCancelModal}
        openRescheduleModal={openRescheduleModal}
      />

      {/* Cancel Modal */}
      {cancelSession && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md">
            <h2 className="font-bold text-lg mb-4 text-[#7047A3]">
              Cancel Session
            </h2>
            <p className="text-gray-700 mb-4">
              Are you sure you want to cancel this session? Please provide a
              reason below:
            </p>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 mb-4"
              rows="4"
              placeholder="Enter reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setCancelSession(null)}
                className="bg-[#CDC1FF] text-[#213555] py-2 px-6 rounded-md transition hover:scale-105"
              >
                Close
              </button>
              <button
                onClick={handleCancelRequest}
                className="bg-[#7047A3] text-white py-2 px-6 rounded-md transition hover:scale-105"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleSession && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md">
            <h2 className="font-bold text-lg mb-4 text-[#7047A3]">
              Reschedule Session
            </h2>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Date:
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-400"
            />
            <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
              Select Start Time:
            </label>
            <select
              value={newTimeSlot.start_time}
              onChange={(e) =>
                setNewTimeSlot((prev) => ({
                  ...prev,
                  start_time: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            >
              {Array.from({ length: 48 }, (_, i) => {
                const hours = String(Math.floor(i / 2)).padStart(2, "0");
                const minutes = i % 2 === 0 ? "00" : "30";
                return (
                  <option
                    key={`${hours}:${minutes}`}
                    value={`${hours}:${minutes}`}
                  >
                    {`${hours}:${minutes}`}
                  </option>
                );
              })}
            </select>

            <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
              Select End Time:
            </label>
            <select
              value={setNewTimeSlot.end_time}
              onChange={(e) =>
                setNewTimeSlot((prev) => ({
                  ...prev,
                  end_time: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            >
              {Array.from({ length: 48 }, (_, i) => {
                const hours = String(Math.floor(i / 2)).padStart(2, "0");
                const minutes = i % 2 === 0 ? "00" : "30";
                return (
                  <option
                    key={`${hours}:${minutes}`}
                    value={`${hours}:${minutes}`}
                  >
                    {`${hours}:${minutes}`}
                  </option>
                );
              })}
            </select>

            <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
              Select Mode:
            </label>
            <select
              value={newMode}
              onChange={(e) => setNewMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            >
              <option value="video">Video</option>
              <option value="in-person">In-person</option>
            </select>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleRescheduleSave}
                className="bg-[#7047A3] text-white py-2 px-6 rounded-md transition hover:scale-105"
              >
                Reschedule
              </button>
              <button
                onClick={() => setRescheduleSession(null)}
                className="bg-[#CDC1FF] text-[#213555] py-2 px-6 rounded-md transition hover:scale-105 ml-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionManagement;

const SessionTable = ({
  sessions,
  handleAcceptRequest,
  handleDeclineRequest,
  openCancelModal,
  openRescheduleModal,
}) => {
  return (
    <div className="pt-1 bg-white rounded-lg shadow-md relative">
      <h1 className="text-2xl font-bold mb-6 text-[#7047A3]">Sessions</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-[#F3F4F6] text-[#7047A3]">
            <tr>
              <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
                #
              </th>
              <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
                Session ID
              </th>
              <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
                Mode
              </th>
              <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
                Date
              </th>
              <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
                Time Slot
              </th>
              <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
                Status
              </th>
              <th className="py-3 px-5 border-b text-center text-sm font-semibold text-gray-600">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.map((session, index) => (
              <tr
                key={session.session_id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-5">{index + 1}</td>
                <td className="py-3 px-5">{session.session_id}</td>
                <td className="py-3 px-5">{session.b_mode}</td>
                <td className="py-3 px-5">
                  {new Date(session.b_date).toLocaleDateString()}
                </td>
                <td className="py-3 px-5">{session.b_time_slot}</td>
                <td
                  className={`py-3 px-5 font-semibold ${getStatusColor(
                    session.status_for_counsellor
                  )}`}
                >
                  {session.status_for_counsellor}
                </td>
                <td className="py-3 px-5 text-center">
                  <div className="flex gap-2">
                    {session.status_for_counsellor === "Requested" && (
                      <>
                        <ActionButton
                          label="Accept"
                          onClick={() =>
                            handleAcceptRequest(session.session_id)
                          }
                          colorClass="bg-green-500 hover:bg-green-600"
                        />
                        <ActionButton
                          label="Decline"
                          // onClick={() =>
                          //   handleDeclineRequest(session.session_id)
                          // }
                          onClick={() => openCancelModal(session)}
                          colorClass="bg-red-500 hover:bg-red-600"
                        />
                      </>
                    )}
                    {session.status_for_counsellor === "Booked" && (
                      <>
                        <ActionButton
                          label="Cancel"
                          onClick={() => openCancelModal(session)}
                          colorClass="bg-red-500 hover:bg-red-600"
                        />
                        <ActionButton
                          label="Reschedule"
                          onClick={() => openRescheduleModal(session)}
                          colorClass="bg-yellow-500 hover:bg-yellow-600"
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ActionButton = ({ label, onClick, colorClass }) => (
  <button
    onClick={onClick}
    className={`px-2 py-1 text-white rounded text-sm ${colorClass} hover:opacity-80`}
  >
    {label}
  </button>
);

const getStatusColor = (status) => {
  switch (status) {
    case "Booked":
      return "text-green-500";
    case "Requested":
      return "text-yellow-500";
    case "Cancelled":
      return "text-red-500";
    default:
      return "text-gray-700";
  }
};
