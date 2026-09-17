import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaUserCircle,
  FaBars,
  FaIdCard,
  FaAddressCard,
  FaUser,
  FaSignOutAlt,
  FaBell,
  FaCog,
  FaUsers,
  FaChartBar,
  FaCogs,
  FaShieldAlt,
  FaHistory,
  FaStream,
  FaExchangeAlt,
  FaKey,
} from "react-icons/fa";
import { getProfile, logout } from "../Api/authService";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // State to store user role

  // Fetch user profile and role on component mount
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) {
      setUserRole(role);
    } else {
      // If no role is found, redirect to login
      navigate("/login", { replace: true });
      return;
    }
    fetchUserProfile();
    
    // Listen for profile updates from other components
    const handleProfileUpdate = () => {
      fetchUserProfile();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [navigate]); // Added navigate to dependency array

  const fetchUserProfile = async () => {
    try {
      const profileData = await getProfile();
      setUserProfile(profileData);
      
      // Auto-synchronize role dynamically from actual database profile to prevent dashboard clashing
      if (profileData && profileData.role) {
        const dbRole = profileData.role.toLowerCase();
        localStorage.setItem("userRole", dbRole);
        setUserRole(dbRole);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout(); // Clear auth token + userRole via authService
    // Clear all app-specific localStorage keys
    [
      "userRole",
      "cardReplacementRequest",
      "tempAccessRequests",
      "securityNotifications_read",
    ].forEach((key) => localStorage.removeItem(key));
    setShowLogoutModal(false);
    navigate("/login", { replace: true });
  };

  const cancelLogout = () => setShowLogoutModal(false);

  // Sidebar menus for staff (generic routes)
  const staffMenu = [
    { name: "Profile", icon: <FaUserCircle className="text-purple-600" />, href: "/dashboard/profile", bg: "bg-purple-100" },
    { name: "Access Permissions", icon: <FaShieldAlt className="text-rose-600" />, href: "/dashboard/permissions", bg: "bg-rose-100" },
    { name: "Access History", icon: <FaHistory className="text-blue-600" />, href: "/dashboard/logs", bg: "bg-blue-100" },
    { name: "Activity Timeline", icon: <FaStream className="text-violet-600" />, href: "/dashboard/timeline", bg: "bg-violet-100" },
    { name: "Card Replacement",       icon: <FaExchangeAlt className="text-amber-600" />,  href: "/dashboard/replacement",    bg: "bg-amber-100"  },
    { name: "Notifications",     icon: <FaBell        className="text-indigo-600" />, href: "/dashboard/notifications", bg: "bg-indigo-100", badge: true },
    { name: "Temp Access",        icon: <FaKey         className="text-emerald-600" />, href: "/dashboard/temp-access",   bg: "bg-emerald-100" },
    { name: "Settings",          icon: <FaCogs        className="text-teal-600" />,   href: "/dashboard/settings",      bg: "bg-teal-100"   },
  ];

  // Sidebar menus for student (generic routes)
  const studentMenu = [
    { name: "Profile", icon: <FaUserCircle className="text-emerald-600" />, href: "/dashboard/profile", bg: "bg-emerald-100" },
    { name: "Access Permissions", icon: <FaShieldAlt className="text-rose-600" />, href: "/dashboard/permissions", bg: "bg-rose-100" },
    { name: "Access History", icon: <FaHistory className="text-blue-600" />, href: "/dashboard/logs", bg: "bg-blue-100" },
    { name: "Activity Timeline", icon: <FaStream className="text-violet-600" />, href: "/dashboard/timeline", bg: "bg-violet-100" },
    { name: "Notifications",     icon: <FaBell        className="text-indigo-600" />, href: "/dashboard/notifications", bg: "bg-indigo-100", badge: true },
    { name: "Temp Access",        icon: <FaKey         className="text-emerald-600" />, href: "/dashboard/temp-access",   bg: "bg-emerald-100" },
    { name: "Settings",          icon: <FaCogs        className="text-teal-600" />,   href: "/dashboard/settings",      bg: "bg-teal-100"   },
  ];

  // Sidebar menu sections for Admin
  const adminMenuSections = [
    {
      title: "OVERVIEW",
      items: [
        { name: "Dashboard", icon: <FaChartBar className="text-indigo-600" />, href: "/dashboard/admin", bg: "bg-indigo-50 text-indigo-600" },
      ],
    },
    {
      title: "SECURITY MANAGEMENT",
      items: [
        { name: "User Management", icon: <FaUsers className="text-blue-600" />, href: "/dashboard/admin/users", bg: "bg-blue-50 text-blue-600" },
        { name: "Temporary Access", icon: <FaKey className="text-emerald-600" />, href: "/dashboard/admin/temporary-access", bg: "bg-emerald-50 text-emerald-600" },
        { name: "Role Permissions", icon: <FaShieldAlt className="text-rose-600" />, href: "/dashboard/admin/role-permissions", bg: "bg-rose-50 text-rose-600" },
        { name: "Card Management", icon: <FaIdCard className="text-amber-600" />, href: "/dashboard/admin/cards", bg: "bg-amber-50 text-amber-600" },
      ],
    },
    {
      title: "SYSTEM LOGS",
      items: [
        { name: "Audit Logs", icon: <FaHistory className="text-violet-600" />, href: "/dashboard/admin/audit-logs", bg: "bg-violet-50 text-violet-600" },
      ],
    },
  ];

  // Sidebar menu sections for Staff
  const staffMenuSections = [
    {
      title: "MY ACCESS",
      items: [
        { name: "Profile", icon: <FaUserCircle className="text-purple-600" />, href: "/dashboard/profile", bg: "bg-purple-50 text-purple-600" },
        { name: "Access Permissions", icon: <FaShieldAlt className="text-rose-600" />, href: "/dashboard/permissions", bg: "bg-rose-50 text-rose-600" },
        { name: "Access History", icon: <FaHistory className="text-blue-600" />, href: "/dashboard/logs", bg: "bg-blue-50 text-blue-600" },
        { name: "Activity Timeline", icon: <FaStream className="text-violet-600" />, href: "/dashboard/timeline", bg: "bg-violet-50 text-violet-600" },
      ],
    },
    {
      title: "SERVICES",
      items: [
        { name: "Card Replacement", icon: <FaExchangeAlt className="text-amber-600" />, href: "/dashboard/replacement", bg: "bg-amber-50 text-amber-600" },
        { name: "Notifications", icon: <FaBell className="text-indigo-600" />, href: "/dashboard/notifications", bg: "bg-indigo-50 text-indigo-600", badge: true },
        { name: "Temp Access", icon: <FaKey className="text-emerald-600" />, href: "/dashboard/temp-access", bg: "bg-emerald-50 text-emerald-600" },
        { name: "Settings", icon: <FaCogs className="text-teal-600" />, href: "/dashboard/settings", bg: "bg-teal-50 text-teal-600" },
      ],
    },
  ];

  // Sidebar menu sections for Student
  const studentMenuSections = [
    {
      title: "STUDENT PORTAL",
      items: [
        { name: "Profile", icon: <FaUserCircle className="text-emerald-600" />, href: "/dashboard/profile", bg: "bg-emerald-50 text-emerald-600" },
        { name: "Access Permissions", icon: <FaShieldAlt className="text-rose-600" />, href: "/dashboard/permissions", bg: "bg-rose-50 text-rose-600" },
        { name: "Access History", icon: <FaHistory className="text-blue-600" />, href: "/dashboard/logs", bg: "bg-blue-50 text-blue-600" },
        { name: "Activity Timeline", icon: <FaStream className="text-violet-600" />, href: "/dashboard/timeline", bg: "bg-violet-50 text-violet-600" },
        { name: "Notifications", icon: <FaBell className="text-indigo-600" />, href: "/dashboard/notifications", bg: "bg-indigo-50 text-indigo-600", badge: true },
        { name: "Temp Access", icon: <FaKey className="text-emerald-600" />, href: "/dashboard/temp-access", bg: "bg-emerald-50 text-emerald-600" },
        { name: "Settings", icon: <FaCogs className="text-teal-600" />, href: "/dashboard/settings", bg: "bg-teal-50 text-teal-600" },
      ],
    },
  ];

  const menuSections = userRole === "admin" ? adminMenuSections : (userRole === "student" ? studentMenuSections : staffMenuSections);

  const handleMenuClick = (href) => {
    navigate(href);
  };

  return (
    <div className="drawer lg:drawer-open h-screen overflow-hidden bg-slate-100 font-sans">
      {/* Drawer toggle for small screens */}
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col h-full min-h-0">
        {/* Top Navbar */}
        <header className="navbar bg-white border-b border-slate-200/80 px-4 lg:px-6 h-16 flex-shrink-0 z-30 shadow-xs">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="my-drawer"
              className="btn btn-square btn-ghost text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <FaBars size={20} />
            </label>
          </div>
          <div className="flex-1 flex items-center gap-3">
            <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
              <FaShieldAlt className="text-base" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">
                Secure NFC Access System
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise Control Panel</p>
            </div>
          </div>

          <div className="flex-none flex items-center gap-3">
            {/* Live System Status Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full text-xs text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>System Operational</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn btn-sm bg-slate-100 border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl flex items-center gap-2 transition-all px-3"
            >
              <FaSignOutAlt className="text-xs" />
              <span className="hidden sm:inline text-xs font-semibold">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-slate-50/70 overflow-y-auto min-h-0">
          <div className="h-full">{children}</div>
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-50">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <aside className="menu bg-white text-slate-700 min-h-full w-72 p-4 border-r border-slate-200 shadow-sm flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Sidebar Brand Header */}
            <div className="flex items-center gap-3 px-3 py-2 mb-4 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <FaShieldAlt className="text-lg" />
              </div>
              <div>
                <span className="font-black text-slate-900 text-base tracking-tight block">
                  NFC ACCESS PRO
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Admin Workspace
                </span>
              </div>
            </div>

            {/* User Profile Summary Card */}
            <div className="p-3.5 border border-slate-200/80 bg-slate-50/80 rounded-2xl mb-5 flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-full overflow-hidden shadow-sm border border-white">
                  {userProfile?.profilePhoto ? (
                    <img
                      src={userProfile.profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white">
                      <FaUser className="text-sm" />
                    </div>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>

              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="animate-pulse space-y-1">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                    <div className="h-3 bg-slate-200 rounded w-12"></div>
                  </div>
                ) : (
                  <>
                    <h2 className="font-bold text-sm text-slate-900 truncate">
                      {userProfile && (userProfile.firstName || userProfile.lastName)
                        ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()
                        : 'Administrator'}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200/50">
                        {userRole || 'User'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Structured Navigation Menu */}
            <div className="space-y-5">
              {menuSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.href;
                      let badgeCount = 0;
                      if (item.badge) {
                        try {
                          const readIds = new Set(JSON.parse(localStorage.getItem("securityNotifications_read") || "[]"));
                          badgeCount = 7 - readIds.size;
                          if (badgeCount < 0) badgeCount = 0;
                        } catch { /* ignore */ }
                      }

                      return (
                        <li key={item.name}>
                          <button
                            onClick={() => handleMenuClick(item.href)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-xs font-semibold w-full text-left group ${
                              isActive
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                          >
                            <div
                              className={`p-1.5 rounded-lg text-sm transition-colors ${
                                isActive ? "bg-white/20 text-white" : item.bg
                              }`}
                            >
                              {item.icon}
                            </div>
                            <span className="flex-1 truncate">{item.name}</span>
                            {item.badge && badgeCount > 0 && (
                              <span
                                className={`ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                  isActive ? "bg-white text-indigo-600" : "bg-rose-500 text-white"
                                }`}
                              >
                                {badgeCount}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Logout Action */}
          <div className="pt-4 mt-6 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all group"
            >
              <div className="p-1.5 bg-rose-100/80 rounded-lg text-rose-600 group-hover:bg-rose-200 transition-colors">
                <FaSignOutAlt className="text-xs" />
              </div>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      </div>

      {/* ── PREMIUM LOGOUT CONFIRMATION MODAL ───────────────────────────── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-[fadeIn_0.15s_ease-out]">

            {/* Danger header strip */}
            <div className="bg-gradient-to-r from-rose-600 to-red-600 px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <FaSignOutAlt className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-base">Sign Out</h3>
                <p className="text-rose-100 text-[11px] font-medium">You are about to end your session.</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Are you sure you want to log out? Your session will be terminated and you will
                need to sign in again to access the dashboard.
              </p>

              {/* Warning note */}
              <div className="mt-4 flex items-start gap-2.5 bg-rose-50 border border-rose-100 rounded-xl p-3.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-[11px] text-rose-700 font-semibold leading-relaxed">
                  Any unsaved changes will be lost. Your NFC card access remains active.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={cancelLogout}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
              >
                Stay Signed In
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-3 px-4 rounded-xl font-extrabold text-white bg-rose-600 hover:bg-rose-700 transition-colors text-sm shadow-md shadow-rose-600/25 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
