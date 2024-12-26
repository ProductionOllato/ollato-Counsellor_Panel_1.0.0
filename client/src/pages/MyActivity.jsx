// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNotification } from "../context/NotificationContext";
// import { useAuth } from "../context/UserContext";
// function MyActivity() {
//   const [activityLogs, setActivityLogs] = useState([]);
//   const [selectedSession, setSelectedSession] = useState(null);
//   const [showHistory, setShowHistory] = useState(false);
//   const { triggerNotification } = useNotification();
//   const [joinSession, setJoinSession] = useState(null);
//   const [feedbackSession, setFeedbackSession] = useState(null);
//   const [feedbackText, setFeedbackText] = useState("");

//   const { user } = useAuth();
//   const counsellor_id = user?.user_id;
//   const APIURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;

//   // Fetch activity logs from the backend on component mount
//   useEffect(() => {
//     const fetchActivityLogs = async () => {
//       console.log("Fetching activity logs...");
//       console.log("counsellor_id:", counsellor_id);
//       try {
//         const response = await axios.get(
//           `${APIURL}/myactivity/get-myactivity/${counsellor_id}`
//         );
//         console.log("Activity logs:", response);
//         setActivityLogs(response.data);
//       } catch (error) {
//         triggerNotification("Error fetching activity logs", "error");
//       }
//     };

//     fetchActivityLogs();
//   }, []);

//   const handleGiveFeedback = async (sessionId) => {
//     try {
//       await axios.post(`${APIURL}/api/sessions/${sessionId}/feedback`, {
//         feedback: feedbackText,
//       });
//       setActivityLogs((prev) =>
//         prev.map((session) =>
//           session.session_id === sessionId
//             ? { ...session, feedbackGiven: true }
//             : session
//         )
//       );
//       triggerNotification("Feedback submitted successfully", "success");
//       setFeedbackSession(null);
//       setFeedbackText("");
//     } catch (error) {
//       triggerNotification("Error submitting feedback", "error");
//     }
//   };

//   const handleJoinSession = (session) => {
//     triggerNotification(
//       `Joining session with ID: ${session.session_id}`,
//       "success"
//     );
//     setJoinSession(session);
//   };

//   const isJoinSessionEnabled = (appointmentDate) => {
//     const currentTime = new Date();
//     const sessionTime = new Date(appointmentDate);
//     const diffInMinutes = (sessionTime - currentTime) / (1000 * 60);
//     return diffInMinutes <= 10 && diffInMinutes >= -10;
//   };

//   const determineStatus = (appointmentDate, feedbackGiven) => {
//     const currentTime = new Date();
//     const sessionTime = new Date(appointmentDate);
//     if (feedbackGiven) return "Feedback Given";
//     if (sessionTime < currentTime) return "Completed";
//     return "Upcoming";
//   };

//   // const filteredLogs = showHistory
//   //   ? activityLogs.filter(
//   //       (session) =>
//   //         determineStatus(session.appointmentDate, session.feedbackGiven) ===
//   //         "Completed"
//   //     )
//   //   : activityLogs;

