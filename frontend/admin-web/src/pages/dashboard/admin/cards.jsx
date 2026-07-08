import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../../component/DashboardLayout";
import {
  FaPlus, FaTimes, FaIdCard, FaExchangeAlt, FaShieldAlt,
  FaSync, FaSearch, FaLock, FaUnlock, FaBan, FaCheckCircle,
  FaExclamationTriangle, FaFilter, FaChevronDown, FaUserCircle,
  FaCalendarAlt, FaClock, FaInfoCircle,
} from "react-icons/fa";
import {
  getAllCards, createCard, revokeCard, suspendCard,
  reactivateCard, replaceCard,
} from "../../../Api/cardService";

// ─────────────────────────────────────────────────────────────────────────────
// ── Constants & Helpers
// ─────────────────────────────────────────────────────────────────────────────

const REVOKE_REASONS = [
  { value: "lost",    label: "Lost",    icon: "", color: "text-yellow-600" },
  { value: "stolen",  label: "Stolen",  icon: "", color: "text-red-600"    },
  { value: "damaged", label: "Damaged", icon: "", color: "text-orange-600" },
  { value: "misuse",  label: "Misuse",  icon: "", color: "text-purple-600" },
];

const STATUS_CONFIG = {
  active: {
    label: "Active",
    badgeClass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  revoked: {
    label: "Revoked",
    badgeClass: "bg-red-100 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
  suspended: {
    label: "Suspended",
    badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
  },
};

const fmt = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const fmtTime = (date) =>
  date
    ? new Date(date).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Never";

const getUserDisplayName = (card) => {
  if (card.userRef) {
    const u = card.userRef;
    return u.firstName || u.lastName
      ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
      : u.name || "—";
  }
  return card.name || "—";
};

// ─────────────────────────────────────────────────────────────────────────────
// ── Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Animated status badge with pulsing dot */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.revoked;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badgeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === "active" ? "animate-pulse" : ""}`} />
      {cfg.label}
    </span>
  );
};

/** Toast notification */
const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      className={`fixed top-5 right-5 z-[9999] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl max-w-sm
        ${isError ? "bg-red-600" : "bg-emerald-600"} text-white animate-[slideInRight_0.3s_ease-out]`}
    >
      <span className="text-xl mt-0.5">{isError ? "" : ""}</span>
      <div className="flex-1">
        <p className="font-semibold text-sm leading-snug">{toast.message}</p>
      </div>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity ml-2">
        <FaTimes size={12} />
      </button>
    </div>
  );
};

/** Stat card widget */
const StatCard = ({ label, value, icon, colorClass, bgClass }) => (
  <div className={`rounded-2xl p-5 flex items-center justify-between shadow-sm border border-white/60 ${bgClass}`}>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-extrabold mt-1 ${colorClass}`}>{value}</p>
    </div>
    <div className={`p-3 rounded-xl ${bgClass} shadow-inner`}>{icon}</div>
  </div>
);

/** Reusable confirm modal  */
const ConfirmModal = ({ open, onClose, onConfirm, title, children, confirmLabel = "Confirm", confirmClass = "bg-red-600 hover:bg-red-700", loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeInScale_0.2s_ease-out]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
            <FaTimes size={14} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 py-3 rounded-xl font-bold text-white transition-colors text-sm ${confirmClass} disabled:opacity-50`}>
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ── Main Component
// ─────────────────────────────────────────────────────────────────────────────

