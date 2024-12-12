import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { useNotification } from "../context/NotificationContext";
import { MdFirstPage, MdLastPage } from "react-icons/md";
import Calendar from "react-calendar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CiEdit } from "react-icons/ci";
import { MdDeleteForever, MdClose } from "react-icons/md";
import CustomCalendar from "../components/CustomCalendar";

function AvailabilityManagements() {
  const [availability, setAvailability] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null);
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    mode: "video",
    duration: "",
  });
  const [showAvailabilityTable, setShowAvailabilityTable] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSetAvailability, setShowSetAvailability] = useState(false);
  const { triggerNotification } = useNotification();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "ascending",
  });
  const slotsPerPage = 10;

  // Fetch availability slots from backend (mocked for now)
  useEffect(() => {
    const fetchAvailability = async () => {
      const mockData = [
        {
          id: 1,
          date: "2024-11-23",
          day: "Thursday",
          time_slot: "10:00:00 to 11:00:00",
          mode: "video",
          duration: "60",
          status: "Available",
          reason_of_cancellation: "",
        },
      ];

      setAvailability(mockData);
    };
    fetchAvailability();
  }, []);

  const resetForm = () => {
    setFormData({
      start_date: "",
      end_date: "",
      time: "",
      mode: "video",
      duration: "",
    });
    setCurrentSlot(null);
    setIsEditMode(false);
    setShowModal(false);
  };

  const validateSlot = () => {
    const { start_date, end_date, start_time, end_time, duration } = formData;
    if (!start_date || !end_date || !start_time || !end_time || !duration) {
      triggerNotification("All fields are required.", "error");
      return false;
    }
    const startTime = new Date(`${start_date}T${start_time}`);
    const endTime = new Date(`${end_date}T${end_time}`);

    if (startTime >= endTime) {
      triggerNotification("Start time must be before the end time.", "error");
      return false;
    }

    if (duration <= 0) {
      triggerNotification("Duration must be greater than 0!", "error");
      return false;
    }

    // const conflict = availability.some((slot) => {
    //   const slotStart = new Date(slot.date);
    //   const slotEnd = slotStart;
    //   const formStart = new Date(start_date);
    //   const formEnd = new Date(end_date);

    //   return (
    //     ((formStart >= slotStart && formStart <= slotEnd) ||
    //       (formEnd >= slotStart && formEnd <= slotEnd)) &&
    //     slot.time_slot === time &&
    //     slot.id !== (currentSlot?.id || null)
    //   );
    // });

    const conflict = availability.some((slot) => {
      const slotStart = new Date(
        slot.date + "T" + slot.time_slot.split(" to ")[0]
      );
      const slotEnd = new Date(
        slot.date + "T" + slot.time_slot.split(" to ")[1]
      );
      const formStart = startTime; // Use startTime from the validation logic
      const formEnd = endTime; // Use endTime from the validation logic

      return (
        // Checking if the time intervals overlap
        ((formStart >= slotStart && formStart < slotEnd) ||
          (formEnd > slotStart && formEnd <= slotEnd)) &&
        slot.id !== (currentSlot?.id || null) // Ensure we're not comparing the same slot being edited
      );
    });

    if (conflict) {
      triggerNotification("This slot overlaps with an existing one.", "error");
      return false;
    }

    return true;
  };

  const handleStatusChange = (slotId, newStatus) => {
    setAvailability((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, status: newStatus } : slot
      )
    );
    setShowStatusModal(false);
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const addSlot = (newSlot) => {
    setAvailability((prev) => [newSlot, ...prev]);
    triggerNotification("Slot added successfully!", "success");
  };

  const updateSlot = (newSlot) => {
    setAvailability((prev) =>
      prev.map((slot) => (slot.id === currentSlot.id ? newSlot : slot))
    );
    triggerNotification("Slot updated successfully!", "success");
  };

  const handleAddOrUpdateSlot = () => {
    if (!validateSlot()) return;

    const newSlot = {
      id: isEditMode
        ? currentSlot.id
        : availability.length
        ? Math.max(availability.map((s) => s.id)) + 1
        : 1,
      date: format(new Date(formData.start_date), "yyyy-MM-dd"),
      day: format(new Date(formData.start_date), "EEEE"),
      time_slot: `${formData.start_time} to ${formData.end_time}`,
      mode: formData.mode,
      duration: formData.duration,
      status: "Available",
    };

    isEditMode ? updateSlot(newSlot) : addSlot(newSlot);

    resetForm();
    setShowSetAvailability(false);
    setShowAvailabilityTable(true);
  };

  const handleDeleteSlot = (id) => {
    setAvailability((prev) => prev.filter((slot) => slot.id !== id));
    triggerNotification("Slot deleted successfully!", "error");
  };

  const handleEditSlot = (slot) => {
    setIsEditMode(true);
    setCurrentSlot(slot);
    setFormData({
      start_date: slot.date,
      end_date: slot.date,
      start_time: slot.time_slot.split(" to ")[0],
      end_time: slot.time_slot.split(" to ")[1],
      mode: slot.mode,
      duration: slot.duration,
    });
    setShowModal(true);
  };

  const filteredData = availability.filter(
    (entry) =>
      entry.date.includes(searchQuery) ||
      entry.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.time_slot.includes(searchQuery) ||
      entry.mode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    // if (a[sortConfig.key] < b[sortConfig.key])
    //   return sortConfig.direction === "ascending" ? -1 : 1;
    // if (a[sortConfig.key] > b[sortConfig.key])
    //   return sortConfig.direction === "ascending" ? 1 : -1;
    // return 0;
    a.date < b.date ? 1 : b.date < a.date ? -1 : 0;
  });

  const totalPages = Math.ceil(sortedData.length / slotsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * slotsPerPage,
    currentPage * slotsPerPage
  );

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const toggleView = (view) => {
    setShowSetAvailability(view === "add");
    setShowAvailabilityTable(view === "show");
  };

  return (
    <>
  <div className="p-6 pt-1">
  
  <div className="flex justify-center items-center mb-6 px-4 sm:px-6">
    <h1 className="text-xl sm:text-2xl font-semibold text-gray-700 text-center">
      Availability Management
    </h1>
  </div>

  
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

  
  {showSetAvailability && (
    <div className="mb-8">
      <AvailabilityForm
        formData={formData}
        setFormData={setFormData}
        handleAddOrUpdateSlot={handleAddOrUpdateSlot}
        resetForm={resetForm}
      />
    </div>
  )}

  
  {showAvailabilityTable && (
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
                {[{ key: "sr_no", label: "Sr. No." },
                  { key: "date", label: "Date" },
                  { key: "day", label: "Day" },
                  { key: "time_slot", label: "Time" },
                  { key: "mode", label: "Mode" },
                  { key: "duration", label: "Duration" },
                  { key: "status", label: "Status" }].map((col) => (
                  <th
                    key={col.key}
                    className="p-4 text-sm font-normal leading-none text-slate-500 border-b border-slate-300"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    {sortConfig.key === col.key && (
                      <span
                        className={`ml-2 ${sortConfig.direction === "ascending" ? "text-blue-500" : "text-red-500"} text-sm`}
                      >
                        {sortConfig.direction === "ascending" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                ))}
                <th className="p-4 text-sm font-normal leading-none text-slate-500 border-b border-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((slot, index) => (
                  <tr key={slot.id} className="hover:bg-slate-50">
                    <td className="p-4 border-b border-slate-200">{(currentPage - 1) * slotsPerPage + index + 1}</td>
                    <td className="p-4 border-b border-slate-200">{slot.date}</td>
                    <td className="p-4 border-b border-slate-200">{slot.day}</td>
                    <td className="p-4 border-b border-slate-200">{slot.time_slot}</td>
                    <td className="p-4 border-b border-slate-200">{slot.mode}</td>
                    <td className="p-4 border-b border-slate-200">{slot.duration} mins</td>
                    <td className="p-4 border-b border-slate-200">
                      <span className={`py-1 px-2 rounded text-white text-sm ${slot.status === "Available" ? "bg-[#347928]" : "bg-gray-500"}`}
                        onClick={() => { setCurrentSlot(slot); setShowStatusModal(true); }}
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
                  <td colSpan="8" className="text-center p-4 text-gray-500 font-medium">No sessions found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-l"
              >
                <MdFirstPage />
              </button>
              <span className="mx-4">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-r"
              >
                <MdLastPage />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )}

  {/* Status Modal */}
  {showStatusModal && (
    <div>
      <div className="fixed inset-0 bg-gray-700 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded shadow-lg p-6 w-96 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-center">Change Current Status</h2>
          <div className="text-gray-700 mb-4 flex justify-center">
            <button
              onClick={() => handleStatusChange(currentSlot.id, "Available")}
              className="bg-[#347928] hover:bg-[#A5B68D] hover:text-[#001F3F] text-[#dbe1e7] font-medium py-1 px-3 rounded mr-2 flex items-center"
              aria-label="Set status to Available"
            >
              Available
            </button>
            <button
              onClick={() => handleStatusChange(currentSlot.id, "Not Available")}
              className="bg-[#FFBD73] hover:bg-[#FFC107] text-[#001F3F] font-medium py-1 px-3 rounded mr-2 flex items-center"
              aria-label="Set status to Not Available"
            >
              Not Available
            </button>
          </div>
          <button
            onClick={() => setShowStatusModal(false)}
            className="bg-[#AE445A] hover:bg-[#FF4545] text-[#001F3F] font-medium py-1 px-3 rounded flex items-center w-fit mx-auto"
            aria-label="Close the status modal"
          >
            Close <MdClose />
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Edit Modal */}
  {showModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#D3F1DF] rounded-lg shadow-lg p-8 w-full max-w-md transition-transform transform hover:scale-105">
        <h2 className="text-xl font-semibold text-center mb-6">Edit Availability Slot</h2>
        <AvailabilityForm
          formData={formData}
          setFormData={setFormData}
          handleAddOrUpdateSlot={handleAddOrUpdateSlot}
          resetForm={resetForm}
        />
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowModal(false)}
            className="bg-[#AE445A] hover:bg-[#FF4545] text-white font-medium py-1 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )}
</div>

    </>
  );
}

export default AvailabilityManagements;

// Availability Form
function AvailabilityForm({
  formData,
  setFormData,
  handleAddOrUpdateSlot,
  resetForm,
}) {
  // Generate time slots for selection, extending to cover common time ranges.
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return `${hour}:00`;
  });

  const handleStartDateChange = (selectedDate) => {
    setFormData((prev) => ({
      ...prev,
      start_date: selectedDate,
    }));
  };

  const handleEndDateChange = (selectedDate) => {
    setFormData((prev) => ({
      ...prev,
      end_date: selectedDate,
    }));
  };

  return (
    <div className="p-6 pt-1">
  
  <div className="container mx-auto">

    
    <div className="flex justify-center items-center mb-6 px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-700 text-center">
        Availability Management
      </h1>
    </div>

    
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

    
    {showSetAvailability && (
      <div className="mb-8">
        <AvailabilityForm
          formData={formData}
          setFormData={setFormData}
          handleAddOrUpdateSlot={handleAddOrUpdateSlot}
          resetForm={resetForm}
        />
      </div>
    )}

    
    {showAvailabilityTable && (
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
                  {[{ key: "sr_no", label: "Sr. No." },
                    { key: "date", label: "Date" },
                    { key: "day", label: "Day" },
                    { key: "time_slot", label: "Time" },
                    { key: "mode", label: "Mode" },
                    { key: "duration", label: "Duration" },
                    { key: "status", label: "Status" }].map((col) => (
                    <th
                      key={col.key}
                      className="p-4 text-sm font-normal leading-none text-slate-500 border-b border-slate-300"
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      {sortConfig.key === col.key && (
                        <span
                          className={`ml-2 ${sortConfig.direction === "ascending" ? "text-blue-500" : "text-red-500"} text-sm`}
                        >
                          {sortConfig.direction === "ascending" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                  ))}
                  <th className="p-4 text-sm font-normal leading-none text-slate-500 border-b border-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((slot, index) => (
                    <tr key={slot.id} className="hover:bg-slate-50">
                      <td className="p-4 border-b border-slate-200">{(currentPage - 1) * slotsPerPage + index + 1}</td>
                      <td className="p-4 border-b border-slate-200">{slot.date}</td>
                      <td className="p-4 border-b border-slate-200">{slot.day}</td>
                      <td className="p-4 border-b border-slate-200">{slot.time_slot}</td>
                      <td className="p-4 border-b border-slate-200">{slot.mode}</td>
                      <td className="p-4 border-b border-slate-200">{slot.duration} mins</td>
                      <td className="p-4 border-b border-slate-200">
                        <span className={`py-1 px-2 rounded text-white text-sm ${slot.status === "Available" ? "bg-[#347928]" : "bg-gray-500"}`}
                          onClick={() => { setCurrentSlot(slot); setShowStatusModal(true); }}
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
                    <td colSpan="8" className="text-center p-4 text-gray-500 font-medium">No sessions found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-l"
                >
                  <MdFirstPage />
                </button>
                <span className="mx-4">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-r"
                >
                  <MdLastPage />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    )}

    {/* Status Modal */}
    {showStatusModal && (
      <div>
        <div className="fixed inset-0 bg-gray-700 bg-opacity-75 transition-opacity"></div>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-96 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-center">Change Current Status</h2>
            <div className="text-gray-700 mb-4 flex justify-center">
              <button
                onClick={() => handleStatusChange(currentSlot.id, "Available")}
                className="bg-[#347928] hover:bg-[#A5B68D] hover:text-[#001F3F] text-[#dbe1e7] font-medium py-1 px-3 rounded mr-2 flex items-center"
                aria-label="Set status to Available"
              >
                Available
              </button>
              <button
                onClick={() => handleStatusChange(currentSlot.id, "Not Available")}
                className="bg-[#FFBD73] hover:bg-[#FFC107] text-[#001F3F] font-medium py-1 px-3 rounded mr-2 flex items-center"
                aria-label="Set status to Not Available"
              >
                Not Available
              </button>
            </div>
            <button
              onClick={() => setShowStatusModal(false)}
              className="bg-[#AE445A] hover:bg-[#FF4545] text-[#001F3F] font-medium py-1 px-3 rounded flex items-center w-fit mx-auto"
              aria-label="Close the status modal"
            >
              Close <MdClose />
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Modal */}
    {showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#D3F1DF] rounded-lg shadow-lg p-8 w-full max-w-md transition-transform transform hover:scale-105">
          <h2 className="text-xl font-semibold text-center mb-6">Edit Availability Slot</h2>
          <AvailabilityForm
            formData={formData}
            setFormData={setFormData}
            handleAddOrUpdateSlot={handleAddOrUpdateSlot}
            resetForm={resetForm}
          />
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowModal(false)}
              className="bg-[#AE445A] hover:bg-[#FF4545] text-white font-medium py-1 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
</div>

  );
}
