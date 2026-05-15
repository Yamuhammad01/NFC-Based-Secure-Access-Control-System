import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DashboardLayout from "../../../component/DashboardLayout";
import { FaPlus, FaTimes, FaEdit, FaTrash, FaEye, FaEyeSlash, FaUsers } from "react-icons/fa";
import Notification, { useNotification } from "../../../component/Notification";
import { 
  getAllStaff, 
  adminInvite, 
  updateStaff, 
  deleteStaff,
  getTotalStaffs, 
  getTotalDepartments
} from "../../../Api/authService";

const EmployeeTable = () => {
  const [selectedQR, setSelectedQR] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    staffId: "", 
    department: "",
    email: "",
    phone: "",
    photo: ""
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalStaffs, setTotalStaffs] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  
  // Notification system
  const {
    notification,
    showSuccess,
    showError,
    clearNotification
  } = useNotification();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeIdToDelete, setEmployeeIdToDelete] = useState(null);

  /***************************************************************************
   * Helpers to parse backend responses (robust to different response shapes)
   ***************************************************************************/
  const normalizeStaffList = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.staffs)) return response.staffs;
    // sometimes backend sends { result: [...] }
    if (Array.isArray(response.result)) return response.result;
    return [];
  };

  const parseTotalValue = (response, keyFallbackValue) => {
    if (response == null) return keyFallbackValue;
    // If response is a straight number
    if (typeof response === "number") return response;
    // If response is object with known key(s)
    if (typeof response === "object") {
      if (typeof response.totalStaffs === "number") return response.totalStaffs;
      if (typeof response.totalDepartments === "number") return response.totalDepartments;
      if (typeof response.total === "number") return response.total;
      if (typeof response.count === "number") return response.count;
    }
    return keyFallbackValue;
  };

  /***************************************************************************
   * Centralized refresh (used after add / edit / delete)
   ***************************************************************************/
  const refreshStaffList = async () => {
    try {
      setLoading(true);
      setError(null);

      const staffResponse = await getAllStaff();
      const staffArray = normalizeStaffList(staffResponse);
      setEmployees(staffArray);

      // Try fetching totals from endpoints; fallback to calculating
      try {
        const ts = await getTotalStaffs();
        const parsedTs = parseTotalValue(ts, staffArray.length);
        setTotalStaffs(parsedTs);
      } catch (err) {
        // fallback: length of staff list
        setTotalStaffs(staffArray.length);
      }

      try {
        const td = await getTotalDepartments();
        const parsedTd = parseTotalValue(td, new Set(staffArray.map(s => (s.department || "").trim().toLowerCase())).size);
        setTotalDepartments(parsedTd);
      } catch (err) {
        // fallback: count unique departments
        const depts = new Set(staffArray.map(s => (s.department || "").trim().toLowerCase()).filter(Boolean));
        setTotalDepartments(depts.size);
      }
    } catch (err) {
      console.error("Failed to refresh staff list:", err);
      setError(err?.message || "Failed to load staff data.");
      showError(err?.message || "Failed to load staff data.");
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    refreshStaffList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /***************************************************************************
   * Form handlers
   ***************************************************************************/
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      if (isEdit) {
        setEditingEmployee(prev => ({ ...prev, photo: dataUrl }));
      } else {
        setNewEmployee(prev => ({ ...prev, photo: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  /***************************************************************************
   * Add new employee
   ***************************************************************************/
  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.staffId || !newEmployee.department || !newEmployee.email || !newEmployee.phone) {
      showError("Please fill in all required fields");
      return;
    }

    const emailExists = employees.some(emp => (emp.email || "").toLowerCase() === newEmployee.email.toLowerCase());
    if (emailExists) {
      showError("An employee with this email already exists");
      return;
    }

    try {
      setLoading(true);
      // Send full staff object (authService.adminInvite uses same route)
      const response = await adminInvite(newEmployee);
      // refresh list from server (preferred)
      await refreshStaffList();

      showSuccess(response?.message || `Staff member ${newEmployee.name} added successfully!`);
      setShowAddForm(false);
      setNewEmployee({
        name: "",
        staffId: "",
        department: "",
        email: "",
        phone: "",
        photo: ""
      });
    } catch (err) {
      console.error("Failed to add staff:", err, err?.response?.data);
      // Prefer backend message if available
      const backendMsg = err?.response?.data?.message || err?.response?.data?.error || err?.response?.data;
      const errorMessage = backendMsg || err?.message || "Failed to add staff member.";
      showError(typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  /***************************************************************************
   * Edit employee
   ***************************************************************************/
  const handleEditEmployee = async () => {
    if (!editingEmployee || !editingEmployee.name || !editingEmployee.department || !editingEmployee.email || !editingEmployee.phone) {
      showError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await updateStaff(editingEmployee.id, editingEmployee);
      await refreshStaffList();
      showSuccess(response?.message || `Staff member ${editingEmployee.name} updated successfully!`);
      setShowEditForm(false);
      setEditingEmployee(null);
    } catch (err) {
      console.error("Failed to update staff:", err, err?.response?.data);
      const backendMsg = err?.response?.data?.message || err?.response?.data?.error;
      showError(backendMsg || err?.message || "Failed to update staff member.");
    } finally {
      setLoading(false);
    }
  };

  /***************************************************************************
   * Toggle status (local only for now)
   ***************************************************************************/
  const toggleEmployeeStatus = (employeeId) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, status: emp.status === "active" ? "inactive" : "active" }
        : emp
    ));
    showSuccess(`Staff member status toggled.`);
  };

  /***************************************************************************
   * Delete flow with modal
   ***************************************************************************/
  const confirmDeleteEmployee = async () => {
    if (!employeeIdToDelete) return;
    try {
      setLoading(true);
      const response = await deleteStaff(employeeIdToDelete);
      await refreshStaffList();
      showSuccess(response?.message || "Staff member deleted successfully!");
      setEmployeeIdToDelete(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Failed to delete staff:", err, err?.response?.data);
      const backendMsg = err?.response?.data?.message || err?.response?.data?.error;
      showError(backendMsg || err?.message || "Failed to delete staff member.");
    } finally {
      setLoading(false);
    }
  };

  const cancelDeleteEmployee = () => {
    setEmployeeIdToDelete(null);
    setShowDeleteModal(false);
  };

  const promptDeleteEmployee = (employeeId) => {
    setEmployeeIdToDelete(employeeId);
    setShowDeleteModal(true);
  };

  /***************************************************************************
   * Effects
   ***************************************************************************/

  const openEditForm = (employee) => {
    setEditingEmployee({ ...employee });
    setShowEditForm(true);
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(employees);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    const excelBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "employees.xlsx");
  };

  return (
    <DashboardLayout>
      {/* Notification Component */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={clearNotification}
        />
      )}
      <div className="min-h-screen">
        {/* Dashboard Stats */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-gray-500 mt-3">Loading staff data...</p>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-10">
            <p>Error: {error}</p>
            <p>Please try again later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-6">
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Staff</p>
                    <p className="text-2xl font-bold text-gray-900">{totalStaffs}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaUsers className="text-blue-600 text-xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Staff</p>
                    <p className="text-2xl font-bold text-green-600">{employees.filter(emp => emp.status === "active").length}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <FaEye className="text-green-600 text-xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inactive Staff</p>
                    <p className="text-2xl font-bold text-orange-600">{employees.filter(emp => emp.status === "inactive").length}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <FaEyeSlash className="text-orange-600 text-xl" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Departments</p>
                    <p className="text-2xl font-bold text-purple-600">{totalDepartments}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FaUsers className="text-purple-600 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 px-6">
              <h2 className="text-xl font-semibold text-gray-700">Staff Management</h2>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="btn btn-primary btn-sm flex items-center gap-2"
                >
                  <FaPlus size={14} />
                  Add Staff
                </button>
                <button onClick={downloadExcel} className="btn btn-sm btn-outline btn-primary">
                  Download Excel
                </button>
              </div>
            </div>

            <div
              className="overflow-auto px-6"
              style={{ maxHeight: "calc(100vh - 260px)" }}
            >
              <table className="table min-w-[1000px]">
                {/* Table Head */}
                <thead className="bg-blue-100 text-gray-700 sticky top-0 z-20">
                  <tr>
                    <th className="text-black sticky top-0 bg-blue-100">ID</th>
                    <th className="text-black sticky top-0 bg-blue-100">Name</th>
                    <th className="text-black sticky top-0 bg-blue-100">Job Title</th>
                    <th className="text-black sticky top-0 bg-blue-100">Department</th>
                    <th className="text-black sticky top-0 bg-blue-100">Email</th>
                    <th className="text-black sticky top-0 bg-blue-100 whitespace-nowrap">Phone</th>
                    <th className="text-black sticky top-0 bg-blue-100">Status</th>
                    <th className="text-black sticky top-0 bg-blue-100">QR Code</th>
                    <th className="text-black sticky top-0 bg-blue-100">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id || emp.staffId || emp.email} className={emp.status === "inactive" ? "opacity-60" : ""}>
                      <td className="font-medium text-black">{emp.id}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="mask mask-squircle h-12 w-12">
                              <img src={emp.photo} alt={emp.name} />
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-black">{emp.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-black">{emp.jobTitle}</td>
                      <td className="text-black">{emp.department}</td>
                      <td className="text-black">{emp.email}</td>
                      <td className="text-black whitespace-nowrap">{emp.phone}</td>
                      <td>
                        <span className={`badge ${emp.status === "active" ? "badge-success" : "badge-warning"}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td>
                        <img
                          src={emp.qrCode}
                          alt="QR Code"
                          className="h-12 w-12 cursor-pointer"
                          onClick={() => setSelectedQR(emp.qrCode)}
                        />
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditForm(emp)}
                            className="btn btn-xs btn-outline btn-info"
                            title="Edit"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            onClick={() => toggleEmployeeStatus(emp.id)}
                            className={`btn btn-xs btn-outline ${emp.status === "active" ? "btn-warning" : "btn-success"}`}
                            title={emp.status === "active" ? "Deactivate" : "Activate"}
                          >
                            {emp.status === "active" ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                          </button>
                          <button
                            onClick={() => promptDeleteEmployee(emp.id)}
                            className="btn btn-xs btn-outline btn-error"
                            title="Delete"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Employee Modal */}
            {showAddForm && (
              <dialog open className="modal modal-open">
                <div className="modal-box max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Add New Staff Member</h3>
                    <button 
                      onClick={() => setShowAddForm(false)}
                      className="btn btn-sm btn-circle btn-ghost"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  
                  <form onSubmit={(e) => { e.preventDefault(); handleAddEmployee(); }}>
                    <div className="space-y-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Name *</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={newEmployee.name}
                          onChange={handleInputChange}
                          className="input input-bordered w-full"
                          placeholder="Enter staff name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">ID Number *</span>
                        </label>
                        <input
                          type="text"
                          name="staffId"
                          value={newEmployee.staffId}
                          onChange={handleInputChange}
                          className="input input-bordered w-full"
                          placeholder="Enter ID number"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Department *</span>
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={newEmployee.department}
                          onChange={handleInputChange}
                          className="input input-bordered w-full"
                          placeholder="Enter department name"
                          required
                        />
                      </div>

                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Email *</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={newEmployee.email}
                          onChange={handleInputChange}
                          className="input input-bordered w-full"
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Phone Number *</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={newEmployee.phone}
                          onChange={handleInputChange}
                          className="input input-bordered w-full"
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Profile Picture</span>
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="file-input file-input-bordered w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="modal-action">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="btn btn-ghost"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? "Adding..." : "Add Staff"}
                      </button>
                    </div>
                  </form>
                </div>
              </dialog>
            )}

            {/* Edit Employee Modal */}
            {showEditForm && editingEmployee && (
              <dialog open className="modal modal-open">
                <div className="modal-box max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Edit Staff Member</h3>
                    <button 
                      onClick={() => setShowEditForm(false)}
                      className="btn btn-sm btn-circle btn-ghost"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  
                  <form onSubmit={(e) => { e.preventDefault(); handleEditEmployee(); }}>
                    <div className="space-y-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Name *</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editingEmployee.name || ""}
                          onChange={handleEditInputChange}
                          className="input input-bordered w-full"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Department *</span>
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={editingEmployee.department || ""}
                          onChange={handleEditInputChange}
                          className="input input-bordered w-full"
                          placeholder="Enter department name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Email *</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editingEmployee.email || ""}
                          onChange={handleEditInputChange}
                          className="input input-bordered w-full"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Phone Number *</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={editingEmployee.phone || ""}
                          onChange={handleEditInputChange}
                          className="input input-bordered w-full"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="label">
                          <span className="label-text font-medium">Profile Picture</span>
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, true)}
                          className="file-input file-input-bordered w-full"
                        />
                        {editingEmployee.photo && (
                          <div className="mt-2">
                            <img 
                              src={editingEmployee.photo} 
                              alt="Current" 
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="modal-action">
                      <button
                        type="button"
                        onClick={() => setShowEditForm(false)}
                        className="btn btn-ghost"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? "Updating..." : "Update Staff"}
                      </button>
                    </div>
                  </form>
                </div>
              </dialog>
            )}

            {/* QR Modal */}
            {selectedQR && (
              <dialog open className="modal">
                <div className="modal-box flex flex-col items-center">
                  <img src={selectedQR} alt="QR Code Large" className="w-64 h-64" />
                  <button
                    className="btn mt-4 btn-primary"
                    onClick={() => setSelectedQR(null)}
                  >
                    Close
                  </button>
                </div>
              </dialog>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <dialog open className="modal modal-open">
                <div className="modal-box">
                  <h3 className="font-bold text-lg">Delete Staff</h3>
                  <p className="py-4">
                    Are you sure you want to delete this staff member? This action cannot be undone.
                  </p>
                  <div className="modal-action">
                    <button
                      className="btn btn-ghost"
                      onClick={cancelDeleteEmployee}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      className={`btn btn-error ${loading ? "loading" : ""}`}
                      onClick={confirmDeleteEmployee}
                      disabled={loading}
                    >
                      {loading ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </dialog>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeeTable;
