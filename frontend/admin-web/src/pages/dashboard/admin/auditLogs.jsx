import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DashboardLayout from "../../../component/DashboardLayout";
import { FaChartBar, FaCalendarAlt, FaDoorOpen, FaShieldAlt, FaTrash, FaSync } from "react-icons/fa";
import { getAccessLogs } from "../../../Api/authService";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAccessLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setError(err?.message || "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const downloadExcel = () => {
    const formattedLogs = logs.map(log => ({
      Timestamp: new Date(log.timestamp).toLocaleString(),
      UID: log.uid,
      "User Name": log.userName,
      Role: log.role,
      "Reader ID": log.readerId,
      Door: log.door,
      Result: log.result,
      Reason: log.reason || "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedLogs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AccessLogs");
    const excelBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "access_audit_logs.xlsx");
  };

  // Compute Stats
  const totalTaps = logs.length;
  const grantedTaps = logs.filter(log => log.result?.toLowerCase() === "granted").length;
  const deniedTaps = logs.filter(log => log.result?.toLowerCase() === "denied").length;
  const uniqueUsers = new Set(logs.map(log => log.uid)).size;

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 px-6 pt-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Security Audit Logs</h1>
            <p className="text-sm text-gray-500">Real-time NFC Access Control Activity</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchLogs}
              className="btn btn-outline btn-primary btn-sm flex items-center gap-2"
              disabled={loading}
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button onClick={downloadExcel} className="btn btn-sm btn-primary flex items-center gap-2">
              Export Excel
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-gray-500 mt-3">Loading access audit logs...</p>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-10">
            <p>Error: {error}</p>
            <p>Please try again later.</p>
          </div>
        ) : (
          <>
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-6">
              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Taps</p>
                    <p className="text-2xl font-bold text-gray-900">{totalTaps}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaChartBar className="text-blue-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Access Granted</p>
                    <p className="text-2xl font-bold text-green-600">{grantedTaps}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaShieldAlt className="text-green-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Access Denied</p>
                    <p className="text-2xl font-bold text-red-600">{deniedTaps}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <FaShieldAlt className="text-red-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unique Cards Tapped</p>
                    <p className="text-2xl font-bold text-purple-600">{uniqueUsers}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FaDoorOpen className="text-purple-600 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Audit Log Table */}
            <div
              className="overflow-auto px-6"
              style={{ maxHeight: "calc(100vh - 260px)" }}
            >
              <table className="table min-w-[1000px]">
                <thead className="bg-blue-100 text-gray-700 sticky top-0 z-20">
                  <tr>
                    <th className="text-black sticky top-0 bg-blue-100">Timestamp</th>
                    <th className="text-black sticky top-0 bg-blue-100">Card UID</th>
                    <th className="text-black sticky top-0 bg-blue-100">User Name</th>
                    <th className="text-black sticky top-0 bg-blue-100">Role</th>
                    <th className="text-black sticky top-0 bg-blue-100">Reader ID</th>
                    <th className="text-black sticky top-0 bg-blue-100">Door Zone</th>
                    <th className="text-black sticky top-0 bg-blue-100">Result</th>
                    <th className="text-black sticky top-0 bg-blue-100">Failure Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-gray-500 font-medium bg-white">
                        No tap logs recorded yet. Run the physical simulator to generate access log entries.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                        <td className="text-gray-600 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="font-semibold text-black uppercase">{log.uid}</td>
                        <td className="text-black font-medium">{log.userName}</td>
                        <td className="text-gray-700 capitalize">
                          <span className={`badge badge-sm badge-outline ${
                            log.role === "admin" ? "badge-primary" : log.role === "staff" ? "badge-secondary" : "badge-neutral"
                          }`}>
                            {log.role}
                          </span>
                        </td>
                        <td className="text-black uppercase">{log.readerId}</td>
                        <td className="text-gray-800 font-medium">{log.door}</td>
                        <td>
                          <span className={`badge ${
                            log.result?.toLowerCase() === "granted" ? "badge-success text-white" : "badge-error text-white"
                          } font-bold capitalize`}>
                            {log.result}
                          </span>
                        </td>
                        <td className="text-red-500 font-medium">
                          {log.reason || <span className="text-gray-400 font-normal">N/A</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
