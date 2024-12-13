import React, { useEffect, useState } from "react";
import { useNotification } from "../context/NotificationContext";
import {
  MdFirstPage,
  MdLastPage,
  MdDeleteForever,
  MdClose,
} from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import axios from "axios";
import AvailabilityForm from "../components/AvailabilityForm";
import { useAuth } from "../context/UserContext";

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
  const { user } = useAuth();

  const slotsPerPage = 10;

  // Fetch Availability Data
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${APIURL}/counsellor/get-availability`
        );
        setAvailability(response.data || []);
      } catch (error) {
        triggerNotification(
          error.response?.data?.message || "Failed to fetch availability.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [APIURL]);

  // Reset Form State
  const resetForm = () => {
    setFormData(initialFormData());
    setIsEditMode(false);
    setCurrentSlot(null);
    setModal({ show: false, type: null });
  };

  // Handle Search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Validate Slot
  // const validateSlot = () => {
  //   const { start_date, end_date, start_time, end_time, duration } = formData;
  //   if (!start_date || !end_date || !start_time || !end_time || !duration) {
  //     triggerNotification("All fields are required.", "error");
  //     return false;
  //   }

  //   if (new Date(start_date) > new Date(end_date)) {
  //     triggerNotification("Start date cannot be after end date.", "error");
  //     return false;
  //   }

  //   const startTime = new Date(`2000-01-01T${start_time}`);
  //   const endTime = new Date(`2000-01-01T${end_time}`);
  //   if (startTime >= endTime) {
  //     triggerNotification("Start time must be before end time.", "error");
  //     return false;
  //   }

  //   if (parseInt(duration, 10) <= 0) {
  //     triggerNotification("Duration must be greater than 0.", "error");
  //     return false;
  //   }

  //   // Check Overlaps
  //   const conflict = availability.some((slot) => {
  //     const [slotStart, slotEnd] = slot.time_slot
  //       .split(" to ")
  //       .map((time) => new Date(`2000-01-01T${time}`));
  //     const currentStart = startTime;
  //     const currentEnd = endTime;

  //     return (
  //       currentStart < slotEnd &&
  //       currentEnd > slotStart &&
  //       slot.id !== (currentSlot?.id || null)
  //     );
  //   });

  //   if (conflict) {
  //     triggerNotification("This slot overlaps with an existing one.", "error");
  //     return false;
  //   }

  //   return true;
  // };

  const validateSlot = () => {
    const { start_date, start_time, end_time, mode, duration } = formData;

    if (!start_date || !start_time || !end_time || !mode || !duration) {
      triggerNotification("All fields are required.", "error");
      return false;
    }

    if (
      new Date(`2000-01-01T${start_time}`) >= new Date(`2000-01-01T${end_time}`)
    ) {
      triggerNotification("Start time must be before end time.", "error");
      return false;
    }

    return true; // Pass validation
  };

  // Add or Update Slot
  const handleSaveSlot = async () => {
    if (!validateSlot()) return;

    const newSlot = {
      id: isEditMode ? currentSlot.id : undefined,
      ...formData,
      status: "Available",
      time_slot: `${formData.start_time} to ${formData.end_time}`,
    };

    try {
      if (isEditMode) {
        await axios.put(`${APIURL}/counsellor/update-availability`, newSlot);
        setAvailability((prev) =>
          prev.map((slot) => (slot.id === newSlot.id ? newSlot : slot))
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
  const handleDeleteSlot = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;

    try {
      await axios.delete(`${APIURL}/counsellor/delete-availability/${id}`);
      setAvailability((prev) => prev.filter((slot) => slot.id !== id));
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

  const paginatedData = sortedData.slice(
    (currentPage - 1) * slotsPerPage,
    currentPage * slotsPerPage
  );

  const toggleView = (view) => {
    setView(view);
  };

  // const handleAvailabilitySubmit = async (formData) => {
  //   const counsellor_id = user.user_id;
  //   try {
  //     const response = await axios.post(
  //       `${APIURL}/counsellor/set-availability`,
  //       { ...formData, counsellor_id }
  //     );

  //     if (response.status === 200) {
  //       triggerNotification("Availability added successfully!", "success");
  //       // Optional: Clear the form or update availability list here
  //     } else {
  //       triggerNotification(
  //         response.data?.message || "Failed to add availability.",
  //         "error"
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error submitting availability:", error);
  //     triggerNotification(
  //       error.response?.data?.message || "Something went wrong!",
  //       "error"
  //     );
  //   } finally {
  //     resetForm();
  //   }
  // };

  const handleAvailabilitySubmit = async (formData) => {
    const counsellor_id = user.user_id; // Get the counsellor ID

    // Transform formData to match the backend payload
    const payload = {
      counsellor_id,
      dates: [formData.start_date],
      mode: formData.mode === "video" ? "online" : "in-person",
      duration: formData.duration === "60" ? "1 hour" : "45 minutes",
      status: "available",
      start_time: `${formData.start_time}:00`,
      end_time: `${formData.end_time}:00`,
    };

    console.log("Payload:", payload);

    try {
      const response = await axios.post(
        `${APIURL}/counsellor/set-availability`,
        payload
      );

      if (response.status === 200) {
        triggerNotification("Availability added successfully!", "success");
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

  return (
    <div className="p-6">
      <div className="flex justify-center items-center mb-6 px-4 sm:px-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-700 text-center">
          Availability Management
        </h1>
      </div>

      {/* Add and Show Buttons */}

      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 px-4 sm:px-6">
        <button
          onClick={() => {
            resetForm();
            toggleView("add");
          }}
          className="bg-[#8174A0] hover:bg-[#A888B5] text-white py-2 px-6 rounded w-full sm:w-auto"
        >
          Add Availability
        </button>
        <button
          onClick={() => toggleView("show")}
          className="bg-[#8174A0] hover:bg-[#A888B5] text-white py-2 px-6 rounded w-full sm:w-auto"
        >
          Show Availability
        </button>
      </div>
      {/*  */}

      {view === "add" && (
        <section>
          <div>
            <AvailabilityForm
              // onSubmit={handleAvailabilitySubmit}
              onSubmit={async (formData) => {
                await handleAvailabilitySubmit(formData);
              }}
            />
          </div>
        </section>
      )}

      {view === "show" && (
        <section className="bg-white antialiased mb-8">
          <div className="w-full max-w-full px-4 sm:px-6">
            <div className="relative border border-[#85A98F] rounded-sm">
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={handleSearch}
                aria-label="Search sessions"
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-[#D3F1DF] pl-3 pr-28 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
              />
            </div>
          </div>

          <div className="max-w-screen-xl px-4 py-6 mx-auto lg:px-6 sm:py-16 lg:py-4">
            <div className="overflow-x-auto mt-6">
              <table className="min-w-full table-auto border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-300">
                    {[
                      { key: "sr_no", label: "Sr. No." },
                      { key: "date", label: "Date" },
                      { key: "day", label: "Day" },
                      { key: "time_slot", label: "Time" },
                      { key: "mode", label: "Mode" },
                      { key: "duration", label: "Duration" },
                      { key: "status", label: "Status" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        className="p-4 text-sm font-normal leading-none text-slate-500 border-b border-slate-300"
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
                            {sortConfig.direction === "ascending" ? "▲" : "▼"}
                          </span>
                        )}
                      </th>
                    ))}
                    <th className="p-4 text-sm font-normal leading-none text-slate-500 border-b border-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((slot, index) => (
                      <tr key={slot.id} className="hover:bg-slate-50">
                        <td className="p-4 border-b border-slate-200">
                          {(currentPage - 1) * slotsPerPage + index + 1}
                        </td>
                        <td className="p-4 border-b border-slate-200">
                          {slot.date}
                        </td>
                        <td className="p-4 border-b border-slate-200">
                          {slot.day}
                        </td>
                        <td className="p-4 border-b border-slate-200">
                          {slot.startTime} to {slot.endTime}
                        </td>
                        <td className="p-4 border-b border-slate-200">
                          {slot.mode}
                        </td>
                        <td className="p-4 border-b border-slate-200">
                          {slot.duration} mins
                        </td>
                        <td className="p-4 border-b border-slate-200">
                          <span
                            className={`py-1 px-2 rounded text-white text-sm ${
                              slot.status === "Available"
                                ? "bg-[#347928]"
                                : "bg-gray-500"
                            }`}
                            onClick={() => {
                              setCurrentSlot(slot);
                              setShowStatusModal(true);
                            }}
                          >
                            {slot.status}
                          </span>
                        </td>
                        <td className="p-4 border-b border-slate-200">
                          <button
                            onClick={() => handleEditSlot(slot)}
                            className="bg-[#FFBD73] hover:bg-yellow-600 text-[#001F3F] font-medium py-1 px-3 rounded mr-2 flex items-center"
                          >
                            Edit <CiEdit />
                          </button>
                        </td>
                        <td className="p-4 border-b border-slate-200">
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="bg-[#AE445A] hover:bg-[#FF4545] text-[#001F3F] font-medium py-1 px-3 rounded flex items-center"
                          >
                            Delete <MdDeleteForever />
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
                </tbody>
              </table>

              {/* {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={currentPage === 1}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-l"
                  >
                    <MdFirstPage />
                  </button>
                  <span className="mx-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-r"
                  >
                    <MdLastPage />
                  </button>
                </div>
              )} */}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AvailabilityManagements;
