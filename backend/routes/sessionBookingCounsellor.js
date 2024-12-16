const express = require("express");
const {
  bookSession,
  cancelBookingByCounsellor,
  requestCancellationByStudent,
  acceptStudentCancellationRequest,
  rescheduleBooking,
  getCounsellorAllSessions ,
} = require("../controllers/sessionController");

const router = express.Router();

// POST /sessions/book
router.post("/book", bookSession);
router.post("/cancel-by-counsellor", cancelBookingByCounsellor);
router.post("/cancel-by-student", requestCancellationByStudent);
router.post("/accept-request-counsellor", acceptStudentCancellationRequest);
router.put("/reschedule", rescheduleBooking);
router.get("/get-sessions", getCounsellorAllSessions );

module.exports = router;
