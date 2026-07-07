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

  // Sidebar menus for staff
  const staffMenu = [
    { name: "Profile", icon: <FaUserCircle className="text-purple-600" />, href: "/dashboard/staff/profile", bg: "bg-purple-100" },
    { name: "Access Permissions", icon: <FaShieldAlt className="text-rose-600" />, href: "/dashboard/staff/permissions", bg: "bg-rose-100" },
    { name: "Access History", icon: <FaHistory className="text-blue-600" />, href: "/dashboard/staff/logs", bg: "bg-blue-100" },
    { name: "Activity Timeline", icon: <FaStream className="text-violet-600" />, href: "/dashboard/staff/timeline", bg: "bg-violet-100" },
    { name: "Card Replacement",       icon: <FaExchangeAlt className="text-amber-600" />,  href: "/dashboard/staff/replacement",    bg: "bg-amber-100"  },
    { name: "Notifications",     icon: <FaBell        className="text-indigo-600" />, href: "/dashboard/staff/notifications", bg: "bg-indigo-100", badge: true },
    { name: "Temp Access",        icon: <FaKey         className="text-emerald-600" />, href: "/dashboard/staff/temp-access",   bg: "bg-emerald-100" },
    { name: "Settings",          icon: <FaCogs        className="text-teal-600" />,   href: "/dashboard/staff/settings",      bg: "bg-teal-100"   },
  ];

  // Sidebar menus for admin
  const adminMenu = [
    { name: "Dashboard", icon: <FaChartBar className="text-indigo-600" />, href: "/dashboard/admin", bg: "bg-indigo-100" },
  ];

  // Choose menu based on role
  const menuItems = userRole === "admin" ? adminMenu : staffMenu;

  const handleMenuClick = (href) => {
    navigate(href);
  };

  return (
    <div className="drawer lg:drawer-open h-screen overflow-hidden">
      {/* Drawer toggle for small screens */}
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col h-full min-h-0">
        {/* Top Navbar */}
        <div className="navbar bg-white border-b shadow-sm px-4 flex-shrink-0">
          <div className="flex-none lg:hidden">
            <label
              htmlFor="my-drawer"
              className="btn btn-square btn-ghost text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <FaBars size={22} />
            </label>
          </div>
          <div className="flex-1">
            <span className="text-xl md:text-2xl font-bold text-blue-700 flex items-center gap-2">
              Access Control Dashboard
            </span>
          </div>
          <div className="flex-none flex items-center gap-2">
            <button onClick={handleLogout} className="btn bg-red-500 text-white hover:bg-red-600 rounded-lg flex items-center gap-2 transition-colors px-2 sm:px-4">
              <FaSignOutAlt />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-blue-50 overflow-y-auto min-h-0">
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
        <aside className="menu bg-white text-gray-800 min-h-full w-72 p-4 border-r shadow-lg overflow-y-auto">
          {/* Profile */}
          <div className="flex flex-col items-center p-6 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden mb-4 shadow-lg">
              {userProfile?.profilePhoto ? (
                <img 
                  src={userProfile.profilePhoto} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                  <FaUser className="text-white text-2xl" />
                </div>
              )}
            </div>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ) : (
              <>
                <h2 className="font-bold text-lg text-gray-800">
                  {userProfile && (userProfile.firstName || userProfile.lastName) 
                    ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()
                    : 'User'
                  }
                </h2>
                <p className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full capitalize">
                  {userRole}
                </p>
                {userProfile?.department && (
                  <p className="text-xs text-gray-500 mt-1">
                    {userProfile.department}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Menu */}
          <ul className="space-y-2">
            {menuItems.map((item) => {
              // Live unread count for notification badge
              let badgeCount = 0;
              if (item.badge) {
                try {
                  const readIds = new Set(JSON.parse(localStorage.getItem("securityNotifications_read") || "[]"));
                  const TOTAL_NOTIFS = 7; // matches MOCK_NOTIFICATIONS length
                  badgeCount = TOTAL_NOTIFS - readIds.size;
                  if (badgeCount < 0) badgeCount = 0;
                } catch { /* ignore */ }
              }
              return (
                <li key={item.name}>
                  <button
                    onClick={() => handleMenuClick(item.href)}
                    className={`flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-all duration-200 group w-full text-left ${
                      location.pathname === item.href ? "bg-blue-50 text-blue-700" : ""
                    }`}
                  >
                    <div className={`p-2 rounded-lg group-hover:opacity-80 transition-colors ${item.bg}`}>
                      {item.icon}
                    </div>
                    <span className="font-medium flex-1">{item.name}</span>
                    {item.badge && badgeCount > 0 && (
                      <span className="ml-auto bg-rose-500 text-white text-[10px] font-extrabold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                        {badgeCount}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* ── Sidebar logout button ──────────────────────────────── */}
          <div className="mt-auto pt-6 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all duration-200 group font-semibold"
            >
              <div className="p-2 bg-rose-100 rounded-lg group-hover:bg-rose-200 transition-colors">
                <FaSignOutAlt className="text-rose-600" />
              </div>
              <span>Log Out</span>
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
