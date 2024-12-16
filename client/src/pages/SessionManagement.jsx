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

// function SessionManagement() {
//   const [activeStatus, setActiveStatus] = useState("");
//   const [sessions, setSessions] = useState([]);
//   const [editSession, setEditSession] = useState(null);
//   const [newStatus, setNewStatus] = useState("");
//   const [rescheduleSession, setRescheduleSession] = useState(null);
//   const [newDate, setNewDate] = useState("");
//   const [newTime, setNewTime] = useState("");
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
//       console.log("Response get sessions:", response.data);
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
//     try {
//       await axios.post(`${APIURL}/session/accept-request`, { sessionId });
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

//   const handleCancelRequestByCounsellor = async (sessionId) => {
//     try {
//       await axios.post(`${APIURL}/session/cancel-by-counsellor`, { sessionId });
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

//   const handleReschedule = (session) => {
//     setRescheduleSession(session);
//   };

//   const handleRescheduleSave = async () => {
//     if (!newDate || !newTime) {
//       triggerNotification("Please select both a date and a time.", "error");
//       return;
//     }
//     try {
//       // Make API request to reschedule session
//       await axios.post(`${APIURL}/session/rescheduleBooking`, {
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

//   const handleEdit = (session) => {
//     if (
//       ["Completed", "Cancelled", "Ongoing"].includes(
//         session.status_for_counsellor
//       )
//     ) {
//       triggerNotification("Editing not allowed for this session.", "error");
//       return;
//     }
//     setEditSession(session);
//     setNewStatus(session.status_for_counsellor);
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
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-2xl font-bold mb-8 text-center">
//         Session Management
//       </h1>

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
//         handleEdit={handleEdit}
//         handleUpdateSession={handleUpdateSession}
//         newStatus={newStatus}
//         setNewStatus={setNewStatus}
//       />
//     </div>
//   );
// }
function SessionManagement() {
  const [activeStatus, setActiveStatus] = useState("");
  const [sessions, setSessions] = useState([]);
  const [editSession, setEditSession] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [rescheduleSession, setRescheduleSession] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const [cancelSession, setCancelSession] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const { triggerNotification } = useNotification();
  const { user } = useAuth();
  const counsellor_id = user?.user_id;
  const APIURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;

  // Fetch sessions from backend API
  useEffect(() => {
    fetchSessions();
  }, [counsellor_id]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(
        `${APIURL}/session/get-sessions?counsellor_id=${counsellor_id}`
      );
      console.log("Response get sessions:", response.data);
      // Sort sessions by date to show the most recent ones at the top
      const sortedSessions = response.data.sort(
        (a, b) => new Date(b.b_date) - new Date(a.b_date)
      );
      setSessions(sortedSessions);
    } catch (err) {
      triggerNotification("Failed to fetch sessions.", "error");
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

  // Handle session actions (accept, decline, cancel, reschedule)
  const handleAcceptRequest = async (sessionId) => {
    try {
      await axios.post(`${APIURL}/accept-request-counsellor`, { sessionId });
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

  const handleDeclineRequestByStudent = async (sessionId) => {
    try {
      await axios.post(`${APIURL}/cancel-by-student`, { sessionId });
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.session_id === sessionId
            ? { ...session, status_for_counsellor: "Cancelled" }
            : session
        )
      );
      triggerNotification("Request declined successfully.", "success");
    } catch (err) {
      triggerNotification("Failed to decline request.", "error");
    }
  };

  // const handleCancelRequestByCounsellor = async (sessionId) => {
  //   try {
  //     await axios.post(`${APIURL}/cancelBookingByCounsellor`, {
  //       counsellor_id,
  //       sessionId,
  //       reason_of_cancellation,
  //     });
  //     setSessions((prevSessions) =>
  //       prevSessions.map((session) =>
  //         session.session_id === sessionId
  //           ? { ...session, status_for_counsellor: "Cancelled" }
  //           : session
  //       )
  //     );
  //     triggerNotification("Session cancelled successfully.", "success");
  //   } catch (err) {
  //     triggerNotification("Failed to cancel session.", "error");
  //   }
  // };

  const handleCancelRequestByCounsellor = async (
    sessionId,
    reason_of_cancellation
  ) => {
    try {
      await axios.post(`${APIURL}/session/cancel-by-counsellor`, {
        counsellor_id,
        sessionId,
        reason_of_cancellation,
      });
      console.log("Response cancel by counsellor:", response.data);
      
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.session_id === sessionId
            ? { ...session, status_for_counsellor: "Cancelled" }
            : session
        )
      );
      triggerNotification("Session cancelled successfully.", "success");
    } catch (err) {
      triggerNotification("Failed to cancel session.", "error");
    }
  };

  const openCancelModal = (session) => {
    setCancelSession(session); // Store session details in state
    setCancelReason(""); // Reset reason input
  };

  const handleConfirmCancellation = () => {
    if (!cancelReason.trim()) {
      triggerNotification("Please provide a reason for cancellation.", "error");
      return;
    }
    handleCancelRequestByCounsellor(cancelSession.session_id, cancelReason); // Call API
    setCancelSession(null); // Close modal
  };

  const handleCancelCancel = () => {
    setCancelSession(null); // Close modal
  };

  const handleReschedule = (session) => {
    setRescheduleSession(session);
  };

  const handleRescheduleSave = async () => {
    if (!newDate || !newTime) {
      triggerNotification("Please select both a date and a time.", "error");
      return;
    }
    try {
      // Make API request to reschedule session (updated to PUT)
      await axios.put(`${APIURL}/reschedule`, {
        sessionId: rescheduleSession.session_id,
        newDate,
        newTime,
      });
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.session_id === rescheduleSession.session_id
            ? { ...session, b_date: new Date(`${newDate}T${newTime}`) }
            : session
        )
      );
      setRescheduleSession(null);
      triggerNotification("Session rescheduled successfully.", "success");
    } catch (err) {
      triggerNotification("Failed to reschedule session.", "error");
    }
  };

  const handleCancelReschedule = () => {
    setRescheduleSession(null);
    setNewDate("");
    setNewTime("");
  };

  const handleUpdateSession = async () => {
    if (!newStatus) {
      triggerNotification("Please select a valid status.", "error");
      return;
    }
    try {
      await axios.put(`${APIURL}/session/update-status`, {
        sessionId: editSession.session_id,
        newStatus,
      });
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.session_id === editSession.session_id
            ? { ...session, status_for_counsellor: newStatus }
            : session
        )
      );
      setEditSession(null);
      triggerNotification("Session updated successfully.", "success");
    } catch (err) {
      triggerNotification("Failed to update session.", "error");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-8 text-center">
        Session Management
      </h1>

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
        handleDeclineRequestByStudent={handleDeclineRequestByStudent}
        handleCancelRequestByCounsellor={handleCancelRequestByCounsellor}
        handleReschedule={handleReschedule}
        handleRescheduleSave={handleRescheduleSave}
        rescheduleSession={rescheduleSession}
        newDate={newDate}
        setNewDate={setNewDate}
        newTime={newTime}
        setNewTime={setNewTime}
        handleCancelReschedule={handleCancelReschedule}
        handleUpdateSession={handleUpdateSession}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        openCancelModal={openCancelModal}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        cancelSession={cancelSession}
        setCancelSession={setCancelSession}
        handleCancelCancel={handleCancelCancel}
        handleConfirmCancellation={handleConfirmCancellation}
      />
    </div>
  );
}
export default SessionManagement;

