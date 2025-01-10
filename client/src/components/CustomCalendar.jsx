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

import "../styles/CustomCalendar.css";

function CustomCalendar({ date, onDateChange }) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));

  const handleDateClick = (selectedDate) => {
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    onDateChange(formattedDate);
  };

  const prevWeek = () => setCurrentWeek((prev) => subWeeks(prev, 1));
  const nextWeek = () => setCurrentWeek((prev) => addWeeks(prev, 1));

  const weekDates = Array.from({ length: 7 }, (_, index) =>
    addDays(currentWeek, index)
  );

  return (
    <div className="calendar-container">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button type="button" onClick={prevWeek} className="nav-button">
          <IoIosArrowDropleftCircle size={24} />
        </button>

        <div className="current-month">
          <h2>{format(currentWeek, "MMMM yyyy")}</h2>
        </div>

        <button type="button" onClick={nextWeek} className="nav-button">
          <IoIosArrowDroprightCircle size={24} />
        </button>
      </div>

      {/* Days of the Week */}
      <div className="days-of-week">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="day">
            {day}
          </div>
        ))}
      </div>
      {/* Days of the Week- mobile */}
      <div className="days-of-week-mobile">
        {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
          <div key={day} className="day">
            {day}
          </div>
        ))}
      </div>

      {/* Dates of the Week */}
      <div className="dates-of-week">
        {weekDates.map((day) => {
          const isSelected = isSameDay(day, date);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              type="button"
              key={day}
              onClick={() => handleDateClick(day)}
              className={`date-button ${
                isSelected ? "selected" : isToday ? "today" : ""
              }`}
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

// import React, { useState } from "react";
// import {
//   format,
//   startOfMonth,
//   endOfMonth,
//   startOfWeek,
//   endOfWeek,
//   addMonths,
//   subMonths,
//   isSameDay,
//   addDays,
// } from "date-fns";
// import {
//   IoIosArrowDropleftCircle,
//   IoIosArrowDroprightCircle,
// } from "react-icons/io";

// import "../styles/CustomCalendar.css";

// function CustomCalendar({ date, onDateChange }) {
//   const [currentMonth, setCurrentMonth] = useState(new Date());

//   const handleDateClick = (selectedDate) => {
//     const formattedDate = format(selectedDate, "yyyy-MM-dd");
//     onDateChange(formattedDate);
//   };

//   const prevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
//   const nextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

//   // Generate days of the current month
//   const startDate = startOfMonth(currentMonth);
//   const endDate = endOfMonth(currentMonth);
//   const daysInMonth = [];

//   // Fill the array with days of the current month
//   for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
//     daysInMonth.push(date);
//   }

//   // Get the start and end of the week surrounding the month
//   const startWeek = startOfWeek(startDate);
//   const endWeek = endOfWeek(endDate);

//   // Fill in the previous and next month days
//   const allDays = [];
//   for (let date = startWeek; date <= endWeek; date = addDays(date, 1)) {
//     allDays.push(date);
//   }

//   return (
//     <div className="calendar-container">
//       {/* Calendar Header */}
//       <div className="calendar-header">
//         <button type="button" onClick={prevMonth} className="calendar-button">
//           <IoIosArrowDropleftCircle size={24} />
//         </button>

//         <div className="calendar-title">
//           <h2>{format(currentMonth, "MMMM yyyy")}</h2>
//         </div>

//         <button type="button" onClick={nextMonth} className="calendar-button">
//           <IoIosArrowDroprightCircle size={24} />
//         </button>
//       </div>

//       {/* Days of the Week */}
//       <div className="weekdays">
//         {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
//           <div key={day} className="weekday">
//             {day}
//           </div>
//         ))}
//       </div>

//       {/* Dates of the Month */}
//       <div className="dates-container">
//         {allDays.map((day) => {
//           const isSelected = isSameDay(day, date);
//           const isToday = isSameDay(day, new Date());

//           return (
//             <button
//               type="button"
//               key={day}
//               onClick={() => handleDateClick(day)}
//               className={`date-button ${isSelected ? "selected" : ""} ${
//                 isToday ? "today" : ""
//               }`}
//             >
//               {format(day, "d")}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// export default CustomCalendar;
