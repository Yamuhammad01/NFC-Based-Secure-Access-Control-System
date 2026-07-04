import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../../component/DashboardLayout";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCamera,
  FaSave,
  FaTimes,
  FaEdit,
  FaLock,
  FaShieldAlt,
  FaIdBadge,
  FaCheckCircle,
  FaSpinner,
  FaWifi,
} from "react-icons/fa";
import { getProfile, updateProfile, addProfilePhoto } from "../../../Api/authService";

// ─── Read-only locked field ───────────────────────────────────────────────────
const LockedField = ({ icon, label, value }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
      {icon}
      {label}
      <FaLock size={9} className="text-slate-300 ml-1" />
    </label>
    <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 cursor-not-allowed">
      <span className="text-sm font-bold text-slate-400 font-mono truncate">{value || "—"}</span>
      <span className="ml-auto text-[9px] font-extrabold uppercase text-slate-300 tracking-widest flex-shrink-0">
        Locked
      </span>
    </div>
  </div>
);

// ─── Editable field ───────────────────────────────────────────────────────────
const EditableField = ({ icon, label, name, type = "text", value, onChange, disabled, placeholder, error }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
      {icon}
      {label}
    </label>
    <div className={`relative flex items-center rounded-xl border transition-all ${
      error ? "border-rose-400 bg-rose-50/30" :
      disabled ? "border-slate-200 bg-slate-50" :
      "border-slate-200 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100"
    }`}>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={disabled ? "" : placeholder}
        className="w-full px-4 py-3 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none disabled:cursor-not-allowed disabled:text-slate-500 rounded-xl"
      />
    </div>
    {error && (
      <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
        <FaTimes size={9} /> {error}
      </p>
    )}
  </div>
);

