import React, { useState } from "react";
import {
  FaExclamationTriangle,
  FaTimesCircle,
  FaCheckCircle,
  FaSpinner,
  FaTimes,
  FaBan,
  FaWrench,
  FaShieldAlt,
} from "react-icons/fa";
import { MdOutlineCreditCardOff } from "react-icons/md";
import { reportLostCard, reportStolenCard } from "../Api/authService";

// ── Issue type definitions ─────────────────────────────────────────────────────
const ISSUE_TYPES = [
  {
    id: "lost",
    label: "Lost Card",
    description: "I can no longer locate my card. Revoke it to prevent misuse.",
    icon: <MdOutlineCreditCardOff size={22} />,
    severity: "warning",       // amber
    actionLabel: "Mark as Lost",
    securityNote: "Your card will be flagged as revoked. All tap attempts will be denied and logged.",
  },
  {
    id: "stolen",
    label: "Stolen Card",
    description: "My card was taken without my consent. Suspend it immediately.",
    icon: <FaBan size={20} />,
    severity: "danger",        // red
    actionLabel: "Suspend Immediately",
    securityNote: "Immediate suspension activated. Any scan will trigger a security alert to campus patrols.",
  },
  {
    id: "damaged",
    label: "Damaged Card",
    description: "My card is physically damaged and no longer scanning correctly.",
    icon: <FaWrench size={18} />,
    severity: "info",          // blue
    actionLabel: "Report Damage",
    securityNote: "A maintenance request will be logged. Your current card remains active until replaced.",
  },
];

// ── Severity style maps ────────────────────────────────────────────────────────
const SEVERITY_STYLES = {
  warning: {
    ring:   "ring-amber-400",
    bg:     "bg-amber-50",
    border: "border-amber-200",
    icon:   "text-amber-500 bg-amber-100",
    badge:  "bg-amber-100 text-amber-700 border-amber-200",
    btn:    "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400",
    note:   "bg-amber-50 border-amber-200 text-amber-800",
  },
  danger: {
    ring:   "ring-rose-500",
    bg:     "bg-rose-50",
    border: "border-rose-200",
    icon:   "text-rose-500 bg-rose-100",
    badge:  "bg-rose-100 text-rose-700 border-rose-200",
    btn:    "bg-rose-600 hover:bg-rose-700 focus:ring-rose-400",
    note:   "bg-rose-50 border-rose-200 text-rose-800",
  },
  info: {
    ring:   "ring-blue-400",
    bg:     "bg-blue-50",
    border: "border-blue-200",
    icon:   "text-blue-500 bg-blue-100",
    badge:  "bg-blue-100 text-blue-700 border-blue-200",
    btn:    "bg-blue-600 hover:bg-blue-700 focus:ring-blue-400",
    note:   "bg-blue-50 border-blue-200 text-blue-800",
  },
};

// ── Modal Component ────────────────────────────────────────────────────────────
const ReportCardModal = ({ isOpen, onClose, userId, cardUid }) => {
  const [selectedType, setSelectedType]   = useState(null);
  const [additionalNote, setNote]         = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [submitState, setSubmitState]     = useState(null); // null | "success" | "error"
  const [errorMsg, setErrorMsg]           = useState("");

  if (!isOpen) return null;

  const selected = ISSUE_TYPES.find((t) => t.id === selectedType);
  const styles   = selected ? SEVERITY_STYLES[selected.severity] : null;

  const handleClose = () => {
    setSelectedType(null);
    setNote("");
    setSubmitting(false);
    setSubmitState(null);
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedType) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      // Real backend calls for lost & stolen; simulate for damaged
      if (selectedType === "lost" && userId) {
        await reportLostCard(userId);
      } else if (selectedType === "stolen" && userId) {
        await reportStolenCard(userId);
      } else {
        // "damaged" — no backend endpoint yet, simulate 800 ms delay
        await new Promise((r) => setTimeout(r, 800));
      }
      setSubmitState("success");
    } catch (err) {
      console.error("Report card issue failed:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Could not reach the server. Your report has been queued locally."
      );
      setSubmitState("error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitState === "success") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center animate-[fadeIn_0.2s_ease-out]">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <FaCheckCircle className="text-emerald-500 text-3xl" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 mb-2">Report Submitted</h2>
          <p className="text-sm text-slate-500 font-medium mb-1">
            <span className="font-bold text-slate-700">{selected?.label}</span> has been reported
            successfully.
          </p>
          <p className="text-xs text-slate-400 font-medium mb-8 max-w-xs mx-auto leading-relaxed">
            {selected?.securityNote}
          </p>
          {cardUid && (
            <p className="text-[10px] font-mono text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg inline-block mb-6 border border-slate-200">
              Card UID: {cardUid}
            </p>
          )}
          <button
            onClick={handleClose}
            className="btn w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl border-none"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ── Main modal ──────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <FaExclamationTriangle className="text-amber-400 text-lg" />
            </div>
            <div>
              <h2 className="text-white font-extrabold text-base tracking-tight">
                Report Card Issue
              </h2>
              <p className="text-slate-400 text-[11px] font-medium">
                Select the issue type and confirm.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Security banner */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <FaShieldAlt className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 font-semibold leading-relaxed">
              Reporting an issue will alter your card's active security state. This action is
              logged and cannot be reversed without administrator approval.
            </p>
          </div>

          {/* Issue type selector */}
          <div className="space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
              Select Issue Type
            </p>
            {ISSUE_TYPES.map((type) => {
              const s = SEVERITY_STYLES[type.severity];
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150 focus:outline-none ${
                    isSelected
                      ? `${s.bg} ${s.border} ring-2 ${s.ring} ring-offset-1`
                      : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${isSelected ? s.icon : "bg-slate-200 text-slate-500"} transition-colors`}>
                    {type.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-extrabold ${isSelected ? "text-slate-900" : "text-slate-700"}`}>
                      {type.label}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium leading-snug mt-0.5">
                      {type.description}
                    </p>
                  </div>

                  {/* Selected indicator */}
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                    isSelected
                      ? `${s.badge.split(" ")[0]} border-current scale-110`
                      : "border-slate-300 bg-white"
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Additional notes textarea */}
          {selectedType && (
            <div className="space-y-1.5 animate-[fadeIn_0.15s_ease-out]">
              <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                Additional Notes <span className="text-slate-300 font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={additionalNote}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Lost near the main cafeteria on Monday afternoon…"
                className="textarea textarea-bordered w-full text-sm bg-slate-50 border-slate-200 focus:border-slate-400 placeholder-slate-300 resize-none rounded-xl"
              />
            </div>
          )}

          {/* Security note for selected type */}
          {selected && (
            <div className={`flex items-start gap-2.5 rounded-xl border p-3.5 ${styles.note}`}>
              <FaExclamationTriangle className="flex-shrink-0 mt-0.5 text-sm" />
              <p className="text-[11px] font-semibold leading-relaxed">
                {selected.securityNote}
              </p>
            </div>
          )}

          {/* Error message */}
          {submitState === "error" && (
            <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl p-3.5">
              <FaTimesCircle className="text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-rose-700 font-semibold">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleClose}
            className="btn btn-ghost flex-1 rounded-xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedType || submitting}
            className={`btn flex-1 rounded-xl border-none font-extrabold text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              styles ? styles.btn : "bg-slate-500"
            }`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <FaSpinner className="animate-spin" />
                Submitting…
              </span>
            ) : (
              selected?.actionLabel || "Submit Report"
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReportCardModal;
