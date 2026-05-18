import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../component/DashboardLayout";
import {
  FaBell,
  FaExclamationTriangle,
  FaBan,
  FaCheckCircle,
  FaInfoCircle,
  FaTimes,
  FaFilter,
  FaSync,
  FaEye,
  FaShieldAlt,
  FaDoorOpen,
  FaClock,
} from "react-icons/fa";
import { MdOutlineSensors } from "react-icons/md";

// ─── Storage key ──────────────────────────────────────────────────────────────
const READ_KEY = "securityNotifications_read";

const loadRead = () => {
  try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]")); }
  catch { return new Set(); }
};
const saveRead = (set) =>
  localStorage.setItem(READ_KEY, JSON.stringify([...set]));

// ─── Mock notification dataset ─────────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  {
    id: "notif-1",
    type: "card_used",
    severity: "info",
    title: "Card Used at Laboratory Suite",
    message: "Your NFC card was successfully scanned at Laboratory Suite (RDR-LAB-01). Access granted.",
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),        // 18 min ago
    location: "Laboratory Suite",
    readerId: "RDR-LAB-01",
  },
  {
    id: "notif-2",
    type: "unauthorized",
    severity: "danger",
    title: "Unauthorized Access Attempt Detected",
    message: "An access attempt was made at Core IT Server Rooms using your card UID but was denied due to insufficient security clearance.",
    timestamp: new Date(Date.now() - 2.3 * 3600000).toISOString(),      // 2.3 h ago
    location: "Core IT Server Rooms",
    readerId: "RDR-SRV-02",
  },
  {
    id: "notif-3",
    type: "card_used",
    severity: "info",
    title: "Card Used at Main Campus Gate",
    message: "Your NFC card was scanned at Main Campus Gate (RDR-MAIN-OUT). Exit recorded successfully.",
    timestamp: new Date(Date.now() - 4.5 * 3600000).toISOString(),
    location: "Main Campus Gate",
    readerId: "RDR-MAIN-OUT",
  },
  {
    id: "notif-4",
    type: "suspicious",
    severity: "warning",
    title: "Unusual Access Pattern Detected",
    message: "Multiple access attempts were registered at Admin Office within 5 minutes. This has been flagged for security review.",
    timestamp: new Date(Date.now() - 7 * 3600000).toISOString(),
    location: "Admin Office",
    readerId: "RDR-ADM-IN",
  },
  {
    id: "notif-5",
    type: "card_used",
    severity: "info",
    title: "Card Used at Academic Registry",
    message: "Your NFC card was scanned at Academic Registry Suite (RDR-REG-IN). Access granted.",
    timestamp: new Date(Date.now() - 9 * 3600000).toISOString(),
    location: "Academic Registry Suite",
    readerId: "RDR-REG-IN",
  },
  {
    id: "notif-6",
    type: "unauthorized",
    severity: "danger",
    title: "Denied — University Vault Complex",
    message: "Access to University Vault Complex was denied. Your current access level does not permit entry to this restricted zone.",
    timestamp: new Date(Date.now() - 26 * 3600000).toISOString(),
    location: "University Vault Complex",
    readerId: "RDR-VLT-01",
  },
  {
    id: "notif-7",
    type: "system",
    severity: "success",
    title: "Card Successfully Activated",
    message: "Your NFC smart card has been activated and linked to your university profile. All access permissions have been applied.",
    timestamp: new Date(Date.now() - 72 * 3600000).toISOString(),
    location: null,
    readerId: null,
  },
];

