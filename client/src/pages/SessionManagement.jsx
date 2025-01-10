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

const SessionManagement = () => {
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
  const [newMode, setNewMode] = useState("video");
  const { triggerNotification } = useNotification();
  const { user } = useAuth();
  const counsellor_id = user?.user_id;
  const APIURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;
  const [filterVisible, setFilterVisible] = useState(false);

  const toggleFilterVisibility = () => setFilterVisible((prev) => !prev);

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
      handleFetchError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchError = (err) => {
    if (err.response) {
      const { status, data } = err.response;
      const message = data.message || "An unexpected error occurred.";
      if (status === 400) {
        triggerNotification(
          "Invalid request. Counsellor ID is required.",
          "error"
        );
      } else {
        triggerNotification(message, "error");
      }
    } else {
      triggerNotification(
        "Failed to fetch sessions. Please check your connection.",
        "error"
      );
    }
  };

  const filteredSessions = useMemo(() => {
    return activeStatus
      ? sessions.filter(
          (session) => session.status_for_counsellor === activeStatus
        )
      : sessions;
  }, [activeStatus, sessions]);

  const handleAcceptRequest = async (sessionId) => {
    await handleSessionAction(sessionId, "accept");
  };

  const handleDeclineRequest = async (sessionId) => {
    if (!cancelReason.trim()) {
      triggerNotification("Please provide a reason for cancellation.", "error");
      return;
    }
    await handleSessionAction(sessionId, "decline");
  };

  const handleCancelRequest = async () => {
    if (!cancelReason.trim()) {
      triggerNotification("Please provide a reason for cancellation.", "error");
      return;
    }
    await handleSessionAction(cancelSession.session_id, "cancel");
  };

  const handleSessionAction = async (sessionId, action) => {
    const payload = {
      session_id: sessionId,
      counsellor_id,
      reason_of_cancellation: cancelReason,
    };
    const endpoint =
      action === "accept"
        ? "/session/accept-booking-request-counsellor"
        : "/session/cancel-by-counsellor";

    try {
      const response = await axios.post(`${APIURL}${endpoint}`, payload);
      if (response.status === 200) {
        updateSessionStatus(sessionId, action);
        triggerNotification(
          `Request ${
            action === "accept" ? "accepted" : "declined"
          } successfully.`,
          "success"
        );
      } else {
        throw new Error(response.data?.message || "Failed to process request.");
      }
    } catch (err) {
      triggerNotification(err.message || "Failed to process request.", "error");
    } finally {
      if (action === "cancel") {
        setCancelSession(null);
        setCancelReason("");
      }
    }
  };

  const updateSessionStatus = (sessionId, action) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.session_id === sessionId
          ? {
              ...session,
              status_for_counsellor:
                action === "accept" ? "Booked" : "Cancelled",
            }
          : session
      )
    );
  };

  const openCancelModal = (session) => {
    setCancelSession(session);
    setCancelReason("");
  };

  const openRescheduleModal = (session) => {
    setRescheduleSession(session);
    setNewDate("");
    setNewTimeSlot({ start_time: "", end_time: "" });
    setNewMode(session.b_mode);
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
        updateRescheduledSession(payload);
        triggerNotification("Session rescheduled successfully.", "success");
      } else {
        throw new Error(response.data?.message || "Rescheduling failed.");
      }
    } catch (err) {
      triggerNotification(
        err.message || "Failed to reschedule session.",
        "error"
      );
    } finally {
      setRescheduleSession(null);
    }
  };

  const updateRescheduledSession = (payload) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.session_id === payload.session_id
          ? {
              ...session,
              b_date: payload.new_r_date,
              b_time_slot: payload.new_r_time,
              b_mode: payload.new_r_mode,
            }
          : session
      )
    );
  };

  return (
    <div className="w-full mt-4 pt-2 bg-white shadow-lg rounded-lg">
      <Header />
      <StatusFilter
        activeStatus={activeStatus}
        setActiveStatus={setActiveStatus}
        toggleFilterVisibility={toggleFilterVisibility}
        filterVisible={filterVisible}
      />
      <SessionTable
        sessions={filteredSessions}
        handleAcceptRequest={handleAcceptRequest}
        handleDeclineRequest={handleDeclineRequest}
        openCancelModal={openCancelModal}
        openRescheduleModal={openRescheduleModal}
        loading={loading}
      />
      {cancelSession && (
        <CancelModal
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          onClose={() => setCancelSession(null)}
          onConfirm={handleCancelRequest}
        />
      )}
      {rescheduleSession && (
        <RescheduleModal
          newDate={newDate}
          setNewDate={setNewDate}
          newTimeSlot={newTimeSlot}
          setNewTimeSlot={setNewTimeSlot}
          newMode={newMode}
          setNewMode={setNewMode}
          onClose={() => setRescheduleSession(null)}
          onConfirm={handleRescheduleSave}
        />
      )}
    </div>
  );
};

const Header = () => (
  <div className="text-center mb-8">
    <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
      Expert Session Management
    </h1>
    <p className="text-sm text-slate-600">
      Manage and organize your counselling sessions effectively.
    </p>
  </div>
);

const StatusFilter = ({
  activeStatus,
  setActiveStatus,
  toggleFilterVisibility,
  filterVisible,
}) => (
  <div className="session-status-filter flex flex-wrap justify-around mb-6 relative">
    <div className="desktop-filter w-full gap-4 justify-center items-center">
      <FilterButton
        label="All"
        isActive={activeStatus === ""}
        onClick={() => setActiveStatus("")}
      />
      {statuses.map((status) => (
        <FilterButton
          key={status}
          label={status}
          isActive={activeStatus === status}
          onClick={() => setActiveStatus(status)}
        />
      ))}
    </div>
    <MobileFilter
      activeStatus={activeStatus}
      toggleFilterVisibility={toggleFilterVisibility}
      filterVisible={filterVisible}
      setActiveStatus={setActiveStatus}
    />
  </div>
);

