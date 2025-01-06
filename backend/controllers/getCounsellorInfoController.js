const db = require("../config/db"); // Adjust based on your DB setup

exports.getCounsellorPersonalInfo = async (req, res) => {
  const { id } = req.params;

  // Validate the ID
  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid Counsellor Id",
    });
  }

  try {
    // Query to fetch personal details based on user_id
    const [results] = await db.query(
      "SELECT * FROM personal_details WHERE id = ?",
      [id]
    );

    // Check if the counsellor exists
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Counsellor not found",
      });
    }

    // Return success with personal details
    return res.status(200).json({
      success: true,
      message: "Counsellor personal information fetched successfully",
      data: results[0], // Assuming there's only one result
    });
  } catch (error) {
    // Return a generic server error message
    return res.status(500).json({
      success: false,
      message:
        "An error occurred while fetching counsellor details. Please try again later.",
    });
  }
};

exports.getCounsellorProfessionalInfo = async (req, res) => {
  const { user_id } = req.params;

  // Validate the ID
  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid Counsellor Id",
    });
  }

  try {
    // Query to fetch personal details based on user_id
    const [results] = await db.query(
      "SELECT * FROM professional_details WHERE user_id = ?",
      [user_id]
    );

    // Check if the counsellor exists
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Counsellor not found",
      });
    }

    // Return success with personal details
    return res.status(200).json({
      success: true,
      message: "Counsellor professional information fetched successfully",
      data: results[0], // Assuming there's only one result
    });
  } catch (error) {
    // Return a generic server error message
    return res.status(500).json({
      success: false,
      message:
        "An error occurred while fetching counsellor details. Please try again later.",
    });
  }
};
