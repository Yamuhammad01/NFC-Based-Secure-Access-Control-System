import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../component/DashboardLayout";
import Notification, { useNotification } from "../../../component/Notification";
import StatusBadge from "../../../components/StatusBadge";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import ViewDetailsModal from "../../../components/ViewDetailsModal";
import {
  getAllTempAccessRequests,
  approveTempAccessRequest,
  rejectTempAccessRequest,
} from "../../../Api/tempAccessService";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaBan,
  FaClock,
  FaUser,
  FaBuilding,
  FaClipboardList,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaKey,
  FaTimes,
} from "react-icons/fa";

const TemporaryAccessRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  // Available areas for filter dropdown
  const [areas, setAreas] = useState([]);

  // Modals state
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestToAction, setRequestToAction] = useState(null);

  // Review notes
  const [reviewNotes, setReviewNotes] = useState("");

  // Notification helper
  const showNotification = (type, message) => {
    setNotification({ type, message, isVisible: true });
    setTimeout(() => setNotification(null), 3000);
  };

  // Load all requests
  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAllTempAccessRequests();

      if (data && data.status === "success") {
        setRequests(data.data || []);

        // Extract unique areas for filter dropdown
        const uniqueAreas = Array.from(
          new Set((data.data || []).map((r) => r.area).filter(Boolean))
        ).sort();
        setAreas(uniqueAreas);
      }
    } catch (err) {
      setError(err?.message || "Failed to load temporary access requests.");
      showNotification("error", err?.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Filtered requests
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      !searchTerm ||
      (req.userName && req.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.userLastName && req.userLastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.staffId && req.staffId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.ticketId && req.ticketId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = !selectedStatus || req.status === selectedStatus;
    const matchesArea = !selectedArea || req.area === selectedArea;

    return matchesSearch && matchesStatus && matchesArea;
  });

  // Stats
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;
  const totalCount = requests.length;

  // Handlers
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const handleApproveClick = (request) => {
    setRequestToAction(request);
    setReviewNotes("");
    setShowApproveModal(true);
  };

  const handleRejectClick = (request) => {
    setRequestToAction(request);
    setReviewNotes("");
    setShowRejectModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!requestToAction) return;

    try {
      setLoading(true);
      const res = await approveTempAccessRequest(requestToAction.ticketId, reviewNotes);

      showNotification("success", res.message || "Request approved successfully!");
      setShowApproveModal(false);
      setRequestToAction(null);
      setReviewNotes("");

      // Refresh the list
      await loadRequests();
    } catch (err) {
      showNotification("error", err?.message || "Failed to approve request.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!requestToAction) return;

    try {
      setLoading(true);
      const res = await rejectTempAccessRequest(requestToAction.ticketId, reviewNotes);

      showNotification("success", res.message || "Request rejected successfully!");
      setShowRejectModal(false);
      setRequestToAction(null);
      setReviewNotes("");

      // Refresh the list
      await loadRequests();
    } catch (err) {
      showNotification("error", err?.message || "Failed to reject request.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("");
    setSelectedArea("");
  };

  return (
    <DashboardLayout>
      {/* Notifications overlay */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Temporary Access Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage temporary access requests submitted by staff and students
          </p>
        </div>

        {/* Counter cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Requests</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FaKey size={22} />
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Pending</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <FaClock size={22} />
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Approved</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <FaCheckCircle size={22} />
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Rejected</span>
              <p className="text-2xl font-bold text-rose-600 mt-1">{rejectedCount}</p>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <FaBan size={22} />
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white/80 backdrop-blur border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <FaSearch size={15} />
              </span>
              <input
                type="text"
                placeholder="Search by name, staff ID, or ticket ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10 pr-4 py-3 rounded-xl border-gray-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
              {/* Status Filter */}
              <div className="relative flex-1 md:w-40">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <FaFilter size={13} />
                </span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="select select-bordered w-full pl-9 pr-3 rounded-xl border-gray-200 text-xs focus:outline-none text-gray-700"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Area Filter */}
              <div className="relative flex-1 md:w-56">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <FaBuilding size={13} />
                </span>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="select select-bordered w-full pl-9 pr-3 rounded-xl border-gray-200 text-xs focus:outline-none text-gray-700"
                >
                  <option value="">All Areas</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset button */}
              {(searchTerm || selectedStatus || selectedArea) && (
                <button
                  onClick={clearFilters}
                  className="btn btn-ghost text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-2 px-3 rounded-xl transition-all duration-200"
                >
                  <FaTimes size={12} className="mr-1" />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full min-w-[1200px] border-collapse align-middle">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold text-xs tracking-wider text-left">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-3">Area Requested</th>
                  <th className="py-4 px-3">Reason</th>
                  <th className="py-4 px-3">Duration</th>
                  <th className="py-4 px-3">Status</th>
                  <th className="py-4 px-3">Submitted</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="loading loading-spinner loading-md text-blue-600"></span>
                        <p className="text-gray-400 text-xs">Fetching requests...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                          <FaClipboardList size={24} />
                        </div>
                        <h4 className="font-semibold text-gray-800">No requests found</h4>
                        <p className="text-xs text-gray-400 max-w-xs">
                          {requests.length === 0
                            ? "There are no temporary access requests in the system."
                            : "No requests match your search criteria. Try adjusting your filters."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr
                      key={req.ticketId}
                      className="hover:bg-blue-50/20 transition-all duration-150 border-b border-gray-100"
                    >
                      {/* User */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {req.userName && req.userName.charAt(0)}
                            {req.userLastName && req.userLastName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {req.userName} {req.userLastName}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">{req.staffId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Area */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <FaBuilding className="text-gray-400 text-xs" />
                          <span className="font-medium text-gray-700 whitespace-normal break-words">
                            {req.area}
                          </span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-4 px-3">
                        <p className="text-gray-600 text-xs line-clamp-2 max-w-[200px]">
                          {req.reason}
                        </p>
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <FaClock className="text-gray-400 text-xs" />
                          <span className="font-medium text-gray-700 whitespace-nowrap">
                            {req.durationLabel || req.duration}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3">
                        <StatusBadge status={req.status} size="sm" />
                      </td>

                      {/* Submitted At */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FaCalendarAlt className="text-gray-400" />
                          <span>{new Date(req.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApproveClick(req)}
                                className="btn btn-ghost btn-xs w-8 h-8 rounded-lg p-0 text-emerald-600 hover:bg-emerald-50"
                                title="Approve Request"
                              >
                                <FaCheckCircle size={14} />
                              </button>
                              <button
                                onClick={() => handleRejectClick(req)}
                                className="btn btn-ghost btn-xs w-8 h-8 rounded-lg p-0 text-rose-600 hover:bg-rose-50"
                                title="Reject Request"
                              >
                                <FaBan size={14} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleViewDetails(req)}
                            className="btn btn-ghost btn-xs w-8 h-8 rounded-lg p-0 text-blue-600 hover:bg-blue-50"
                            title="View Details"
                          >
                            <FaEye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />

      {/* Approve Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setRequestToAction(null);
          setReviewNotes("");
        }}
        onConfirm={handleApproveConfirm}
        title="Approve Request"
        message={`Are you sure you want to approve the temporary access request for "${requestToAction?.area}" submitted by ${requestToAction?.userName} ${requestToAction?.userLastName}?`}
        confirmText="Approve"
        cancelText="Cancel"
        type="success"
        loading={loading}
        showNotesField={true}
        notesPlaceholder="Add review notes (optional)"
        notesValue={reviewNotes}
        onNotesChange={setReviewNotes}
      />

      {/* Reject Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRequestToAction(null);
          setReviewNotes("");
        }}
        onConfirm={handleRejectConfirm}
        title="Reject Request"
        message={`Are you sure you want to reject the temporary access request for "${requestToAction?.area}" submitted by ${requestToAction?.userName} ${requestToAction?.userLastName}?`}
        confirmText="Reject"
        cancelText="Cancel"
        type="danger"
        loading={loading}
        showNotesField={true}
        notesPlaceholder="Add review notes (recommended)"
        notesValue={reviewNotes}
        onNotesChange={setReviewNotes}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-[fadeIn_0.2s_ease-out] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-emerald-500 text-4xl" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">Success!</h3>
            <p className="text-sm text-slate-600 font-medium">{successMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 btn bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl border-none"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TemporaryAccessRequests;