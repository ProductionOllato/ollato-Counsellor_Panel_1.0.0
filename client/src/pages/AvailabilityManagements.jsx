import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNotification } from "../context/NotificationContext";
import { MdDeleteForever } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import axios from "axios";
import AvailabilityForm from "../components/AvailabilityForm";
import { useAuth } from "../context/UserContext";
import "../styles/AvailabilityManagements.css";
import debounce from "lodash/debounce";

const AvailabilityManagements = () => {
  const initialFormData = () => ({
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    mode: "video",
    duration: "",
  });
  const APIURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;

  const { triggerNotification } = useNotification();

  // State Management
  const [availability, setAvailability] = useState([]);
  const [formData, setFormData] = useState(initialFormData());
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "ascending",
  });
  const [currentSlot, setCurrentSlot] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modal, setModal] = useState({ show: false, type: null });
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("show");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const { user } = useAuth();

  const slotsPerPage = 10;
  const totalPages = Math.ceil(availability.length / slotsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (value.trim() === "") return;

    console.log("name", name, "value", value);

    setSelectedSlot((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Reset Form State
  const resetForm = () => {
    setFormData(initialFormData());
    setIsEditMode(false);
    setCurrentSlot(null);
    setModal({ show: false, type: null });
  };

  // Validate Slot
  const validateSlot = () => {
    const { date, start_time, end_time, mode, duration } = formData;

    if (!date || !start_time || !end_time || !mode || !duration) {
      triggerNotification("All fields are required.", "error");
      return false;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      triggerNotification("The selected date cannot be in the past.", "error");
      return false;
    }

    const startTime = new Date(`2000-01-01T${start_time}`);
    const endTime = new Date(`2000-01-01T${end_time}`);
    if (startTime >= endTime) {
      triggerNotification("Start time must be before end time.", "error");
      return false;
    }

    return true;
  };

  // Handle add availability submit
  const handleAvailabilitySubmit = async (formData) => {
    const counsellor_id = user.user_id;

    // Transform formData to match the backend payload
    const payload = {
      counsellor_id,
      dates: [formData.date],
      mode: formData.mode,
      duration: `${formData.duration}`,
      status: "available",
      start_time: `${formData.start_time}:00`,
      end_time: `${formData.end_time}:00`,
    };
    try {
      const response = await axios.post(
        `${APIURL}/counsellor/set-availability`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        triggerNotification("Availability added successfully!", "success");
        toggleView("show");
      } else {
        triggerNotification(
          response.data?.message || "Failed to add availability.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error submitting availability:", error);
      triggerNotification(
        error.response?.data?.message || "Something went wrong!",
        "error"
      );
    } finally {
      resetForm(); // Reset the form
    }
  };

  const handleEditSlot = (slot) => {
    setSelectedSlot({ ...slot });
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowEditModal(false);
    setSelectedSlot(null);
  };

  const handleUpdateSlot = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      counsellor_id: user.user_id,
      dates: [selectedSlot.date],
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      mode: selectedSlot.mode,
      duration: `${selectedSlot.duration}`,
      status: selectedSlot.status,
    };
    try {
      const response = await axios.put(
        `${APIURL}/counsellor/update-availability`,
        payload
      );
      if (response.status === 200) {
        setAvailability((prev) =>
          prev.map((slot) =>
            slot.sr_no === selectedSlot.sr_no ? { ...slot, ...payload } : slot
          )
        );
        setShowEditModal(false);
        triggerNotification("Availability updated successfully!", "success");
      } else {
        throw new Error(
          response.data.message || "Failed to update availability."
        );
      }
    } catch (error) {
      console.error(error.message || "Failed to update availability.");
      triggerNotification("Failed to update availability.", "error");
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  // Delete Slot
  const handleDeleteSlot = async (sr_no, slotDetails) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    try {
      await axios.delete(`${APIURL}/counsellor/delete-availability`, {
        data: { sr_no },
      });

      setAvailability((prev) => prev.filter((slot) => slot.sr_no !== sr_no));
      triggerNotification("Slot deleted successfully!", "success");
    } catch (error) {
      triggerNotification("Failed to delete slot.", "error");
    }
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.direction === "ascending" ? "descending" : "ascending";
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    return [...availability]
      .filter((entry) =>
        [entry.date, entry.time_slot, entry.mode, entry.status]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        return sortConfig.direction === "ascending"
          ? aValue > bValue
            ? 1
            : -1
          : aValue < bValue
          ? 1
          : -1;
      });
  }, [availability, searchQuery, sortConfig]);

  const startIndex = (currentPage - 1) * slotsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + slotsPerPage);

  // Handle search
  const debouncedSearch = useCallback(
    debounce((query) => setSearchQuery(query), 300),
    []
  );

  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
  };

  const toggleView = (view) => {
    setView(view);
  };

  useEffect(() => {
    const fetchAvailabilityData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${APIURL}/counsellor/get-availability/${user.user_id}`
        );

        if (response.status === 200 && response.data.data) {
          setAvailability(response.data.data);
        } else {
          console.error("Failed to fetch availability data.");
        }
      } catch (error) {
        console.error("Error fetching availability data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailabilityData();
  }, [user, APIURL, triggerNotification]);

  return (
    <div className="availability-management-container">
      <div className="availability-header">
        <h1 className="availability-title">Availability Management</h1>
      </div>

      <div className="availability-actions">
        <button
          onClick={() => {
            resetForm();
            toggleView("add");
          }}
          className="availability-add-button"
        >
          Add Availability
        </button>
        <button
          onClick={() => toggleView("show")}
          className="availability-show-button"
        >
          Show Availability
        </button>
      </div>

      {view === "add" && (
        <section>
          <AvailabilityForm
            onSubmit={async (formData) => {
              await handleAvailabilitySubmit(formData);
            }}
          />
        </section>
      )}

      {view === "show" && (
        <div>
          {loading ? (
            <p className="availability-loading">Loading...</p>
          ) : (
            <section className="availability-table-section">
              <div className="availability-search-container">
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={handleSearch}
                  aria-label="Search sessions"
                  className="search-input"
                />
                <span className="search-icon">
                  <svg
                    className="search-icon w-5 h-5 text-slate-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm10 2l-5.3-5.3"
                    />
                  </svg>
                </span>
              </div>

              <div className="availability-table-container">
                {/* Desktop view Table */}
                <table className="availability-table">
                  <thead>
                    <tr>
                      {[
                        { key: "sr_no", label: "Sr. No." },
                        { key: "date", label: "Date" },
                        { key: "time_slot", label: "Time" },
                        { key: "mode", label: "Mode" },
                        { key: "duration", label: "Duration" },
                        { key: "status", label: "Status" },
                      ].map((col) => (
                        <th
                          key={col.key}
                          className="availability-table-header"
                          onClick={() => handleSort(col.key)}
                        >
                          {col.label}
                          {sortConfig.key === col.key && (
                            <span
                              className={`sort-indicator ${sortConfig.direction}`}
                            >
                              {sortConfig.direction === "ascending" ? "▲" : "▼"}
                            </span>
                          )}
                        </th>
                      ))}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availability.length > 0 ? (
                      paginatedData.map((slot, index) => (
                        <tr key={slot.sr_no} className="availability-table-row">
                          <td>
                            {(currentPage - 1) * slotsPerPage + index + 1}
                          </td>
                          <td>{slot.date}</td>
                          <td>
                            {slot.start_time} to {slot.end_time}
                          </td>
                          <td>{slot.mode}</td>
                          <td>{slot.duration}</td>
                          <td className={`status-badge ${slot.status}`}>
                            {slot.status}
                          </td>
                          <td>
                            <button
                              onClick={() => handleEditSlot(slot)}
                              className="action-edit-button"
                            >
                              <CiEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(slot.sr_no, slot)}
                              className="action-delete-button"
                            >
                              <MdDeleteForever />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="no-sessions-message">
                          No sessions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Mobile Card View */}
                <div className="mobile-card-view">
                  {availability.length > 0 ? (
                    paginatedData.map((slot) => (
                      <div key={slot.sr_no} className="session-card">
                        <div className="session-grid">
                          <span className="session-info-label">
                            Session ID:
                          </span>
                          <span>{slot.session_id}</span>
                        </div>
                        <div className="session-grid">
                          <span className="session-info-label">Date:</span>
                          <span>{slot.date}</span>
                        </div>
                        <div className="session-grid">
                          <span className="session-info-label">Time:</span>
                          <span>
                            {slot.start_time} to {slot.end_time}
                          </span>
                        </div>
                        <div className="session-grid">
                          <span className="session-info-label">Mode:</span>
                          <span>{slot.mode}</span>
                        </div>
                        <div className="session-grid">
                          <span className="session-info-label">Duration:</span>
                          <span>{slot.duration}</span>
                        </div>
                        <div className="session-grid">
                          <span className="session-info-label">Status:</span>
                          <span
                            className={`session-status ${
                              slot.status === "available"
                                ? "status-available"
                                : "status-unavailable"
                            }`}
                          >
                            {slot.status}
                          </span>
                        </div>
                        <div className="session-actions">
                          <button
                            onClick={() => handleEditSlot(slot)}
                            className="action-button edit-button"
                          >
                            <CiEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.sr_no, slot)}
                            className="action-button delete-button"
                          >
                            <MdDeleteForever />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-sessions">No sessions found.</div>
                  )}
                </div>

                {/* Edit Modal */}
                {showEditModal && (
                  <div className="modal-availability-overlay">
                    <div className="modal-availability-content">
                      <h2 className="modal-availability-title">
                        Edit Availability
                      </h2>
                      <form
                        onSubmit={handleUpdateSlot}
                        className="modal-availability-form"
                      >
                        <div className="modal-availability-form-group">
                          <label
                            htmlFor="date"
                            className="modal-availability-label"
                          >
                            Date
                          </label>
                          <input
                            id="date"
                            type="date"
                            name="date"
                            value={selectedSlot.date}
                            onChange={handleInputChange}
                            className="modal-availability-input"
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>

                        <TimeDropdown
                          label="Start Time"
                          name="start_time"
                          value={selectedSlot.start_time}
                          onChange={handleInputChange}
                        />
                        <TimeDropdown
                          label="End Time"
                          name="end_time"
                          value={selectedSlot.end_time}
                          onChange={handleInputChange}
                        />

                        <div className="modal-availability-form-group">
                          <label
                            htmlFor="mode"
                            className="modal-availability-label"
                          >
                            Mode
                          </label>
                          <select
                            id="mode"
                            name="mode"
                            value={selectedSlot.mode}
                            onChange={handleInputChange}
                            className="modal-availability-input"
                          >
                            <option value="video">Video</option>
                            <option value="in-person">In-person</option>
                            <option value="call">Call</option>
                          </select>
                        </div>

                        <div className="modal-availability-form-group">
                          <label
                            htmlFor="duration"
                            className="modal-availability-label"
                          >
                            Duration
                          </label>
                          <select
                            id="duration"
                            name="duration"
                            value={selectedSlot.duration}
                            onChange={handleInputChange}
                            className="modal-availability-input"
                          >
                            <option value="60 Minutes">60 Minutes</option>
                            <option value="45 Minutes">45 Minutes</option>
                          </select>
                        </div>

                        <div className="modal-availability-form-group">
                          <label
                            htmlFor="status"
                            className="modal-availability-label"
                          >
                            Status
                          </label>
                          <select
                            id="status"
                            name="status"
                            value={selectedSlot.status}
                            onChange={handleInputChange}
                            className="modal-availability-input"
                          >
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                          </select>
                        </div>

                        <div className="modal-availability-actions">
                          <button
                            type="button"
                            onClick={() => closeModal()}
                            className="modal-availability-cancel"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className={`modal-availability-save ${
                              loading ? "modal-availability-save-disabled" : ""
                            }`}
                          >
                            {loading ? "Updating..." : "Update"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pagination-controls flex justify-center mt-4 text-base">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="pagination-prev bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-l text-base"
                    >
                      Previous
                    </button>
                    <span className="pagination-info mx-4 ">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="pagination-next bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-r text-base"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailabilityManagements;

const TimeDropdown = ({ label, value, onChange, name }) => (
  <div className="time-dropdown-container">
    <label htmlFor={name} className="time-dropdown-label">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="time-dropdown-select"
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
  </div>
);
