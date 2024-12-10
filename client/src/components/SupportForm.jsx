import React, { useState } from "react";
import { useNotification } from "../context/NotificationContext";
import "../styles/SupportForm.css";
import { useAuth } from "../context/UserContext";

const SupportForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    queryType: "",
    description: "",
    file: null,
    sessionId: "",
  });
  const [loading, setLoading] = useState(false);
  const { triggerNotification } = useNotification();
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    triggerNotification(
      "Your query has been submitted successfully!",
      "success"
    );
    // console.log("Form data:", formData);
    setLoading(false);

    const userId = user.user_id;
    const payload = {
      counsellor_id: userId,
      session_id: formData.sessionId,
      name: formData.name,
      email: formData.email,
      query_type: formData.queryType,
      // description: formData.description,
    };
    console.log(payload);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_ENDPOINT_URL}/help/support-form`,
        {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        triggerNotification(
          "Your query has been submitted successfully!",
          "success"
        );
        setFormData({
          name: "",
          email: "",
          queryType: "",
          description: "",
          file: null,
          sessionId: "",
        });
      } else {
        triggerNotification("An error occurred. Please try again.", "error");
      }
    } catch (error) {
      triggerNotification("Network error. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formbold-main-wrapper">
      <div className="formbold-form-wrapper">
        <h2 className="form-title">Help & Support</h2>
        <form onSubmit={handleSubmit}>
          <div className="formbold-input-flex">
            <div>
              <label htmlFor="name" className="formbold-form-label">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="formbold-form-input"
              />
            </div>
            <div>
              <label htmlFor="email" className="formbold-form-label">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="formbold-form-input"
              />
            </div>
          </div>

          <div className="formbold-input-flex">
            <div className="formbold-input-radio-wrapper">
              <label htmlFor="queryType" className="formbold-form-label">
                Query Type
              </label>
              <select
                name="queryType"
                value={formData.queryType}
                onChange={handleChange}
                className="formbold-form-input"
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Billing Query">Billing Query</option>
                <option value="Session Query">Session Query</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="file" className="formbold-form-label">
                Upload File (Optional)
              </label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                className="formbold-form-input"
              />
            </div>
          </div>

          {formData.queryType === "Session Query" && (
            <div>
              <label htmlFor="sessionId" className="formbold-form-label">
                Session Query Details
              </label>
              <input
                type="text"
                name="sessionId"
                value={formData.sessionId}
                onChange={handleChange}
                placeholder="Enter session Id"
                className="formbold-form-input"
              />
            </div>
          )}

          <div>
            <label htmlFor="description" className="formbold-form-label">
              Description
            </label>
            <textarea
              rows="6"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Type your message"
              className="formbold-form-input"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`formbold-btn ${loading ? "bg-gray-400" : ""}`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupportForm;
