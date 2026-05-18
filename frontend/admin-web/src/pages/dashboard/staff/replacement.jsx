import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../component/DashboardLayout";
import {
  FaCreditCard,
  FaExchangeAlt,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaShieldAlt,
  FaInfoCircle,
  FaTimes,
  FaWifi,
} from "react-icons/fa";
import { MdOutlineCreditCardOff } from "react-icons/md";
import { getProfile } from "../../../Api/authService";

// ─── Storage key for pending state ───────────────────────────────────────────
const PENDING_KEY = "cardReplacementRequest";

// ─── Helper: read / write pending request from localStorage ──────────────────
const loadPendingRequest = () => {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const savePendingRequest = (data) => {
  localStorage.setItem(PENDING_KEY, JSON.stringify(data));
};

const clearPendingRequest = () => {
  localStorage.removeItem(PENDING_KEY);
};

// ─── Reason options ───────────────────────────────────────────────────────────
const REASONS = [
  { id: "lost",    label: "Card was lost",     icon: <MdOutlineCreditCardOff size={18} /> },
  { id: "stolen",  label: "Card was stolen",   icon: <FaShieldAlt size={15} /> },
  { id: "damaged", label: "Card is damaged",   icon: <FaExchangeAlt size={15} /> },
  { id: "expired", label: "Card has expired",  icon: <FaClock size={15} /> },
  { id: "other",   label: "Other reason",      icon: <FaInfoCircle size={15} /> },
];

// ─── Main Page Component ──────────────────────────────────────────────────────
const CardReplacement = () => {
  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [selectedReason, setReason]     = useState("");
  const [additionalNote, setNote]       = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [pendingRequest, setPending]    = useState(null); // persisted request
  const [showSuccess, setShowSuccess]   = useState(false);

  // ── Load profile + persisted pending state ──────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const p = await getProfile();
        setProfile(p);
      } catch {
        setProfile({
          staffId: "ST2026001",
          firstName: "John",
          lastName: "Doe",
          uid: "NFC-88A-92F",
          department: "Registry & Academic Affairs",
        });
      }
      setPending(loadPendingRequest());
      setLoading(false);
    };
    init();
  }, []);

  // ── Submit handler ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedReason) return;
    setSubmitting(true);

    // Simulate an API call (800 ms)
    await new Promise((r) => setTimeout(r, 900));

    const request = {
      staffId:   profile?.staffId || "N/A",
      uid:       profile?.uid || "N/A",
      reason:    REASONS.find((r) => r.id === selectedReason)?.label || selectedReason,
      note:      additionalNote,
      submittedAt: new Date().toISOString(),
      ticketId:  `RCR-${Date.now().toString(36).toUpperCase()}`,
      status:    "pending",
    };

    savePendingRequest(request);
    setPending(request);
    setSubmitting(false);
    setShowModal(false);
    setShowSuccess(true);
    setReason("");
    setNote("");

    // Auto-dismiss success banner after 6 s
    setTimeout(() => setShowSuccess(false), 6000);
  };

  const handleCancelRequest = () => {
    clearPendingRequest();
    setPending(null);
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout role="staff">
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
          <span className="loading loading-spinner loading-lg text-amber-500" />
          <p className="text-gray-500 text-sm font-semibold animate-pulse">
            Loading card information…
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const fullName = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "User";

  return (
    <DashboardLayout role="staff">
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-8">

        {/* ── HERO HEADER ──────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-orange-950 rounded-3xl shadow-xl border border-amber-800/20 mb-8 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <FaExchangeAlt className="text-amber-400" />
                Card Replacement Request
              </h1>
              <p className="text-amber-200/80 text-sm mt-2 font-medium max-w-xl">
                Request a new NFC smart card if yours has been lost, stolen, or is no longer
                functioning correctly. Your request will be reviewed by the registry office.
              </p>
            </div>

            {/* Current card status chip */}
            <div className="flex-shrink-0 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/15 text-center">
              <p className="text-[10px] text-amber-300 font-extrabold uppercase tracking-widest mb-1">
                Card Status
              </p>
              <span className={`text-sm font-black capitalize ${
                pendingRequest ? "text-amber-400" : "text-emerald-400"
              }`}>
                {pendingRequest ? "Replacement Pending" : profile?.status || "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* ── SUCCESS ALERT ────────────────────────────────────────────────── */}
        {showSuccess && (
          <div className="mb-6 flex items-start gap-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="p-2.5 bg-emerald-100 rounded-xl flex-shrink-0">
              <FaCheckCircle className="text-emerald-600 text-lg" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-emerald-800 text-sm">Request submitted successfully!</p>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                Your card replacement request has been queued. The registry office will process
                it within 1–3 working days and contact you via your registered email.
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-emerald-400 hover:text-emerald-600 transition-colors flex-shrink-0"
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* ── MAIN CONTENT GRID ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT — Current card info */}
          <div className="lg:col-span-1 space-y-6">

            {/* Physical card visual */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-widest mb-4">
                Current Card
              </h3>

              {/* Mini card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 p-5 text-white border border-slate-800 shadow-lg">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
                <div className="flex justify-between items-start mb-5">
                  <span className="text-[9px] tracking-[0.2em] font-extrabold text-indigo-300 uppercase">
                    University Smart ID
                  </span>
                  <FaWifi className="rotate-90 text-indigo-300" />
                </div>
                {/* Gold chip */}
                <div className="w-9 h-7 rounded bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 mb-4 shadow-inner relative overflow-hidden">
                  <div className="w-full h-px bg-amber-700/30 absolute top-1/3" />
                  <div className="w-full h-px bg-amber-700/30 absolute top-2/3" />
                  <div className="h-full w-px bg-amber-700/30 absolute left-1/3" />
                  <div className="h-full w-px bg-amber-700/30 absolute left-2/3" />
                </div>
                <p className="font-mono text-sm font-bold text-white/90 tracking-widest">
                  {profile?.uid
                    ? `${profile.uid.slice(0, 4)} •••• •••• ${profile.uid.slice(-4)}`
                    : "•••• •••• ••••"}
                </p>
                <div className="flex justify-between mt-3 text-[10px] text-indigo-200/70 font-bold uppercase">
                  <span>{fullName}</span>
                  <span>{profile?.staffId}</span>
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                {[
                  ["Department", profile?.department || "—"],
                  ["Staff ID",   profile?.staffId    || "—"],
                  ["Card UID",   profile?.uid        || "—"],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase">{label}</span>
                    <span className="text-slate-800 font-extrabold font-mono">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security info panel */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <FaShieldAlt className="text-amber-500" />
                <h4 className="text-xs font-extrabold text-amber-800 uppercase tracking-wide">
                  Security Notice
                </h4>
              </div>
              <ul className="space-y-2 text-[11px] text-amber-800 font-medium leading-relaxed list-disc list-inside">
                <li>Your current card remains active until the replacement is issued.</li>
                <li>Report a lost or stolen card separately to suspend gate access immediately.</li>
                <li>Processing takes 1–3 working days.</li>
                <li>You will be notified by email when ready for collection.</li>
              </ul>
            </div>
          </div>

          {/* RIGHT — Request panel */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── PENDING STATE ─────────────────────────────────────────── */}
            {pendingRequest ? (
              <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                {/* Status banner */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center gap-3">
                  <FaClock className="text-white text-xl flex-shrink-0" />
                  <div>
                    <p className="text-white font-extrabold text-sm">Replacement Pending</p>
                    <p className="text-amber-100 text-[11px] font-medium">
                      Your request is being reviewed by the registry office.
                    </p>
                  </div>
                  {/* Pulsing badge */}
                  <span className="ml-auto flex-shrink-0 bg-white/20 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full animate-pulse border border-white/30">
                    Under Review
                  </span>
                </div>

                {/* Ticket details */}
                <div className="p-6 space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
                    <FaCreditCard className="text-amber-500" />
                    Request Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      ["Ticket ID",       pendingRequest.ticketId],
                      ["Reason",          pendingRequest.reason],
                      ["Submitted",       new Date(pendingRequest.submittedAt).toLocaleString()],
                      ["Staff ID",        pendingRequest.staffId],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">
                          {label}
                        </p>
                        <p className="text-sm font-extrabold text-slate-800 font-mono">{val}</p>
                      </div>
                    ))}
                  </div>

                  {pendingRequest.note && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1">
                        Additional Note
                      </p>
                      <p className="text-sm text-slate-700 font-medium italic">"{pendingRequest.note}"</p>
                    </div>
                  )}

                  {/* Expected timeline bar */}
                  <div className="rounded-xl border border-slate-100 p-4 bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-3">
                      Processing Timeline
                    </p>
                    <div className="flex items-center gap-0 text-[10px] font-bold">
                      {[
                        { label: "Submitted",   done: true  },
                        { label: "Under Review", done: true  },
                        { label: "Approved",    done: false },
                        { label: "Ready",       done: false },
                      ].map((step, i, arr) => (
                        <React.Fragment key={step.label}>
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                              step.done
                                ? "bg-amber-500 border-amber-500 text-white"
                                : "bg-white border-slate-300 text-slate-300"
                            }`}>
                              {step.done ? <FaCheckCircle size={10} /> : <span className="text-[8px] font-black">{i + 1}</span>}
                            </div>
                            <span className={step.done ? "text-amber-600" : "text-slate-400"}>
                              {step.label}
                            </span>
                          </div>
                          {i < arr.length - 1 && (
                            <div className={`flex-1 h-0.5 mb-4 mx-1 ${step.done ? "bg-amber-400" : "bg-slate-200"}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleCancelRequest}
                    className="btn btn-outline btn-sm border-slate-200 text-slate-500 hover:bg-slate-50 font-bold rounded-xl"
                  >
                    <FaTimes className="mr-1" /> Cancel Request
                  </button>
                </div>
              </div>
            ) : (
              /* ── REQUEST CARD (no pending request) ─────────────────────── */
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="px-6 py-5 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <FaCreditCard className="text-amber-500" />
                    Request a Replacement Card
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Submit a formal request to the registry office for a new NFC smart card.
                  </p>
                </div>

                {/* Illustration area */}
                <div className="p-8 flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-16 rounded-xl bg-gradient-to-br from-slate-800 to-indigo-900 shadow-xl flex items-center justify-center border border-slate-700">
                      <FaWifi className="rotate-90 text-indigo-300 text-2xl" />
                    </div>
                    <div className="absolute -right-3 -bottom-3 w-8 h-8 rounded-full bg-amber-100 border-2 border-white shadow flex items-center justify-center">
                      <FaExchangeAlt className="text-amber-500 text-xs" />
                    </div>
                  </div>

                  <h4 className="text-lg font-extrabold text-slate-800 mb-2">Need a New Card?</h4>
                  <p className="text-sm text-slate-500 font-medium max-w-sm leading-relaxed mb-8">
                    Your request will be reviewed by the registry office and a new card will be issued
                    to you within 1–3 working days.
                  </p>

                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-md shadow-amber-500/25 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                  >
                    <FaCreditCard />
                    Request New Card
                  </button>
                </div>

                {/* Footer note */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 flex items-center gap-2">
                  <FaInfoCircle className="text-slate-400 flex-shrink-0 text-sm" />
                  <p className="text-[11px] text-slate-500 font-medium">
                    You can only have one active replacement request at a time.
                  </p>
                </div>
              </div>
            )}

            {/* What happens next guide */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-widest mb-5">
                What happens after your request?
              </h3>
              <div className="space-y-4">
                {[
                  {
                    step: "01",
                    title: "Request Received",
                    body: "Your request is instantly logged in the campus registry management system.",
                    color: "text-amber-500 bg-amber-50 border-amber-100",
                  },
                  {
                    step: "02",
                    title: "Identity Verification",
                    body: "The registry office verifies your identity and confirms current card status.",
                    color: "text-blue-500 bg-blue-50 border-blue-100",
                  },
                  {
                    step: "03",
                    title: "Card Provisioned",
                    body: "A new NFC card is programmed with your access credentials and security tier.",
                    color: "text-violet-500 bg-violet-50 border-violet-100",
                  },
                  {
                    step: "04",
                    title: "Collection Notification",
                    body: "You receive an email notification to collect your new card from the registry.",
                    color: "text-emerald-500 bg-emerald-50 border-emerald-100",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 items-start">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-sm flex-shrink-0 ${item.color}`}>
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── CONFIRMATION MODAL ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Modal header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-xl">
                  <FaExchangeAlt className="text-white text-base" />
                </div>
                <div>
                  <h2 className="text-white font-extrabold text-base">Request New Card</h2>
                  <p className="text-amber-100 text-[11px] font-medium">Fill in the reason for replacement.</p>
                </div>
              </div>
              <button
                onClick={() => { setShowModal(false); setReason(""); setNote(""); }}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Reason selector */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                  Reason for Replacement <span className="text-rose-400">*</span>
                </label>
                <div className="space-y-2">
                  {REASONS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setReason(r.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-150 ${
                        selectedReason === r.id
                          ? "bg-amber-50 border-amber-400 ring-2 ring-amber-300 ring-offset-1"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <div className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
                        selectedReason === r.id ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-500"
                      }`}>
                        {r.icon}
                      </div>
                      <span className={`text-sm font-extrabold ${selectedReason === r.id ? "text-amber-800" : "text-slate-700"}`}>
                        {r.label}
                      </span>
                      <div className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        selectedReason === r.id ? "bg-amber-400 border-amber-400" : "border-slate-300 bg-white"
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional note */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                  Additional Note <span className="text-slate-300 font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={additionalNote}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any extra details the registry office should know…"
                  className="textarea textarea-bordered w-full text-sm bg-slate-50 border-slate-200 placeholder-slate-300 resize-none rounded-xl"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => { setShowModal(false); setReason(""); setNote(""); }}
                className="btn btn-ghost flex-1 rounded-xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedReason || submitting}
                className="btn flex-1 bg-amber-500 hover:bg-amber-600 border-none text-white font-extrabold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <FaSpinner className="animate-spin" /> Submitting…
                  </span>
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CardReplacement;
