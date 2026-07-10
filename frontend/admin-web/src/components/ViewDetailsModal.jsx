import React from "react";
import {
  FaTimes,
  FaUser,
  FaBuilding,
  FaClock,
  FaCalendarAlt,
  FaClipboardList,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaIdCard,
  FaStickyNote,
} from "react-icons/fa";

const ViewDetailsModal = ({ isOpen, onClose, request }) => {
  if (!isOpen || !request) return null;

  const durationLabels = {
    "30min": "30 Minutes",
    "1hr": "1 Hour",
    "2hrs": "2 Hours",
    "4hrs": "4 Hours",
    "half": "Half Day",
    "full": "Full Day",
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const InfoRow = ({ icon, label, value, mono = false }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p
          className={`text-sm text-slate-800 font-semibold break-words ${
            mono ? "font-mono text-xs" : ""
          }`}
        >
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <FaInfoCircle className="text-white text-lg" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Request Details</h3>
              <p className="text-blue-100 text-xs">Ticket #{request.ticketId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/15 rounded-xl transition-all"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          {/* User Information Section */}
          <div className="mb-6">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FaUser size={12} /> User Information
            </h4>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <InfoRow
                icon={<FaUser size={14} />}
                label="Full Name"
                value={`${request.userName || "N/A"} ${request.userLastName || ""}`}
              />
              <InfoRow
                icon={<FaIdCard size={14} />}
                label="Staff/Matric Number"
                value={request.staffId}
                mono
              />
              <InfoRow
                icon={<FaBuilding size={14} />}
                label="Department"
                value={request.userDepartment}
              />
            </div>
          </div>

          {/* Request Details Section */}
          <div className="mb-6">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FaClipboardList size={12} /> Request Details
            </h4>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <InfoRow
                icon={<FaBuilding size={14} />}
                label="Area Requested"
                value={request.area}
              />
              <InfoRow
                icon={<FaClock size={14} />}
                label="Duration"
                value={durationLabels[request.duration] || request.duration}
              />
              <InfoRow
                icon={<FaClipboardList size={14} />}
                label="Reason"
                value={request.reason}
              />
            </div>
          </div>

          {/* Status & Timeline Section */}
          <div className="mb-6">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FaCalendarAlt size={12} /> Timeline & Status
            </h4>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <InfoRow
                icon={<FaCalendarAlt size={14} />}
                label="Submitted At"
                value={formatDate(request.submittedAt)}
              />
              {request.reviewedAt && (
                <InfoRow
                  icon={<FaCheckCircle size={14} />}
                  label="Reviewed At"
                  value={formatDate(request.reviewedAt)}
                />
              )}
              {request.approvedAt && (
                <InfoRow
                  icon={<FaCheckCircle size={14} />}
                  label="Approved At"
                  value={formatDate(request.approvedAt)}
                />
              )}
              {request.expiresAt && (
                <InfoRow
                  icon={<FaExclamationTriangle size={14} />}
                  label="Expires At"
                  value={formatDate(request.expiresAt)}
                />
              )}
            </div>
          </div>

          {/* Review Notes Section */}
          {request.reviewNotes && (
            <div className="mb-6">
              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FaStickyNote size={12} /> Review Notes
              </h4>
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {request.reviewNotes}
                </p>
              </div>
            </div>
          )}

          {/* Status Badge Display */}
          <div className="flex items-center justify-center pt-4 border-t border-slate-100">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Current Status
              </p>
              <div className="inline-block">
                <StatusBadgeWrapper status={request.status} size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 flex justify-end border-t border-slate-50 bg-slate-50/50">
          <button
            onClick={onClose}
            className="py-3 px-6 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple wrapper to avoid circular dependency - StatusBadge will be inline here
const StatusBadgeWrapper = ({ status, size }) => {
  const STATUS_CONFIG = {
    pending: {
      label: "Pending",
      bg: "bg-amber-100 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    },
    approved: {
      label: "Approved",
      bg: "bg-emerald-100 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },
    rejected: {
      label: "Rejected",
      bg: "bg-rose-100 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
    },
    expired: {
      label: "Expired",
      bg: "bg-slate-100 text-slate-500 border-slate-200",
      dot: "bg-slate-400",
    },
  };

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const sizeClasses = size === "md" ? "text-xs px-3 py-1.5" : "text-[10px] px-2.5 py-1";
  const dotSizes = size === "md" ? "w-2 h-2" : "w-1.5 h-1.5";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-extrabold uppercase tracking-wide rounded-full border ${config.bg} ${sizeClasses}`}
    >
      <span className={`rounded-full ${config.dot} ${dotSizes}`} />
      {config.label}
    </span>
  );
};

export default ViewDetailsModal;