const FilterButton = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`text-black px-6 py-2 text-base font-semibold rounded-lg ${
      isActive ? "bg-[#7047A3] text-white" : "bg-gray-200 hover:bg-gray-300"
    }`}
  >
    {label}
  </button>
);

const MobileFilter = ({
  activeStatus,
  toggleFilterVisibility,
  filterVisible,
  setActiveStatus,
}) => (
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
        <FilterButton
          label="All"
          isActive={activeStatus === ""}
          onClick={() => {
            setActiveStatus("");
            toggleFilterVisibility();
          }}
        />
        {statuses.map((status) => (
          <FilterButton
            key={status}
            label={status}
            isActive={activeStatus === status}
            onClick={() => {
              setActiveStatus(status);
              toggleFilterVisibility();
            }}
          />
        ))}
      </div>
    )}
  </div>
);

const SessionTable = ({
  sessions,
  handleAcceptRequest,
  handleDeclineRequest,
  openCancelModal,
  openRescheduleModal,
  loading,
}) => {
  if (loading) return <div>Loading sessions...</div>;

  return (
    <div className="session-table-container bg-white rounded-lg shadow-md relative p-4">
      <h1 className="session-table-title text-2xl font-bold mb-6 text-[#7047A3]">
        Sessions
      </h1>
      {sessions.length === 0 ? (
        <div className="text-center text-gray-500">No sessions available.</div>
      ) : (
        <>
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
          <TableView
            sessions={sessions}
            handleAcceptRequest={handleAcceptRequest}
            handleDeclineRequest={handleDeclineRequest}
            openCancelModal={openCancelModal}
            openRescheduleModal={openRescheduleModal}
          />
        </>
      )}
    </div>
  );
};

const TableView = ({
  sessions,
  handleAcceptRequest,
  handleDeclineRequest,
  openCancelModal,
  openRescheduleModal,
}) => (
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
);

const SessionCard = ({
  session,
  index,
  handleAcceptRequest,
  handleDeclineRequest,
  openCancelModal,
  openRescheduleModal,
}) => (
  <div className="border border-gray-400 rounded-lg p-4 mb-4 shadow-md bg-white">
    <SessionDetails session={session} />
    <SessionActions
      session={session}
      handleAcceptRequest={handleAcceptRequest}
      handleDeclineRequest={handleDeclineRequest}
      openCancelModal={openCancelModal}
      openRescheduleModal={openRescheduleModal}
    />
  </div>
);

const SessionDetails = ({ session }) => (
  <>
    <DetailRow label="Session ID:" value={session.session_id} />
    <DetailRow
      label="Date:"
      value={new Date(session.b_date).toLocaleDateString()}
    />
    <DetailRow label="Time Slot:" value={session.b_time_slot} />
    <DetailRow
      label="Status:"
      value={
        <span className={getStatusColor(session.status_for_counsellor)}>
          {session.status_for_counsellor}
        </span>
      }
    />
  </>
);

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between mb-2 lg:text-base">
    <strong>{label}</strong> {value}
  </div>
);

const SessionRow = ({
  session,
  index,
  handleAcceptRequest,
  handleDeclineRequest,
  openCancelModal,
  openRescheduleModal,
}) => (
  <tr className="mt-4 text-base">
    <td className="text-base">{index + 1}</td>
    <td className="text-base">{session.session_id}</td>
    <td className="text-base">{session.b_mode}</td>
    <td className="text-base">
      {new Date(session.b_date).toLocaleDateString()}
    </td>
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

const CancelModal = ({ cancelReason, setCancelReason, onClose, onConfirm }) => (
  <Modal
    title="Cancel Session"
    onClose={onClose}
    onConfirm={onConfirm}
    confirmText="Confirm"
  >
    <p className="text-gray-700 mb-4">
      Are you sure you want to cancel this session? Please provide a reason
      below:
    </p>
    <textarea
      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 mb-4"
      rows="4"
      placeholder="Enter reason for cancellation..."
      value={cancelReason}
      onChange={(e) => setCancelReason(e.target.value)}
    />
  </Modal>
);

const RescheduleModal = ({
  newDate,
  setNewDate,
  newTimeSlot,
  setNewTimeSlot,
  newMode,
  setNewMode,
  onClose,
  onConfirm,
}) => (
  <Modal
    title="Reschedule Session"
    onClose={onClose}
    onConfirm={onConfirm}
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
    <TimeSlotSelector
      label="Select Start Time:"
      timeSlot={newTimeSlot.start_time}
      setTimeSlot={(value) =>
        setNewTimeSlot((prev) => ({ ...prev, start_time: value }))
      }
    />
    <TimeSlotSelector
      label="Select End Time:"
      timeSlot={newTimeSlot.end_time}
      setTimeSlot={(value) =>
        setNewTimeSlot((prev) => ({ ...prev, end_time: value }))
      }
    />
    <ModeSelector newMode={newMode} setNewMode={setNewMode} />
  </Modal>
);

const TimeSlotSelector = ({ label, timeSlot, setTimeSlot }) => (
  <>
    <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
      {label}
    </label>
    <select
      value={timeSlot}
      onChange={(e) => setTimeSlot(e.target.value)}
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
  </>
);

const ModeSelector = ({ newMode, setNewMode }) => (
  <>
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
  </>
);

export default SessionManagement;
