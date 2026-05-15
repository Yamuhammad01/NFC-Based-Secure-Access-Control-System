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
    logout(); // Clear auth token
    setShowLogoutModal(false);
    navigate("/login", { replace: true });
  };

  const cancelLogout = () => setShowLogoutModal(false);

  // Sidebar menus for staff
  const staffMenu = [
    { name: "Profile", icon: <FaUser className="text-purple-600" />, href: "/dashboard/staff/profile", bg: "bg-purple-100" },
    { name: "Business Card", icon: <FaIdCard className="text-blue-600" />, href: "/dashboard/staff/BusinessCard", bg: "bg-blue-100" },
    { name: "Smart ID", icon: <FaAddressCard className="text-green-600" />, href: "/dashboard/staff/staffId", bg: "bg-green-100" },
    { name: "Settings", icon: <FaCogs className="text-teal-600" />, href: "/dashboard/staff/settings", bg: "bg-teal-100" },
  ];

  // Sidebar menus for admin
  const adminMenu = [
    { name: "Dashboard", icon: <FaUsers className="text-indigo-600" />, href: "/dashboard/admin", bg: "bg-indigo-100" },
    { name: "Employees", icon: <FaUsers className="text-indigo-600" />, href: "/dashboard/admin/employees", bg: "bg-indigo-100" },
    // { name: "Reports", icon: <FaChartBar className="text-orange-600" />, href: "/dashboard/admin", bg: "bg-orange-100" },
    // { name: "System Settings", icon: <FaCogs className="text-teal-600" />, href: "/dashboard/admin/settings", bg: "bg-teal-100" },
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
              Smart ID
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
            {menuItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => handleMenuClick(item.href)}
                  className={`flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-all duration-200 group w-full text-left ${
                    location.pathname === item.href ? "bg-blue-50 text-blue-700" : ""
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg group-hover:opacity-80 transition-colors ${item.bg}`}
                  >
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Log out</h3>
            <p className="py-4">Do you want to log out?</p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={cancelLogout}>Cancel</button>
              <button className="btn btn-error" onClick={confirmLogout}>Log Out</button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default DashboardLayout;
