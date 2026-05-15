import React, { useState, useEffect, useRef } from 'react';
import { FaDownload, FaEnvelope, FaBriefcase, FaBuilding, FaUser } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import DashboardLayout from '../../../component/DashboardLayout';
import { getProfile } from '../../../Api/authService';
import { useNotification } from '../../../component/Notification';

const BusinessCard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cardRef = useRef(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile data');
      showNotification('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;

    try {
      showNotification('Generating image...', 'info');
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight
      });
      
      const link = document.createElement('a');
      link.download = `business-card-${profile?.firstName || 'card'}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      showNotification('Business card downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading card:', error);
      showNotification('Failed to download card. Please try again.', 'error');
    }
  };

  const qrValue = profile ? JSON.stringify({
    staffId: profile.staffId,
    name: `${profile.firstName} ${profile.lastName}`,
    department: profile.department,
    jobTitle: profile.jobTitle,
    email: profile.email,
    position: profile.position
  }) : '';

  if (loading) {
    return (
      <DashboardLayout title="Business Card" role="staff">
        <div className="flex justify-center items-center min-h-screen">
          <div className="loading loading-spinner loading-lg text-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Business Card" role="staff">
        <div className="flex flex-col justify-center items-center min-h-screen">
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={fetchProfile}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Business Card" role="staff">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-2 sm:p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Business Card</h1>
            <p className="text-gray-600">Your professional business card</p>
          </div>

          {/* Download Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={downloadCard}
              className="btn btn-primary gap-2"
            >
              <FaDownload /> Download PNG
            </button>
          </div>

          {/* Business Card */}
          <div className="flex justify-center">
            <div 
              ref={cardRef}
              className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg text-white relative overflow-hidden aspect-[0.8/1] sm:aspect-[1.75/1]"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
              </div>

              <div className="relative z-10 h-full flex flex-col justify-between">
                {/* Top Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-2 sm:gap-0">
                  {/* Profile Photo - Mobile First */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-3 border-white/30 shadow-lg order-1 sm:order-2 flex-shrink-0">
                    {profile?.profilePhoto ? (
                      <img 
                        src={profile.profilePhoto} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/src/assets/pic.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                        <FaUser className="text-white text-2xl" />
                      </div>
                    )}
                  </div>
                  
                  {/* Name and Title */}
                  <div className="flex-1 text-center sm:text-left order-2 sm:order-1">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
                      {profile?.firstName} {profile?.lastName}
                    </h2>
                    <p className="text-blue-100 text-sm sm:text-base md:text-lg mb-1 sm:mb-2">{profile?.jobTitle}</p>
                    <p className="text-blue-200 text-xs sm:text-sm">{profile?.department}</p>
                  </div>
                </div>

                {/* Middle Section - Contact Info */}
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
                    <FaEnvelope className="text-blue-200 text-xs sm:text-sm" />
                    <span className="text-xs sm:text-sm truncate">{profile?.email}</span>
                  </div>
                  
                  <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
                    <FaBriefcase className="text-blue-200 text-xs sm:text-sm" />
                    <span className="text-xs sm:text-sm truncate">{profile?.position}</span>
                  </div>
                  
                  <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
                    <FaBuilding className="text-blue-200 text-xs sm:text-sm" />
                    <span className="text-xs sm:text-sm">ID: {profile?.smartId || profile?.staffId}</span>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-1 sm:gap-0">
                  <div className="text-center sm:text-left order-2 sm:order-1">
                    <p className="text-xs text-blue-200 mb-1">Smart ID System</p>
                    <p className="text-xs text-blue-300">{new Date().getFullYear()}</p>
                  </div>
                  
                  {/* QR Code */}
                  <div className="bg-white p-1.5 sm:p-2 rounded-lg order-1 sm:order-2">
                    <QRCodeCanvas 
                      value={qrValue} 
                      size={50}
                      bgColor="#ffffff"
                      fgColor="#1e40af"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Preview Info
          <div className="text-center mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Card Features</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <FaDownload className="text-blue-600" />
                  <span>Downloadable PNG</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaGlobe className="text-green-600" />
                  <span>QR Code Enabled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaBriefcase className="text-purple-600" />
                  <span>Professional Design</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaBuilding className="text-orange-600" />
                  <span>Company Branded</span>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusinessCard;
