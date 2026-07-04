import React from "react";
import { FaShieldAlt, FaClock, FaExclamationCircle, FaCheckCircle, FaBan } from "react-icons/fa";

const SecurityStatusWidget = ({ status = "active", lastAccess = "N/A", failedAttempts = 0 }) => {
  const isSuspicious = failedAttempts > 3;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
          <FaShieldAlt className="text-indigo-600" />
          Security Status
        </h3>
        {isSuspicious && (
          <span className="text-[10px] uppercase font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <FaExclamationCircle /> Action Required
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Card Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              status === "active" ? "bg-emerald-100 text-emerald-600" :
              status === "suspended" ? "bg-amber-100 text-amber-600" :
              "bg-rose-100 text-rose-600"
            }`}>
              {status === "active" ? <FaCheckCircle size={14} /> : <FaBan size={14} />}
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Card Status</p>
              <p className="text-sm font-extrabold text-slate-800 capitalize">{status}</p>
            </div>
          </div>
        </div>

        {/* Last Access */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <FaClock size={14} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Last Access</p>
              <p className="text-sm font-bold text-slate-700">{lastAccess}</p>
            </div>
          </div>
        </div>

        {/* Failed Attempts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              failedAttempts > 0 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"
            }`}>
              <FaExclamationCircle size={14} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Failed Attempts</p>
              <p className={`text-sm font-extrabold ${failedAttempts > 0 ? "text-rose-600" : "text-slate-700"}`}>
                {failedAttempts} {failedAttempts === 1 ? "attempt" : "attempts"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityStatusWidget;
