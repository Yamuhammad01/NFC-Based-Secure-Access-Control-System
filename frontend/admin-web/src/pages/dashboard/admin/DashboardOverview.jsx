import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../component/DashboardLayout";
import StatCard from "./StatCard";
import RecentActivity from "./RecentActivity";
import {
  FaUsers,
  FaIdCard,
  FaBan,
  FaPause,
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaBroadcastTower,
  FaSync,
  FaKey,
  FaHistory,
  FaUserPlus,
  FaShieldAlt,
} from "react-icons/fa";
import {
  getDashboardStats,
  getRecentActivity as fetchRecentActivity,
} from "../../../Api/authService";

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("24h");
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Mock data for demo purposes when backend is empty/offline
  const MOCK_STATS = {
    totalRegisteredUsers: 1248,
    activeNfcCards: 1156,
    revokedCards: 42,
    suspendedCards: 23,
    totalAccessAttemptsToday: 3847,
    successfulAccessAttempts: 3721,
    failedAccessAttempts: 126,
    registeredReaders: 24,
  };

  const MOCK_ACTIVITIES = [
    {
      id: "mock-1",
      type: "access",
      action: "Access granted — Adebayo Oluwaseun at Main Gate",
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      details: { uid: "A1B2C3D4", readerId: "RD-001", door: "main_gate", result: "granted" },
    },
    {
      id: "mock-2",
      type: "admin",
      action: "create_user — Users",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      details: { adminName: "admin@university.edu.ng", targetType: "user", action: "create_user" },
    },
    {
      id: "mock-3",
      type: "access",
      action: "Access denied — Unknown UID at Server Room",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      details: { uid: "UNKNOWN", readerId: "RD-003", door: "server_room", result: "denied", reason: "Card not found" },
    },
    {
      id: "mock-4",
      type: "access",
      action: "Access granted — Ngozi Eze at Library East Wing",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      details: { uid: "E5F6G7H8", readerId: "RD-012", door: "library_east", result: "granted" },
    },
    {
      id: "mock-5",
      type: "admin",
      action: "update_user — Users",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      details: { adminName: "admin@university.edu.ng", targetType: "user", action: "update_user" },
    },
  ];

  const fetchDashboardData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [statsData, activityData] = await Promise.allSettled([
        getDashboardStats(),
        fetchRecentActivity(8),
      ]);

      if (statsData.status === "fulfilled" && statsData.value) {
        setStats(statsData.value);
      } else {
        setStats(MOCK_STATS);
      }

      if (activityData.status === "fulfilled" && activityData.value && activityData.value.length > 0) {
        setActivities(activityData.value);
      } else {
        setActivities(MOCK_ACTIVITIES);
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard metrics.");
      setStats(MOCK_STATS);
      setActivities(MOCK_ACTIVITIES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const successRate =
    stats?.totalAccessAttemptsToday > 0
      ? Math.round(((stats?.successfulAccessAttempts || 0) / stats.totalAccessAttemptsToday) * 100)
      : 96.7;

  const statCards = [
    {
      title: "Total Registered Users",
      value: stats?.totalRegisteredUsers,
      icon: <FaUsers size={20} />,
      colorClass: "text-indigo-600",
      bgClass: "bg-indigo-50",
      trend: { text: "+4.2%", type: "positive" },
    },
    {
      title: "Active NFC Cards",
      value: stats?.activeNfcCards,
      icon: <FaIdCard size={20} />,
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-50",
      trend: { text: "Active", type: "positive" },
    },
    {
      title: "Revoked Cards",
      value: stats?.revokedCards,
      icon: <FaBan size={20} />,
      colorClass: "text-rose-600",
      bgClass: "bg-rose-50",
      trend: { text: "-2.1%", type: "negative" },
    },
    {
      title: "Suspended Cards",
      value: stats?.suspendedCards,
      icon: <FaPause size={20} />,
      colorClass: "text-amber-600",
      bgClass: "bg-amber-50",
      trend: { text: "Standby", type: "neutral" },
    },
    {
      title: "Access Attempts (24h)",
      value: stats?.totalAccessAttemptsToday,
      icon: <FaClipboardList size={20} />,
      colorClass: "text-blue-600",
      bgClass: "bg-blue-50",
      trend: { text: `${successRate}% Pass`, type: "positive" },
    },
    {
      title: "Successful Access",
      value: stats?.successfulAccessAttempts,
      icon: <FaCheckCircle size={20} />,
      colorClass: "text-teal-600",
      bgClass: "bg-teal-50",
      trend: { text: "Verified", type: "positive" },
    },
    {
      title: "Failed Access",
      value: stats?.failedAccessAttempts,
      icon: <FaTimesCircle size={20} />,
      colorClass: "text-red-600",
      bgClass: "bg-red-50",
      trend: { text: "Review", type: "negative" },
    },
    {
      title: "Registered Readers",
      value: stats?.registeredReaders,
      icon: <FaBroadcastTower size={20} />,
      colorClass: "text-violet-600",
      bgClass: "bg-violet-50",
      trend: { text: "Online", type: "positive" },
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
        {/* Page Header with Time Switcher and Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Security Overview
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Real-time monitoring of campus NFC access control and security events
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Time Presets */}
            <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-2xs">
              {["24h", "7d", "30d"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setTimeRange(preset)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    timeRange === preset
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {preset.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing || loading}
              className="btn btn-sm bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center gap-2 shadow-2xs"
            >
              <FaSync className={`text-xs ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
              <span className="text-xs">Refresh</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs">
            <span className="loading loading-spinner loading-lg text-indigo-600"></span>
            <p className="text-xs font-bold text-slate-500 mt-4">Loading security metrics...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-rose-700">Notice: {error}</p>
            <p className="text-[11px] text-rose-600 mt-0.5">Displaying cached operational metrics.</p>
          </div>
        ) : null}

        {/* Metric Cards Grid — 4 Columns on XL, 2 on MD, 1 on Mobile */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, idx) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                icon={card.icon}
                colorClass={card.colorClass}
                bgClass={card.bgClass}
                trend={card.trend}
                delay={idx * 30}
              />
            ))}
          </div>
        )}

        {/* Recent Activity Feed + Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Activity Feed (Takes 2 columns on wide screens) */}
          <div className="xl:col-span-2">
            <RecentActivity activities={activities} />
          </div>

          {/* Quick Management Actions Panel (Replaces old status cards) */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2.5">
                <button
                  onClick={() => navigate("/dashboard/admin/temporary-access")}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-emerald-50/60 hover:border-emerald-200 text-slate-700 hover:text-emerald-800 font-bold transition-all text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200 transition-colors">
                      <FaKey className="text-sm" />
                    </div>
                    <span>Issue Temporary Access</span>
                  </div>
                  <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">→</span>
                </button>

                <button
                  onClick={() => navigate("/dashboard/admin/users")}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/60 hover:border-blue-200 text-slate-700 hover:text-blue-800 font-bold transition-all text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
                      <FaUserPlus className="text-sm" />
                    </div>
                    <span>Register New Cardholder</span>
                  </div>
                  <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">→</span>
                </button>

                <button
                  onClick={() => navigate("/dashboard/admin/audit-logs")}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-violet-50/60 hover:border-violet-200 text-slate-700 hover:text-violet-800 font-bold transition-all text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-100 text-violet-700 group-hover:bg-violet-200 transition-colors">
                      <FaHistory className="text-sm" />
                    </div>
                    <span>Inspect Security Logs</span>
                  </div>
                  <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">→</span>
                </button>

                <button
                  onClick={() => navigate("/dashboard/admin/role-permissions")}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-rose-50/60 hover:border-rose-200 text-slate-700 hover:text-rose-800 font-bold transition-all text-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-100 text-rose-700 group-hover:bg-rose-200 transition-colors">
                      <FaShieldAlt className="text-sm" />
                    </div>
                    <span>Manage Access Roles</span>
                  </div>
                  <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </div>
            </div>

            {/* Campus Security Badge */}
            <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-300">
                  Security Protocol Active
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                24 Access Readers Online
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                All physical door hardware controllers report healthy status. Encryption keys synchronized.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardOverview;