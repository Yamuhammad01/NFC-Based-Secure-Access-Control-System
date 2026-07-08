import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../component/DashboardLayout";
import { 
  FaShieldAlt, 
  FaSync, 
  FaCheckCircle, 
  FaTimesCircle,
  FaSave,
  FaBuilding
} from "react-icons/fa";
import ACCESS_AREAS from "../../../config/accessAreas";

const RolePermissions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState("staff");
  const [allowedAreas, setAllowedAreas] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });

  const roles = [
    { id: "admin", name: "Admin", description: "Full system access" },
    { id: "staff", name: "Staff", description: "Administrative access" },
    { id: "student", name: "Student", description: "Limited student access" },
  ];

  // Group areas by category
  const groupedAreas = ACCESS_AREAS.reduce((acc, area) => {
    if (!acc[area.section]) {
      acc[area.section] = [];
    }
    acc[area.section].push(area);
    return acc;
  }, {});

  useEffect(() => {
    fetchRolePermissions();
  }, [selectedRole]);

  const fetchRolePermissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000/api/permissions/role/${selectedRole}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setAllowedAreas(data.allowedAreas || []);
      }
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      setMessage({ type: "error", text: "Failed to load permissions" });
    } finally {
      setLoading(false);
    }
  };

  const toggleArea = (areaId) => {
    if (selectedRole === "admin") return; // Admin has all access, no need to configure
    
    setAllowedAreas(prev => {
      if (prev.includes(areaId)) {
        return prev.filter(id => id !== areaId);
      } else {
        return [...prev, areaId];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000/api/permissions/role/${selectedRole}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ allowedAreas }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: "success", text: "Role permissions updated successfully" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update permissions" });
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
      setMessage({ type: "error", text: "Failed to save permissions" });
    } finally {
      setSaving(false);
    }
  };

  const isAreaAllowed = (areaId) => {
    if (selectedRole === "admin") return true;
    return allowedAreas.includes(areaId);
  };

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl shadow-xl overflow-hidden border border-indigo-800/20 mb-8 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <FaShieldAlt className="text-indigo-400" />
                Role Permissions Management
              </h1>
              <p className="text-indigo-200/80 text-sm mt-2 max-w-2xl font-medium">
                Configure default access areas for each role. Changes apply to all users with that role.
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === "success" 
              ? "bg-green-50 border border-green-200 text-green-800" 
              : "bg-red-50 border border-red-200 text-red-800"
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Role Selection */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Select Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedRole === role.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-indigo-300"
                }`}
              >
                <h3 className="font-bold text-slate-800">{role.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{role.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions Configuration */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[30vh]">
            <span className="loading loading-spinner loading-lg text-indigo-600"></span>
            <p className="text-gray-500 mt-4 font-semibold animate-pulse">Loading permissions...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">
                Allowed Areas for {roles.find(r => r.id === selectedRole)?.name}
              </h2>
              <button
                onClick={handleSave}
                disabled={saving || selectedRole === "admin"}
                className="btn btn-primary btn-sm flex items-center gap-2 font-bold"
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave size={14} />
                    Save Changes
                  </>
                )}
              </button>
            </div>

            {selectedRole === "admin" ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FaShieldAlt className="text-slate-300 text-4xl mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500">Admin has unrestricted access to all areas</p>
                <p className="text-xs text-slate-400 mt-1">No configuration needed</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedAreas).map(([section, areas]) => (
                  <div key={section}>
                    <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider mb-3">
                      {section}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {areas.map((area) => {
                        const allowed = isAreaAllowed(area.id);
                        return (
                          <button
                            key={area.id}
                            onClick={() => toggleArea(area.id)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              allowed
                                ? "border-emerald-500 bg-emerald-50/70"
                                : "border-slate-200 bg-slate-50 hover:border-rose-300"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h4 className="font-bold text-slate-800 text-sm">{area.name}</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                  {area.description}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                {allowed ? (
                                  <FaCheckCircle className="text-emerald-500 text-xl" />
                                ) : (
                                  <FaTimesCircle className="text-slate-300 text-xl" />
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <FaBuilding className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-blue-900 mb-1">How Permissions Work</h3>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>All new users automatically receive their role's default permissions</li>
                <li>Admins can override permissions for individual users in the Users page</li>
                <li>Changes to role permissions only affect new users or when permissions are refreshed</li>
                <li>Existing users can be refreshed to match new role defaults</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RolePermissions;