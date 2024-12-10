import React, { useState } from "react";
import {
  format,
  startOfWeek,
  addDays,
  subWeeks,
  addWeeks,
  isSameDay,
} from "date-fns";
import {
  IoIosArrowDropleftCircle,
  IoIosArrowDroprightCircle,
} from "react-icons/io";

function CustomCalendar({ date, onDateChange }) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));

  const handleDateClick = (selectedDate) => {
    onDateChange(selectedDate);
  };

  const prevWeek = () => setCurrentWeek((prev) => subWeeks(prev, 1));
  const nextWeek = () => setCurrentWeek((prev) => addWeeks(prev, 1));

  // Generate dates for the current week
  const weekDates = Array.from({ length: 7 }, (_, index) =>
    addDays(currentWeek, index)
  );

  return (
    <div className="max-w-md mx-auto border p-4 rounded-md shadow-md bg-[#dee0e6]">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevWeek}
          className="flex items-center p-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300"
        >
          <IoIosArrowDropleftCircle size={24} />
        </button>
        {/* <h2 className="text-sm font-semibold text-gray-800">
          {`${format(currentWeek, "MMMM d")} - ${format(
            addDays(currentWeek, 6),
            "MMMM d, yyyy"
          )}`}
        </h2> */}
        <div className="text-center min-h-4 min-w-6">
          <h2 className="text-md font-bold text-gray-800">
            {format(currentWeek, "dd MMMM yyyy")}
          </h2>
          {/* <h4 className="text-sm font-semibold text-gray-700">
            {`${format(currentWeek, "MMMM d")} - ${format(
              addDays(currentWeek, 6),
              "MMMM d, yyyy"
            )}`}
          </h4> */}
        </div>
        <button
          type="button"
          onClick={nextWeek}
          className="flex items-center p-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300"
        >
          <IoIosArrowDroprightCircle size={24} />
        </button>
      </div>

      {/* Days of the Week */}
      <div className="grid grid-cols-7 text-center font-medium text-gray-600 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Dates of the Week */}
      <div className="grid grid-cols-7 gap-3">
        {weekDates.map((day) => {
          const isSelected = isSameDay(day, date);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              type="button"
              key={day}
              onClick={() => handleDateClick(day)}
              className={`p-1 min-w-10 rounded-md text-center border ${
                isSelected
                  ? "bg-[#433878] text-white"
                  : isToday
                  ? "bg-[#659287] text-[#ffffff]"
                  : "bg-white text-gray-700"
              } hover:bg-[#433878] hover:text-[#f4f2fc] border-[#433878]`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CustomCalendar;
