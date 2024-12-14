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

  console.log("Received data add CounsellorAvailability: ", req.body);

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

  console.log("Received data update availability: ", req.body);

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
    // console.log("Result update availability :", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "No matching availability found" });
    }

    res.status(200).json({ msg: "Availability updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

exports.deleteAvailability = async (req, res) => {
  // const { sr_no } = req.params;
  const { sr_no } = req.body;

  console.log("Received data delete availability: ", req.params);
  console.log("Received data delete availability: ", req.body);

  if (!sr_no) {
    return res.status(400).json({ msg: "id is required" });
  }

  try {
    // Construct the SQL query
    const query = `
      DELETE FROM counsellor_availability
      WHERE sr_no = ?
    `;

    // Execute the query
    const [result] = await db.query(query, [sr_no]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "No availability found" });
    }

    res.status(200).json({ msg: "Availability deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

exports.getCounsellorAvailability = async (req, res) => {
  const { counsellor_id } = req.body;

  if (!counsellor_id) {
    return res.status(400).json({ msg: "counsellor_id is required" });
  }

  try {
    const query = `
      SELECT * FROM counsellor_availability
      WHERE counsellor_id = ?
    `;

    const [result] = await db.query(query, [counsellor_id]);

    // console.log("Result:", result);

    if (result.length === 0) {
      return res.status(404).json({ msg: "No availability found" });
    }

    // Format the date before sending it to the frontend
    const formattedResult = result.map((item) => {
      const date = new Date(item.date);
      item.date = date.toISOString().split("T")[0]; // Formats date as YYYY-MM-DD
      return item;
    });

    // console.log("Formatted Result:", formattedResult);

    res
      .status(200)
      .json({ msg: "Availability fetched successfully", data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
