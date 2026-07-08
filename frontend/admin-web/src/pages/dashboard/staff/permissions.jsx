import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../component/DashboardLayout";
import AccessMatrix from "../../../component/AccessMatrix";
import { 
  FaShieldAlt, 
  FaSync 
} from "react-icons/fa";
import { getProfile } from "../../../Api/authService";

const StaffPermissions = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);

  const fetchProfileDetails = async () => {
    try {
      setLogsLoading(true);
      const profileData = await getProfile();
      setProfile(profileData);
      
      // Fetch permissions from API
      const token = localStorage.getItem("authToken");
      const userId = profileData._id || profileData.id;
      const permResponse = await fetch(`http://localhost:5000/api/permissions/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (permResponse.ok) {
        const permData = await permResponse.json();
        setPermissions(permData.effectivePermissions || []);
      }
    } catch (error) {
      console.warn("Could not load backend profile, defaulting to standard mock credentials:", error);
      setProfile({
        staffId: "ST2026001",
        firstName: "John",
        lastName: "Doe",
        department: "Registry & Academic Affairs",
        accessLevel: 2,
        role: "staff"
      });
    } finally {
      setLoading(false);
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const handleRequestAccess = (area) => {
    navigate("/dashboard/temp-access");
  };

  if (loading) {
    return (
      <DashboardLayout role="staff">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <span className="loading loading-spinner loading-lg text-rose-600"></span>
          <p className="text-gray-500 mt-4 font-semibold animate-pulse">Loading access clearances...</p>
        </div>
      </DashboardLayout>
    );
  }

  const accessLevel = profile?.accessLevel || 2;

  return (
    <DashboardLayout role="staff">
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-8">
        
        {/* HEADER SECTION HERO */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 rounded-3xl shadow-xl overflow-hidden border border-rose-800/20 mb-8 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <FaShieldAlt className="text-rose-400" />
                Access Permissions & Clearance
              </h1>
              <p className="text-rose-200/80 text-sm mt-2 max-w-2xl font-medium">
                Verify administrative gate clearances loaded dynamically onto your NFC University Smart ID. Access parameters correspond strictly to institutional security classifications.
              </p>
            </div>
            
            {/* Dynamic Clearance Level Badge */}
            <div className="flex-shrink-0 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/15 text-center flex flex-col items-center">
              <span className="text-[10px] text-rose-300 font-extrabold uppercase tracking-widest mb-1">
                Your Security Level
              </span>
              <span className="text-2xl font-black text-white">
                Tier Level {accessLevel}
              </span>
            </div>
          </div>
        </div>

        {/* CONTROLS BAR */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <button 
            onClick={fetchProfileDetails}
            className="btn btn-outline btn-rose btn-sm flex items-center gap-2 font-bold w-full sm:w-auto h-11"
            disabled={logsLoading}
          >
            <FaSync className={logsLoading ? "animate-spin" : ""} />
            Re-sync Permissions
          </button>
        </div>

        {/* ACCESS MATRIX */}
        <AccessMatrix 
          userRole={profile?.role || "staff"}
          accessLevel={accessLevel}
          permissions={permissions}
          onRequestAccess={handleRequestAccess}
        />

        {/* SECURITY CLASSIFICATION FOOTER SUMMARY */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center gap-2">
            <FaShieldAlt className="text-rose-600" />
            University Classification & Security Matrix Protocol
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            All doors and administrative complexes utilize the Wiegand interface protocol linked securely to active MongoDB staff directories. Tapping a card registers immediate cryptographic verification. Attempting access to a denied door registers an automatic alert to campus security patrols.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StaffPermissions;
