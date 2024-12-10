const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();
// Create a MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "counsellors",
});

// Test the connection
(async () => {
  try {
    // Execute a simple query to test the connection
    await db.query("SELECT 1");
    console.log("Database connected successfully.");
    console.log(
      "Connected to DB:",
      process.env.DB_NAME || "local database counsellors"
    );
  } catch (error) {
    console.error("Database connection failed:", error);
  }
})();

// Export the connection pool
module.exports = db;
