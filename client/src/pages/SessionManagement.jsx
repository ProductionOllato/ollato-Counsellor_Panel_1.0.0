
import React, { useEffect, useState, useMemo } from "react";
import { useNotification } from "../context/NotificationContext";
import axios from "axios";
import { useAuth } from "../context/UserContext";
import "../styles/SessionManagement.css";

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

  const [filterVisible, setFilterVisible] = useState(false);

  const toggleFilterVisibility = () => setFilterVisible((prev) => !prev);

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

      const { data } = response;

      const sortedSessions = data.sort(
        (a, b) => new Date(b.b_date) - new Date(a.b_date)
      );

      setSessions(sortedSessions);
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        if (status === 400) {
          triggerNotification("Invalid request. Counsellor ID is required.", "error");
          console.error(data.message);
        } else if (status === 404) {
          triggerNotification("No sessions found for this counsellor.", "info");
          console.error(data.message);
        } else {
          triggerNotification(data.message || "An unexpected error occurred.", "error");
          console.error(data.message);
        }
      } else {
        triggerNotification("Failed to fetch sessions. Please check your connection.", "error");
        console.error(data.message);
      }
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
      console.error(err);
      triggerNotification("Failed to accept the request.", "error");
    }
  };

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
      await axios.post(`${APIURL}/session/cancel-by-counsellor`, payload);
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.session_id === cancelSession.session_id
            ? { ...session, status_for_counsellor: "Cancelled" }
            : session
        )
      );
      triggerNotification("Session cancelled successfully.", "success");
    } catch (err) {
      console.error(err);
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
          Expert Session Management
        </h1>
        <p className="text-sm text-slate-600">
          Manage and organize your counselling sessions effectively.
        </p>
      </div>

      {/* Status Filter */}
      <div className="session-status-filter flex flex-wrap justify-around mb-6 relative">
        {/* Desktop Status Bar */}
        <div className="desktop-filter w-full gap-4 justify-center items-center">
          <button
            onClick={() => setActiveStatus("")}
            className={`text-black px-6 py-2 text-base font-semibold rounded-lg ${activeStatus === "" ? "bg-[#7047A3] text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
          >
            All
          </button>
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`text-black px-6 py-2 text-base font-semibold rounded-lg ${activeStatus === status ? "bg-[#7047A3] text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Mobile Dropdown Filter */}
        <div className="mobile-filter flex w-full">
          <button
            onClick={toggleFilterVisibility}
            className="flex items-center px-6 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm font-semibold w-full"
            aria-expanded={filterVisible}
            aria-controls="filterDropdown"
          >
            {activeStatus || "Filter by Status"}
            <span className="ml-2 transform transition-transform duration-200">
              {filterVisible ? "▲" : "▼"}
            </span>
          </button>
          {filterVisible && (
            <div
              id="filterDropdown"
              className="absolute top-full mt-2 w-full bg-white shadow-md rounded-lg z-10"
            >
              <button
                onClick={() => {
                  setActiveStatus("");
                  setFilterVisible(false);
                }}
                className={`block text-black w-full text-left px-6 py-2 text-sm font-semibold rounded-t-lg transition-all ${activeStatus === "" ? "bg-[#7047A3] text-white" : "bg-gray-200 hover:bg-gray-300"
                  }`}
              >
                All
              </button>
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setActiveStatus(status);
                    setFilterVisible(false);
                  }}
                  className={`block text-black w-full text-left px-6 py-2 text-sm font-semibold transition-all ${activeStatus === status ? "bg-[#7047A3] text-white" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Sessions Table */}
      <SessionTable
        sessions={filteredSessions}
        handleAcceptRequest={handleAcceptRequest}
        handleDeclineRequest={handleDeclineRequest}
        openCancelModal={openCancelModal}
        openRescheduleModal={openRescheduleModal}
        loading={loading}
      />

      {/* Cancel Modal */}
      {cancelSession && (
        <Modal
          title="Cancel Session"
          onClose={() => setCancelSession(null)}
          onConfirm={handleCancelRequest}
          confirmText="Confirm"
        >
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
        </Modal>
      )}

      {/* Reschedule Modal */}
      {rescheduleSession && (
        <Modal
          title="Reschedule Session"
          onClose={() => setRescheduleSession(null)}
          onConfirm={handleRescheduleSave}
          confirmText="Reschedule"
        >
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
                <option key={`${hours}:${minutes}`} value={`${hours}:${minutes}`}>
                  {`${hours}:${minutes}`}
                </option>
              );
            })}
          </select>

          <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
            Select End Time:
          </label>
          <select
            value={newTimeSlot.end_time}
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
                <option key={`${hours}:${minutes}`} value={`${hours}:${minutes}`}>
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
        </Modal>
      )}
    </div>
  );
}

const SessionTable = ({
  sessions,
  handleAcceptRequest,
  handleDeclineRequest,
  openCancelModal,
  openRescheduleModal,
  loading,
}) => {
  if (loading) {
    return <div>Loading sessions...</div>; // Loading indicator
  }

  return (
    <div className="session-table-container bg-white rounded-lg shadow-md relative p-4">
      <h1 className="session-table-title text-2xl font-bold mb-6 text-[#7047A3]">
        Sessions
      </h1>
      <div className="session-table-content-container overflow-x-auto">
        {/* Card view for mobile devices */}
        <div className="block lg:hidden">
          {sessions.map((session, index) => (
            <SessionCard
              key={session.session_id}
              session={session}
              index={index}
              handleAcceptRequest={handleAcceptRequest}
              handleDeclineRequest={handleDeclineRequest}
              openCancelModal={openCancelModal}
              openRescheduleModal={openRescheduleModal}
            />
          ))}
        </div>

        {/* Table view for larger devices */}
        <table className="session-table hidden lg:table min-w-full table-auto border-collapse border border-gray-300">
          <thead className="session-table-header bg-[#F3F4F6] text-[#7047A3]">
            <tr>
              <th className="text-base">#</th>
              <th className="text-base">Session ID</th>
              <th className="text-base">Mode</th>
              <th className="text-base">Date</th>
              <th className="text-base">Time Slot</th>
              <th className="text-base">Status</th>
              <th className="text-base">Action</th>
            </tr>
          </thead>
          <tbody className="session-table-body bg-white divide-y divide-gray-200 text-center">
            {sessions.map((session, index) => (
              <SessionRow
                key={session.session_id}
                session={session}
                index={index}
                handleAcceptRequest={handleAcceptRequest}
                handleDeclineRequest={handleDeclineRequest}
                openCancelModal={openCancelModal}
                openRescheduleModal={openRescheduleModal}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SessionCard = ({ session, index, handleAcceptRequest, handleDeclineRequest, openCancelModal, openRescheduleModal }) => (
  <div className="border border-gray-400 rounded-lg p-4 mb-4 shadow-md bg-white">
    <div className="flex justify-between mb-2 lg:text-base">
      <strong>Session ID:</strong> {session.session_id}
    </div>
    <div className="flex justify-between mb-2 lg:text-base">
      <strong>Date:</strong> {new Date(session.b_date).toLocaleDateString()}
    </div>
    <div className="flex justify-between mb-2 lg:text-base">
      <strong>Time Slot:</strong> {session.b_time_slot}
    </div>
    <div className="flex justify-between mb-2 lg:text-base">
      <strong>Status:</strong> <span className={getStatusColor(session.status_for_counsellor)}>{session.status_for_counsellor}</span>
    </div>
    <div className="flex justify-end gap-2">
      {session.status_for_counsellor === "Requested" && (
        <>
          <ActionButton
            label="Accept"
            onClick={() => handleAcceptRequest(session.session_id)}
            colorClass="bg-green-500 hover:bg-green-600"
          />
          <ActionButton
            label="Decline"
            onClick={() => openCancelModal(session)}
            colorClass="bg-red-500 hover:bg-red-600"
          />
        </>
      )}
      {session.status_for_counsellor === "Booked" && (
        <ActionButton
          label="Reschedule"
          onClick={() => openRescheduleModal(session)}
          colorClass="bg-yellow-500 hover:bg-yellow-600"
        />
      )}
    </div>
  </div>
);

const SessionRow = ({ session, index, handleAcceptRequest, handleDeclineRequest, openCancelModal, openRescheduleModal }) => (
  <tr className="mt-4 text-base">
    <td className="text-base">{index + 1}</td>
    <td className="text-base">{session.session_id}</td>
    <td className="text-base">{session.b_mode}</td>
    <td className="text-base">{new Date(session.b_date).toLocaleDateString()}</td>
    <td className="text-base">{session.b_time_slot}</td>
    <td className={getStatusColor(session.status_for_counsellor)}>
      {session.status_for_counsellor}
    </td>
    <td>
      <div className="flex gap-2">
        {session.status_for_counsellor === "Requested" && (
          <>
            <ActionButton
              label="Accept"
              onClick={() => handleAcceptRequest(session.session_id)}
              colorClass="bg-green-500 hover:bg-green-600"
            />
            <ActionButton
              label="Decline"
              onClick={() => openCancelModal(session)}
              colorClass="bg-red-500 hover:bg-red-600"
            />
          </>
        )}
        {session.status_for_counsellor === "Booked" && (
          <ActionButton
            label="Reschedule"
            onClick={() => openRescheduleModal(session)}
            colorClass="bg-yellow-500 hover:bg-yellow-600"
          />
        )}
      </div>
    </td>
  </tr>
);

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

const Modal = ({ title, onClose, onConfirm, confirmText, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-md">
      <h2 className="font-bold text-lg mb-4 text-[#7047A3]">{title}</h2>
      {children}
      <div className="flex justify-end gap-4 mt-4">
        <button
          onClick={onClose}
          className="bg-[#CDC1FF] text-[#213555] py-2 px-6 rounded-md transition hover:scale-105"
        >
          Close
        </button>
        <button
          onClick={onConfirm}
          className="bg-[#7047A3] text-white py-2 px-6 rounded-md transition hover:scale-105"
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

export default SessionManagement;

