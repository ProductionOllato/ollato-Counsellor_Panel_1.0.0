const express = require("express");
const {
  bookSession,
  cancelBookingByCounsellor,
  requestCancellationByStudent,
  acceptStudentCancellationRequest,
  rescheduleBooking,
  getCounsellorAllSessions,
  acceptStudentBookingRequestByCounsellor,
} = require("../controllers/sessionController");
const { route } = require("./counsellorAuthRoutes");

const router = express.Router();

// POST /sessions/book
router.post("/book", bookSession);
router.post("/cancel-by-counsellor", cancelBookingByCounsellor);
router.post("/cancel-by-student", requestCancellationByStudent);
router.post("/accept-request-counsellor", acceptStudentCancellationRequest);
router.put("/reschedule", rescheduleBooking);
router.get("/get-sessions", getCounsellorAllSessions);
router.post(
  "/accept-booking-request-counsellor",
  acceptStudentBookingRequestByCounsellor
);


module.exports = router;