// ─── Toast component ──────────────────────────────────────────────────────────
const Toast = ({ visible, type, message, onClose }) => {
  if (!visible) return null;
  const isSuccess = type === "success";
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border transition-all animate-[fadeIn_0.2s_ease-out] max-w-sm ${
      isSuccess
        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
        : "bg-rose-50 border-rose-200 text-rose-800"
    }`}>
      {isSuccess
        ? <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
        : <FaTimes className="text-rose-500 flex-shrink-0" />
      }
      <p className="text-sm font-semibold flex-1">{message}</p>
      <button onClick={onClose} className="text-current opacity-50 hover:opacity-100 flex-shrink-0">
        <FaTimes size={12} />
      </button>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Settings() {
  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [editing, setEditing]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [toast, setToast]           = useState(null);
  const fileInputRef                = useRef(null);

  // Editable form state
  const [form, setForm] = useState({ email: "", phone: "" });
  const [errors, setErrors]  = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile]       = useState(null);

  // ── Load profile ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
      setForm({
        email: data.email || "",
        phone: data.phone || "",
      });
    } catch {
      // Fallback mock
      const mock = {
        firstName:   "John",
        lastName:    "Doe",
        email:       "john.doe@university.edu",
        phone:       "+234 801 234 5678",
        staffId:     "ST2026001",
        role:        "Staff",
        accessLevel: 2,
        uid:         "NFC-88A-92F",
        department:  "Registry & Academic Affairs",
        profilePhoto: null,
      };
      setProfile(mock);
      setForm({ email: mock.email, phone: mock.phone });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message, visible: true });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRe.test(form.email))
      e.email = "Please enter a valid email address.";
    if (form.phone && !/^[+\d\s\-()]{7,20}$/.test(form.phone))
      e.phone = "Please enter a valid phone number.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save info ───────────────────────────────────────────────────────────────
  const handleSave = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await updateProfile({ email: form.email, phone: form.phone });
      await fetchProfile();
      window.dispatchEvent(new CustomEvent("profileUpdated"));
      setEditing(false);
      showToast("success", "Personal information updated successfully!");
    } catch {
      showToast("error", "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Photo handling ──────────────────────────────────────────────────────────
  const handlePhotoChange = (ev) => {
    const file = ev.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToast("error", "Please select a JPEG, PNG, or WebP image."); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Image must be under 5 MB."); return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setUploading(true);
    try {
      await addProfilePhoto(photoFile);
      await fetchProfile();
      window.dispatchEvent(new CustomEvent("profileUpdated"));
      setPhotoFile(null);
      setPhotoPreview(null);
      showToast("success", "Profile photo updated successfully!");
    } catch {
      showToast("error", "Photo upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const cancelPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancel = () => {
    setEditing(false);
    setErrors({});
    if (profile) setForm({ email: profile.email || "", phone: profile.phone || "" });
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout role="staff">
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
          <span className="loading loading-spinner loading-lg text-teal-500" />
          <p className="text-gray-500 text-sm font-semibold animate-pulse">Loading profile…</p>
        </div>
      </DashboardLayout>
    );
  }

  const fullName = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "User";
  const initials = `${(profile?.firstName || "U")[0]}${(profile?.lastName || "")[0] || ""}`.toUpperCase();
  const currentPhoto = photoPreview || profile?.profilePhoto;

  return (
    <DashboardLayout role="staff">
      <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-8">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl shadow-xl border border-teal-800/20 mb-8 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white/10 shadow-xl">
                {currentPhoto ? (
                  <img src={currentPhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-2xl font-black text-white">{initials}</span>
                  </div>
                )}
              </div>
              {/* Camera overlay */}
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-teal-500 hover:bg-teal-400 rounded-xl flex items-center justify-center cursor-pointer shadow-md transition-colors"
                title="Change photo"
              >
                <FaCamera className="text-white" size={13} />
              </label>
              <input
                id="avatar-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-white">{fullName}</h1>
              <p className="text-teal-200/80 text-sm font-medium mt-0.5">{profile?.department}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-[10px] bg-white/10 text-white font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wide border border-white/15">
                  {profile?.role || "Staff"}
                </span>
                <span className="text-[10px] bg-white/10 text-white font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wide border border-white/15 font-mono">
                  {profile?.staffId}
                </span>
              </div>
            </div>

            {/* Edit toggle */}
            <div className="sm:ml-auto">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all"
                >
                  <FaEdit /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-extrabold px-5 py-2.5 rounded-xl border border-white/20 transition-all"
                >
                  <FaTimes /> Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT: Profile photo upload ──────────────────────────────────── */}
          <div className="space-y-6">

            {/* Photo card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
                  <FaCamera className="text-teal-500" /> Profile Picture
                </h3>
              </div>

              <div className="p-6 text-center">
                {/* Large preview */}
                <div className="w-28 h-28 rounded-2xl overflow-hidden mx-auto mb-4 border-2 border-slate-200 shadow-md">
                  {currentPhoto ? (
                    <img src={currentPhoto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-3xl font-black text-white">{initials}</span>
                    </div>
                  )}
                </div>

                {/* File selected state */}
                {photoFile ? (
                  <div className="space-y-3">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-left">
                      <p className="text-xs font-bold text-slate-700 truncate">{photoFile.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {(photoFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePhotoUpload}
                        disabled={uploading}
                        className="btn flex-1 bg-teal-500 hover:bg-teal-600 border-none text-white font-extrabold rounded-xl text-xs"
                      >
                        {uploading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                        {uploading ? "Uploading…" : "Upload"}
                      </button>
                      <button
                        onClick={cancelPhoto}
                        disabled={uploading}
                        className="btn btn-ghost flex-1 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="avatar-upload"
                    className="flex flex-col items-center gap-2 cursor-pointer p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all"
                  >
                    <FaCamera className="text-slate-400 text-xl" />
                    <span className="text-xs font-bold text-slate-500">Click to change photo</span>
                    <span className="text-[10px] text-slate-400">JPEG, PNG, WebP · Max 5 MB</span>
                  </label>
                )}
              </div>
            </div>

            {/* NFC card mini-visual */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                Your NFC Card
              </h3>
              <div className="relative rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 p-4 text-white border border-slate-800 shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[8px] tracking-[0.2em] font-extrabold text-indigo-300 uppercase">
                    University Smart ID
                  </span>
                  <FaWifi className="rotate-90 text-indigo-300 text-xs" />
                </div>
                <div className="w-7 h-5 rounded bg-gradient-to-br from-amber-300 to-amber-500 mb-3 shadow-inner" />
                <p className="font-mono text-xs font-bold text-white/80 tracking-widest">
                  {profile?.uid
                    ? `${profile.uid.slice(0, 4)} •••• ${profile.uid.slice(-4)}`
                    : "•••• •••• ••••"}
                </p>
                <div className="flex justify-between mt-2 text-[8px] text-indigo-200/60 font-bold uppercase">
                  <span>{fullName}</span>
                  <span>{profile?.staffId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Form panels ──────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Editable fields panel ─────────────────────────────────────── */}
            <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
                  <FaEdit className="text-teal-500" /> Personal Information
                </h3>
                {editing && (
                  <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wide">
                    Editing
                  </span>
                )}
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Email — editable */}
                <div className="sm:col-span-2">
                  <EditableField
                    icon={<FaEnvelope size={10} />}
                    label="Email Address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, email: "" })); }}
                    disabled={!editing}
                    placeholder="your.email@university.edu"
                    error={errors.email}
                  />
                </div>

                {/* Phone — editable */}
                <div className="sm:col-span-2">
                  <EditableField
                    icon={<FaPhone size={10} />}
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => { setForm((p) => ({ ...p, phone: e.target.value })); setErrors((p) => ({ ...p, phone: "" })); }}
                    disabled={!editing}
                    placeholder="+234 801 234 5678"
                    error={errors.phone}
                  />
                </div>
              </div>

              {/* Save footer */}
              {editing && (
                <div className="px-6 pb-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-ghost flex-1 rounded-xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50"
                  >
                    <FaTimes /> Discard
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn flex-1 bg-teal-500 hover:bg-teal-600 border-none text-white font-extrabold rounded-xl shadow-sm disabled:opacity-50"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <FaSpinner className="animate-spin" /> Saving…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <FaSave /> Save Changes
                      </span>
                    )}
                  </button>
                </div>
              )}
            </form>

            {/* ── Read-only locked fields panel ─────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
                  <FaLock className="text-slate-400" /> System-Managed Fields
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wide border border-slate-200">
                  Read Only
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <LockedField icon={<FaWifi size={9} className="rotate-90" />} label="Card UID"       value={profile?.uid} />
                <LockedField icon={<FaIdBadge size={9} />}                    label="Staff ID"       value={profile?.staffId} />
                <LockedField icon={<FaUser size={9} />}                       label="Role"           value={profile?.role} />
                <LockedField icon={<FaShieldAlt size={9} />}                  label="Access Level"   value={profile?.accessLevel ? `Level ${profile.accessLevel}` : "—"} />
              </div>

              <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 flex items-start gap-2.5">
                <FaShieldAlt className="text-slate-400 flex-shrink-0 mt-0.5 text-xs" />
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  These fields are controlled by the university registry office and cannot be
                  changed by users. Contact registry services to request modifications.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Toast notification ──────────────────────────────────────────────── */}
      <Toast
        visible={toast?.visible}
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />
    </DashboardLayout>
  );
}