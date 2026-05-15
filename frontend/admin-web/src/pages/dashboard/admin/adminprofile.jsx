import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../component/DashboardLayout";
import { QRCodeCanvas } from "qrcode.react";
import { FaUsers, FaBuilding, FaTasks, FaUser } from "react-icons/fa";
import { getTotalStaffs, getTotalDepartments, getProfile } from "../../../Api/authService";

const Adminprofile = () => {
  const [totalStaffs, setTotalStaffs] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [adminProfile, setAdminProfile] = useState(null); // State for admin profile
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const profileData = await getProfile(); // Fetch admin profile
        setAdminProfile(profileData);

        const staffResponse = await getTotalStaffs();
        setTotalStaffs(staffResponse.totalStaffs);

        const deptResponse = await getTotalDepartments();
        setTotalDepartments(deptResponse.totalDepartments);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        setError(err.message || "Failed to fetch admin dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const qrValue = adminProfile ? JSON.stringify({
    id: adminProfile.id,
    name: `${adminProfile.firstName || ''} ${adminProfile.lastName || ''}`.trim(),
    role: "Admin", // Assuming the fetched profile doesn't explicitly state role, hardcoding for QR
    email: adminProfile.email,
  }) : '';

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-100px)] p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, {adminProfile?.firstName || 'Admin'}</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-gray-500 mt-3">Loading admin dashboard...</p>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-10">
          <p>Error: {error}</p>
          <p>Please try again later.</p>
        </div>
      ) : (
        <>
          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat bg-white/80 backdrop-blur rounded-2xl shadow-md">
              <div className="stat-figure text-indigo-500">
                <FaUsers size={28} />
              </div>
              <div className="stat-title text-black">Total Staff</div>
              <div className="stat-value text-indigo-600">{totalStaffs}</div>
            </div>
            <div className="stat bg-white/80 backdrop-blur rounded-2xl shadow-md">
              <div className="stat-figure text-indigo-500">
                <FaBuilding size={28} />
              </div>
              <div className="stat-title text-black">Departments</div>
              <div className="stat-value text-indigo-600">{totalDepartments}</div>
            </div>
            <div className="stat bg-white/80 backdrop-blur rounded-2xl shadow-md">
              <div className="stat-figure text-indigo-500">
                <FaTasks size={28} />
              </div>
              <div className="stat-title text-black">Active Projects</div>
              <div className="stat-value text-indigo-600">34</div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Photo */}
              <div className="flex-shrink-0">
                <div className="avatar">
                  <div className="w-32 h-32 rounded-full ring ring-indigo-400 ring-offset-2 overflow-hidden">
                    {adminProfile?.profilePhoto ? (
                      <img src={adminProfile.profilePhoto} alt="Profile" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                        <FaUser className="text-white text-2xl" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {adminProfile && (adminProfile.firstName || adminProfile.lastName) 
                        ? `${adminProfile.firstName || ''} ${adminProfile.lastName || ''}`.trim()
                        : 'Admin'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">Email</p>
                    <p className="text-lg font-medium text-gray-800">{adminProfile?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">Department</p>
                    <p className="text-lg font-medium text-gray-800">{adminProfile?.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">Admin ID</p>
                    <p className="text-lg font-medium text-gray-800">{adminProfile?.id || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* QR */}
              <div className="flex-shrink-0 self-center md:self-auto">
                <div className="bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-100">
                  {adminProfile && <QRCodeCanvas value={qrValue} size={150} />}
                </div>
                <p className="mt-2 text-center text-xs text-gray-500">Smart ID QR</p>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </DashboardLayout>
  );
};

export default Adminprofile;