// ─── Severity config ──────────────────────────────────────────────────────────
const SEVERITY = {
  danger: {
    border:  "border-l-rose-500",
    bg:      "bg-rose-50/70 hover:bg-rose-50",
    badgeBg: "bg-rose-100 text-rose-700 border-rose-200",
    iconBg:  "bg-rose-100 text-rose-500",
    dot:     "bg-rose-500",
    icon:    <FaBan size={15} />,
    label:   "Security Alert",
  },
  warning: {
    border:  "border-l-amber-500",
    bg:      "bg-amber-50/60 hover:bg-amber-50",
    badgeBg: "bg-amber-100 text-amber-700 border-amber-200",
    iconBg:  "bg-amber-100 text-amber-500",
    dot:     "bg-amber-500",
    icon:    <FaExclamationTriangle size={14} />,
    label:   "Warning",
  },
  info: {
    border:  "border-l-blue-400",
    bg:      "bg-blue-50/50 hover:bg-blue-50",
    badgeBg: "bg-blue-100 text-blue-700 border-blue-200",
    iconBg:  "bg-blue-100 text-blue-500",
    dot:     "bg-blue-400",
    icon:    <FaDoorOpen size={15} />,
    label:   "Card Activity",
  },
  success: {
    border:  "border-l-emerald-500",
    bg:      "bg-emerald-50/50 hover:bg-emerald-50",
    badgeBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
    iconBg:  "bg-emerald-100 text-emerald-500",
    dot:     "bg-emerald-500",
    icon:    <FaCheckCircle size={15} />,
    label:   "System",
  },
};

