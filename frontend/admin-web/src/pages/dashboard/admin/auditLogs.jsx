import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DashboardLayout from "../../../component/DashboardLayout";
import {
  FaChartBar,
  FaDoorOpen,
  FaShieldAlt,
  FaSync,
  FaSearch,
  FaFileExcel,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaUser,
  FaIdCard,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";
import { getAccessLogs } from "../../../Api/authService";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [resultFilter, setResultFilter] = useState("all"); // all, granted, denied
  const [roleFilter, setRoleFilter] = useState("all"); // all, admin, staff, student

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Detail Modal state
  const [selectedLog, setSelectedLog] = useState(null);

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
    const formattedLogs = filteredLogs.map((log) => ({
      Timestamp: new Date(log.timestamp).toLocaleString(),
      UID: log.uid,
      "User Name": log.userName || "N/A",
      Role: log.role || "N/A",
      "Reader ID": log.readerId || "N/A",
      Door: log.door || "N/A",
      Result: log.result || "N/A",
      Reason: log.reason || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedLogs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AccessLogs");
    const excelBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      `access_audit_logs_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Filter logs based on search & filter controls
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.uid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.door?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.readerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reason?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesResult =
      resultFilter === "all" || log.result?.toLowerCase() === resultFilter.toLowerCase();

    const matchesRole =
      roleFilter === "all" || log.role?.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesResult && matchesRole;
  });

  // Calculate statistics
  const totalTaps = logs.length;
  const grantedTaps = logs.filter((log) => log.result?.toLowerCase() === "granted").length;
  const deniedTaps = logs.filter((log) => log.result?.toLowerCase() === "denied").length;
  const uniqueUsers = new Set(logs.map((log) => log.uid)).size;
  const passRate = totalTaps > 0 ? Math.round((grantedTaps / totalTaps) * 100) : 100;

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Security Audit Logs
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Comprehensive immutable record of all NFC tap events and access verifications
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="btn btn-sm bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center gap-2 shadow-2xs"
            >
              <FaSync className={`text-xs ${loading ? "animate-spin text-indigo-600" : ""}`} />
              <span className="text-xs">Refresh</span>
            </button>

            <button
              onClick={downloadExcel}
              disabled={logs.length === 0}
              className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs"
            >
              <FaFileExcel className="text-xs" />
              <span className="text-xs">Export Excel</span>
            </button>
          </div>
        </div>

        {/* High Level Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Access Taps
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {totalTaps.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <FaChartBar className="text-xl" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Access Granted
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-600">
                  {grantedTaps.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  {passRate}% Pass
                </span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <FaShieldAlt className="text-xl" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Access Denied
              </p>
              <p className="text-2xl font-black text-rose-600 mt-1">
                {deniedTaps.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <FaTimesCircle className="text-xl" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Unique Cardholders
              </p>
              <p className="text-2xl font-black text-purple-600 mt-1">
                {uniqueUsers.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <FaDoorOpen className="text-xl" />
            </div>
          </div>
        </div>

        {/* Filter and Control Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search by UID, user, door, reader..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Result Filter */}
            <select
              value={resultFilter}
              onChange={(e) => {
                setResultFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Access Results</option>
              <option value="granted">Granted Only</option>
              <option value="denied">Denied Only</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All User Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="student">Student</option>
            </select>

            {/* Clear Filters Button */}
            {(searchQuery || resultFilter !== "all" || roleFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setResultFilter("all");
                  setRoleFilter("all");
                  setCurrentPage(1);
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 bg-rose-50 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <span className="loading loading-spinner loading-lg text-indigo-600"></span>
              <p className="text-xs font-bold text-slate-500 mt-3">Fetching audit records...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-600">
              <p className="font-bold text-sm">Failed to load audit logs</p>
              <p className="text-xs text-slate-500 mt-1">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Cardholder</th>
                    <th className="py-3.5 px-4">Card UID</th>
                    <th className="py-3.5 px-4">Reader & Door</th>
                    <th className="py-3.5 px-4">Access Result</th>
                    <th className="py-3.5 px-4">Failure Reason</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                          <FaShieldAlt className="text-lg" />
                        </div>
                        <p className="font-bold text-slate-700">No matching audit logs found</p>
                        <p className="text-slate-400 text-[11px] mt-1">
                          Try tweaking your search term or active filters
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => {
                      const isGranted = log.result?.toLowerCase() === "granted";
                      return (
                        <tr key={log._id || log.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Timestamp */}
                          <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FaClock className="text-slate-400 text-xs" />
                              <span>{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                          </td>

                          {/* Cardholder */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 font-bold text-[11px]">
                                {log.userName ? log.userName.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">
                                  {log.userName || "Unknown User"}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-slate-400">
                                  {log.role || "Cardholder"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Card UID */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded">
                              {log.uid || "N/A"}
                            </span>
                          </td>

                          {/* Reader & Door */}
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-bold text-slate-800 block">
                                {log.door || "Main Entrance"}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 uppercase">
                                Reader: {log.readerId || "RD-001"}
                              </span>
                            </div>
                          </td>

                          {/* Access Result */}
                          <td className="py-3.5 px-4">
                            {isGranted ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Granted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                Denied
                              </span>
                            )}
                          </td>

                          {/* Failure Reason */}
                          <td className="py-3.5 px-4">
                            {log.reason ? (
                              <span className="text-rose-600 font-semibold text-[11px] bg-rose-50/80 px-2 py-0.5 rounded">
                                {log.reason}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium text-[11px]">N/A</span>
                            )}
                          </td>

                          {/* Action Modal Trigger */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="btn btn-ghost btn-xs text-indigo-600 hover:bg-indigo-50 font-bold rounded-lg"
                            >
                              <FaEye className="text-xs" />
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer & Pagination */}
          {!loading && filteredLogs.length > 0 && (
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>entries per page (Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length})</span>
              </div>

              {/* Page Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-xs bg-white border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 rounded-lg"
                >
                  <FaChevronLeft className="text-[10px]" />
                </button>

                <span className="px-3 text-xs font-bold text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn btn-xs bg-white border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 rounded-lg"
                >
                  <FaChevronRight className="text-[10px]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Log Detail Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.15s_ease-out]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FaShieldAlt className="text-indigo-400 text-lg" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Log Event Inspection</h3>
                  <p className="text-[11px] text-slate-400">Transaction record analysis</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Event Result</span>
                  <span
                    className={`font-black text-sm uppercase ${
                      selectedLog.result?.toLowerCase() === "granted"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {selectedLog.result || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Timestamp</span>
                  <span className="font-bold text-slate-800">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-semibold">Cardholder Name:</span>
                  <span className="font-bold text-slate-900">{selectedLog.userName || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-semibold">Card UID:</span>
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {selectedLog.uid || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-semibold">Role:</span>
                  <span className="font-bold text-indigo-700 capitalize">{selectedLog.role || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-semibold">Door Zone:</span>
                  <span className="font-bold text-slate-800">{selectedLog.door || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-semibold">Reader Hardware ID:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedLog.readerId || "N/A"}</span>
                </div>
                {selectedLog.reason && (
                  <div className="flex justify-between py-1 text-rose-600">
                    <span className="font-semibold">Failure Reason:</span>
                    <span className="font-bold">{selectedLog.reason}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-2.5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white text-xs transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AuditLogs;
