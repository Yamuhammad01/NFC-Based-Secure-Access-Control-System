import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../component/DashboardLayout";
import {
  FaKey,
  FaBuilding,
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaTimes,
  FaPlus,
  FaHistory,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdOutlineSensors } from "react-icons/md";
import { getProfile } from "../../../Api/authService";

// ─── Storage key ──────────────────────────────────────────────────────────────
const STORAGE_KEY = "tempAccessRequests";

const loadRequests = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
};
const saveRequests = (list) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

// ─── Static data ──────────────────────────────────────────────────────────────
const AREAS = [
  "Staff Office",
  "Dean's Conference Room",
  "Core IT Server Rooms",
  "University Vault Complex",
  "Academic Registry Suite",
  "Faculty Research Laboratory",
  "Main Administration Block",
  "Finance & Accounts Office",
  "Library Archives Section",
  "Security Control Room",
];

const DURATIONS = [
  { label: "30 Minutes", value: "30min" },
  { label: "1 Hour",     value: "1hr"   },
  { label: "2 Hours",    value: "2hrs"  },
  { label: "4 Hours",    value: "4hrs"  },
  { label: "Half Day",   value: "half"  },
  { label: "Full Day",   value: "full"  },
];

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  pending: {
    label: "Pending Review",
    bg:    "bg-amber-100 text-amber-700 border-amber-200",
    dot:   "bg-amber-500",
  },
  approved: {
    label: "Approved",
    bg:    "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot:   "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    bg:    "bg-rose-100 text-rose-700 border-rose-200",
    dot:   "bg-rose-500",
  },
  expired: {
    label: "Expired",
    bg:    "bg-slate-100 text-slate-500 border-slate-200",
    dot:   "bg-slate-400",
  },
};

