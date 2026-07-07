import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../../component/DashboardLayout";
import Notification, { useNotification } from "../../../component/Notification";
import {
  getUsers,
  registerUser,
  updateUser,
  deleteUser,
} from "../../../Api/userService";
import {
  FaPlus,
  FaTimes,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaBuilding,
  FaUserTag,
  FaShieldAlt,
  FaLock,
  FaCheckCircle,
  FaBan,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaCamera
} from "react-icons/fa";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  
  // Available departments list (dynamically generated from loaded users)
  const [departments, setDepartments] = useState([]);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Active records for modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    staffId: "",
    department: "",
    role: "staff",
    uid: "",
    accessLevel: 1,
    profilePhoto: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    staffId: "",
    department: "",
    role: "staff",
    uid: "",
    cardStatus: "active",
    accessLevel: 1,
    profilePhoto: "",
  });

  // Photo upload refs
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Notification system
  const { notification, showSuccess, showError, clearNotification } = useNotification();

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        search: searchTerm,
        department: selectedDept,
        role: selectedRole,
        cardStatus: selectedStatus,
      };

      const data = await getUsers(filters);
      setUsers(data);
      
      // Extract unique departments for filter dropdown
      if (data && data.length > 0) {
        const depts = Array.from(new Set(data.map(u => u.department).filter(Boolean)));
        setDepartments(depts);
      }
    } catch (err) {
      setError(err?.message || "Failed to load users data.");
      showError(err?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [searchTerm, selectedDept, selectedRole, selectedStatus]);

  // Form input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Base64 Photo conversion
  const handlePhotoUpload = (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showError("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (isEdit) {
        setEditFormData((prev) => ({ ...prev, profilePhoto: base64 }));
      } else {
        setFormData((prev) => ({ ...prev, profilePhoto: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Create User submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.staffId || !formData.department) {
      showError("Please fill in all required fields (Name, Email, Staff/Matric ID, Department)");
      return;
    }

    try {
      setLoading(true);
      const res = await registerUser(formData);
      await loadUsers();
      
      showSuccess(res.message || `User ${formData.name} registered successfully!`);
      setShowAddModal(false);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        staffId: "",
        department: "",
        role: "staff",
        uid: "",
        accessLevel: 1,
        profilePhoto: "",
      });

      // If a temporary password was returned, show a custom notification dialog
      if (res.tempPassword) {
        alert(
          `User registered successfully!\n\n` +
          `TEMP LOGIN CREDENTIALS:\n` +
          `Email: ${formData.email}\n` +
          `Temporary Password: ${res.tempPassword}\n\n` +
          `Please share this password with the user. They will be forced to change it on their first login.`
        );
      }

    } catch (err) {
      console.error("Register user error:", err);
      showError(err.message || "Failed to register user");
    } finally {
      setLoading(false);
    }
  };

  // Edit User details
  const handleEditOpen = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      staffId: user.staffId,
      department: user.department,
      role: user.role,
      uid: user.uid || "",
      cardStatus: user.cardStatus || "active",
      accessLevel: user.accessLevel || 1,
      profilePhoto: user.profilePhoto || "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const id = selectedUser.id || selectedUser._id;
    if (!id) return;

    try {
      setLoading(true);
      const res = await updateUser(id, editFormData);
      await loadUsers();
      
      showSuccess(res.message || "User profile updated successfully!");
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (err) {
      showError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // View User Profile
  const handleViewOpen = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Delete User soft delete
  const handleDeletePrompt = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    const id = userToDelete.id || userToDelete._id;
    if (!id) return;

    try {
      setLoading(true);
      const res = await deleteUser(id);
      await loadUsers();
      showSuccess(res.message || `User ${userToDelete.name} deleted successfully.`);
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      showError(err.message || "Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Notifications overlay */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={clearNotification}
        />
      )}

      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              User Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Admin control center for cardholders, staff, students, and system access roles
            </p>
          </div>
          <div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-5 rounded-xl border-none shadow-md shadow-blue-500/20 transition-all duration-200 flex items-center gap-2"
            >
              <FaPlus size={14} />
              Register User
            </button>
          </div>
        </div>

        {/* Counter cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total users</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FaUser size={22} />
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Active Cards</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {users.filter(u => u.cardStatus === "active").length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <FaCheckCircle size={22} />
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Suspended</span>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {users.filter(u => u.cardStatus === "suspended").length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <FaExclamationTriangle size={22} />
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Revoked</span>
              <p className="text-2xl font-bold text-rose-600 mt-1">
                {users.filter(u => u.cardStatus === "revoked").length}
              </p>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <FaBan size={22} />
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white/80 backdrop-blur border border-gray-100 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <FaSearch size={15} />
              </span>
              <input
                type="text"
                placeholder="Search by full name, email, or staff id..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10 pr-4 py-3 rounded-xl border-gray-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
              
              {/* Department Filter */}
              <div className="relative flex-1 md:w-48">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <FaBuilding size={13} />
                </span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="select select-bordered w-full pl-9 pr-3 rounded-xl border-gray-200 text-xs focus:outline-none text-gray-700 appearance-none"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                  {/* Default back up values if list empty */}
                  {departments.length === 0 && (
                    <>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Microbiology">Microbiology</option>
                    </>
                  )}
                </select>
              </div>

              {/* Role Filter */}
              <div className="relative flex-1 md:w-40">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <FaUserTag size={13} />
                </span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="select select-bordered w-full pl-9 pr-3 rounded-xl border-gray-200 text-xs focus:outline-none text-gray-700"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="student">Student</option>
                </select>
              </div>

              {/* Card Status Filter */}
              <div className="relative flex-1 md:w-44">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                  <FaIdCard size={13} />
                </span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="select select-bordered w-full pl-9 pr-3 rounded-xl border-gray-200 text-xs focus:outline-none text-gray-700"
                >
                  <option value="">All Card Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="revoked">Revoked</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Reset button */}
              {(searchTerm || selectedDept || selectedRole || selectedStatus) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedDept("");
                    setSelectedRole("");
                    setSelectedStatus("");
                  }}
                  className="btn btn-ghost text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-2 px-3 rounded-xl transition-all duration-200"
                >
                  Clear Filters
                </button>
              )}

            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full min-w-[1000px] border-collapse align-middle">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold text-xs tracking-wider text-left">
                  <th className="py-4 px-6">Profile Photo</th>
                  <th className="py-4 px-3">Full Name</th>
                  <th className="py-4 px-3">Staff/Matric Number</th>
                  <th className="py-4 px-3">Department</th>
                  <th className="py-4 px-3">Role</th>
                  <th className="py-4 px-3">Assigned UID</th>
                  <th className="py-4 px-3">Card Status</th>
                  <th className="py-4 px-3">Access Level</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="loading loading-spinner loading-md text-blue-600"></span>
                        <p className="text-gray-400 text-xs">Fetching users list...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                          <FaUser size={24} />
                        </div>
                        <h4 className="font-semibold text-gray-800">No users found</h4>
                        <p className="text-xs text-gray-400 max-w-xs">
                          We couldn't find any users matching your criteria. Try adjusting your searches or filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr 
                      key={user.id || user._id}
                      className="hover:bg-blue-50/20 transition-all duration-150 border-b border-gray-100"
                    >
                      {/* Photo */}
                      <td className="py-4 px-6">
                        <div className="w-11 h-11 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                          {user.profilePhoto ? (
                            <img
                              src={user.profilePhoto}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold capitalize">
                              {user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-4 px-3 font-semibold text-gray-900">
                        {user.name}
                      </td>

                      {/* Staff/Matric ID */}
                      <td className="py-4 px-3 font-medium text-gray-600">
                        {user.staffId}
                      </td>

                      {/* Department */}
                      <td className="py-4 px-3 text-gray-600">
                        {user.department}
                      </td>

                      {/* Role */}
                      <td className="py-4 px-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize tracking-wide ${
                          user.role === "admin" 
                            ? "bg-purple-50 text-purple-700 border border-purple-100" 
                            : user.role === "staff"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "bg-teal-50 text-teal-700 border border-teal-100"
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* UID */}
                      <td className="py-4 px-3">
                        <span className="font-mono text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-lg select-all">
                          {user.uid || "UNASSIGNED"}
                        </span>
                      </td>

                      {/* Card Status */}
                      <td className="py-4 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          user.cardStatus === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : user.cardStatus === "suspended"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : user.cardStatus === "revoked"
                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                            : "bg-gray-50 text-gray-500 border border-gray-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.cardStatus === "active"
                              ? "bg-emerald-500"
                              : user.cardStatus === "suspended"
                              ? "bg-amber-500"
                              : user.cardStatus === "revoked"
                              ? "bg-rose-500"
                              : "bg-gray-400"
                          }`} />
                          {user.cardStatus}
                        </span>
                      </td>

                      {/* Access Level */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5">
                          <FaShieldAlt className={`text-xs ${
                            user.accessLevel === 3
                              ? "text-rose-600"
                              : user.accessLevel === 2
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`} />
                          <span className="font-bold text-gray-800 text-xs">
                            LVL {user.accessLevel}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewOpen(user)}
                            className="btn btn-ghost btn-xs w-8 h-8 rounded-lg p-0 text-blue-600 hover:bg-blue-50"
                            title="View Profile"
                          >
                            <FaEye size={13} />
                          </button>
                          <button
                            onClick={() => handleEditOpen(user)}
                            className="btn btn-ghost btn-xs w-8 h-8 rounded-lg p-0 text-amber-600 hover:bg-amber-50"
                            title="Edit User"
                          >
                            <FaEdit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeletePrompt(user)}
                            className="btn btn-ghost btn-xs w-8 h-8 rounded-lg p-0 text-rose-600 hover:bg-rose-50"
                            title="Delete User"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. REGISTER NEW USER MODAL                                 */}
      {/* ────────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden my-8 animate-[fadeIn_0.2s_ease-out]">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <FaUser className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">Register User</h3>
                  <p className="text-blue-100 text-xs">Create a new access profile and assign an NFC card</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/15 rounded-xl transition-all"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubmit}>
              <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
                
                {/* Profile Photo upload */}
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <div className="relative w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-white">
                    {formData.profilePhoto ? (
                      <img src={formData.profilePhoto} alt="Upload preview" className="w-full h-full object-cover" />
                    ) : (
                      <FaUser className="text-slate-300 text-xl" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800">Profile Photo</p>
                    <p className="text-[10px] text-slate-400">JPG or PNG, max 2MB. Optional.</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1.5 btn btn-xs border border-gray-200 bg-white hover:bg-gray-50 text-slate-700 py-1 px-3 rounded-lg flex items-center gap-1.5 font-bold"
                    >
                      <FaCamera size={10} />
                      Choose Image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, false)}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Form fields grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      className="input input-bordered w-full rounded-xl py-2 px-3 border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. Adebayo Oluwaseun"
                      required
                    />
                  </div>

                  {/* Staff ID */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Staff/Matric Number *</label>
                    <input
                      type="text"
                      name="staffId"
                      value={formData.staffId || ""}
                      onChange={handleInputChange}
                      className="input input-bordered w-full rounded-xl py-2 px-3 border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. ST-00234 or MAT-2022-4122"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Address *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <FaEnvelope size={11} />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleInputChange}
                        className="input input-bordered w-full pl-8 pr-3 rounded-xl py-2 border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
                        placeholder="username@domain.edu"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Phone Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <FaPhone size={11} />
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                        className="input input-bordered w-full pl-8 pr-3 rounded-xl py-2 border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
                        placeholder="e.g. +2348031234567"
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Department *</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department || ""}
                      onChange={handleInputChange}
                      className="input input-bordered w-full rounded-xl py-2 px-3 border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. Computer Science"
                      required
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">System Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="select select-bordered w-full rounded-xl py-2 px-3 border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
                      required
                    >
                      <option value="staff">Staff</option>
                      <option value="student">Student</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  {/* UID */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Assign UID (Optional)</label>
                    <input
                      type="text"
                      name="uid"
                      value={formData.uid || ""}
                      onChange={handleInputChange}
                      className="input input-bordered w-full rounded-xl py-2 px-3 border-gray-200 text-sm font-mono focus:border-blue-500 focus:outline-none"
                      placeholder="Leave blank to auto-generate"
                    />
                    <p className="text-[10px] text-gray-400 italic">Format: NFC-XXXXXXX (e.g. NFC-A8D9F2C)</p>
                  </div>

                  {/* Access Level */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Access Level *</label>
                    <select
                      name="accessLevel"
                      value={formData.accessLevel}
                      onChange={handleInputChange}
                      className="select select-bordered w-full rounded-xl py-2 px-3 border-gray-200 text-sm focus:border-blue-500 focus:outline-none"
                      required
                    >
                      <option value={1}>Level 1 (General Entry)</option>
                      <option value={2}>Level 2 (Department + Labs)</option>
                      <option value={3}>Level 3 (High Security / Server Rooms)</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Actions Footer */}
              <div className="px-6 pb-6 pt-3 flex gap-3 border-t border-slate-50 bg-slate-50/50 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-3 px-5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3 px-5 rounded-xl font-extrabold text-white bg-blue-600 hover:bg-blue-700 transition-colors text-sm shadow-md shadow-blue-600/25 flex items-center gap-1.5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Registering...
                    </>
                  ) : (
                    "Register User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. EDIT USER MODAL                                         */}
      {/* ────────────────────────────────────────────────────────── */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden my-8 animate-[fadeIn_0.2s_ease-out]">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <FaEdit className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">Edit User Profile</h3>
                  <p className="text-amber-50 text-xs">Modify identity information and update card credentials</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-white/15 rounded-xl transition-all"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit}>
              <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
                
                {/* Photo Upload preview */}
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <div className="relative w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-white">
                    {editFormData.profilePhoto ? (
                      <img src={editFormData.profilePhoto} alt="Upload preview" className="w-full h-full object-cover" />
                    ) : (
                      <FaUser className="text-slate-300 text-xl" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800">Profile Photo</p>
                    <p className="text-[10px] text-slate-400">JPG or PNG, max 2MB. Optional.</p>
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="mt-1.5 btn btn-xs border border-gray-200 bg-white hover:bg-gray-50 text-slate-700 py-1 px-3 rounded-lg flex items-center gap-1.5 font-bold"
                    >
                      <FaCamera size={10} />
                      Choose Image
                    </button>
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, true)}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Form fields grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name || ""}
                      onChange={handleEditInputChange}
                      className="input input-bordered w-full rounded-xl py-2 px-3 border-gray-200 text-sm focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Staff ID */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Staff/Matric Number *</label>
                    <input
                      type="text"
                      name="staffId"
                      value={editFormData.staffId || ""}
                      onChange={handleEditInputChange}
                      className="input input-bordered w-full rounded-xl py-2 px-3 border-gray-200 text-sm focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Address *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <FaEnvelope size={11} />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email || ""}
                        onChange={handleEditInputChange}
                        className="input input-bordered w-full pl-8 pr-3 rounded-xl py-2 border-gray-200 text-sm focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Phone Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <FaPhone size={11} />
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={editFormData.phone || ""}
                        onChange={handleEditInputChange}
                        className="input input-bordered w-full pl-8 pr-3 rounded-xl py-2 border-gray-200 text-sm focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Department *</label>
                    <input
                      type="text"
                      name="department"
                      value={editFormData.department || ""}
                      onChange={handleEditInputChange}
                      className="input input-bordered w-full rounded-xl py-2 px-3 border-gray-200 text-sm focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">System Role *</label>
                    <select
                      name="role"
                      value={editFormData.role}
                      onChange={handleEditInputChange}
                      className="select select-bordered w-full rounded-xl py-2 px-3 border-gray-200 text-sm focus:border-amber-500 focus:outline-none"
                      required
                    >
                      <option value="staff">Staff</option>
                      <option value="student">Student</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  {/* UID */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Assigned UID</label>
                    <input
                      type="text"
                      name="uid"
                      value={editFormData.uid || ""}
                      onChange={handleEditInputChange}
                      className="input input-bordered w-full rounded-xl py-2 px-3 border-gray-200 text-sm font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Access Level */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Access Level *</label>
                    <select
                      name="accessLevel"
                      value={editFormData.accessLevel}
                      onChange={handleEditInputChange}
                      className="select select-bordered w-full rounded-xl py-2 px-3 border-gray-200 text-sm focus:border-amber-500 focus:outline-none"
                      required
                    >
                      <option value={1}>Level 1 (General Entry)</option>
                      <option value={2}>Level 2 (Department + Labs)</option>
                      <option value={3}>Level 3 (High Security / Server Rooms)</option>
                    </select>
                  </div>

                  {/* Card Status */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Card Status *</label>
                    <select
                      name="cardStatus"
                      value={editFormData.cardStatus}
                      onChange={handleEditInputChange}
                      className="select select-bordered w-full rounded-xl py-2 px-3 border-gray-200 text-sm focus:border-amber-500 focus:outline-none"
                      required
                    >
                      <option value="active">Active (Card works at readers)</option>
                      <option value="suspended">Suspended (Access temporarily blocked)</option>
                      <option value="revoked">Revoked (Card permanently blocked)</option>
                      <option value="inactive">Inactive (Not in system use)</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Actions Footer */}
              <div className="px-6 pb-6 pt-3 flex gap-3 border-t border-slate-50 bg-slate-50/50 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="py-3 px-5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3 px-5 rounded-xl font-extrabold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-colors text-sm shadow-md shadow-orange-500/25 flex items-center gap-1.5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. VIEW PROFILE MODAL                                      */}
      {/* ────────────────────────────────────────────────────────── */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            
            {/* Design header banner */}
            <div className="h-28 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 relative">
              <button 
                onClick={() => setShowViewModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-all"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* Profile body */}
            <div className="px-6 pb-6 pt-0 relative flex flex-col items-center">
              
              {/* Profile Avatar overflowing header */}
              <div className="w-24 h-24 rounded-3xl border-4 border-white bg-gradient-to-br from-teal-400 to-blue-500 shadow-lg -mt-12 overflow-hidden flex items-center justify-center">
                {selectedUser.profilePhoto ? (
                  <img src={selectedUser.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-3xl font-extrabold capitalize">{selectedUser.name.charAt(0)}</span>
                )}
              </div>

              {/* Identity & Tags */}
              <h3 className="font-extrabold text-xl text-gray-900 mt-4 text-center">{selectedUser.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5 tracking-wide font-mono uppercase">{selectedUser.staffId}</p>

              {/* Status Tags */}
              <div className="flex gap-2 mt-3">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                  {selectedUser.role}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                  selectedUser.cardStatus === "active"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    : selectedUser.cardStatus === "suspended"
                    ? "bg-amber-50 text-amber-700 border border-amber-100"
                    : "bg-rose-50 text-rose-700 border border-rose-100"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    selectedUser.cardStatus === "active" ? "bg-emerald-500" : selectedUser.cardStatus === "suspended" ? "bg-amber-500" : "bg-rose-500"
                  }`} />
                  {selectedUser.cardStatus || "active"}
                </span>
              </div>

              {/* Divider */}
              <div className="w-full border-b border-gray-100 my-5" />

              {/* Cardholder Details */}
              <div className="w-full space-y-3.5 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <FaBuilding className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 leading-none">Department</p>
                    <p className="font-bold text-gray-800 mt-1">{selectedUser.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 leading-none">Email Address</p>
                    <p className="font-bold text-gray-800 mt-1 text-xs select-all">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaPhone className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 leading-none">Phone Number</p>
                    <p className="font-bold text-gray-800 mt-1">{selectedUser.phone || "—"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaIdCard className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 leading-none">NFC Card UID</p>
                    <p className="font-mono font-bold text-gray-800 mt-1 text-xs">{selectedUser.uid || "UNASSIGNED"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FaShieldAlt className="text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 leading-none">Access Level</p>
                    <p className="font-bold text-gray-800 mt-1">Level {selectedUser.accessLevel} Permissions</p>
                  </div>
                </div>

                {selectedUser.createdAt && (
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 leading-none">Registered Date</p>
                      <p className="font-medium text-gray-700 mt-1">
                        {new Date(selectedUser.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowViewModal(false)}
                className="mt-6 w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
              >
                Close Profile
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. DELETE CONFIRMATION MODAL                               */}
      {/* ────────────────────────────────────────────────────────── */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-[fadeIn_0.15s_ease-out]">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-rose-600 to-red-600 px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0 text-white">
                <FaTrash size={18} />
              </div>
              <div className="text-white">
                <h3 className="font-extrabold text-base">Delete User</h3>
                <p className="text-rose-100 text-[11px] font-medium">Deactivate account and revoke NFC access</p>
              </div>
            </div>

            {/* Content Body */}
            <div className="px-6 py-6 space-y-4">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Are you sure you want to delete <strong>{userToDelete.name}</strong>?
                This will soft delete the user record, rendering their assigned NFC card UID (<span className="font-mono text-xs">{userToDelete.uid || "N/A"}</span>) instantly inactive.
              </p>

              <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-100 rounded-xl p-3.5">
                <FaLock className="text-rose-500 flex-shrink-0 mt-0.5" size={13} />
                <p className="text-[11px] text-rose-700 font-semibold leading-relaxed">
                  Their NFC card permissions will be set to revoked, and access logs will preserve historic swipes.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 px-4 rounded-xl font-extrabold text-white bg-rose-600 hover:bg-rose-700 transition-colors text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-1.5"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default UsersPage;