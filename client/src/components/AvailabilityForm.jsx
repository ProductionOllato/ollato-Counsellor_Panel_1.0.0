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
    mode: "",
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
    <div className="availability-form-container">
      <h2 className="availability-form-title">Add Availability</h2>

      <form onSubmit={handleSubmit} className="availability-form">
        {/* Date Fields */}
        <div>
          <CustomCalendar
            date={formData.date}
            onDateChange={handleDateChange}
          />
        </div>

        {/* Time Fields */}
        <div className="availability-form-grid availability-form-grid-sm">
          <div className="availability-form-grid-item custom-select-container">
            <label className="availability-form-label">Start Time:</label>
            <select
              name="start_time"
              value={formData.start_time}
              onChange={handleInputChange}
              className="availability-form-select custom-select"
            >
              <option value="" disabled>
                Choose Start Time
              </option>
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
          <div className="availability-form-grid-item custom-select-container">
            <label className="availability-form-label">End Time:</label>
            <select
              name="end_time"
              value={formData.end_time}
              onChange={handleInputChange}
              className="availability-form-select custom-select"
            >
              <option value="" disabled>
                Choose End Time
              </option>
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
        <div className="availability-form-grid availability-form-grid-sm ">
          <div className="availability-form-grid-item custom-select-container">
            <label className="availability-form-label">Mode:</label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleInputChange}
              className="availability-form-select custom-select"
            >
              <option value="" disabled>
                Select Mode
              </option>
              <option value="video">Video</option>
              <option value="in-person">In-Person</option>
              <option value="call">Call</option>
            </select>
          </div>

          <div className="availability-form-grid-item custom-select-container">
            <label className="availability-form-label">
              Duration (minutes):
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="availability-form-select custom-select"
            >
              <option value="" disabled>
                Select Duration
              </option>
              <option value="45 Minutes">45 Minutes</option>
              <option value="60 Minutes">60 Minutes</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="availability-form-button">
          <button type="submit" className="availability-form-submit">
            Add Availability
          </button>
        </div>
      </form>
    </div>
  );
};

export default AvailabilityForm;
