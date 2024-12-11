// const db = require("../config/db"); // Adjust the path as necessary

// exports.addCounsellorAvailability = async (req, res) => {
//   const { counsellor_id, dates, mode, duration, status } = req.body;

//   if (!Array.isArray(dates) || dates.length === 0) {
//     return res
//       .status(400)
//       .json({ msg: "Dates must be an array and cannot be empty" });
//   }

//   try {
//     const insertValues = dates.map((date) => [
//       counsellor_id,
//       date,
//       mode,
//       duration,
//       status,
//     ]);

//     const query = `
//         INSERT INTO counsellor_availability (counsellor_id, date, mode, duration, status)
//         VALUES ?`;

//     await db.query(query, [insertValues]);

//     res.status(201).json({ msg: "Counsellor availability added successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// };

const db = require("../config/db"); // Adjust the path as necessary

exports.addCounsellorAvailability = async (req, res) => {
  const { counsellor_id, dates, mode, duration, status, start_time, end_time } =
    req.body;

  // Validate the required fields
  if (!counsellor_id) {
    return res.status(400).json({ msg: "Counsellor ID is required" });
  }

  if (!Array.isArray(dates) || dates.length === 0) {
    return res
      .status(400)
      .json({ msg: "Dates must be an array and cannot be empty" });
  }

  if (!start_time || !end_time) {
    return res
      .status(400)
      .json({ msg: "Both start_time and end_time are required" });
  }

  try {
    // Prepare the values for bulk insertion
    const insertValues = dates.map((date) => [
      counsellor_id,
      date,
      mode,
      duration,
      status,
      start_time,
      end_time,
    ]);

    const query = `
        INSERT INTO counsellor_availability (counsellor_id, date, mode, duration, status, start_time, end_time)
        VALUES ?`;

    // Execute the query
    await db.query(query, [insertValues]);

    res.status(201).json({ msg: "Counsellor availability added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

exports.updateAvailability = async (req, res) => {
  const {
    counsellor_id, // Required to identify the counsellor
    date, // Optional, used for matching
    start_time, // Optional, used for matching
    end_time, // Optional, used for matching
    mode, // Optional, used for matching or updating
    duration, // Optional, used for updating
    status, // Optional, used for updating
  } = req.body;

  // Validate required fields
  if (!counsellor_id) {
    return res.status(400).json({ msg: "counsellor_id is required" });
  }

  try {
    // Dynamic WHERE clause to identify the row
    let whereClause = "counsellor_id = ?";
    const whereParams = [counsellor_id];

    if (date) {
      whereClause += " AND date = ?";
      whereParams.push(date);
    }
    if (start_time) {
      whereClause += " AND start_time = ?";
      whereParams.push(start_time);
    }
    if (end_time) {
      whereClause += " AND end_time = ?";
      whereParams.push(end_time);
    }

    // Validate that we have fields to update
    const updates = [];
    const updateParams = [];

    if (mode) {
      updates.push("mode = ?");
      updateParams.push(mode);
    }
    if (duration) {
      updates.push("duration = ?");
      updateParams.push(duration);
    }
    if (status) {
      updates.push("status = ?");
      updateParams.push(status);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ msg: "At least one field to update must be provided" });
    }

    // Construct the full SQL query
    const query = `
      UPDATE counsellor_availability
      SET ${updates.join(", ")}
      WHERE ${whereClause}
    `;

    // Combine update and where parameters
    const params = [...updateParams, ...whereParams];

    // Execute the query
    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "No matching availability found" });
    }

    res.status(200).json({ msg: "Availability updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
