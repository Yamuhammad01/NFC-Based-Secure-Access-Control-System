import React, { useState } from "react";
import { 
  FaWifi, 
  FaCopy, 
  FaCheck, 
  FaExclamationTriangle, 
  FaRegCalendarAlt, 
  FaShieldAlt, 
  FaEye, 
  FaEyeSlash 
} from "react-icons/fa";

const NfcCardWidget = ({ 
  uid = "04AA92FB2233", 
  status = "active", 
  issuedDate = "12 Jan 2026", 
  expiryDate = "12 Jan 2030",
  accessLevel = 2
}) => {
  const [copied, setCopied] = useState(false);
  const [revealUid, setRevealUid] = useState(false);

  // Helper to mask Card UID securely: e.g. 04AA****2233
  const getMaskedUid = (rawUid) => {
    if (!rawUid) return "•••• •••• ••••";
    const clean = rawUid.replace(/[\s-]/g, "");
    if (clean.length <= 8) return `${clean}••••`;
    return `${clean.slice(0, 4)} •••• •••• ${clean.slice(-4)}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Status color mappings as strictly requested:
  // Green = Active, Yellow = Suspended, Red = Revoked
  const getStatusConfig = (currentStatus) => {
    switch (currentStatus?.toLowerCase()) {
      case "active":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500 shadow-emerald-500/50",
          cardIndicator: "from-emerald-500/20 to-teal-500/20 ring-emerald-500",
          label: "Active"
        };
      case "suspended":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500 shadow-amber-500/50",
          cardIndicator: "from-amber-500/20 to-orange-500/20 ring-amber-500",
          label: "Suspended"
        };
      case "revoked":
      default:
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500 shadow-rose-500/50",
          cardIndicator: "from-rose-500/20 to-red-500/20 ring-rose-500",
          label: "Revoked"
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FaShieldAlt className="text-indigo-600" />
            Smart NFC Access Card
          </h3>
          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusConfig.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`}></span>
            {statusConfig.label}
          </span>
        </div>

        {/* 3D GLASSMORPHIC PLASTIC UNIVERSITY BADGE */}
        <div className={`relative overflow-hidden aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 p-6 text-white shadow-lg border border-slate-800 transition-all duration-300 hover:shadow-xl group ring-1 ${statusConfig.cardIndicator}`}>
          
          {/* Decorative Card Circuit Lines Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="flex justify-between items-start h-full flex-col">
            
            {/* Top row: Brand & Wireless NFC Icon */}
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] tracking-[0.25em] font-extrabold text-indigo-300 uppercase">
                University Smart ID
              </span>
              <div className="flex items-center gap-2">
                <FaWifi className="rotate-90 text-indigo-300 text-lg group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-bold text-indigo-200/80 tracking-widest uppercase">NFC</span>
              </div>
            </div>

            {/* Middle row: Gold Smart Chip Vector & Card UID */}
            <div className="w-full my-3">
              {/* Gold Chip */}
              <div className="w-10 h-8 rounded bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border border-amber-200 shadow-inner mb-4 relative overflow-hidden flex flex-col justify-between p-1 opacity-90">
                <div className="w-full h-[1px] bg-amber-700/30"></div>
                <div className="w-full h-[1px] bg-amber-700/30"></div>
                <div className="w-[1px] h-full bg-amber-700/30 absolute left-1/3 top-0"></div>
                <div className="w-[1px] h-full bg-amber-700/30 absolute left-2/3 top-0"></div>
              </div>

              {/* Masked / Raw UID */}
              <div className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg p-2.5 transition-colors border border-white/5 group/uid">
                <span className="font-mono text-base tracking-wider sm:text-lg font-bold text-slate-100 select-all">
                  {revealUid ? uid : getMaskedUid(uid)}
                </span>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setRevealUid(!revealUid)}
                    className="p-1 hover:text-indigo-300 text-slate-400 transition-colors"
                    title={revealUid ? "Mask UID" : "Reveal Raw UID"}
                  >
                    {revealUid ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                  <button 
                    onClick={handleCopy}
                    className="p-1 hover:text-indigo-300 text-slate-400 transition-colors relative"
                    title="Copy UID"
                  >
                    {copied ? <FaCheck size={14} className="text-emerald-400" /> : <FaCopy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Holder Access Level info */}
            <div className="flex justify-between items-end w-full text-[10px] text-indigo-200/80 font-bold uppercase tracking-wider">
              <div>
                <p className="text-[8px] text-indigo-400 font-semibold mb-0.5">Access Level</p>
                <p className="text-white font-extrabold text-xs">Level {accessLevel}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-indigo-400 font-semibold mb-0.5">Secure Protocol</p>
                <p className="text-white font-extrabold text-xs">DESFire EV3</p>
              </div>
            </div>

          </div>
        </div>

        {/* METADATA SPECIFICATIONS TABLE */}
        <div className="mt-6 space-y-3.5 border-t border-slate-100 pt-5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 font-bold uppercase flex items-center gap-1.5">
              <FaRegCalendarAlt className="text-slate-400" /> Issued
            </span>
            <span className="text-slate-800 font-extrabold">{issuedDate}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 font-bold uppercase flex items-center gap-1.5">
              <FaRegCalendarAlt className="text-slate-400" /> Expires
            </span>
            <span className="text-slate-800 font-extrabold">{expiryDate || "Never Expires"}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 font-bold uppercase flex items-center gap-1.5">
              <FaShieldAlt className="text-slate-400" /> Security State
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded capitalize ${statusConfig.bg}`}>
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Warning Tip for Revoked/Suspended cards */}
      {status !== "active" && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
          <FaExclamationTriangle className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] font-semibold text-amber-800 leading-relaxed">
            Your card is currently locked or suspended. Tap events will trigger a security breach log at physical gate points. Contact registry services immediately.
          </p>
        </div>
      )}
    </div>
  );
};

export default NfcCardWidget;
