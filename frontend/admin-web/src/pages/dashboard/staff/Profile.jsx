import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../../../component/DashboardLayout";
import { QRCodeCanvas } from "qrcode.react";
import { FaUser, FaEnvelope, FaBuilding, FaIdBadge, FaBriefcase } from "react-icons/fa";
import { getProfile } from "../../../Api/authService";
import Notification, { useNotification } from "../../../component/Notification";

const StaffProfile = () => {
  const location = useLocation();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  
  // Notification system
  const {
    notification,
    showSuccess,
    clearNotification
  } = useNotification();

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
    
    // Show welcome message if coming from registration
    if (location.state?.fromRegistration) {
      setTimeout(() => {
        showSuccess('Welcome! Your account has been created successfully!');
      }, 500);
    }
    
    // Listen for profile updates from other components
    const handleProfileUpdate = () => {
      fetchUserProfile();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [location.state, showSuccess]);

  const fetchUserProfile = async () => {
    try {
      const profileData = await getProfile();
      setUserProfile(profileData);
      setError(null);
      setImageError(false); // Reset image error when profile loads
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Generate QR code data from user profile
  const qrValue = userProfile ? JSON.stringify({
    staffId: userProfile.staffId,
    name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
    department: userProfile.department,
    email: userProfile.email,
    jobTitle: userProfile.jobTitle,
    position: userProfile.position
  }) : '';

  if (loading) {
    return (
      <DashboardLayout role="staff">
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="staff">
        <div className="p-4 md:p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchUserProfile}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="staff">
      {/* Notification Component */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={clearNotification}
        />
      )}
      {/* header */}
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome back, {userProfile && (userProfile.firstName || userProfile.lastName) 
            ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()
            : 'User'
          }
        </p>
      </div>

      <div className="min-h-[calc(100vh-100px)] p-2 sm:p-4 md:p-6">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-gray-100 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">

            {/* User Avatar */}
            <div className="flex-shrink-0 self-center md:self-auto">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-lg ring ring-indigo-400 ring-offset-2">
                {userProfile?.profilePhoto && !imageError ? (
                  <img 
                    src={userProfile.profilePhoto} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={() => {
                      console.error('Failed to load profile image from:', userProfile.profilePhoto);
                      setImageError(true);
                    }}
                    onLoad={() => {
                      console.log('Profile image loaded successfully');
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                    <FaUser className="text-white text-4xl" />
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                    <FaUser className="text-blue-600 text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Full Name</p>
                    <p className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                      {userProfile && (userProfile.firstName || userProfile.lastName) 
                        ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()
                        : 'Not set'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                    <FaEnvelope className="text-green-600 text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Email</p>
                    <p className="text-sm sm:text-lg font-medium text-gray-800 truncate">{userProfile?.email || 'Not available'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                    <FaBuilding className="text-purple-600 text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Department</p>
                    <p className="text-sm sm:text-lg font-medium text-gray-800 truncate">{userProfile?.department || 'Not set'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                    <FaIdBadge className="text-orange-600 text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Smart ID</p>
                    <p className="text-sm sm:text-lg font-medium text-gray-800 truncate">{userProfile?.smartId || userProfile?.staffId || 'Not available'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-teal-100 rounded-lg">
                    <FaBriefcase className="text-teal-600 text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Job Title</p>
                    <p className="text-sm sm:text-lg font-medium text-gray-800 truncate">{userProfile?.jobTitle || 'Not set'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
                    <FaBriefcase className="text-indigo-600 text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wider text-gray-500">Position</p>
                    <p className="text-sm sm:text-lg font-medium text-gray-800 truncate">{userProfile?.position || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR */}
            <div className="flex-shrink-0 self-center md:self-auto">
              <div className="bg-gray-50 p-2 sm:p-3 md:p-4 rounded-xl shadow-inner border border-gray-100">
                {qrValue ? (
                  <QRCodeCanvas value={qrValue} size={120} className="sm:w-[150px] sm:h-[150px]" />
                ) : (
                  <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] bg-gray-200 flex items-center justify-center rounded">
                    <p className="text-gray-500 text-xs sm:text-sm text-center">QR Code<br/>Unavailable</p>
                  </div>
                )}
              </div>
              <p className="mt-2 text-center text-xs text-gray-500">Smart ID QR</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffProfile; 