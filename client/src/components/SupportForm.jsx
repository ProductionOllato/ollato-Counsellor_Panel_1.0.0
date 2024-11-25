import React, { useState } from "react";
import { useNotification } from "../context/NotificationContext";

const SupportForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    queryType: "",
    description: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const { triggerNotification } = useNotification();

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
    console.log("Form data:", formData);
    setLoading(false);

    // const formDataObj = new FormData();
    // for (const key in formData) {
    //   formDataObj.append(key, formData[key]);
    // }

    // try {
    //   const response = await fetch("http://localhost:5001/support", {
    //     method: "POST",
    //     body: formDataObj,
    //   });

    //   if (response.ok) {
    //     // setMessage("Your query has been submitted successfully!");
    //     triggerNotification(
    //       "Your query has been submitted successfully!",
    //       "success"
    //     );
    //     setFormData({
    //       name: "",
    //       email: "",
    //       queryType: "",
    //       description: "",
    //       file: null,
    //     });
    //   } else {
    //     setMessage("An error occurred. Please try again.");
    //   }
    // } catch (error) {
    //   setMessage("Network error. Please try again later.");
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-10 bg-white rounded-lg mt-16 min-w-fit w-1/2 shadow-1"
    >
      <h2 className="text-2xl font-semibold mb-3 text-center">Support Form</h2>
      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm text-gray-700 font-semibold"
        >
          Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="queryType" className="block text-sm font-semibold">
          Query Type
        </label>
        <select
          name="queryType"
          value={formData.queryType}
          onChange={handleChange}
          required
          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="" disabled>
            Select
          </option>
          <option value="Technical Issue">Technical Issue</option>
          <option value="Billing Query">Billing Query</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="mb-3">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-grey-700"
        >
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="mb-3">
        <label
          htmlFor="file"
          className="block text-sm font-medium text-grey-700"
        >
          Upload File (Optional)
        </label>
        <input
          type="file"
          name="file"
          onChange={handleChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-gray-50 hover:file:bg-gray-100"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 text-white font-semibold rounded-md ${
          loading ? "bg-gray-400" : "bg-[#605678] hover:bg-[#8967B3]"
        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50`}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default SupportForm;
