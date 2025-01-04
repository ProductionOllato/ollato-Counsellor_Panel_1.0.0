import React, { useState } from "react";
import CustomCalendar from "./CustomCalendar";
import { useNotification } from "../context/NotificationContext";
import "../styles/AvailabilityForm.css";

const AvailabilityForm = ({ onSubmit }) => {
  const { triggerNotification } = useNotification();

  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    mode: "video",
    duration: "",
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
  const handleDateChange = (selectedDate) => {
    setFormData((prevData) => ({
      ...prevData,
      date: selectedDate,
    }));
  };

  // Form validation
  const validateForm = () => {
    const { date, start_time, end_time } = formData;

    if (!date || !start_time || !end_time) {
      triggerNotification("All fields are required.", "error");
      return false;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time for comparison

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

      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {/* Date Fields */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Date:
          </label>
          <CustomCalendar
            date={formData.date}
            onDateChange={handleDateChange}
          />
        </div>

        {/* Time Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Start Time:
            </label>
            <select
              name="start_time"
              value={formData.start_time}
              onChange={handleInputChange}
              className="custom-select"
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              End Time:
            </label>
            <select
              name="end_time"
              value={formData.end_time}
              onChange={handleInputChange}
              className="custom-select"
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
              className="custom-select"
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
              className="custom-select "
            >
              <option value="45 Minutes">45 Minutes</option>
              <option value="60 Minutes">60 Minutes</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-[#1E3E62] text-base hover:bg-[#0a1c31] text-white py-2 px-6 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-[#1E3E62]/50"
          >
            Add Availability
          </button>
        </div>
      </form >
    </div >
  );
};

export default AvailabilityForm;