// ─── Relative time helper ─────────────────────────────────────────────────────
const relTime = (iso) => {
  const diff = Date.now() - new Date(iso);
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ─── Request history card ─────────────────────────────────────────────────────
const RequestCard = ({ req, onCancel }) => {
  const s = STATUS[req.status] || STATUS.pending;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-start gap-4 hover:shadow-md transition-all">
      {/* Left icon */}
      <div className="p-3 bg-indigo-50 rounded-xl text-indigo-500 flex-shrink-0">
        <FaBuilding size={18} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
          <h4 className="text-sm font-extrabold text-slate-800">{req.area}</h4>
          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${s.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        </div>

        <p className="text-xs text-slate-500 font-medium mb-3 line-clamp-2">
          {req.reason}
        </p>

        <div className="flex flex-wrap gap-4 text-[11px] text-slate-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <FaClock size={10} /> {req.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <FaCalendarAlt size={10} /> {relTime(req.submittedAt)}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-slate-300">
            <MdOutlineSensors size={11} /> {req.ticketId}
          </span>
        </div>
      </div>

      {/* Cancel if pending */}
      {req.status === "pending" && (
        <button
          onClick={() => onCancel(req.ticketId)}
          className="flex-shrink-0 text-slate-400 hover:text-rose-500 transition-colors p-1"
          title="Cancel request"
        >
          <FaTimes size={14} />
        </button>
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const TempAccessRequest = () => {
  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [drawerOpen, setDrawer]     = useState(false);
  const [requests, setRequests]     = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);  // success state
  const [lastTicket, setLastTicket] = useState(null);

  // Form state
  const [area, setArea]         = useState("");
  const [reason, setReason]     = useState("");
  const [duration, setDuration] = useState("");
  const [errors, setErrors]     = useState({});

  useEffect(() => {
    const init = async () => {
      try {
        const p = await getProfile();
        setProfile(p);
      } catch {
        setProfile({ staffId: "ST2026001", firstName: "John", lastName: "Doe", department: "Registry" });
      }
      setRequests(loadRequests());
      setLoading(false);
    };
    init();
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!area)   e.area   = "Please select an area.";
    if (!reason || reason.trim().length < 10)
                 e.reason = "Please enter a reason (at least 10 characters).";
    if (!duration) e.duration = "Please select a duration.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900)); // simulate API

    const ticket = `TAR-${Date.now().toString(36).toUpperCase()}`;
    const newReq = {
      ticketId:    ticket,
      area,
      reason,
      duration:    DURATIONS.find((d) => d.value === duration)?.label || duration,
      submittedAt: new Date().toISOString(),
      status:      "pending",
      staffId:     profile?.staffId || "N/A",
    };

    const updated = [newReq, ...requests];
    setRequests(updated);
    saveRequests(updated);
    setLastTicket(ticket);
    setSubmitting(false);
    setSubmitted(true);

    // Reset form
    setArea(""); setReason(""); setDuration(""); setErrors({});
  };

  const handleCancel = (ticketId) => {
    const updated = requests.filter((r) => r.ticketId !== ticketId);
    setRequests(updated);
    saveRequests(updated);
  };

  const closeDrawer = () => {
    setDrawer(false);
    setSubmitted(false);
    setErrors({});
    setArea(""); setReason(""); setDuration("");
  };

  if (loading) {
    return (
      <DashboardLayout role="staff">
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
          <span className="loading loading-spinner loading-lg text-indigo-500" />
          <p className="text-gray-500 text-sm font-semibold animate-pulse">Loading…</p>
        </div>
      </DashboardLayout>
    );
  }

  const pendingCount  = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;

  return (
    <DashboardLayout role="staff">
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-8">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 rounded-3xl shadow-xl border border-emerald-800/20 mb-8 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <FaKey className="text-emerald-400" />
                Temporary Access Request
              </h1>
              <p className="text-emerald-200/80 text-sm mt-2 font-medium max-w-xl">
                Request short-term access to restricted university areas. Each request is
                reviewed by the registry office and approved based on your clearance level.
              </p>
            </div>

            {/* Stats + CTA */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-center">
                <p className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-widest">Pending</p>
                <p className="text-2xl font-black text-amber-400">{pendingCount}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-center">
                <p className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-widest">Approved</p>
                <p className="text-2xl font-black text-emerald-400">{approvedCount}</p>
              </div>
              <button
                onClick={() => { setDrawer(true); setSubmitted(false); }}
                className="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-transparent whitespace-nowrap"
              >
                <FaPlus />
                New Request
              </button>
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { step: "01", icon: <FaClipboardList />, color: "text-emerald-500 bg-emerald-50 border-emerald-100", title: "Submit Request", body: "Fill in the area, reason, and access duration needed." },
            { step: "02", icon: <FaInfoCircle />,    color: "text-blue-500 bg-blue-50 border-blue-100",         title: "Registry Reviews", body: "The registry office verifies your clearance and approves." },
            { step: "03", icon: <FaCheckCircle />,   color: "text-violet-500 bg-violet-50 border-violet-100",   title: "Access Granted", body: "A temporary token is loaded onto your card for the duration." },
          ].map((s) => (
            <div key={s.step} className={`bg-white rounded-2xl border p-5 shadow-sm flex gap-4 items-start ${s.color.split(" ")[2]}`}>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-base flex-shrink-0 font-black ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">Step {s.step}</p>
                <p className="text-sm font-extrabold text-slate-800">{s.title}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── REQUEST HISTORY ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
              <FaHistory className="text-slate-400" /> My Requests
            </h3>
            <span className="text-xs font-bold text-slate-400">{requests.length} total</span>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaKey className="text-slate-300 text-xl" />
              </div>
              <p className="text-sm font-bold text-slate-600">No requests yet</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Click <span className="font-bold text-emerald-600">New Request</span> to get started.
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {requests.map((req) => (
                <RequestCard key={req.ticketId} req={req} onCancel={handleCancel} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SLIDE-OVER DRAWER                                                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9990] bg-slate-900/50 backdrop-blur-sm"
            onClick={closeDrawer}
          />

          {/* Drawer panel */}
          <div className="fixed inset-y-0 right-0 z-[9999] w-full max-w-md flex flex-col bg-white shadow-2xl">

            {/* Drawer header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-xl">
                  <FaKey className="text-white text-base" />
                </div>
                <div>
                  <h2 className="text-white font-extrabold text-base">New Temporary Access</h2>
                  <p className="text-emerald-100 text-[11px] font-medium">
                    Complete the form and submit for review.
                  </p>
                </div>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* ── SUCCESS STATE ────────────────────────────────────────────── */}
            {submitted ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                  <FaCheckCircle className="text-emerald-500 text-4xl" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 mb-2">Request Submitted!</h3>
                <p className="text-sm text-slate-500 font-medium mb-4 max-w-xs leading-relaxed">
                  Your temporary access request has been submitted successfully and is pending review.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 mb-6 inline-block w-full">
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">Ticket ID</p>
                  <p className="text-base font-black text-slate-800 font-mono">{lastTicket}</p>
                  <p className="text-[11px] text-amber-600 font-semibold mt-2 flex items-center justify-center gap-1">
                    <FaClock size={10} /> Expected review: within 1 working day
                  </p>
                </div>
                <div className="w-full space-y-3">
                  <button
                    onClick={() => { setSubmitted(false); }}
                    className="btn w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl border-none"
                  >
                    Submit Another Request
                  </button>
                  <button
                    onClick={closeDrawer}
                    className="btn btn-ghost w-full text-slate-600 font-bold rounded-xl border border-slate-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* ── FORM ──────────────────────────────────────────────────── */
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">

                  {/* Security note */}
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <FaExclamationTriangle className="text-amber-500 flex-shrink-0 mt-0.5 text-sm" />
                    <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                      Temporary access requests are logged. Misuse of temporary access will result in disciplinary action.
                    </p>
                  </div>

                  {/* Area field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                      <FaBuilding size={11} /> Area Needed
                      <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={area}
                      onChange={(e) => { setArea(e.target.value); setErrors((p) => ({ ...p, area: "" })); }}
                      className={`select select-bordered w-full bg-slate-50 text-slate-800 text-sm ${errors.area ? "border-rose-400 focus:border-rose-400" : "border-slate-200"}`}
                    >
                      <option value="">Select an area…</option>
                      {AREAS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                    {errors.area && (
                      <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                        <FaTimes size={9} /> {errors.area}
                      </p>
                    )}
                  </div>

                  {/* Reason field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                      <FaClipboardList size={11} /> Reason for Access
                      <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={reason}
                      onChange={(e) => { setReason(e.target.value); setErrors((p) => ({ ...p, reason: "" })); }}
                      placeholder="e.g. Submission of documents to the Dean's office for semester registration…"
                      className={`textarea textarea-bordered w-full bg-slate-50 text-slate-800 text-sm placeholder-slate-300 resize-none rounded-xl ${errors.reason ? "border-rose-400" : "border-slate-200"}`}
                    />
                    <div className="flex justify-between items-center">
                      {errors.reason ? (
                        <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                          <FaTimes size={9} /> {errors.reason}
                        </p>
                      ) : <span />}
                      <p className="text-[10px] text-slate-300 font-semibold ml-auto">
                        {reason.length} chars
                      </p>
                    </div>
                  </div>

                  {/* Duration field */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                      <FaClock size={11} /> Access Duration
                      <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {DURATIONS.map((d) => (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => { setDuration(d.value); setErrors((p) => ({ ...p, duration: "" })); }}
                          className={`py-3 px-2 rounded-xl border-2 text-xs font-extrabold transition-all ${
                            duration === d.value
                              ? "bg-emerald-50 border-emerald-400 text-emerald-700 ring-2 ring-emerald-300 ring-offset-1"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white"
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                    {errors.duration && (
                      <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                        <FaTimes size={9} /> {errors.duration}
                      </p>
                    )}
                  </div>

                  {/* Preview summary (only when all fields filled) */}
                  {area && reason.trim().length >= 10 && duration && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                      <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest mb-2">
                        Request Summary
                      </p>
                      {[
                        ["Area",     area],
                        ["Duration", DURATIONS.find((d) => d.value === duration)?.label],
                        ["Reason",   reason],
                      ].map(([k, v]) => (
                        <div key={k} className="flex gap-2 text-xs">
                          <span className="font-extrabold text-emerald-700 w-16 flex-shrink-0">{k}:</span>
                          <span className="text-emerald-800 font-medium line-clamp-2">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Drawer footer */}
                <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-3">
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="btn btn-ghost flex-1 rounded-xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn flex-1 bg-emerald-500 hover:bg-emerald-600 border-none text-white font-extrabold rounded-xl shadow-sm disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <FaSpinner className="animate-spin" /> Submitting…
                      </span>
                    ) : "Submit Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default TempAccessRequest;