const SessionTable = ({
  sessions,
  handleAcceptRequest,
  handleDeclineRequestByStudent,
  handleCancelRequestByCounsellor,
  handleReschedule,
  handleRescheduleSave,
  rescheduleSession,
  newDate,
  setNewDate,
  newTime,
  setNewTime,
  handleCancelReschedule,
  openCancelModal,
  cancelSession,
  cancelReason,
  handleCancelCancel,
  handleConfirmCancellation,
  setCancelReason,
  setCancelSession,
}) => {
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
      case "Accepted":
        return "text-green-500";
      case "Requested":
        return "text-yellow-500";
      case "Cancelled":
        return "text-red-500";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md relative">
      <h1 className="text-2xl font-bold mb-6 text-[#7047A3]">
        Session Management
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-[#F3F4F6]">
            <tr>
              <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
                #
              </th>
              <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
                Session ID
              </th>
              <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
                Mode
              </th>
              <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
                Date
              </th>
              <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
                Time Slot
              </th>
              <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
                Status
              </th>
              <th className="py-3 px-5 border-b text-left text-sm font-semibold text-gray-600">
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
                <td className="py-3 px-5">
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
                          onClick={() =>
                            handleDeclineRequestByStudent(session.session_id)
                          }
                          colorClass="bg-red-500 hover:bg-red-600"
                        />
                      </>
                    )}
                    {/* {session.status_for_counsellor === "Booked" && (
                      <ActionButton
                        label="Cancel"
                        // onClick={() =>
                        //   handleCancelRequestByCounsellor(session.session_id)
                        // }
                        onClick={() => cancelSession()}
                        colorClass="bg-red-500 hover:bg-red-600"
                      />
                    )} */}
                    {session.status_for_counsellor === "Booked" && (
                      <ActionButton
                        label="Cancel"
                        onClick={() => openCancelModal(session)} // Open cancel modal with session details
                        colorClass="bg-red-500 hover:bg-red-600"
                      />
                    )}

                    {session.status_for_counsellor == "Booked" && (
                      <ActionButton
                        label="Reschedule"
                        onClick={() => handleReschedule(session)}
                        colorClass="bg-yellow-500 hover:bg-yellow-600"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rescheduleSession && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
          onClick={handleCancelReschedule} // Allow click-outside to close the modal
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()} // Prevent click bubbling
          >
            <h2 className="font-bold text-lg mb-4 text-[#7047A3]">
              Reschedule Session
            </h2>

            <label
              className="block text-sm font-semibold text-gray-700 mb-2"
              htmlFor="date"
            >
              Select Date:
            </label>
            <input
              type="date"
              id="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="p-2 border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-400"
            />

            <div className="my-4">
              <label
                className="block text-sm font-semibold text-gray-700 mb-2"
                htmlFor="time"
              >
                Select Time:
              </label>
              <select
                name="time"
                id="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
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
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleRescheduleSave}
                className="bg-[#7047A3] text-white py-2 px-6 rounded-md transition hover:scale-105 disabled:bg-[#D7D3BF] disabled:text-[#22375c]"
                disabled={!newDate || !newTime}
              >
                Reschedule
              </button>
              <button
                onClick={handleCancelReschedule}
                className="bg-[#CDC1FF] text-[#213555] py-2 px-6 rounded-md transition hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelSession && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
          onClick={handleCancelCancel}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md"
            onClick={(e) => e.stopPropagation()} // Prevent click bubbling
          >
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
                onClick={handleCancelCancel}
                className="bg-[#CDC1FF] text-[#213555] py-2 px-6 rounded-md transition hover:scale-105"
              >
                Close
              </button>
              <button
                onClick={handleConfirmCancellation}
                className="bg-[#7047A3] text-white py-2 px-6 rounded-md transition hover:scale-105"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
