const db = require("../config/db");

const getMyActivity = async (req, res) => {
  console.log("Request body:", req.params);

  const { counsellor_id } = req.params;
  if (!counsellor_id) {
    return res.status(400).json({ error: "Counsellor ID is required" });
  }

  try {
    // const [rows] = await db.query(
    //   "SELECT * FROM counsellor_booking WHERE counsellor_id = ?",
    //   [counsellor_id]
    // );
    const [rows] = await db.query(
      `
      SELECT 
        session_id,
        student_id,
        counsellor_id,
        b_time_slot,
        DATE_FORMAT(b_date, '%Y-%m-%d') AS b_date,
        b_mode,
        b_duration,
        Booked,
        cancelled_r_counsellor,
        TIME_FORMAT(r_time, '%H:%i:%s') AS r_time,
        DATE_FORMAT(r_date, '%Y-%m-%d') AS r_date,
        r_duration,
        r_mode,
        status_for_counsellor,
        status_for_student,
        reason_of_cancellation
      FROM counsellor_booking
      WHERE counsellor_id = ?
      `,
      [counsellor_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "No activity found" });
    }

    console.log("Rows:", rows);

    res.status(200).json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getFeedback = async (req, res) => {};
module.exports = { getMyActivity };