//   const filteredLogs = showHistory
//     ? activityLogs.filter(
//         (session) =>
//           determineStatus(
//             session.r_date || session.b_date,
//             session.feedbackGiven
//           ) === "Completed"
//       )
//     : activityLogs;

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h1 className="text-2xl font-bold mb-6 text-center">My Activity</h1>
//       <div className="flex justify-end mb-4">
//         <button
//           onClick={() => setShowHistory((prev) => !prev)}
//           className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg shadow hover:bg-purple-500"
//         >
//           {showHistory ? "Back to Activity" : "View History"}
//         </button>
//       </div>
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white shadow-md rounded-lg">
//           <thead className="bg-gray-200">
//             <tr>
//               <th className="px-4 py-2">#</th>
//               <th className="px-4 py-2">Session ID</th>
//               <th className="px-4 py-2">Date</th>
//               <th className="px-4 py-2">Time Slot</th>
//               <th className="px-4 py-2">Mode</th>
//               <th className="px-4 py-2">Duration</th>
//               <th className="px-4 py-2">Status</th>
//               <th className="px-4 py-2">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredLogs.map((session, index) => {
//               const sessionDate = session.r_date || session.b_date;
//               const timeSlot = session.b_time_slot || session.r_time;
//               const mode = session.r_mode || session.b_mode;
//               const duration = session.r_duration || session.b_duration;
//               return (
//                 <tr key={session.session_id}>
//                   <td className="px-4 py-3">{index + 1}</td>
//                   <td className="px-4 py-3">{session.session_id}</td>
//                   <td className="px-4 py-3">{sessionDate}</td>
//                   <td className="px-4 py-3">{timeSlot}</td>
//                   <td className="px-4 py-3">{mode}</td>
//                   <td className="px-4 py-3">{duration}</td>
//                   <td className="px-4 py-3">
//                     {determineStatus(sessionDate, session.feedbackGiven)}
//                   </td>
//                   <td className="px-4 py-3">
//                     {" "}
//                     {determineStatus(sessionDate, session.feedbackGiven) ===
//                     "Upcoming" ? (
//                       <button
//                         onClick={() => setFeedbackSession(session)}
//                         className="px-4 py-2 bg-pink-700 text-white text-sm rounded-lg shadow hover:bg-pink-600"
//                       >
//                         Feedback
//                       </button>
//                     ) : (
//                       <button
//                         disabled
//                         className="px-4 py-2 bg-gray-400 text-white text-sm rounded-lg cursor-not-allowed"
//                       >
//                         Completed
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//       {/* Feedback Modal */}
//       {feedbackSession && (
//         <div
//           className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50"
//           onClick={() => setFeedbackSession(null)}
//         >
//           <div
//             className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <h3 className="text-lg lg:text-2xl font-bold text-gray-900 mb-6">
//               Feedback for Session
//             </h3>
//             <textarea
//               value={feedbackText}
//               onChange={(e) => setFeedbackText(e.target.value)}
//               className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               rows="4"
//               placeholder="Please provide your feedback."
//             ></textarea>
//             <div className="flex justify-end">
//               <button
//                 onClick={() => setFeedbackSession(null)}
//                 className="px-4 py-2 bg-gray-300 text-black text-sm rounded-lg mr-2"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => handleGiveFeedback(feedbackSession.session_id)}
//                 className="px-4 py-2 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-600"
//               >
//                 Submit Feedback
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default MyActivity;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/UserContext";
import "../styles/MyActivity.css";

