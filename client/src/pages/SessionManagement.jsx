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

  const toggleFilterVisibility = () => {
    setFilterVisible((prevState) => !prevState);
  };

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
          triggerNotification(
            "Invalid request. Counsellor ID is required.",
            "error"
          );
          console.error(data.message);
        } else {
          triggerNotification(
            data.message || "An unexpected error occurred.",
            "error"
          );
          console.error(data.message);
        }
      } else {
        triggerNotification(
          "Failed to fetch sessions. Please check your connection.",
          "error"
        );
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

  // Fetch sessions from backend API
  useEffect(() => {
    fetchSessions();
  }, [counsellor_id, APIURL]);
  return (
    <div className="session-container">
      <div className="session-header">
        <h1 className="session-title">Expert Session Management</h1>
        <p className="session-subtitle">
          Manage and organize your counselling sessions effectively.
        </p>
      </div>

      {/* Status Filter */}
      <div className="session-status-filter">
        {/* Desktop Status Bar */}
        <div className="session-status-buttons">
          <button
            onClick={() => setActiveStatus("")}
            className={`session-button ${
              activeStatus === "" ? "session-button-active" : ""
            }`}
          >
            All
          </button>
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`session-button ${
                activeStatus === status ? "session-button-active" : ""
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Mobile Dropdown Filter */}
        <div className="session-mobile-filter">
          <button
            onClick={toggleFilterVisibility}
            className="session-dropdown-button"
            aria-expanded={filterVisible}
            aria-controls="filterDropdown"
          >
            {activeStatus || "Filter by Status"}
            <span className="session-dropdown-icon">
              {filterVisible ? "▲" : "▼"}
            </span>
          </button>
          {filterVisible && (
            <div id="filterDropdown" className="session-dropdown">
              <button
                onClick={() => {
                  setActiveStatus("");
                  setFilterVisible(false);
                }}
                className={`session-dropdown-item ${
                  activeStatus === "" ? "session-button-active" : ""
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
                  className={`session-dropdown-item ${
                    activeStatus === status ? "session-button-active" : ""
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

      {/* Modals */}
      {cancelSession && (
        <Modal
          title="Cancel Session"
          onClose={() => setCancelSession(null)}
          onConfirm={handleCancelRequest}
          confirmText="Confirm"
        >
          <p className="session-modal-text">
            Are you sure you want to cancel this session? Please provide a
            reason below:
          </p>
          <textarea
            className="session-textarea"
            rows="4"
            placeholder="Enter reason for cancellation..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          ></textarea>
        </Modal>
      )}

      {rescheduleSession && (
        <Modal
          title="Reschedule Session"
          onClose={() => setRescheduleSession(null)}
          onConfirm={handleRescheduleSave}
          confirmText="Reschedule"
        >
          <label className="session-label">Select Date:</label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="session-input"
          />
          <label className="session-label">Select Start Time:</label>
          <select
            value={newTimeSlot.start_time}
            onChange={(e) =>
              setNewTimeSlot((prev) => ({
                ...prev,
                start_time: e.target.value,
              }))
            }
            className="session-input"
          >
            {Array.from({ length: 48 }, (_, i) => {
              const hours = String(Math.floor(i / 2)).padStart(2, "0");
              const minutes = i % 2 === 0 ? "00" : "30";
              const time = `${hours}:${minutes}`;
              return (
                <option key={time} value={time}>
                  {time}
                </option>
              );
            })}
          </select>
          <label className="session-label">Select End Time:</label>
          <select
            value={newTimeSlot.end_time}
            onChange={(e) =>
              setNewTimeSlot((prev) => ({
                ...prev,
                end_time: e.target.value,
              }))
            }
            className="session-input"
          >
            {Array.from({ length: 48 }, (_, i) => {
              const hours = String(Math.floor(i / 2)).padStart(2, "0");
              const minutes = i % 2 === 0 ? "00" : "30";
              const time = `${hours}:${minutes}`;
              return (
                <option key={time} value={time}>
                  {time}
                </option>
              );
            })}
          </select>
          <label className="session-label">Select Mode:</label>
          <select
            value={newMode}
            onChange={(e) => setNewMode(e.target.value)}
            className="session-input"
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
    <div className="session-table-container">
      <h1 className="session-table-title">Sessions</h1>
      <div className="session-table-content-container">
        {/* Card view for mobile devices */}
        <div className="session-card-container">
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
        <table className="session-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Session ID</th>
              <th>Mode</th>
              <th>Date</th>
              <th>Time Slot</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          {loading ? (
            <div>Loading sessions...</div>
          ) : (
            <tbody className="session-table-body">
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
          )}
        </table>
      </div>
    </div>
  );
};

const SessionCard = ({
  session,
  handleAcceptRequest,
  openCancelModal,
  openRescheduleModal,
}) => (
  <div className="session-card-container">
    <div className="session-detail">
      <strong>Session ID:</strong> {session.session_id}
    </div>
    <div className="session-detail">
      <strong>Date:</strong> {new Date(session.b_date).toLocaleDateString()}
    </div>
    <div className="session-detail">
      <strong>Time Slot:</strong> {session.b_time_slot}
    </div>
    <div className="session-detail">
      <strong>Status:</strong>
      <span
        className={`status ${getStatusColor(session.status_for_counsellor)}`}
      >
        {session.status_for_counsellor}
      </span>
    </div>
    <div className="session-actions">
      {session.status_for_counsellor === "Requested" && (
        <>
          <ActionButton
            label="Accept"
            onClick={() => handleAcceptRequest(session.session_id)}
            colorClass="accept-button"
          />
          <ActionButton
            label="Decline"
            onClick={() => openCancelModal(session)}
            colorClass="decline-button"
          />
        </>
      )}
      {session.status_for_counsellor === "Booked" && (
        <ActionButton
          label="Reschedule"
          onClick={() => openRescheduleModal(session)}
          colorClass="reschedule-button"
        />
      )}
    </div>
  </div>
);

const SessionRow = ({
  session,
  index,
  handleAcceptRequest,
  openCancelModal,
  openRescheduleModal,
}) => (
  <tr className="session-row">
    <td className="session-data">{index + 1}</td>
    <td className="session-data">{session.session_id}</td>
    <td className="session-data">{session.b_mode}</td>
    <td className="session-data">
      {new Date(session.b_date).toLocaleDateString()}
    </td>
    <td className="session-data">{session.b_time_slot}</td>
    <td className={`status ${getStatusColor(session.status_for_counsellor)}`}>
      {session.status_for_counsellor}
    </td>
    <td className="session-actions">
      <div className="action-buttons">
        {session.status_for_counsellor === "Requested" && (
          <>
            <ActionButton
              label="Accept"
              onClick={() => handleAcceptRequest(session.session_id)}
              colorClass="accept-button"
            />
            <ActionButton
              label="Decline"
              onClick={() => openCancelModal(session)}
              colorClass="decline-button"
            />
          </>
        )}
        {session.status_for_counsellor === "Booked" && (
          <ActionButton
            label="Reschedule"
            onClick={() => openRescheduleModal(session)}
            colorClass="reschedule-button"
          />
        )}
      </div>
    </td>
  </tr>
);

const ActionButton = ({ label, onClick, colorClass }) => (
  <button onClick={onClick} className={`action-button ${colorClass}`}>
    {label}
  </button>
);

const getStatusColor = (status) => {
  switch (status) {
    case "Booked":
      return "status-booked";
    case "Requested":
      return "status-requested";
    case "Cancelled":
      return "status-cancelled";
    default:
      return "status-default";
  }
};

const Modal = ({ title, onClose, onConfirm, confirmText, children }) => (
  <div className="modal-overlay">
    <div className="modal-container">
      <h2 className="modal-title">{title}</h2>
      {children}
      <div className="modal-actions">
        <button onClick={onClose} className="modal-button modal-button-close">
          Close
        </button>
        <button
          onClick={onConfirm}
          className="modal-button modal-button-confirm"
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

export default SessionManagement;
