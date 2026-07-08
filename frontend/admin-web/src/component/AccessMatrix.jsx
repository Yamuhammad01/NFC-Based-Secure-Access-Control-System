import React, { useState } from "react";
import { 
  FaShieldAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaBuilding, 
  FaLock, 
  FaUnlockAlt, 
  FaSearch, 
  FaSync,
  FaArrowRight,
  FaKey
} from "react-icons/fa";
import ACCESS_AREAS from "../config/accessAreas";

const AccessMatrix = ({ 
  userRole = "staff", 
  accessLevel = 1,
  loading = false,
  onRequestAccess,
  permissions = []
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Determine if user has access to a specific area
  const hasAccess = (area) => {
    if (userRole === "admin") return true;
    if (permissions.length > 0) {
      return permissions.includes(area.id);
    }
    // Fallback to static config if no permissions provided
    if (userRole === "staff") return area.staffAccess;
    if (userRole === "student") return area.studentAccess;
    return false;
  };

  // Determine if area is requestable by this user
  const canRequest = (area) => {
    if (userRole === "student" && area.studentRequestable) return true;
    if (userRole === "staff" && area.category === "restricted") return true;
    return false;
  };

  // Get visible areas based on role
  const getVisibleAreas = () => {
    let areas = [...ACCESS_AREAS];
    
    // For students: hide "student-requestable" section from the main grid (these are request-only)
    // For staff: hide "student-requestable" section (irrelevant for staff)
    if (userRole === "staff") {
      areas = areas.filter((a) => a.category !== "student-requestable");
    }
    
    // Filter by search if needed
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      areas = areas.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      );
    }

    return areas;
  };

  const visibleAreas = getVisibleAreas();

  // Split areas into approved vs restricted
  const approvedAreas = visibleAreas.filter((a) => hasAccess(a));
  const restrictedAreas = visibleAreas.filter((a) => !hasAccess(a));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh]">
        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
        <p className="text-gray-500 mt-4 font-semibold animate-pulse">Loading access clearances...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search & Controls */}
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
        
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="btn btn-ghost btn-sm text-slate-500 font-bold"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Approved Access Areas */}
      {approvedAreas.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <FaUnlockAlt className="text-emerald-500 text-sm" />
            <h3 className="text-base font-extrabold text-slate-700 uppercase tracking-wider">
              Approved Access Areas
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {approvedAreas.length} {approvedAreas.length === 1 ? "area" : "areas"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedAreas.map((area) => (
              <div 
                key={area.id} 
                className="relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md bg-emerald-50/70 border-emerald-100 hover:bg-emerald-50"
              >
                <span className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></span>

                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                      {area.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                      {area.description}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl flex-shrink-0 bg-emerald-100/80 text-emerald-600">
                    <FaUnlockAlt size={18} />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-2 flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-xs">
                    <FaCheckCircle className="text-emerald-500" /> APPROVED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restricted Access Areas */}
      {restrictedAreas.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-5">
            <FaLock className="text-rose-500 text-sm" />
            <h3 className="text-base font-extrabold text-slate-700 uppercase tracking-wider">
              Restricted Access Areas
            </h3>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              {restrictedAreas.length} {restrictedAreas.length === 1 ? "area" : "areas"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restrictedAreas.map((area) => {
              const requestable = canRequest(area);

              return (
                <div 
                  key={area.id} 
                  className="relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md bg-rose-50/40 border-rose-100/50 hover:bg-rose-50/60"
                >
                  <span className="absolute top-0 left-0 w-full h-1 bg-rose-500"></span>

                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
                        {area.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                        {area.description}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl flex-shrink-0 bg-rose-100/80 text-rose-600">
                      <FaLock size={18} />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-2 flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-rose-600 font-extrabold text-xs">
                      <FaTimesCircle className="text-rose-500" /> RESTRICTED
                    </span>

                    {/* Request Access Button */}
                    {requestable && onRequestAccess && (
                      <button
                        onClick={() => onRequestAccess(area)}
                        className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        title={`Request temporary access to ${area.name}`}
                      >
                        <FaKey size={10} />
                        Request Access
                        <FaArrowRight size={9} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {visibleAreas.length === 0 && (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <FaBuilding className="text-slate-300 text-3xl mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-500">No areas match your search</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
};

export default AccessMatrix;