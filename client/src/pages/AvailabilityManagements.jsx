import React, { useEffect, useState } from "react";
import { useNotification } from "../context/NotificationContext";
import { MdDeleteForever } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import axios from "axios";
import AvailabilityForm from "../components/AvailabilityForm";
import { useAuth } from "../context/UserContext";
import "../styles/AvailabilityManagements.css";

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

  useEffect(() => {
    const fetchAvailabilityData = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          `${APIURL}/counsellor/get-availability`,
          { counsellor_id: user.user_id }
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
  }, [user, APIURL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
      duration: `${formData.duration} minutes`,
      status: "available",
      start_time: `${formData.start_time}:00`,
      end_time: `${formData.end_time}:00`,
    };

    console.log("Payload:", payload);
    console.log("FormData:", formData);

    try {
      const response = await axios.post(
        `${APIURL}/counsellor/set-availability`,
        payload
      );
      console.log("Response set availability:", response);

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

  //
  const handleEditSlot = (slot) => {
    setSelectedSlot(slot);
    setShowEditModal(true);
  };

  //handle update slot
  // const handleUpdateSlot = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   console.log("Selected Slot:", selectedSlot);

  //   const payload = {
  //     counsellor_id: selectedSlot.counsellor_id,
  //     date: selectedSlot.date,
  //     start_time: selectedSlot.start_time,
  //     end_time: selectedSlot.end_time,
  //     mode: selectedSlot.mode,
  //     duration: selectedSlot.duration,
  //     status: selectedSlot.status,
  //   };
  //   console.log("Payload update availability:", payload);

  //   try {
  //     const response = await axios.put(
  //       `${APIURL}/counsellor/update-availability`,
  //       payload
  //     );
  //     console.log("Response update availability:", response);

  //     if (response.status === 200) {
  //       // Update the availability in the state after successful update
  //       setAvailability((prev) =>
  //         prev.map((slot) =>
  //           slot.sr_no === selectedSlot.sr_no ? selectedSlot : slot
  //         )
  //       );
  //       setShowEditModal(false); // Close the modal
  //       triggerNotification("Availability updated successfully!", "success");
  //     } else {
  //       throw new Error(
  //         response.data.message || "Failed to update availability."
  //       );
  //     }
  //   } catch (error) {
  //     console.error(error.message || "Failed to update availability.");
  //     triggerNotification(
  //       error.message || "Failed to update availability.",
  //       "error"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleUpdateSlot = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Selected Slot:", selectedSlot);

    const payload = {
      counsellor_id: user.user_id, // Ensure you are sending the counsellor ID
      dates: [selectedSlot.date],
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      mode: selectedSlot.mode,
      duration: selectedSlot.duration,
      status: selectedSlot.status,
    };

    console.log("Payload update availability:", payload);

    try {
      const response = await axios.put(
        `${APIURL}/counsellor/update-availability`,
        payload
      );
      console.log("Response update availability:", response);

      if (response.status === 200) {
        // Update the availability in the state after successful update
        setAvailability((prev) =>
          prev.map((slot) =>
            slot.sr_no === selectedSlot.sr_no ? { ...slot, ...payload } : slot
          )
        );
        setShowEditModal(false); // Close the modal
        triggerNotification("Availability updated successfully!", "success");
      } else {
        throw new Error(
          response.data.message || "Failed to update availability."
        );
      }
    } catch (error) {
      console.error(error.message || "Failed to update availability.");
      triggerNotification(
        error.response?.data?.message || "Failed to update availability.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSlot = async () => {
    if (!validateSlot()) return;

    const newSlot = {
      sr_no: isEditMode ? currentSlot.sr_no : undefined,
      ...formData,
      status: "Available",
      time_slot: `${formData.start_time} to ${formData.end_time}`,
    };

    try {
      if (isEditMode) {
        await axios.put(`${APIURL}/counsellor/update-availability`, newSlot);
        setAvailability((prev) =>
          prev.map((slot) => (slot.sr_no === newSlot.sr_no ? newSlot : slot))
        );
        triggerNotification("Slot updated successfully!", "success");
      } else {
        const response = await axios.post(
          `${APIURL}/counsellor/set-availability`,
          newSlot
        );
        setAvailability((prev) => [response.data, ...prev]);
        triggerNotification("Slot added successfully!", "success");
      }
    } catch (error) {
      triggerNotification(
        error.response?.data?.message || "Failed to save availability slot.",
        "error"
      );
    } finally {
      resetForm();
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

  // Sorting
  const sortedData = [...availability]
    .filter((entry) =>
      [entry.date, entry.time_slot, entry.mode, entry.status]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      return sortConfig.direction === "ascending"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    });

  const handleSort = (key) => {
    const direction =
      sortConfig.direction === "ascending" ? "descending" : "ascending";
    setSortConfig({ key, direction });
  };

  const startIndex = (currentPage - 1) * slotsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + slotsPerPage);

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const tableData = searchQuery ? sortedData : availability;

  const toggleView = (view) => {
    setView(view);
  };

  return (
    <div className="availability-container w-full bg-white shadow-lg rounded-lg mt-10 pt-2 h-full">
      <div className="flex justify-center items-center mb-6 px-4 sm:px-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-700 text-center">
          Availability Management
        </h1>
      </div>

      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 px-4 sm:px-6 ">
        <button
          onClick={() => {
            resetForm();
            toggleView("add");
          }}
          className="bg-[#8174A0] hover:bg-[#A888B5] text-white py-2 px-6 rounded w-full sm:w-auto text-base"
        >
          Add Availability
        </button>
        <button
          onClick={() => toggleView("show")}
          className="bg-[#8174A0] hover:bg-[#A888B5] text-white py-2 px-6 rounded w-full sm:w-auto text-base"
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
            <p className="text-gray-700 font-semibold text-center">
              Loading...
            </p>
          ) : (
            <section className="bg-white antialiased mb-8">
              <div className="w-full max-w-full px-4 sm:px-6">
                <div className="relative border border-[#85A98F] rounded-sm">
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={handleSearch}
                    aria-label="Search sessions"
                    className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-[#D3F1DF] pl-10 pr-12 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                  />
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="w-5 h-5 text-slate-400"
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
              </div>

              <div className="max-w-screen-xl mx-auto">
                <div className="overflow-x-auto mt-6">
                  <table className="min-w-full table-auto border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-300 text-center text-base">
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
                            className="p-2 text-base font-normal leading-none text-slate-500 border-b border-slate-300 "
                            onClick={() => handleSort(col.key)}
                          >
                            {col.label}
                            {sortConfig.key === col.key && (
                              <span
                                className={`ml-2 ${
                                  sortConfig.direction === "ascending"
                                    ? "text-blue-500"
                                    : "text-red-500"
                                } text-sm`}
                              >
                                {sortConfig.direction === "ascending"
                                  ? "▲"
                                  : "▼"}
                              </span>
                            )}
                          </th>
                        ))}
                        <th className="p-2 text-sm font-normal leading-none text-slate-500 border-b border-slate-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.length > 0 ? (
                        paginatedData.map((slot, index) => (
                          <tr key={slot.sr_no} className="hover:bg-slate-50">
                            <td className="py-4 text-center border-b border-slate-200">
                              {(currentPage - 1) * slotsPerPage + index + 1}
                            </td>
                            <td className="py-4 text-center  border-b border-slate-200">
                              {slot.date}
                            </td>
                            <td className="py-4 text-center border-b border-slate-200">
                              {slot.start_time} to {slot.end_time}
                            </td>
                            <td className="py-4 text-center border-b border-slate-200">
                              {slot.mode}
                            </td>
                            <td className="py-4 text-center border-b border-slate-200">
                              {slot.duration}
                            </td>
                            <td className="py-4 text-center border-b border-slate-200">
                              <span
                                className={`py-1 text-center px-2 rounded text-white text-sm ${
                                  slot.status === "available"
                                    ? "bg-[#347928]"
                                    : "bg-gray-500"
                                }`}
                              >
                                {slot.status}
                              </span>
                            </td>
                            <td className="py-2 border-b border-slate-200 flex justify-center">
                              <button
                                onClick={() => handleEditSlot(slot)}
                                className="bg-[#FFBD73] hover:bg-yellow-600 text-[#001F3F] font-medium py-1 px-3 rounded mr-2 flex items-center text-sm"
                              >
                                <CiEdit />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteSlot(slot.sr_no, slot)
                                }
                                className="bg-[#AE445A] hover:bg-[#FF4545] text-[#001F3F] font-medium py-1 px-3 rounded flex items-center text-sm"
                              >
                                <MdDeleteForever />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-center p-4 text-gray-500 font-medium"
                          >
                            No sessions found.
                          </td>
                        </tr>
                      )}
                      {/* {tableData.length === 0 && (
                        <tr>
                          <td
                            colSpan="8"
                            className="text-center p-4 text-gray-500 font-medium"
                          >
                            No sessions found matching the search criteria.
                          </td>
                        </tr>
                      )} */}
                    </tbody>
                  </table>

                  {/* Edit Modal */}
                  {showEditModal && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center z-50 w-full transition-opacity duration-300 opacity-100">
                      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                          Edit Availability
                        </h2>
                        <form
                          onSubmit={handleUpdateSlot}
                          className="space-y-6 grid grid-cols-2"
                        >
                          <div className="mb-5">
                            <label
                              htmlFor="date"
                              className="block text-sm font-medium text-gray-800"
                            >
                              Date
                            </label>
                            <input
                              id="date"
                              type="date"
                              name="date"
                              value={selectedSlot.date}
                              onChange={handleInputChange}
                              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                          <div className="mb-5">
                            <label
                              htmlFor="mode"
                              className="block text-sm font-medium text-gray-800"
                            >
                              Mode
                            </label>
                            <select
                              id="mode"
                              name="mode"
                              value={selectedSlot.mode}
                              onChange={handleInputChange}
                              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {[
                                { value: "video", label: "Video" },
                                { value: "in-person", label: "In-person" },
                              ].map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="mb-5">
                            <label
                              htmlFor="duration"
                              className="block text-sm font-medium text-gray-800"
                            >
                              Duration
                            </label>
                            <select
                              id="duration"
                              name="duration"
                              value={selectedSlot.duration}
                              onChange={handleInputChange}
                              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {[
                                { value: "60", label: "60 Minutes" },
                                { value: "45", label: "45 Minutes" },
                              ].map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="mb-5">
                            <label
                              htmlFor="status"
                              className="block text-sm font-medium text-gray-800"
                            >
                              Status
                            </label>
                            <select
                              id="status"
                              name="status"
                              value={selectedSlot.status}
                              onChange={handleInputChange}
                              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="available">Available</option>
                              <option value="unavailable">Unavailable</option>
                            </select>
                          </div>

                          <div className="flex justify-end mt-6 col-span-2">
                            <button
                              type="button"
                              onClick={() => setShowEditModal(false)}
                              className="text-base bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md mr-2 transition duration-150 ease-in-out"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={loading}
                              className={`text-base bg-[#7047A3] hover:bg-[#4b3368] text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out ${
                                loading ? "opacity-50 cursor-not-allowed" : ""
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
                    <div className="flex justify-center mt-4 text-base">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-l text-base"
                      >
                        Previous
                      </button>
                      <span className="mx-4 ">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-r text-base"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
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
  <div className="mb-5">
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
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
