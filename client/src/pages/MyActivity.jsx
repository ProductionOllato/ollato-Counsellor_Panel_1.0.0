import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/UserContext";
import "../styles/MyActivity.css";

function MyActivity() {
  const [activityLogs, setActivityLogs] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [feedbackSession, setFeedbackSession] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const { triggerNotification } = useNotification();
  const { user } = useAuth();
  const counsellor_id = user?.user_id;
  const APIURL = import.meta.env.VITE_APP_API_ENDPOINT_URL;

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        const response = await axios.get(
          `${APIURL}/myactivity/get-myactivity/${counsellor_id}`
        );
        setActivityLogs(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchActivityLogs();
  }, []);

  const handleGiveFeedback = async (e) => {
    e.preventDefault();

    if (!rating || !feedbackText.trim()) {
      triggerNotification("Please provide a rating and feedback.", "error");
      return;
    }

    try {
      await axios.post(
        `${APIURL}/myactivity/get-feedback/${feedbackSession.session_id}`,
        {
          feedbackText,
          rating,
          student_id: user?.user_id,
          counsellor_id: user?.user_id,
        }
      );

      setActivityLogs((prev) =>
        prev.map((session) =>
          session.session_id === feedbackSession.session_id
            ? { ...session, feedbackGiven: true }
            : session
        )
      );

      triggerNotification("Feedback submitted successfully", "success");
      setFeedbackSession(null);
      setFeedbackText("");
      setRating(0);
    } catch (error) {
      console.error(error);
      triggerNotification("Error submitting feedback", "error");
    }
  };

  const handleRating = (value) => {
    setRating(value);
  };

  const determineStatus = (sessionDate, feedbackGiven, isCanceled) => {
    const currentTime = new Date();
    const sessionTime = new Date(sessionDate);

    if (isCanceled) return "Canceled";
    if (feedbackGiven) return "Feedback Given";
    if (sessionTime < currentTime) return "Completed";
    return "Upcoming";
  };

  const filteredLogs = showHistory
    ? activityLogs.filter((session) =>
        ["Completed", "Canceled"].includes(
          determineStatus(
            session.r_date || session.b_date,
            session.feedbackGiven,
            session.cancelled_r_counsellor
          )
        )
      )
    : activityLogs;

  return (
    <div className="container-myactivity">
      <h1 className="header-myactivity">My Activity</h1>

      {/* Toggle between history and upcoming */}
      <div className="toggle-button-myactivity">
        <button
          onClick={() => setShowHistory((prev) => !prev)}
          className="toggle-btn-myactivity"
        >
          {showHistory ? "Back to Activity" : "View History"}
        </button>
      </div>

      <div className="table-container-myactivity">
        {filteredLogs.length > 0 ? (
          <>
            {/* Desktop Table */}
            <table className="activity-table-myactivity">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Session ID</th>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Mode</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((session, index) => {
                  const sessionDate = session.r_date || session.b_date;
                  const timeSlot = session.b_time_slot || session.r_time;
                  const mode = session.r_mode || session.b_mode;
                  const duration = session.r_duration || session.b_duration;

                  const status = determineStatus(
                    sessionDate,
                    session.feedbackGiven,
                    session.cancelled_r_counsellor
                  );

                  return (
                    <tr key={session.session_id}>
                      <td>{index + 1}</td>
                      <td>{session.session_id}</td>
                      <td>{sessionDate}</td>
                      <td>{timeSlot}</td>
                      <td>{mode}</td>
                      <td>{duration} min</td>
                      <td>{status}</td>
                      <td>
                        {status === "Completed" && !session.feedbackGiven ? (
                          <button
                            onClick={() => setFeedbackSession(session)}
                            className="feedback-btn-myactivity"
                          >
                            Give Feedback
                          </button>
                        ) : status === "Feedback Given" ? (
                          <span className="feedback-status-myactivity">
                            Feedback Already Given
                          </span>
                        ) : (
                          <span>{status}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="mobile-view-myactivity">
              {filteredLogs.map((session, index) => {
                const sessionDate = session.r_date || session.b_date;
                const timeSlot = session.b_time_slot || session.r_time;
                const mode = session.r_mode || session.b_mode;
                const duration = session.r_duration || session.b_duration;

                const status = determineStatus(
                  sessionDate,
                  session.feedbackGiven,
                  session.cancelled_r_counsellor
                );

                return (
                  <div
                    className="session-card-myactivity"
                    key={session.session_id}
                  >
                    <div>
                      <strong>Session ID:</strong> {session.session_id}
                    </div>
                    <div>
                      <strong>Date:</strong> {sessionDate}
                    </div>
                    <div>
                      <strong>Time Slot:</strong> {timeSlot}
                    </div>
                    <div>
                      <strong>Mode:</strong> {mode}
                    </div>
                    <div>
                      <strong>Duration:</strong> {duration} min
                    </div>
                    <div>
                      <strong>Status:</strong> {status}
                    </div>
                    <div>
                      {status === "Completed" && !session.feedbackGiven ? (
                        <button
                          onClick={() => setFeedbackSession(session)}
                          className="feedback-btn-myactivity"
                        >
                          Give Feedback
                        </button>
                      ) : status === "Feedback Given" ? (
                        <span className="feedback-status-myactivity">
                          Feedback Already Given
                        </span>
                      ) : (
                        <span>{status}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="no-sessions-myactivity">
            {showHistory
              ? "No completed or canceled sessions found."
              : "No upcoming sessions found."}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackSession && (
        <div
          className="modal-overlay-myactivity"
          onClick={() => setFeedbackSession(null)}
        >
          <div
            className="modal-content-myactivity"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title-myactivity">
              Feedback for Session ({feedbackSession.session_date})
            </h3>

            {/* Feedback Form */}
            <form className="feedback-form" onSubmit={handleGiveFeedback}>
              <div className="form-group">
                <label htmlFor="rating">Rating:</label>
                <div
                  className="star-rating"
                  aria-label="Select a rating from 1 to 5"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <span
                      key={value}
                      className={`star ${value <= rating ? "filled" : ""}`}
                      onClick={() => handleRating(value)}
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(0)}
                      role="button"
                      tabIndex="0"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleRating(value)
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="feedbackText">Comments:</label>
                <textarea
                  id="feedbackText"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows="4"
                  placeholder="Write your feedback here..."
                ></textarea>
              </div>

              <div className="modal-actions-myactivity">
                <button
                  type="button"
                  onClick={() => setFeedbackSession(null)}
                  className="cancel-btn-myactivity"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn-myactivity">
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyActivity;
