import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../component/DashboardLayout";
import {
  FaDoorOpen,
  FaBan,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSync,
  FaFilter,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdOutlineSensors } from "react-icons/md";
import { getProfile, getUserAccessLogs } from "../../../Api/authService";

// ─── Reusable Timeline Item ────────────────────────────────────────────────────
const TimelineItem = ({ log, isLast }) => {
  const isGranted = log.result?.toLowerCase() === "granted";

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "--:--";
    }
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="flex gap-4 group">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Icon bubble */}
        <div
          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-md border-4 border-white transition-transform group-hover:scale-110 ${
            isGranted
              ? "bg-emerald-500 text-white"
              : "bg-rose-500 text-white"
          }`}
        >
          {isGranted ? <FaDoorOpen size={16} /> : <FaBan size={16} />}
        </div>
        {/* Connector line */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-slate-200 to-transparent mt-1 min-h-[2rem]" />
        )}
      </div>

      {/* Content card */}
      <div
        className={`mb-6 flex-1 rounded-2xl border p-4 shadow-sm transition-all duration-200 group-hover:shadow-md ${
          isGranted
            ? "bg-emerald-50/60 border-emerald-100 hover:bg-emerald-50"
            : "bg-rose-50/50 border-rose-100 hover:bg-rose-50"
        }`}
      >
        {/* Top row: time + badge */}
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <FaClock className={isGranted ? "text-emerald-400" : "text-rose-400"} />
            <span>{formatTime(log.timestamp)}</span>
            <span className="text-slate-300">·</span>
            <FaCalendarAlt className="text-slate-400" />
            <span>{formatDate(log.timestamp)}</span>
          </div>

          <span
            className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wide border ${
              isGranted
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-rose-100 text-rose-700 border-rose-200"
            }`}
          >
            {isGranted ? (
              <FaCheckCircle size={9} />
            ) : (
              <FaTimesCircle size={9} />
            )}
            {isGranted ? "Granted" : "Denied"}
          </span>
        </div>

        {/* Main event description */}
        <p className="text-sm font-extrabold text-slate-800 tracking-tight">
          {isGranted ? "Entered" : "Attempted"}{" "}
          <span className={isGranted ? "text-emerald-700" : "text-rose-600"}>
            {log.door || "Unknown Access Point"}
          </span>
        </p>

        {/* Sub row: reader + rejection reason */}
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-semibold">
          <span className="flex items-center gap-1">
            <MdOutlineSensors size={12} />
            {log.readerId || "RDR-UNKNOWN"}
          </span>
          {!isGranted && log.reason && (
            <span className="text-rose-500 font-bold">— {log.reason}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const StaffTimeline = () => {
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" | "granted" | "denied"

  const MOCK_LOGS = [
    {
      _id: "tl-1",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      door: "Laboratory Suite",
      readerId: "RDR-LAB-01",
      result: "granted",
    },
    {
      _id: "tl-2",
      timestamp: new Date(Date.now() - 2.75 * 3600000).toISOString(),
      door: "Admin Office",
      readerId: "RDR-ADM-IN",
      result: "denied",
      reason: "Security Level Mismatch",
    },
    {
      _id: "tl-3",
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      door: "Main Campus Gate",
      readerId: "RDR-MAIN-OUT",
      result: "granted",
    },
    {
      _id: "tl-4",
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
      door: "Academic Registry Suite",
      readerId: "RDR-REG-IN",
      result: "granted",
    },
    {
      _id: "tl-5",
      timestamp: new Date(Date.now() - 8.5 * 3600000).toISOString(),
      door: "Core IT Server Rooms",
      readerId: "RDR-SRV-02",
      result: "denied",
      reason: "Unauthorized Security Level",
    },
    {
      _id: "tl-6",
      timestamp: new Date(Date.now() - 26 * 3600000).toISOString(),
      door: "Main Campus Gate",
      readerId: "RDR-MAIN-IN",
      result: "granted",
    },
  ];

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      let profileData = null;
      try {
        profileData = await getProfile();
        setProfile(profileData);
      } catch {
        profileData = { uid: "NFC-88A-92F", staffId: "ST2026001" };
        setProfile(profileData);
      }

      if (profileData?.uid) {
        try {
          const data = await getUserAccessLogs(profileData.uid);
          setLogs(Array.isArray(data) && data.length > 0 ? data : MOCK_LOGS);
        } catch {
          setLogs(MOCK_LOGS);
        }
      } else {
        setLogs(MOCK_LOGS);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered & sorted list (newest first)
  const displayed = logs
    .filter((l) =>
      filter === "all" ? true : l.result?.toLowerCase() === filter
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const totalGranted = logs.filter((l) => l.result?.toLowerCase() === "granted").length;
  const totalDenied  = logs.filter((l) => l.result?.toLowerCase() === "denied").length;

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout role="staff">
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
          <span className="loading loading-spinner loading-lg text-indigo-600" />
          <p className="text-gray-500 text-sm font-semibold animate-pulse">
            Loading your activity timeline…
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="staff">
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-8">

        {/* ── HERO HEADER ──────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-violet-950 rounded-3xl shadow-xl border border-indigo-800/20 mb-8 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <FaClock className="text-indigo-400" />
                Activity Timeline
              </h1>
              <p className="text-indigo-200/80 text-sm mt-2 font-medium max-w-xl">
                A chronological feed of every physical door scan logged against your NFC
                smart card — newest events first.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 flex-wrap">
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-center">
                <p className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest">Granted</p>
                <p className="text-2xl font-black text-emerald-400">{totalGranted}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-center">
                <p className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest">Denied</p>
                <p className="text-2xl font-black text-rose-400">{totalDenied}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── FILTER BAR ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <FaFilter className="text-slate-400 text-xs" />
            {["all", "granted", "denied"].map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide border transition-all ${
                  filter === option
                    ? option === "all"
                      ? "bg-slate-800 text-white border-slate-800"
                      : option === "granted"
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-rose-500 text-white border-rose-500"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="btn btn-outline btn-sm flex items-center gap-2 font-bold h-10 border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <FaSync className={refreshing ? "animate-spin" : ""} />
            Refresh Timeline
          </button>
        </div>

        {/* ── VERTICAL TIMELINE ────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
          {displayed.length === 0 ? (
            <div className="text-center py-16">
              <FaClock className="mx-auto text-slate-300 text-5xl mb-4" />
              <p className="text-sm font-bold text-slate-600">No activity yet.</p>
              <p className="text-xs text-gray-400 mt-1">
                Tap your smart card at any campus reader to see events here.
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Left-side date separators + items */}
              {displayed.map((log, idx) => {
                const isLast = idx === displayed.length - 1;

                // Insert a date separator when date changes
                const currentDate = new Date(log.timestamp).toDateString();
                const prevDate =
                  idx > 0
                    ? new Date(displayed[idx - 1].timestamp).toDateString()
                    : null;

                return (
                  <React.Fragment key={log._id}>
                    {(idx === 0 || currentDate !== prevDate) && (
                      <div className="flex items-center gap-3 mb-4 mt-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                          {new Date(log.timestamp).toLocaleDateString([], {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>
                    )}
                    <TimelineItem log={log} isLast={isLast} />
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffTimeline;
