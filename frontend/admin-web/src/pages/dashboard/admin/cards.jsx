import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../component/DashboardLayout";
import { 
  FaPlus, 
  FaTimes, 
  FaIdCard, 
  FaUserMinus, 
  FaExchangeAlt, 
  FaShieldAlt, 
  FaExclamationTriangle, 
  FaSync, 
  FaSearch, 
  FaLock, 
  FaUnlock 
} from "react-icons/fa";
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  reportLostCard, 
  reportStolenCard, 
  replaceCard, 
  deactivateUser 
} from "../../../Api/authService";

const CardManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Notification banner state
  const [alert, setAlert] = useState(null);

  // Modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    uid: "",
    role: "student",
    accessLevel: 1,
    allowedTime: {
      start: "08:00",
      end: "18:00"
    }
  });

  // Replacement card state
  const [newCardUid, setNewCardUid] = useState("");

  const triggerAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err?.message || "Failed to load cardholders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      allowedTime: {
        ...prev.allowedTime,
        [name]: value
      }
    }));
  };

  // ──────────────────────────────────────────────
  // Cardholder Lifecycle Actions
  // ──────────────────────────────────────────────

  // 1. Add User / Register Cardholder
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.uid) {
      triggerAlert("Name and Card UID are required", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await createUser(newUser);
      await fetchUsers();
      triggerAlert(res?.message || "Cardholder registered successfully!");
      setShowAddForm(false);
      setNewUser({
        name: "",
        uid: "",
        role: "student",
        accessLevel: 1,
        allowedTime: { start: "08:00", end: "18:00" }
      });
    } catch (err) {
      const backendMsg = err?.response?.data?.message || err?.message;
      triggerAlert(backendMsg || "Failed to register cardholder.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. Report Lost Card (status -> revoked)
  const handleReportLost = async (id, name) => {
    if (!window.confirm(`Are you sure you want to report the card for ${name} as LOST? This card will be immediately revoked.`)) {
      return;
    }
    try {
      setLoading(true);
      const res = await reportLostCard(id);
      await fetchUsers();
      triggerAlert(res?.message || "Card reported lost & successfully revoked.");
    } catch (err) {
      triggerAlert(err?.message || "Failed to revoke card.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 3. Report Stolen Card (status -> suspended)
  const handleReportStolen = async (id, name) => {
    if (!window.confirm(`IMMEDIATE DEACTIVATION: Are you sure you want to report the card for ${name} as STOLEN? Access will be shut down instantly.`)) {
      return;
    }
    try {
      setLoading(true);
      const res = await reportStolenCard(id);
      await fetchUsers();
      triggerAlert(res?.message || "Card reported stolen & immediately suspended.", "error");
    } catch (err) {
      triggerAlert(err?.message || "Failed to suspend card.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 4. Assign Replacement Card (New UID, status -> active)
  const handleReplaceCard = async (e) => {
    e.preventDefault();
    if (!newCardUid) {
      triggerAlert("New Card UID is required", "error");
      return;
    }
    try {
      setLoading(true);
      const res = await replaceCard(selectedUser.id, newCardUid);
      await fetchUsers();
      triggerAlert(res?.message || "Replacement card assigned successfully!");
      setShowReplaceModal(false);
      setNewCardUid("");
      setSelectedUser(null);
    } catch (err) {
      const backendMsg = err?.response?.data?.message || err?.message;
      triggerAlert(backendMsg || "Failed to replace card.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 5. User Leaves University (status -> suspended/deactivated)
  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to DEACTIVATE the account for ${name} because they left the university?`)) {
      return;
    }
    try {
      setLoading(true);
      const res = await deactivateUser(id);
      await fetchUsers();
      triggerAlert(res?.message || "User account deactivated successfully.");
    } catch (err) {
      triggerAlert(err?.message || "Failed to deactivate account.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on query
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.uid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Computations
  const totalCards = users.length;
  const activeCards = users.filter(u => u.status === "active").length;
  const revokedCards = users.filter(u => u.status === "revoked").length;
  const suspendedCards = users.filter(u => u.status === "suspended").length;

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Banner Notification */}
        {alert && (
          <div className="px-6 pt-4">
            <div className={`alert ${alert.type === "error" ? "alert-error" : "alert-success"} text-white shadow-lg rounded-xl`}>
              <div className="flex gap-2 items-center">
                <FaShieldAlt />
                <span className="font-semibold">{alert.message}</span>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-6 pt-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Card Lifecycle Management</h1>
            <p className="text-sm text-gray-500 font-medium">Issue, Revoke, Suspend, and Replace NFC Credentials</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={fetchUsers}
              className="btn btn-outline btn-primary btn-sm flex items-center gap-2"
              disabled={loading}
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              Sync
            </button>
            <button 
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <FaPlus />
              Issue Card
            </button>
          </div>
        </div>

        {loading && users.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-gray-500 mt-3 font-semibold animate-pulse">Synchronizing NFC directory...</p>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-10">
            <p className="font-semibold text-lg">Failed to sync with access directory.</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
            <button onClick={fetchUsers} className="btn btn-primary btn-sm mt-4">Retry Sync</button>
          </div>
        ) : (
          <>
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-6">
              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Total Cards</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalCards}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FaIdCard className="text-blue-600 text-xl" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Active Cards</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{activeCards}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FaShieldAlt className="text-green-600 text-xl" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Revoked (Lost)</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{revokedCards}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FaExclamationTriangle className="text-yellow-600 text-xl" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Suspended / Stolen</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{suspendedCards}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <FaUserMinus className="text-red-600 text-xl" />
                </div>
              </div>
            </div>

            {/* Filter Search */}
            <div className="mb-6 px-6">
              <div className="relative max-w-md w-full">
                <input 
                  type="text" 
                  placeholder="Search cardholder name, UID, or role..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered w-full pl-10"
                />
                <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            {/* Cardholders Table */}
            <div className="overflow-auto px-6" style={{ maxHeight: "calc(100vh - 280px)" }}>
              <table className="table min-w-[1000px]">
                <thead className="bg-blue-100 text-gray-700 sticky top-0 z-20">
                  <tr>
                    <th className="text-black bg-blue-100">Cardholder Name</th>
                    <th className="text-black bg-blue-100">Card UID</th>
                    <th className="text-black bg-blue-100">Role</th>
                    <th className="text-black bg-blue-100">Access Level</th>
                    <th className="text-black bg-blue-100">Allowed Hours</th>
                    <th className="text-black bg-blue-100">Status</th>
                    <th className="text-black bg-blue-100 text-center">Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-gray-500 font-semibold bg-white">
                        No cardholder records found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td>
                          <span className="font-bold text-black text-sm">{user.name}</span>
                        </td>
                        <td>
                          <span className="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs font-bold uppercase">
                            {user.uid}
                          </span>
                        </td>
                        <td>
                          <span className="capitalize badge badge-neutral badge-sm">{user.role}</span>
                        </td>
                        <td>
                          <span className="badge badge-info badge-sm text-white font-bold">Lvl {user.accessLevel}</span>
                        </td>
                        <td>
                          <span className="text-xs text-gray-700 font-semibold">
                            {user.allowedTime?.start} - {user.allowedTime?.end}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-sm font-bold capitalize ${
                            user.status === "active" ? "badge-success text-white" : 
                            user.status === "revoked" ? "badge-warning text-white" : "badge-error text-white"
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2 justify-center">
                            {/* Lost Card Button */}
                            <button
                              onClick={() => handleReportLost(user.id, user.name)}
                              className="btn btn-xs btn-outline btn-warning flex items-center gap-1 font-semibold"
                              title="Report Lost (Revoke Card)"
                              disabled={user.status === "revoked" || user.status === "suspended"}
                            >
                              <FaExclamationTriangle size={10} />
                              Lost
                            </button>

                            {/* Stolen Card Button */}
                            <button
                              onClick={() => handleReportStolen(user.id, user.name)}
                              className="btn btn-xs btn-outline btn-error flex items-center gap-1 font-semibold"
                              title="Report Stolen (Immediate Suspended Deactivation)"
                              disabled={user.status === "suspended"}
                            >
                              <FaUserMinus size={10} />
                              Stolen
                            </button>

                            {/* Replace Card Button */}
                            <button
                              onClick={() => { setSelectedUser(user); setShowReplaceModal(true); }}
                              className="btn btn-xs btn-primary flex items-center gap-1 font-semibold text-white"
                              title="Assign Replacement Card"
                            >
                              <FaExchangeAlt size={10} />
                              Replace
                            </button>

                            {/* Deactivate Button (Leaves University) */}
                            <button
                              onClick={() => handleDeactivate(user.id, user.name)}
                              className="btn btn-xs btn-outline btn-neutral flex items-center gap-1 font-semibold"
                              title="Deactivate Account (Leaves University)"
                              disabled={user.status === "suspended"}
                            >
                              <FaTimes size={10} />
                              Leave
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal: Add/Register Cardholder */}
            {showAddForm && (
              <dialog open className="modal modal-open">
                <div className="modal-box max-w-md">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-lg font-bold text-gray-800">Issue New NFC Card</h3>
                    <button 
                      onClick={() => setShowAddForm(false)}
                      className="btn btn-sm btn-circle btn-ghost"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  
                  <form onSubmit={handleCreateUser}>
                    <div className="space-y-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">User Full Name *</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={newUser.name}
                          onChange={handleInputChange}
                          className="input input-bordered w-full"
                          placeholder="e.g. John Doe"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">NFC Card UID *</span>
                        </label>
                        <input
                          type="text"
                          name="uid"
                          value={newUser.uid}
                          onChange={handleInputChange}
                          className="input input-bordered w-full font-mono uppercase"
                          placeholder="e.g. ABC123XYZ"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">System Role</span>
                          </label>
                          <select 
                            name="role" 
                            value={newUser.role}
                            onChange={handleInputChange}
                            className="select select-bordered w-full"
                          >
                            <option value="student">Student</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">Access Level</span>
                          </label>
                          <select 
                            name="accessLevel" 
                            value={newUser.accessLevel}
                            onChange={handleInputChange}
                            className="select select-bordered w-full"
                          >
                            <option value={1}>Level 1 (General)</option>
                            <option value={2}>Level 2 (Offices)</option>
                            <option value={3}>Level 3 (Server Rooms)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">Allowed From</span>
                          </label>
                          <input 
                            type="time" 
                            name="start"
                            value={newUser.allowedTime.start}
                            onChange={handleTimeChange}
                            className="input input-bordered w-full"
                          />
                        </div>
                        <div>
                          <label className="label">
                            <span className="label-text font-semibold">Allowed To</span>
                          </label>
                          <input 
                            type="time" 
                            name="end"
                            value={newUser.allowedTime.end}
                            onChange={handleTimeChange}
                            className="input input-bordered w-full"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="modal-action border-t pt-3">
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
                        {loading ? "Issuing..." : "Issue & Register"}
                      </button>
                    </div>
                  </form>
                </div>
              </dialog>
            )}

            {/* Modal: Replace Card */}
            {showReplaceModal && selectedUser && (
              <dialog open className="modal modal-open">
                <div className="modal-box max-w-sm">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-md font-bold text-gray-800">Assign Replacement Card</h3>
                    <button 
                      onClick={() => { setShowReplaceModal(false); setSelectedUser(null); }}
                      className="btn btn-sm btn-circle btn-ghost"
                    >
                      <FaTimes />
                    </button>
                  </div>
                  
                  <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-800">
                      You are issuing a replacement credential for <strong>{selectedUser.name}</strong>. The old card UID (<strong>{selectedUser.uid}</strong>) will be fully unlinked and replaced.
                    </p>
                  </div>

                  <form onSubmit={handleReplaceCard}>
                    <div className="space-y-4">
                      <div>
                        <label className="label">
                          <span className="label-text font-semibold">New Card UID *</span>
                        </label>
                        <input
                          type="text"
                          value={newCardUid}
                          onChange={(e) => setNewCardUid(e.target.value)}
                          className="input input-bordered w-full font-mono uppercase"
                          placeholder="e.g. NEW987XYZ"
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    <div className="modal-action border-t pt-3">
                      <button
                        type="button"
                        onClick={() => { setShowReplaceModal(false); setSelectedUser(null); }}
                        className="btn btn-ghost"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary text-white"
                        disabled={loading}
                      >
                        {loading ? "Re-issuing..." : "Assign & Activate"}
                      </button>
                    </div>
                  </form>
                </div>
              </dialog>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CardManagement;
