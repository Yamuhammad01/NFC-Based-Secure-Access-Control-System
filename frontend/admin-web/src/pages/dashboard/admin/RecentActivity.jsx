import React, { useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaShieldAlt, FaSearch, FaHistory, FaFilter } from "react-icons/fa";

const RecentActivity = ({ activities = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all, access, admin

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      !searchTerm ||
      act.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.details?.door?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.details?.uid?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || act.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getEventIcon = (activity) => {
    const action = activity.action?.toLowerCase() || "";
    const result = activity.details?.result?.toLowerCase();

    if (result === "granted" || action.includes("granted") || action.includes("create")) {
      return (
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-200/60">
          <FaCheckCircle className="text-sm" />
        </div>
      );
    }
    if (result === "denied" || action.includes("denied") || action.includes("delete") || action.includes("revoke")) {
      return (
        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 border border-rose-200/60">
          <FaTimesCircle className="text-sm" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-200/60">
        <FaShieldAlt className="text-sm" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Recent Activity Feed
            </h3>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Real-time NFC tap events and administrative actions</p>
        </div>

        {/* Filter and Search Inputs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                typeFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter("access")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                typeFilter === "access" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Taps
            </button>
            <button
              onClick={() => setTypeFilter("admin")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                typeFilter === "admin" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Admin
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search feed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-36 sm:w-44 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-slate-100 overflow-y-auto max-h-[480px]">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <FaHistory className="text-lg" />
            </div>
            <p className="text-xs font-bold text-slate-600">No activity events found</p>
            <p className="text-[11px] text-slate-400 mt-1">Try adjusting your search or filter settings</p>
          </div>
        ) : (
          filteredActivities.map((activity, index) => (
            <div
              key={activity.id || index}
              className="p-4 hover:bg-slate-50/80 transition-colors flex items-start gap-3.5 group"
            >
              {getEventIcon(activity)}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-800 truncate leading-snug">
                    {activity.action}
                  </p>
                  <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap bg-slate-100 px-2 py-0.5 rounded-md">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {activity.type}
                  </span>

                  {activity.details?.uid && (
                    <span className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      UID: {activity.details.uid}
                    </span>
                  )}

                  {activity.details?.door && (
                    <span className="text-[10px] font-semibold text-slate-500">
                      Door: {activity.details.door}
                    </span>
                  )}

                  {activity.details?.result && (
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        activity.details.result.toLowerCase() === "granted"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                          : "bg-rose-50 text-rose-700 border border-rose-200/50"
                      }`}
                    >
                      {activity.details.result}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;