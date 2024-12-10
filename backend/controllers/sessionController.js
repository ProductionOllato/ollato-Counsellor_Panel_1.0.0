const db = require("../config/db"); // MySQL connection
const { body, validationResult } = require("express-validator");
const moment = require("moment"); // For date-time validation and formatting

// Book a Session
const bookSession = async (req, res) => {
  // Validate request body
  await body("student_id")
    .isInt()
    .withMessage("Student ID must be a valid integer")
    .run(req);
  await body("counsellor_id")
    .isInt()
    .withMessage("Counsellor ID must be a valid integer")
    .run(req);
  await body("b_date")
    .isDate()
    .withMessage("Booking date must be in YYYY-MM-DD format")
    .run(req);
  await body("b_time_slot")
    .matches(/^\d{2}:\d{2}:\d{2} to \d{2}:\d{2}:\d{2}$/)
    .withMessage("Time slot must be in HH:MM:SS to HH:MM:SS format")
    .run(req);
  await body("b_mode")
    .isIn(["Online", "In-person"])
    .withMessage('Mode must be "Online" or "In-person"')
    .run(req);
  await body("b_duration")
    .matches(/^\d{2}:\d{2}:\d{2}$/)
    .withMessage("Duration must be in HH:MM:SS format")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Destructure request body
  const { student_id, counsellor_id, b_time_slot, b_date, b_mode, b_duration } =
    req.body;

  try {
    // Extract start and end times from the time slot
    const [startTime, endTime] = b_time_slot.split(" to ");

    // Validate time ordering
    if (!moment(startTime, "HH:mm:ss").isBefore(moment(endTime, "HH:mm:ss"))) {
      return res
        .status(400)
        .json({ message: "Start time must be earlier than end time" });
    }

    // Convert date to standard format
    const bookingDate = moment(b_date, "YYYY-MM-DD").format("YYYY-MM-DD");

    // Check for booking conflicts for the same counsellor
    const [conflicts] = await db.query(
      `SELECT * FROM counsellor_booking
             WHERE counsellor_id = ?
             AND b_date = ?
             AND (
                 (b_time_slot LIKE ?)
                 OR (? BETWEEN SUBSTRING_INDEX(b_time_slot, ' to ', 1) AND SUBSTRING_INDEX(b_time_slot, ' to ', -1))
                 OR (? BETWEEN SUBSTRING_INDEX(b_time_slot, ' to ', 1) AND SUBSTRING_INDEX(b_time_slot, ' to ', -1))
             )`,
      [counsellor_id, bookingDate, `%${startTime}%`, startTime, endTime]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        message: "This time slot is already booked for the counsellor.",
      });
    }

    // Insert booking into the database
    const [result] = await db.query(
      `INSERT INTO counsellor_booking
             (student_id, counsellor_id, b_time_slot, b_date, b_mode, b_duration, Booked)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        counsellor_id,
        `${startTime} to ${endTime}`,
        bookingDate,
        b_mode,
        b_duration,
        true,
      ]
    );

    // Respond with booking details
    res.status(201).json({
      message: "Session booked successfully",
      booking: {
        session_id: result.insertId,
        student_id,
        counsellor_id,
        b_time_slot: `${startTime} to ${endTime}`,
        b_date: bookingDate,
        b_mode,
        b_duration,
      },
    });
  } catch (error) {
    console.error("Error booking session:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const cancelBookingByCounsellor = async (req, res) => {
  // Validate request body
  await body("session_id")
    .isInt()
    .withMessage("Session ID must be a valid integer")
    .run(req);
  await body("counsellor_id")
    .isInt()
    .withMessage("Counsellor ID must be a valid integer")
    .run(req);
  await body("reason_of_cancellation")
    .isLength({ min: 10 })
    .withMessage("Reason must be at least 10 characters long")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { session_id, counsellor_id, reason_of_cancellation } = req.body;

  try {
    // Check if the booking exists and belongs to the counsellor
    const [booking] = await db.query(
      `SELECT * FROM counsellor_booking WHERE session_id = ? AND counsellor_id = ? AND Booked = true`,
      [session_id, counsellor_id]
    );

    if (booking.length === 0) {
      return res.status(404).json({
        message: "Booking not found or does not belong to this counsellor",
      });
    }

    // Update the booking fields to cancel the session
    await db.query(
      `UPDATE counsellor_booking
             SET cancelled_r_counsellor = true,
                 reason_of_cancellation = ?,
                 status_for_counsellor = 'Cancelled'
             WHERE session_id = ?`,
      [reason_of_cancellation, session_id]
    );

    res.status(200).json({
      message: "Booking cancelled successfully",
      cancellation_details: {
        session_id,
        counsellor_id,
        reason_of_cancellation,
      },
    });
  } catch (error) {
    console.error("Error cancelling booking:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Cancel Booking by Student
const requestCancellationByStudent = async (req, res) => {
  // Validate request body
  await body("session_id")
    .isInt()
    .withMessage("Session ID must be a valid integer")
    .run(req);
  await body("student_id")
    .isInt()
    .withMessage("Student ID must be a valid integer")
    .run(req);
  await body("reason_of_cancellation")
    .isLength({ min: 10 })
    .withMessage("Reason must be at least 10 characters long")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { session_id, student_id, reason_of_cancellation } = req.body;

  try {
    // Check if the booking exists and belongs to the student
    const [booking] = await db.query(
      `SELECT * FROM counsellor_booking WHERE session_id = ? AND student_id = ? AND Booked = true`,
      [session_id, student_id]
    );

    if (booking.length === 0) {
      return res.status(404).json({
        message: "Booking not found or does not belong to this student",
      });
    }

    // Update the booking fields for student cancellation request
    await db.query(
      `UPDATE counsellor_booking
             SET status_for_student = 'Requested',
                 reason_of_cancellation = ?
             WHERE session_id = ?`,
      [reason_of_cancellation, session_id]
    );

    res.status(200).json({
      message: "Cancellation request submitted successfully",
      request_details: {
        session_id,
        student_id,
        reason_of_cancellation,
      },
    });
  } catch (error) {
    console.error("Error requesting cancellation:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const acceptStudentCancellationRequest = async (req, res) => {
  // Validate the request body
  await body("session_id")
    .isInt()
    .withMessage("Session ID must be a valid integer")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { session_id } = req.body;

  try {
    // Check if the booking exists and has a requested cancellation status
    const [booking] = await db.query(
      `SELECT * FROM counsellor_booking WHERE session_id = ? AND status_for_student = 'Requested'`,
      [session_id]
    );

    if (booking.length === 0) {
      return res.status(404).json({
        message: "Cancellation request not found or has already been processed",
      });
    }

    // Update the booking to mark the cancellation as accepted
    await db.query(
      `UPDATE counsellor_booking
             SET status_for_student = 'Cancelled',
              status_for_counsellor = 'Cancelled'
             WHERE session_id = ?`,
      [session_id]
    );

    res.status(200).json({
      message: "Cancellation request accepted successfully",
      updated_status: {
        session_id,
        status_for_student: "Cancelled",
      },
    });
  } catch (error) {
    console.error("Error accepting cancellation request:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const rescheduleBooking = async (req, res) => {
  // Validate the request body
  await body("session_id")
    .isInt()
    .withMessage("Session ID must be a valid integer")
    .run(req);
  await body("new_r_time")
    .notEmpty()
    .withMessage("New reschedule time is required")
    .run(req);
  await body("new_r_date")
    .notEmpty()
    .withMessage("New reschedule date is required")
    .run(req);
  await body("new_r_duration")
    .notEmpty()
    .withMessage("New reschedule duration is required")
    .run(req);
  await body("new_r_mode")
    .notEmpty()
    .withMessage("New reschedule mode is required")
    .run(req);

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { session_id, new_r_time, new_r_date, new_r_duration, new_r_mode } =
    req.body;

  try {
    // Check if the booking exists
    const [booking] = await db.query(
      `SELECT * FROM counsellor_booking WHERE session_id = ?`,
      [session_id]
    );

    if (!booking || booking.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Check if the counsellor's status is 'Cancelled'
    if (booking[0].status_for_counsellor === "Cancelled") {
      return res.status(400).json({
        message:
          "Booking cannot be rescheduled as the counsellor has cancelled the session",
      });
    }

    // Update the booking with the new details and set some columns to NULL
    const result = await db.query(
      `UPDATE counsellor_booking
      SET r_time = ?, r_date = ?, r_duration = ?, r_mode = ?, status_for_student = 'Rescheduled',
      b_time_slot = NULL, b_date = NULL, b_mode = NULL, b_duration = NULL, status_for_counsellor = 'Rescheduled'
      WHERE session_id = ?`,
      [new_r_time, new_r_date, new_r_duration, new_r_mode, session_id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "Failed to reschedule booking. Please try again later.",
      });
    }

    res.status(200).json({
      message: "Booking rescheduled successfully",
      updated_booking: {
        session_id,
        r_time: new_r_time,
        r_date: new_r_date,
        r_duration: new_r_duration,
        r_mode: new_r_mode,
        status_for_student: "Rescheduled",
        status_for_counsellor: "Rescheduled",
      },
    });
  } catch (error) {
    console.error("Error rescheduling booking:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  bookSession,
  cancelBookingByCounsellor,
  requestCancellationByStudent,
  acceptStudentCancellationRequest,
  rescheduleBooking,
};