const CardManagement = () => {
  // ── Data
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // ── Toast
  const [toast, setToast] = useState(null);

  // ── Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Modal states
  const [modal, setModal] = useState(null); // { type: 'revoke'|'suspend'|'reactivate'|'replace'|'issue', card }

  // ── Form state
  const [revokeReason, setRevokeReason] = useState("lost");
  const [newUid, setNewUid] = useState("");
  const [issueForm, setIssueForm] = useState({
    name: "", uid: "", role: "student", accessLevel: 1,
    allowedTime: { start: "08:00", end: "18:00" },
  });

  // ── Helpers
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const closeModal = () => {
    setModal(null);
    setRevokeReason("lost");
    setNewUid("");
  };

  // ── Fetch
  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const data = await getAllCards();
      setCards(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err?.response?.data?.message || err?.message || "Failed to load cards.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  // ── Stats
  const stats = {
    total: cards.length,
    active: cards.filter((c) => c.status === "active").length,
    revoked: cards.filter((c) => c.status === "revoked").length,
    suspended: cards.filter((c) => c.status === "suspended").length,
  };

  // ── Filtered cards
  const filtered = cards.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.uid?.toLowerCase().includes(q) ||
      getUserDisplayName(c).toLowerCase().includes(q) ||
      c.userRef?.staffId?.toLowerCase().includes(q) ||
      c.userRef?.department?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ─────────────────────────────────────────────────────────────────────
  // ── Action Handlers
  // ─────────────────────────────────────────────────────────────────────

  const handleRevoke = async () => {
    if (!modal?.card) return;
    try {
      setActionLoading(true);
      const res = await revokeCard(modal.card.id, revokeReason);
      showToast(res.message || "Card revoked successfully.");
      await fetchCards();
      closeModal();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to revoke card.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!modal?.card) return;
    try {
      setActionLoading(true);
      const res = await suspendCard(modal.card.id);
      showToast(res.message || "Card suspended successfully.");
      await fetchCards();
      closeModal();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to suspend card.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!modal?.card) return;
    try {
      setActionLoading(true);
      const res = await reactivateCard(modal.card.id);
      showToast(res.message || "Card reactivated successfully.");
      await fetchCards();
      closeModal();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to reactivate card.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplace = async () => {
    if (!modal?.card || !newUid.trim()) {
      showToast("Please enter the new card UID.", "error");
      return;
    }
    try {
      setActionLoading(true);
      const res = await replaceCard(modal.card.id, newUid.trim());
      showToast(res.message || "Card replaced successfully.");
      await fetchCards();
      closeModal();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to replace card.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueCard = async (e) => {
    e.preventDefault();
    if (!issueForm.name.trim() || !issueForm.uid.trim()) {
      showToast("Name and Card UID are required.", "error");
      return;
    }
    try {
      setActionLoading(true);
      const res = await createCard(issueForm);
      showToast(res.message || "Card issued successfully.");
      await fetchCards();
      closeModal();
      setIssueForm({ name: "", uid: "", role: "student", accessLevel: 1, allowedTime: { start: "08:00", end: "18:00" } });
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to issue card.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // ── Render
  // ─────────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <style>{`
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      {/* ── Toast ── */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <FaIdCard className="text-emerald-600" />
              NFC Card Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Issue, replace, revoke, suspend, and reactivate physical access cards
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchCards}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm font-semibold shadow-sm transition-all"
            >
              <FaSync className={loading ? "animate-spin" : ""} size={13} />
              Refresh
            </button>
            <button
              onClick={() => setModal({ type: "issue" })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition-all"
            >
              <FaPlus size={13} />
              Issue Card
            </button>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Cards" value={stats.total} colorClass="text-gray-800"
            bgClass="bg-white" icon={<FaIdCard className="text-gray-500 text-xl" />} />
          <StatCard label="Active" value={stats.active} colorClass="text-emerald-600"
            bgClass="bg-emerald-50" icon={<FaCheckCircle className="text-emerald-500 text-xl" />} />
          <StatCard label="Revoked" value={stats.revoked} colorClass="text-red-600"
            bgClass="bg-red-50" icon={<FaBan className="text-red-500 text-xl" />} />
          <StatCard label="Suspended" value={stats.suspended} colorClass="text-amber-600"
            bgClass="bg-amber-50" icon={<FaLock className="text-amber-500 text-xl" />} />
        </div>

        {/* ── Toolbar ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            <input
              type="text"
              placeholder="Search by UID, name, staff ID or department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
          </div>
          {/* Status filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="revoked">Revoked</option>
              <option value="suspended">Suspended</option>
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={10} />
          </div>
          {/* Result count */}
          <div className="flex items-center px-3 text-sm text-gray-400 font-medium">
            {filtered.length} card{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* ── Main Table ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading && cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm font-medium animate-pulse">Synchronising card directory…</p>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
              <FaExclamationTriangle className="text-red-400 text-4xl" />
              <div>
                <p className="font-bold text-gray-700">Failed to load cards</p>
                <p className="text-sm text-gray-400 mt-1">{fetchError}</p>
              </div>
              <button onClick={fetchCards} className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold">
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-gray-200">
                    {["UID", "User", "Status", "Revoke Reason", "Issue Date", "Last Used", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-gray-400">
                        <FaIdCard className="text-5xl mx-auto mb-3 opacity-20" />
                        <p className="font-semibold">No cards found</p>
                        <p className="text-xs mt-1">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((card) => {
                      const user = card.userRef;
                      const displayName = getUserDisplayName(card);
                      const isActive = card.status === "active";
                      const isRevoked = card.status === "revoked";
                      const isSuspended = card.status === "suspended";

                      return (
                        <tr key={card.id || card._id} className="hover:bg-slate-50/70 transition-colors group">
                          {/* UID */}
                          <td className="px-5 py-4">
                            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg tracking-widest uppercase">
                              {card.uid}
                            </span>
                          </td>

                          {/* User */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
                                {user?.profilePhoto ? (
                                  <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <FaUserCircle className="text-white text-base" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm leading-tight">{displayName}</p>
                                {user?.staffId && (
                                  <p className="text-xs text-gray-400 mt-0.5">{user.staffId}</p>
                                )}
                                {user?.department && (
                                  <p className="text-xs text-gray-400">{user.department}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <StatusBadge status={card.status} />
                          </td>

                          {/* Revoke Reason */}
                          <td className="px-5 py-4">
                            {card.revokeReason ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 capitalize">
                                {REVOKE_REASONS.find((r) => r.value === card.revokeReason)?.icon || ""}{" "}
                                {card.revokeReason}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>

                          {/* Issue Date */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                              <FaCalendarAlt size={10} className="text-gray-300" />
                              {fmt(card.issuedDate || card.createdAt)}
                            </div>
                          </td>

                          {/* Last Used */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                              <FaClock size={10} className="text-gray-300" />
                              {fmtTime(card.lastUsed)}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              {/* Replace — always available */}
                              <button
                                onClick={() => setModal({ type: "replace", card })}
                                title="Replace Card"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition-all"
                              >
                                <FaExchangeAlt size={10} /> Replace
                              </button>

                              {/* Revoke — only if not already revoked */}
                              {!isRevoked && (
                                <button
                                  onClick={() => setModal({ type: "revoke", card })}
                                  title="Revoke Card"
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-all"
                                >
                                  <FaBan size={10} /> Revoke
                                </button>
                              )}

                              {/* Suspend — only if active */}
                              {isActive && (
                                <button
                                  onClick={() => setModal({ type: "suspend", card })}
                                  title="Suspend Card"
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100 transition-all"
                                >
                                  <FaLock size={10} /> Suspend
                                </button>
                              )}

                              {/* Reactivate — only if not active */}
                              {!isActive && (
                                <button
                                  onClick={() => setModal({ type: "reactivate", card })}
                                  title="Reactivate Card"
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 transition-all"
                                >
                                  <FaUnlock size={10} /> Reactivate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          ── MODALS
          ════════════════════════════════════════════════════════════════════ */}

      {/* ── Issue New Card Modal ── */}
      {modal?.type === "issue" && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeInScale_0.2s_ease-out]">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                <FaIdCard className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-base">Issue New NFC Card</h3>
                <p className="text-emerald-100 text-xs">Register a physical card in the system</p>
              </div>
              <button onClick={closeModal} className="ml-auto text-white/70 hover:text-white transition-colors">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleIssueCard} className="px-6 py-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Cardholder Name *</label>
                  <input type="text" required value={issueForm.name}
                    onChange={(e) => setIssueForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="e.g. Aisha Bello" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">NFC Card UID *</label>
                  <input type="text" required value={issueForm.uid}
                    onChange={(e) => setIssueForm((f) => ({ ...f, uid: e.target.value.toUpperCase() }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="e.g. A1B2C3D4" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Role</label>
                  <select value={issueForm.role}
                    onChange={(e) => setIssueForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Access Level</label>
                  <select value={issueForm.accessLevel}
                    onChange={(e) => setIssueForm((f) => ({ ...f, accessLevel: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                    <option value={1}>Level 1 — General</option>
                    <option value={2}>Level 2 — Offices</option>
                    <option value={3}>Level 3 — Secure Rooms</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Allowed From</label>
                  <input type="time" value={issueForm.allowedTime.start}
                    onChange={(e) => setIssueForm((f) => ({ ...f, allowedTime: { ...f.allowedTime, start: e.target.value } }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Allowed To</label>
                  <input type="time" value={issueForm.allowedTime.end}
                    onChange={(e) => setIssueForm((f) => ({ ...f, allowedTime: { ...f.allowedTime, end: e.target.value } }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50">
                  {actionLoading ? "Issuing…" : "Issue & Register Card"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Replace Card Modal ── */}
      <ConfirmModal
        open={modal?.type === "replace"}
        onClose={closeModal}
        onConfirm={handleReplace}
        title="Replace NFC Card"
        confirmLabel="Replace & Activate"
        confirmClass="bg-blue-600 hover:bg-blue-700"
        loading={actionLoading}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <FaInfoCircle className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-bold mb-1">What will happen:</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>Old card <span className="font-mono font-bold">{modal?.card?.uid}</span> will be <span className="font-bold">permanently revoked</span></li>
                <li>A new card record will be created for the replacement UID</li>
                <li>The cardholder account will be linked to the new card</li>
                <li>Full replacement history will be recorded</li>
              </ul>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-1">Current cardholder</p>
            <p className="font-bold text-gray-800">{modal?.card ? getUserDisplayName(modal.card) : "—"}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">Current UID: {modal?.card?.uid}</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">New Card UID *</label>
            <input
              type="text" autoFocus required
              value={newUid}
              onChange={(e) => setNewUid(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Scan or type new card UID…"
            />
          </div>
        </div>
      </ConfirmModal>

      {/* ── Revoke Card Modal ── */}
      <ConfirmModal
        open={modal?.type === "revoke"}
        onClose={closeModal}
        onConfirm={handleRevoke}
        title="Revoke Card"
        confirmLabel="Revoke Card"
        confirmClass="bg-red-600 hover:bg-red-700"
        loading={actionLoading}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
            <FaExclamationTriangle className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">
              <p className="font-bold">This action is permanent</p>
              <p className="text-xs mt-1">
                Revoking <span className="font-mono font-bold">{modal?.card?.uid}</span> will immediately block access.
                The card cannot be reactivated — only replaced.
              </p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2">Select Revocation Reason *</label>
            <div className="grid grid-cols-2 gap-2">
              {REVOKE_REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRevokeReason(r.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                    ${revokeReason === r.value
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"}`}
                >
                  <span className="text-base">{r.icon}</span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ConfirmModal>

      {/* ── Suspend Card Modal ── */}
      <ConfirmModal
        open={modal?.type === "suspend"}
        onClose={closeModal}
        onConfirm={handleSuspend}
        title="Suspend Card"
        confirmLabel="Suspend Card"
        confirmClass="bg-amber-500 hover:bg-amber-600"
        loading={actionLoading}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <FaLock className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-bold">Temporary Access Block</p>
              <p className="text-xs mt-1">
                Card <span className="font-mono font-bold">{modal?.card?.uid}</span> will be suspended.
                Access is blocked but the card can be <strong>reactivated</strong> later.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500 font-semibold mb-1">Cardholder</p>
            <p className="font-bold text-gray-800">{modal?.card ? getUserDisplayName(modal.card) : "—"}</p>
          </div>
        </div>
      </ConfirmModal>

      {/* ── Reactivate Card Modal ── */}
      <ConfirmModal
        open={modal?.type === "reactivate"}
        onClose={closeModal}
        onConfirm={handleReactivate}
        title="Reactivate Card"
        confirmLabel="Reactivate Card"
        confirmClass="bg-emerald-600 hover:bg-emerald-700"
        loading={actionLoading}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <FaUnlock className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-800">
              <p className="font-bold">Restore Card Access</p>
              <p className="text-xs mt-1">
                Card <span className="font-mono font-bold">{modal?.card?.uid}</span> will be set back to{" "}
                <strong>Active</strong>. The cardholder will regain full access permissions.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Cardholder</p>
                <p className="font-bold text-gray-800">{modal?.card ? getUserDisplayName(modal.card) : "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-semibold mb-1">Current Status</p>
                {modal?.card && <StatusBadge status={modal.card.status} />}
              </div>
            </div>
          </div>
        </div>
      </ConfirmModal>
    </DashboardLayout>
  );
};

export default CardManagement;
