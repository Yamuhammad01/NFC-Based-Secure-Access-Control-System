import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../component/DashboardLayout";
import { 
  FaShieldAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaBuilding, 
  FaLock, 
  FaUnlockAlt, 
  FaSearch, 
  FaSync 
} from "react-icons/fa";
import { getProfile } from "../../../Api/authService";

const StaffPermissions = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);

  // Dynamic Locations Permission Setup
  const initialPermissionsArray = [
    { 
      id: "loc-1", 
      name: "Main Campus Gate", 
      minLevel: 1, 
      category: "General Entrance",
      description: "General campus entry points, main halls, and public yards." 
    },
    { 
      id: "loc-2", 
      name: "Departmental Laboratories", 
      minLevel: 1, 
      category: "Academic Suites",
      description: "Subject laboratories, general work complexes, and study suites." 
    },
    { 
      id: "loc-3", 
      name: "Academic Registry Suite", 
      minLevel: 2, 
      category: "Administrative Sector",
      description: "Academic Registry Suite, staff offices, and general archives." 
    },
    { 
      id: "loc-4", 
      name: "Dean's Conference Room", 
      minLevel: 2, 
      category: "Administrative Sector",
      description: "Administrative chambers, conference halls, and leadership suites." 
    },
    { 
      id: "loc-5", 
      name: "Core IT Server Rooms", 
      minLevel: 3, 
      category: "Restricted Infrastructure",
      description: "Central network cabinets, databases, and power panels." 
    },
    { 
      id: "loc-6", 
      name: "University Vault Complex", 
      minLevel: 3, 
      category: "Restricted Infrastructure",
      description: "University financial archives, secure vaults, and storage spaces." 
    }
  ];

  const fetchProfileDetails = async () => {
    try {
      setLogsLoading(true);
      const profileData = await getProfile();
      setProfile(profileData);
    } catch (error) {
      console.warn("Could not load backend profile, defaulting to standard mock credentials:", error);
      // Clean mock credentials fallback for testing UI
      setProfile({
        staffId: "ST2026001",
        firstName: "John",
        lastName: "Doe",
        department: "Registry & Academic Affairs",
        accessLevel: 2
      });
    } finally {
      setLoading(false);
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);

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

  // Filter based on search query
  const filteredPermissions = initialPermissionsArray.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    loc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        {/* CONTROLS BAR (SEARCH + REFRESH) */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search secure zones or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pl-10 bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 text-sm h-11"
            />
          </div>
          
          <button 
            onClick={fetchProfileDetails}
            className="btn btn-outline btn-rose btn-sm flex items-center gap-2 font-bold w-full sm:w-auto h-11"
            disabled={logsLoading}
          >
            <FaSync className={logsLoading ? "animate-spin" : ""} />
            Re-sync Permissions
          </button>
        </div>

        {/* ACTIVE ACCESS MATRIX CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPermissions.map((location) => {
            const hasAccess = accessLevel >= location.minLevel;
            return (
              <div 
                key={location.id} 
                className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md ${
                  hasAccess 
                    ? "bg-emerald-50/70 border-emerald-100 hover:bg-emerald-50" 
                    : "bg-rose-50/40 border-rose-100/50 hover:bg-rose-50/60"
                }`}
              >
                {/* Visual Glow Indicator */}
                <span className={`absolute top-0 left-0 w-full h-1 ${
                  hasAccess ? "bg-emerald-500" : "bg-rose-500"
                }`}></span>

                <div className="flex justify-between items-start gap-4 mb-4">
                  {/* Category & Badge */}
                  <div>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide ${
                      hasAccess ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {location.category}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-800 mt-2 tracking-tight">
                      {location.name}
                    </h3>
                  </div>

                  {/* Access Status Icon */}
                  <div className={`p-2.5 rounded-xl ${
                    hasAccess ? "bg-emerald-100/80 text-emerald-600" : "bg-rose-100/80 text-rose-600"
                  }`}>
                    {hasAccess ? <FaUnlockAlt size={18} /> : <FaLock size={18} />}
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6 h-10 overflow-hidden">
                  {location.description}
                </p>

                {/* Bottom Row - Required Tier & Decision Badge */}
                <div className="border-t border-slate-100 pt-4 mt-2 flex justify-between items-center text-xs font-extrabold">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <FaBuilding size={14} className="text-slate-400" />
                    <span>Req. Level {location.minLevel}+</span>
                  </div>
                  
                  {hasAccess ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-extrabold text-xs">
                      <FaCheckCircle className="text-emerald-500" /> APPROVED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-600 font-extrabold text-xs">
                      <FaTimesCircle className="text-rose-500" /> DENIED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

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