function MyActivity() {
  const [activityLogs, setActivityLogs] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [feedbackSession, setFeedbackSession] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const { triggerNotification } = useNotification();
  const { user } = useAuth();
  const counsellor_id = user?.user_id;
  const APIURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        const response = await axios.get(
          `${APIURL}/myactivity/get-myactivity/${counsellor_id}`
        );
        setActivityLogs(response.data);
      } catch (error) {
        triggerNotification("Error fetching activity logs", "error");
      }
    };

    fetchActivityLogs();
  }, [counsellor_id, APIURL, triggerNotification]);

  const handleGiveFeedback = async (sessionId) => {
    try {
      await axios.post(`${APIURL}/sessions/${sessionId}/feedback`, {
        feedback: feedbackText,
      });
      setActivityLogs((prev) =>
        prev.map((session) =>
          session.session_id === sessionId
            ? { ...session, feedbackGiven: true }
            : session
        )
      );
      triggerNotification("Feedback submitted successfully", "success");
      setFeedbackSession(null);
      setFeedbackText("");
    } catch (error) {
      triggerNotification("Error submitting feedback", "error");
    }
  };

  const determineStatus = (sessionDate, feedbackGiven, isCanceled) => {
    const currentTime = new Date();
    const sessionTime = new Date(sessionDate);

    if (isCanceled) return "Canceled";
    if (feedbackGiven) return "Feedback Given";
    if (sessionTime < currentTime) return "Completed";
    return "Upcoming";
  };

  const filteredLogs = showHistory
    ? activityLogs.filter((session) =>
        ["Completed", "Canceled"].includes(
          determineStatus(
            session.r_date || session.b_date,
            session.feedbackGiven,
            session.cancelled_r_counsellor
          )
        )
      )
    : activityLogs;

  return (
    // <div className="container-myactivity">
    //   <h1 className="header-myactivity">My Activity</h1>

    //   {/* Toggle between history and upcoming */}
    //   <div className="toggle-button-myactivity">
    //     <button
    //       onClick={() => setShowHistory((prev) => !prev)}
    //       className="toggle-btn-myactivity"
    //     >
    //       {showHistory ? "Back to Activity" : "View History"}
    //     </button>
    //   </div>

    //   <div className="table-container-myactivity">
    //     {filteredLogs.length > 0 ? (
    //       <table className="activity-table-myactivity">
    //         <thead>
    //           <tr>
    //             <th>#</th>
    //             <th>Session ID</th>
    //             <th>Date</th>
    //             <th>Time Slot</th>
    //             <th>Mode</th>
    //             <th>Duration</th>
    //             <th>Status</th>
    //             <th>Action</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           {filteredLogs.map((session, index) => {
    //             const sessionDate = session.r_date || session.b_date;
    //             const timeSlot = session.b_time_slot || session.r_time;
    //             const mode = session.r_mode || session.b_mode;
    //             const duration = session.r_duration || session.b_duration;

    //             const status = determineStatus(
    //               sessionDate,
    //               session.feedbackGiven,
    //               session.cancelled_r_counsellor
    //             );

    //             return (
    //               <tr key={session.session_id}>
    //                 <td>{index + 1}</td>
    //                 <td>{session.session_id}</td>
    //                 <td>{sessionDate}</td>
    //                 <td>{timeSlot}</td>
    //                 <td>{mode}</td>
    //                 <td>{duration} min</td>
    //                 <td>{status}</td>
    //                 <td>
    //                   {status === "Completed" && !session.feedbackGiven ? (
    //                     <button
    //                       onClick={() => setFeedbackSession(session)}
    //                       className="feedback-btn-myactivity"
    //                     >
    //                       Give Feedback
    //                     </button>
    //                   ) : status === "Feedback Given" ? (
    //                     <span className="feedback-status-myactivity">
    //                       Feedback Already Given
    //                     </span>
    //                   ) : (
    //                     <span>{status}</span>
    //                   )}
    //                 </td>
    //               </tr>
    //             );
    //           })}
    //         </tbody>
    //       </table>
    //     ) : (
    //       <div className="no-sessions-myactivity">
    //         {showHistory
    //           ? "No completed or canceled sessions found."
    //           : "No upcoming sessions found."}
    //       </div>
    //     )}
    //   </div>

    //   {/* Feedback Modal */}
    //   {feedbackSession && (
    //     <div
    //       className="modal-overlay-myactivity"
    //       onClick={() => setFeedbackSession(null)}
    //     >
    //       <div
    //         className="modal-content-myactivity"
    //         onClick={(e) => e.stopPropagation()}
    //       >
    //         <h3 className="modal-title-myactivity">Feedback for Session</h3>
    //         <textarea
    //           value={feedbackText}
    //           onChange={(e) => setFeedbackText(e.target.value)}
    //           className="feedback-textarea-myactivity"
    //           rows="4"
    //           placeholder="Please provide your feedback."
    //         ></textarea>
    //         <div className="modal-actions-myactivity">
    //           <button
    //             onClick={() => setFeedbackSession(null)}
    //             className="cancel-btn-myactivity"
    //           >
    //             Cancel
    //           </button>
    //           <button
    //             onClick={() => handleGiveFeedback(feedbackSession.session_id)}
    //             className="submit-btn-myactivity"
    //           >
    //             Submit Feedback
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   )}
    // </div>

    <div className="container-myactivity">
      <h1 className="header-myactivity">My Activity</h1>

      {/* Toggle between history and upcoming */}
      <div className="toggle-button-myactivity">
        <button
          onClick={() => setShowHistory((prev) => !prev)}
          className="toggle-btn-myactivity"
        >
          {showHistory ? "Back to Activity" : "View History"}
        </button>
      </div>

      <div className="table-container-myactivity">
        {filteredLogs.length > 0 ? (
          <>
            {/* Desktop Table */}
            <table className="activity-table-myactivity">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Session ID</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Mode</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((session, index) => {
                  const sessionDate = session.r_date || session.b_date;
                  const timeSlot = session.b_time_slot || session.r_time;
                  const mode = session.r_mode || session.b_mode;
                  const duration = session.r_duration || session.b_duration;

                  const status = determineStatus(
                    sessionDate,
                    session.feedbackGiven,
                    session.cancelled_r_counsellor
                  );

                  return (
                    <tr key={session.session_id}>
                      <td>{index + 1}</td>
                      <td>{session.session_id}</td>
                      <td>{sessionDate}</td>
                      <td>{timeSlot}</td>
                      <td>{mode}</td>
                      <td>{duration} min</td>
                      <td>{status}</td>
                      <td>
                        {status === "Completed" && !session.feedbackGiven ? (
                          <button
                            onClick={() => setFeedbackSession(session)}
                            className="feedback-btn-myactivity"
                          >
                            Give Feedback
                          </button>
                        ) : status === "Feedback Given" ? (
                          <span className="feedback-status-myactivity">
                            Feedback Already Given
                          </span>
                        ) : (
                          <span>{status}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="mobile-view-myactivity">
              {filteredLogs.map((session, index) => {
                const sessionDate = session.r_date || session.b_date;
                const timeSlot = session.b_time_slot || session.r_time;
                const mode = session.r_mode || session.b_mode;
                const duration = session.r_duration || session.b_duration;

                const status = determineStatus(
                  sessionDate,
                  session.feedbackGiven,
                  session.cancelled_r_counsellor
                );

                return (
                  <div
                    className="session-card-myactivity"
                    key={session.session_id}
                  >
                    {/* <div>
                      <strong>#:</strong> {index + 1}
                    </div> */}
                    <div>
                      <strong>Session ID:</strong> {session.session_id}
                    </div>
                    <div>
                      <strong>Date:</strong> {sessionDate}
                    </div>
                    <div>
                      <strong>Time Slot:</strong> {timeSlot}
                    </div>
                    <div>
                      <strong>Mode:</strong> {mode}
                    </div>
                    <div>
                      <strong>Duration:</strong> {duration} min
                    </div>
                    <div>
                      <strong>Status:</strong> {status}
                    </div>
                    <div>
                      {status === "Completed" && !session.feedbackGiven ? (
                        <button
                          onClick={() => setFeedbackSession(session)}
                          className="feedback-btn-myactivity"
                        >
                          Give Feedback
                        </button>
                      ) : status === "Feedback Given" ? (
                        <span className="feedback-status-myactivity">
                          Feedback Already Given
                        </span>
                      ) : (
                        <span>{status}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="no-sessions-myactivity">
            {showHistory
              ? "No completed or canceled sessions found."
              : "No upcoming sessions found."}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackSession && (
        <div
          className="modal-overlay-myactivity"
          onClick={() => setFeedbackSession(null)}
        >
          <div
            className="modal-content-myactivity"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title-myactivity">Feedback for Session</h3>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="feedback-textarea-myactivity"
              rows="4"
              placeholder="Please provide your feedback."
            ></textarea>
            <div className="modal-actions-myactivity">
              <button
                onClick={() => setFeedbackSession(null)}
                className="cancel-btn-myactivity"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGiveFeedback(feedbackSession.session_id)}
                className="submit-btn-myactivity"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyActivity;
