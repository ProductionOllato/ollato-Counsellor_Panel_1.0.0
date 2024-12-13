import React, { useState } from "react";
import CustomCalendar from "./CustomCalendar";
import { useNotification } from "../context/NotificationContext";

const AvailabilityForm = ({ onSubmit }) => {
  const { triggerNotification } = useNotification();

  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    mode: "video", // default mode is 'video'
    duration: "60", // default duration is 60 mins
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle calendar date changes
  const handleStartDateChange = (selectedDate) => {
    setFormData((prevData) => ({
      ...prevData,
      start_date: selectedDate,
    }));
  };

  const handleEndDateChange = (selectedDate) => {
    setFormData((prevData) => ({
      ...prevData,
      end_date: selectedDate,
    }));
  };

  // Form validation
  const validateForm = () => {
    const { start_date, end_date, start_time, end_time } = formData;

    if (!start_date || !end_date || !start_time || !end_time) {
      triggerNotification("All fields are required.", "error");
      return false;
    }

    if (new Date(start_date) > new Date(end_date)) {
      triggerNotification("Start date cannot be after the end date.", "error");
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

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (onSubmit) {
      onSubmit(formData); // Pass form data to parent component
    }
  };

  return (
    <div className="w-full p-6 border rounded-md shadow-md bg-gray-50">
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
        Add Availability
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Start Date:
            </label>
            <CustomCalendar
              date={formData.start_date}
              onDateChange={handleStartDateChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              End Date:
            </label>
            <CustomCalendar
              date={formData.end_date}
              onDateChange={handleEndDateChange}
            />
          </div>
        </div>

        {/* Time Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Start Time:
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              End Time:
            </label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Mode and Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mode:
            </label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            >
              <option value="video">Video</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Duration (minutes):
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
            >
              <option value="45">45 Minutes</option>
              <option value="60">60 Minutes</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-[#1E3E62] hover:bg-[#0a1c31] text-white py-2 px-6 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-[#1E3E62]/50"
          >
            Add Availability
          </button>
        </div>
      </form>
    </div>
  );
};

export default AvailabilityForm;