// ─── Relative time helper ─────────────────────────────────────────────────────
const relativeTime = (iso) => {
  const diff = Date.now() - new Date(iso);
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const formatExact = (iso) =>
  new Date(iso).toLocaleString([], {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

// ─── Single notification card ─────────────────────────────────────────────────
const NotificationCard = ({ notif, isRead, onMarkRead, onDismiss }) => {
  const s = SEVERITY[notif.severity] || SEVERITY.info;

  return (
    <div
      className={`relative flex gap-4 p-4 sm:p-5 rounded-2xl border border-l-4 transition-all duration-200 group ${s.border} ${s.bg} ${
        isRead ? "opacity-70" : ""
      }`}
    >
      {/* Unread dot */}
      {!isRead && (
        <span className={`absolute top-4 right-4 w-2 h-2 rounded-full ${s.dot} flex-shrink-0`} />
      )}

      {/* Icon bubble */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
        {s.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        {/* Header row */}
        <div className="flex flex-wrap items-start gap-2 mb-1">
          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wide ${s.badgeBg}`}>
            {s.label}
          </span>
          {!isRead && (
            <span className="text-[10px] font-extrabold text-white bg-indigo-500 px-2 py-0.5 rounded-full">
              New
            </span>
          )}
        </div>

        <h4 className="text-sm font-extrabold text-slate-800 leading-snug">
          {notif.title}
        </h4>
        <p className="text-[12px] text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">
          {notif.message}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-slate-400 font-semibold">
          <span className="flex items-center gap-1">
            <FaClock size={10} />
            <span title={formatExact(notif.timestamp)}>{relativeTime(notif.timestamp)}</span>
            <span className="text-slate-300">·</span>
            <span>{formatExact(notif.timestamp).split(",")[0]}</span>
          </span>
          {notif.location && (
            <span className="flex items-center gap-1">
              <MdOutlineSensors size={11} />
              {notif.location}
            </span>
          )}
          {notif.readerId && (
            <span className="font-mono uppercase text-slate-300">{notif.readerId}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isRead && (
          <button
            onClick={() => onMarkRead(notif.id)}
            title="Mark as read"
            className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
          >
            <FaEye size={11} />
          </button>
        )}
        <button
          onClick={() => onDismiss(notif.id)}
          title="Dismiss"
          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors"
        >
          <FaTimes size={11} />
        </button>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const SecurityNotifications = () => {
  const [notifications, setNotifications]   = useState(MOCK_NOTIFICATIONS);
  const [readIds, setReadIds]               = useState(new Set());
  const [filter, setFilter]                 = useState("all");
  const [refreshing, setRefreshing]         = useState(false);

  // Load persisted read state
  useEffect(() => { setReadIds(loadRead()); }, []);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markRead = (id) => {
    const next = new Set(readIds).add(id);
    setReadIds(next);
    saveRead(next);
  };

  const markAllRead = () => {
    const next = new Set(notifications.map((n) => n.id));
    setReadIds(next);
    saveRead(next);
  };

  const dismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const next = new Set(readIds);
    next.delete(id);
    setReadIds(next);
    saveRead(next);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setNotifications(MOCK_NOTIFICATIONS);
      setRefreshing(false);
    }, 700);
  };

  // Filter displayed notifications
  const displayed = notifications.filter((n) => {
    if (filter === "unread")   return !readIds.has(n.id);
    if (filter === "danger")   return n.severity === "danger";
    if (filter === "warning")  return n.severity === "warning";
    if (filter === "activity") return n.severity === "info";
    return true;
  });

  // Group by relative date bucket
  const groupByDate = (list) => {
    const groups = {};
    list.forEach((n) => {
      const diff = Date.now() - new Date(n.timestamp);
      let key = diff < 86400000 ? "Today"
              : diff < 172800000 ? "Yesterday"
              : "Earlier";
      (groups[key] = groups[key] || []).push(n);
    });
    return groups;
  };

  const groups = groupByDate(displayed);

  return (
    <DashboardLayout role="staff">
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-8">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl shadow-xl border border-indigo-900/20 mb-8 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <FaBell className="text-indigo-400" />
                Security Notifications
                {unreadCount > 0 && (
                  <span className="text-sm bg-rose-500 text-white font-extrabold px-2.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-indigo-200/80 text-sm mt-2 font-medium max-w-xl">
                Real-time alerts for card activity, access denials, and campus security events
                linked to your NFC credential.
              </p>
            </div>

            {/* Summary stat chips */}
            <div className="flex gap-3 flex-wrap">
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-center">
                <p className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest">Unread</p>
                <p className="text-2xl font-black text-white">{unreadCount}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-center">
                <p className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest">Alerts</p>
                <p className="text-2xl font-black text-rose-400">
                  {notifications.filter((n) => n.severity === "danger").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTROLS ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          {/* Filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            <FaFilter className="text-slate-400 text-xs flex-shrink-0" />
            {[
              { id: "all",      label: "All" },
              { id: "unread",   label: `Unread (${unreadCount})` },
              { id: "danger",   label: "⚠ Alerts" },
              { id: "warning",  label: "Suspicious" },
              { id: "activity", label: "Card Activity" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFilter(opt.id)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide border transition-all ${
                  filter === opt.id
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="btn btn-outline btn-sm font-bold h-10 border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <FaCheckCircle size={12} /> Mark all read
              </button>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-outline btn-sm font-bold h-10 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <FaSync className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* ── NOTIFICATION FEED ────────────────────────────────────────────── */}
        {displayed.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaBell className="text-slate-300 text-2xl" />
            </div>
            <p className="text-sm font-bold text-slate-600">No notifications</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              You're all caught up. Any new security events will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {["Today", "Yesterday", "Earlier"].map((bucket) => {
              const items = groups[bucket];
              if (!items?.length) return null;
              return (
                <div key={bucket}>
                  {/* Date separator */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                      {bucket}
                    </span>
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[10px] text-slate-300 font-semibold">
                      {items.length} event{items.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {items.map((notif) => (
                      <NotificationCard
                        key={notif.id}
                        notif={notif}
                        isRead={readIds.has(notif.id)}
                        onMarkRead={markRead}
                        onDismiss={dismiss}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── SECURITY TIPS FOOTER ─────────────────────────────────────────── */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <FaShieldAlt className="text-indigo-500" /> Security Reminders
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <FaExclamationTriangle className="text-amber-500" />,
                bg: "bg-amber-50 border-amber-100",
                title: "Unauthorized Alert?",
                body: "If you didn't attempt that access, report your card immediately.",
              },
              {
                icon: <FaBan className="text-rose-500" />,
                bg: "bg-rose-50 border-rose-100",
                title: "Card Stolen?",
                body: "Use 'Report Card Issue' to suspend your card instantly.",
              },
              {
                icon: <FaInfoCircle className="text-blue-500" />,
                bg: "bg-blue-50 border-blue-100",
                title: "Normal Activity",
                body: "Routine card scans are logged for your transparency.",
              },
            ].map((tip) => (
              <div key={tip.title} className={`rounded-xl border p-4 ${tip.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  {tip.icon}
                  <p className="text-xs font-extrabold text-slate-700">{tip.title}</p>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{tip.body}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default SecurityNotifications;
