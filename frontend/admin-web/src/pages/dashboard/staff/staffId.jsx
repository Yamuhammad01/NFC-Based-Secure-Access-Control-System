import React, { useState, useEffect, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { FaDownload, FaUser, FaBuilding, FaBriefcase, FaIdBadge } from "react-icons/fa";
import DashboardLayout from "../../../component/DashboardLayout";
import { getProfile } from "../../../Api/authService";
import { useNotification } from "../../../component/Notification";

const StaffId = () => {
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
      // Use html2canvas alternative approach
      const cardElement = cardRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set high resolution for crisp output
      const scale = 3;
      canvas.width = cardElement.offsetWidth * scale;
      canvas.height = cardElement.offsetHeight * scale;
      ctx.scale(scale, scale);
      
      // Create a temporary container for rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = cardElement.offsetWidth + 'px';
      tempContainer.style.height = cardElement.offsetHeight + 'px';
      tempContainer.innerHTML = cardElement.outerHTML;
      document.body.appendChild(tempContainer);
      
      // Convert to image using foreignObject and SVG
      const data = new XMLSerializer().serializeToString(cardElement);
      const svgBlob = new Blob([`
        <svg xmlns="http://www.w3.org/2000/svg" width="${cardElement.offsetWidth}" height="${cardElement.offsetHeight}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">${data}</div>
          </foreignObject>
        </svg>
      `], { type: 'image/svg+xml' });
      
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      
      img.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cardElement.offsetWidth, cardElement.offsetHeight);
        ctx.drawImage(img, 0, 0);
        
        // Download the image
        const link = document.createElement('a');
        link.download = `staff-id-${profile?.staffId || 'card'}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        
        // Cleanup
        URL.revokeObjectURL(url);
        document.body.removeChild(tempContainer);
        
        showNotification('Staff ID card downloaded successfully!', 'success');
      };
      
      img.onerror = () => {
        // Fallback: simple screenshot approach
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cardElement.offsetWidth, cardElement.offsetHeight);
        
        const link = document.createElement('a');
        link.download = `staff-id-${profile?.staffId || 'card'}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        
        document.body.removeChild(tempContainer);
        showNotification('Staff ID card downloaded (basic version)!', 'success');
      };
      
      img.src = url;
      
    } catch (err) {
      console.error('Download failed:', err);
      showNotification('Failed to download card. Please try again.', 'error');
    }
  };

  const qrValue = profile ? JSON.stringify({
    staffId: profile.staffId,
    name: `${profile.firstName} ${profile.lastName}`,
    department: profile.department,
    jobTitle: profile.jobTitle,
    email: profile.email
  }) : '';

  if (loading) {
    return (
      <DashboardLayout title="Staff ID" role="staff">
        <div className="flex justify-center items-center min-h-screen">
          <div className="loading loading-spinner loading-lg text-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Staff ID" role="staff">
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
    <DashboardLayout title="Staff ID" role="staff">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Staff ID Card</h1>
            <p className="text-gray-600">Your official identification card</p>
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

          {/* ID Card */}
          <div className="flex justify-center">
            <div 
              ref={cardRef}
              className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-2xl border-l-8 border-blue-600 aspect-[0.7/1] sm:aspect-[1.6/1]"
            >
              <div className="h-full flex flex-col sm:flex-row">
                {/* Photo and QR Section */}
                <div className="w-full sm:w-1/3 flex flex-col items-center justify-center space-y-3 sm:space-y-4 border-b sm:border-b-0 sm:border-r border-gray-200 pb-4 sm:pb-0 sm:pr-6">
                  {/* Profile Photo */}
                  <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg">
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
                        <FaUser className="text-white text-3xl" />
                      </div>
                    )}
                  </div>
                  
                  {/* QR Code */}
                  <div className="bg-gray-50 p-2 sm:p-3 rounded-xl">
                    <QRCodeCanvas 
                      value={qrValue} 
                      size={60}
                      bgColor="#ffffff"
                      fgColor="#1e40af"
                    />
                  </div>
                </div>

                {/* Information Section */}
                <div className="w-full sm:w-2/3 pt-4 sm:pt-0 sm:pl-6 flex flex-col justify-center">
                  {/* Header */}
                  <div className="mb-4 sm:mb-6 text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                      {profile?.firstName} {profile?.lastName}
                    </h2>
                    <div className="w-12 sm:w-16 h-1 bg-blue-600 rounded mx-auto sm:mx-0"></div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div className="flex items-center justify-center sm:justify-start space-x-3">
                      <FaIdBadge className="text-blue-600 text-base sm:text-lg" />
                      <div className="text-center sm:text-left">
                        <p className="text-xs sm:text-sm text-gray-500">Staff ID</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-800">{profile?.smartId || profile?.staffId}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start space-x-3">
                      <FaBuilding className="text-green-600 text-base sm:text-lg" />
                      <div className="text-center sm:text-left">
                        <p className="text-xs sm:text-sm text-gray-500">Department</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-800">{profile?.department}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start space-x-3">
                      <FaBriefcase className="text-purple-600 text-base sm:text-lg" />
                      <div className="text-center sm:text-left">
                        <p className="text-xs sm:text-sm text-gray-500">Job Title</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-800">{profile?.jobTitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start space-x-3">
                      <FaUser className="text-orange-600 text-base sm:text-lg" />
                      <div className="text-center sm:text-left">
                        <p className="text-xs sm:text-sm text-gray-500">Position</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-800">{profile?.position}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 text-center sm:text-left">
                    <p className="text-xs text-gray-400">Smart ID System • {new Date().getFullYear()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffId;
