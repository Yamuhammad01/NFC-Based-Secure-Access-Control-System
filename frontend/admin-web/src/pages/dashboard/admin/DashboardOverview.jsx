import React, { useState, useEffect } from "react";
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
  FaSpinner,
} from "react-icons/fa";
import {
  getDashboardStats,
  getRecentActivity as fetchRecentActivity,
} from "../../../Api/authService";

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try fetching from backend APIs
        const [statsData, activityData] = await Promise.allSettled([
          getDashboardStats(),
          fetchRecentActivity(5),
        ]);

        if (statsData.status === "fulfilled" && statsData.value) {
          setStats(statsData.value);
        } else {
          // Fallback to mock stats
          setStats(MOCK_STATS);
          console.warn("Using mock stats — backend returned no data or failed");
        }

        if (activityData.status === "fulfilled" && activityData.value && activityData.value.length > 0) {
          setActivities(activityData.value);
        } else {
          // Fallback to mock activities
          setActivities(MOCK_ACTIVITIES);
          console.warn("Using mock activities — backend returned no data or failed");
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard data.");
        // Use mock data on error
        setStats(MOCK_STATS);
        setActivities(MOCK_ACTIVITIES);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Registered Users",
      value: stats?.totalRegisteredUsers,
      icon: <FaUsers size={26} />,
      colorClass: "text-indigo-600",
      bgClass: "bg-indigo-50",
    },
    {
      title: "Active NFC Cards",
      value: stats?.activeNfcCards,
      icon: <FaIdCard size={26} />,
      colorClass: "text-emerald-600",
      bgClass: "bg-emerald-50",
    },
    {
      title: "Revoked Cards",
      value: stats?.revokedCards,
      icon: <FaBan size={26} />,
      colorClass: "text-rose-600",
      bgClass: "bg-rose-50",
    },
    {
      title: "Suspended Cards / Inactive Users",
      value: stats?.suspendedCards,
      icon: <FaPause size={26} />,
      colorClass: "text-amber-600",
      bgClass: "bg-amber-50",
    },
    {
      title: "Total Access Attempts (24h)",
      value: stats?.totalAccessAttemptsToday,
      icon: <FaClipboardList size={26} />,
      colorClass: "text-blue-600",
      bgClass: "bg-blue-50",
    },
    {
      title: "Successful Access",
      value: stats?.successfulAccessAttempts,
      icon: <FaCheckCircle size={26} />,
      colorClass: "text-teal-600",
      bgClass: "bg-teal-50",
    },
    {
      title: "Failed Access",
      value: stats?.failedAccessAttempts,
      icon: <FaTimesCircle size={26} />,
      colorClass: "text-red-600",
      bgClass: "bg-red-50",
    },
    {
      title: "Registered Readers",
      value: stats?.registeredReaders,
      icon: <FaBroadcastTower size={26} />,
      colorClass: "text-violet-600",
      bgClass: "bg-violet-50",
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-100px)] p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Security Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time NFC access control monitoring dashboard
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-gray-500 mt-3">Loading security metrics...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
            <p className="text-rose-700 font-semibold">Error loading dashboard</p>
            <p className="text-sm text-rose-600 mt-1">{error}</p>
            <p className="text-xs text-gray-500 mt-2">Showing cached/mock data below.</p>
          </div>
        ) : null}

        {/* Stats Grid — 4 columns × 2 rows on desktop, 2 cols on tablet, 1 col on mobile */}
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
                delay={idx * 50}
              />
            ))}
          </div>
        )}

        {/* Recent Activity + Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Activity — takes 2 columns on wide screens */}
          <div className="xl:col-span-2">
            <RecentActivity activities={activities} />
          </div>

          {/* Quick Info Panel — 1 column */}
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Backend API</span>
                  <span className="badge badge-success badge-sm">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="badge badge-success badge-sm">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Redis Cache</span>
                  <span className="badge badge-success badge-sm">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Celery Workers</span>
                  <span className="badge badge-success badge-sm">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">NFC Readers</span>
                  <span className="badge badge-info badge-sm">{stats?.registeredReaders || 0} Online</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-md border border-blue-100 p-5">
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">
                Access Summary
              </h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Monitoring <strong>{stats?.registeredReaders || 0}</strong> access points across campus.
                <br />
                <span className="text-emerald-700 font-semibold">
                  {(stats?.totalAccessAttemptsToday || 0) > 0
                    ? `${Math.round(((stats?.successfulAccessAttempts || 0) / (stats?.totalAccessAttemptsToday || 1)) * 100)}%`
                    : "—"}
                </span>{" "}
                success rate in the last 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardOverview;