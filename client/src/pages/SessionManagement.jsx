import React, { useEffect, useMemo, useState } from "react";
import { useNotification } from "../context/NotificationContext";
import axios from "axios"; // For backend API integration

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
  const [editSession, setEditSession] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [rescheduleSession, setRescheduleSession] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const { triggerNotification } = useNotification();

  // Fetch sessions from backend API
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(
        `${process.env.VITE_APP_API_ENDPOINT_URL}/session`
      );
      console.log("Response data:", response.data);

      setSessions(response.data);
      // setSessions(sessionData.sessions);
    } catch (err) {
      triggerNotification("Failed to fetch sessions.", "error");
    }
  };

  const handleReschedule = (session) => {
    setRescheduleSession(session);
  };

  const handleCancelReschedule = () => {
    setRescheduleSession(null);
    setNewDate("");
    setNewTime("");
  };

  const handleCancel = () => {
    setEditSession(null);
    setNewStatus("");
  };

  const handleAcceptRequest = async (sessionId) => {
    try {
      await axios.post(
        `${process.env.VITE_APP_API_ENDPOINT_URL}/session/reschedule/`
      );
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, status: "Booked" } : session
        )
      );

      triggerNotification("Request accepted successfully.", "success");
    } catch (err) {
      triggerNotification("Failed to accept the request.", "error");
    }
  };

  const handleRescheduleSave = async () => {
    if (!newDate || !newTime) {
      triggerNotification("Please select both a date and a time.", "error");
      return;
    }
    try {
      // await axios.post(`/api/sessions/${rescheduleSession.id}/reschedule`, {
      //   newDate,
      //   newTime,
      // });
      setSessions((prev) =>
        prev.map((session) =>
          session.id === rescheduleSession.id
            ? { ...session, scheduledTime: newDate + "T" + newTime }
            : session
        )
      );
      setRescheduleSession(null);
      setNewDate(""); // Clear date input
      setNewTime(""); // Clear time input
      triggerNotification("Session rescheduled successfully.", "success");
    } catch (err) {
      triggerNotification("Failed to reschedule session.", "error");
    }
  };

  const handleDeclineRequestByStudent = async (sessionId) => {
    try {
      await axios.post(
        `${process.env.VITE_APP_API_ENDPOINT_URL}/session/cancel-by-student`
      );
      // Update local state to set the status to "Cancelled"
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, status: "Cancelled" }
            : session
        )
      );

      // Trigger a success notification
      triggerNotification("Session request declined successfully.", "success");
    } catch (err) {
      // Trigger an error notification if the request fails
      triggerNotification("Failed to decline session request.", "error");
    }
  };

  const handleCancelRequestByCounsellor = async () => {
    try {
      await axios.post(
        `${process.env.VITE_APP_API_ENDPOINT_URL}/session/cancel-by-counsellor`
      );
      // Update local state to set the status to "Cancelled"
      setSessions((prev) =>
        prev.map((session) =>
          session.id === rescheduleSession.id
            ? { ...session, status: "Cancelled" }
            : session
        )
      );

      // Trigger a success notification
      triggerNotification("Session request cancelled successfully.", "success");
    } catch (error) {
      triggerNotification("Failed to cancel session request.", "error");
    }
  };

  const handleEdit = (session) => {
    if (
      session.status === "Completed" ||
      session.status === "Cancelled" ||
      session.status === "Ongoing"
    ) {
      triggerNotification("Editing not allowed for this session.", "error");
      return;
    }
    setEditSession(session);
    setNewStatus(session.status);
  };

  const handleUpdateSession = async () => {
    if (!newStatus) {
      triggerNotification("Please select a valid status.", "error");
      return;
    }
    try {
      const updatedSession = {
        ...editSession,
        status: newStatus,
      };

      await axios.put(`/api/sessions/${editSession.id}`, updatedSession);

      setSessions((prev) =>
        prev.map((session) =>
          session.id === editSession.id ? updatedSession : session
        )
      );
      setEditSession(null);
      triggerNotification("Session updated successfully.", "success");
    } catch (err) {
      triggerNotification("Failed to update session.", "error");
    }
  };

  // const filteredSessions =
  //   activeStatus === ""
  //     ? sessions
  //     : sessions.filter((session) => session.status === activeStatus);

  const filteredSessions = useMemo(() => {
    return activeStatus === ""
      ? sessions
      : sessions.filter((session) => session.status === activeStatus);
  }, [activeStatus, sessions]);

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
        handleEdit={handleEdit}
        handleReschedule={handleReschedule}
        handleAcceptRequest={handleAcceptRequest}
        handleDeclineRequestByStudent={handleDeclineRequestByStudent}
        handleCancelRequestByCounsellor={handleCancelRequestByCounsellor}
        handleRescheduleSave={handleRescheduleSave}
        rescheduleSession={rescheduleSession}
        newDate={newDate}
        setNewDate={setNewDate}
        newTime={newTime}
        setNewTime={setNewTime}
        handleCancelReschedule={handleCancelReschedule}
        editSession={editSession}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        handleSave={handleUpdateSession}
        handleCancel={handleCancel}
        statuses={statuses}
      />
    </div>
  );
}

export default SessionManagement;

const SessionTable = ({
  sessions,
  handleEdit,
  handleReschedule,
  handleAcceptRequest,
  handleDeclineRequestByStudent,
  handleCancelRequestByCounsellor,
  handleRescheduleSave,
  rescheduleSession,
  newDate,
  setNewDate,
  newTime,
  setNewTime,
  handleCancelReschedule,
  editSession,
  newStatus,
  setNewStatus,
  handleSave,
  handleCancel,
  statuses,
}) => {
  // Reusable Button Component
  const ActionButton = ({ label, onClick, colorClass }) => (
    <button
      onClick={onClick}
      className={`px-2 py-1 text-white rounded text-sm ${colorClass} hover:opacity-80`}
      aria-label={label}
    >
      {label}
    </button>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Session Management</h1>

      {sessions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white shadow-md rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                  Session ID
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                  Scheduled Time
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.map((session, index) => (
                <tr key={session.id} className="hover:bg-gray-100">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{session.sessionId}</td>
                  <td className="px-6 py-4">{session.clientName}</td>
                  <td className="px-6 py-4">{session.type}</td>
                  <td className="px-6 py-4">
                    {new Date(session.scheduledTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">{session.status}</td>
                  <td className="px-6 py-4 text-end space-x-2">
                    {session.status === "Requested" && (
                      <>
                        <ActionButton
                          label="Accept"
                          onClick={() => handleAcceptRequest(session.id)}
                          colorClass="bg-green-500"
                        />
                        <ActionButton
                          label="Decline"
                          onClick={() =>
                            handleDeclineRequestByStudent(session.id)
                          }
                          colorClass="bg-red-500"
                        />
                      </>
                    )}
                    {session.status === "Booked" && (
                      <>
                        <ActionButton
                          label="Edit"
                          onClick={() => handleEdit(session)}
                          colorClass="bg-blue-500"
                        />
                        <ActionButton
                          label="Reschedule"
                          onClick={() => handleReschedule(session)}
                          colorClass="bg-yellow-500"
                        />
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg mt-6">
          No sessions available.
        </p>
      )}

      {/* Reschedule Modal */}
      {rescheduleSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-2/3 lg:w-1/3">
            <h2 className="text-2xl font-semibold mb-6">Reschedule Session</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                New Date:
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                New Time:
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex justify-end gap-4">
              <ActionButton
                label="Save"
                onClick={handleRescheduleSave}
                colorClass="bg-green-500"
              />
              <ActionButton
                label="Cancel"
                onClick={handleCancelReschedule}
                colorClass="bg-red-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-2/3 lg:w-1/3">
            <h2 className="text-2xl font-semibold mb-6">Edit Session</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Status:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-4">
              <ActionButton
                label="Save"
                onClick={handleSave}
                colorClass="bg-green-500"
              />
              <ActionButton
                label="Cancel"
                onClick={handleCancel}
                colorClass="bg-red-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
