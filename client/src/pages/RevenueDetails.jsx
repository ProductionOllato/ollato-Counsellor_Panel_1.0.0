import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import Logo from "../assets/Ollato_Logo_CC-03.png";
import { useNotification } from "../context/NotificationContext";

const paymentData = [
  {
    srNo: 1,
    sessionId: "S123",
    studentId: "STU456",
    paymentDate: "2024-12-01",
    paymentAmount: 1000.0,
  },
  {
    srNo: 2,
    sessionId: "S124",
    studentId: "STU457",
    paymentDate: "2024-12-02",
    paymentAmount: 1000.0,
  },
  {
    srNo: 3,
    sessionId: "S125",
    studentId: "STU458",
    paymentDate: "2024-12-03",
    paymentAmount: 1000.0,
  },
  {
    srNo: 4,
    sessionId: "S126",
    studentId: "STU459",
    paymentDate: "2024-12-03",
    paymentAmount: 1000.0,
  },
  {
    srNo: 5,
    sessionId: "S127",
    studentId: "STU460",
    paymentDate: "2024-12-04",
    paymentAmount: 1000.0,
  },
  {
    srNo: 6,
    sessionId: "S128",
    studentId: "STU461",
    paymentDate: "2024-12-05",
    paymentAmount: 1000.0,
  },
  {
    srNo: 7,
    sessionId: "S129",
    studentId: "STU462",
    paymentDate: "2024-12-06",
    paymentAmount: 1000.0,
  },
  {
    srNo: 8,
    sessionId: "S130",
    studentId: "STU463",
    paymentDate: "2024-12-07",
    paymentAmount: 1000.0,
  },
  {
    srNo: 9,
    sessionId: "S131",
    studentId: "STU464",
    paymentDate: "2024-12-08",
    paymentAmount: 1000.0,
  },
  {
    srNo: 10,
    sessionId: "S132",
    studentId: "STU465",
    paymentDate: "2024-12-09",
    paymentAmount: 1000.0,
  },
];

const RevenueDetails = () => {
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { triggerNotification } = useNotification();

  // Fetch payment details from backend
  const fetchPaymentDetails = async () => {
    try {
      // const response = await fetch("https://api.example.com/payments"); // Replace with your backend API URL
      // if (!response.ok) {
      //   throw new Error("Failed to fetch payment details");
      // }
      // const data = await response.json();
      setPaymentDetails(paymentData);
    } catch (err) {
      // console.error("Error fetching payment details:", err);
      triggerNotification("Error fetching payment details.", "error");
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchPaymentDetails();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const downloadCSV = () => {
    const csvData = Papa.unparse(paymentDetails);
    const blob = new Blob([csvData], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "payment_details.csv";
    link.click();
  };

  const filteredPaymentDetails = paymentDetails.filter(
    (payment) =>
      payment.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.paymentDate.includes(searchQuery)
  );

  // Calculate total, dispatched, and pending amounts (example static logic)
  const totalRevenue = paymentDetails.length * 1000; // For example, 1000 Rs per payment
  const dispatchedAmount = paymentDetails.length * 500; // Example logic for dispatched
  const pendingAmount = totalRevenue - dispatchedAmount;

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  // if (error) {
  //   return <div>Error: {error}</div>;
  // }

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          <button
            onClick={downloadCSV}
            className="px-6 py-2 bg-[#1E3E62] text-white text-sm rounded-lg hover:bg-[#2b5c7c] transition duration-300"
          >
            Download
          </button>
        </div>

        {/* Revenue Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Revenue Card */}
          <div className="flex items-center justify-between p-6 bg-white border  rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-[#387478]">
            <div>
              <h3 className="text-xl font-semibold text-[#387478]">
                Total Revenue
              </h3>
              <p className="text-base  text-[#387478]">{totalRevenue} Rs</p>
            </div>
            <img
              src={Logo}
              alt="Logo"
              className="w-16 h-16 opacity-80 hover:opacity-100 transition-opacity duration-300"
            />
          </div>

          {/* Dispatched Amount Card */}
          <div className="flex items-center justify-between p-6 bg-white border border-[#8174A0] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <div>
              <h3 className="text-xl font-semibold text-[#8174A0]">
                Dispatched Amount
              </h3>
              <p className="text-base text-[#8174A0]">{dispatchedAmount} Rs</p>
            </div>
            <img
              src={Logo}
              alt="Logo"
              className="w-16 h-16 opacity-80 hover:opacity-100 transition-opacity duration-300"
            />
          </div>

          {/* Pending Amount Card */}
          <div className="flex items-center justify-between p-6 bg-white border border-[#AA5486] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <div>
              <h3 className="text-xl font-semibold text-[#AA5486]">
                Pending Amount
              </h3>
              <p className="text-base text-[#AA5486]">{pendingAmount} Rs</p>
            </div>
            <img
              src={Logo}
              alt="Logo"
              className="w-16 h-16 opacity-80 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>

        {/* Payment Details Table Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden mt-8">
          <div className="px-6 py-4 flex justify-between items-center border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Payment Details
            </h2>
            <div className="ml-3">
              <div className="w-full max-w-sm min-w-[200px] relative">
                <div className="relative">
                  <input
                    className="bg-white w-full pr-11 h-10 pl-3 py-2 bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md"
                    type="search"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search by Session ID, Student ID, or Payment Date"
                  />
                  <button
                    className="absolute h-8 w-8 right-1 top-1 my-auto px-2 flex items-center bg-white rounded "
                    type="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="3"
                      stroke="currentColor"
                      className="w-8 h-8 text-slate-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col w-full h-full overflow-scroll text-gray-700 bg-white shadow-md rounded-lg bg-clip-border">
            <div className="overflow-x-auto px-6 py-4">
              <table className="min-w-full table-auto text-sm text-gray-600">
                <thead className="text-xs text-gray-700 uppercase border-b border-[#243642] bg-[#A6AEBF]">
                  <tr>
                    <th className="px-4 py-3 text-center font-bold text-[#1A1A1D]">
                      Sr. No
                    </th>
                    <th className="px-4 py-3 text-center font-bold text-[#1A1A1D]">
                      Session ID
                    </th>
                    <th className="px-4 py-3 text-center font-bold text-[#1A1A1D]">
                      Student ID
                    </th>
                    <th className="px-4 py-3 text-center font-bold text-[#1A1A1D]">
                      Payment Date
                    </th>
                    <th className="px-4 py-3 text-center font-bold text-[#1A1A1D]">
                      Payment Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#C5D3E8]">
                  {filteredPaymentDetails.map((payment, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-[#1A1A1D] text-center">
                        {payment.srNo}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1A1A1D] text-center">
                        {payment.sessionId}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1A1A1D] text-center">
                        {payment.studentId}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1A1A1D] text-center">
                        {payment.paymentDate}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800 text-center">
                        {payment.paymentAmount} Rs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RevenueDetails;
