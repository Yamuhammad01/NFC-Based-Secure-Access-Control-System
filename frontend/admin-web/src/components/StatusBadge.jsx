import React from "react";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    bg: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    bg: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-rose-100 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  expired: {
    label: "Expired",
    bg: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
  },
};

const StatusBadge = ({ status = "pending", size = "sm", showDot = true }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  const sizeClasses = {
    sm: "text-[10px] px-2.5 py-1",
    md: "text-xs px-3 py-1.5",
    lg: "text-sm px-4 py-2",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-extrabold uppercase tracking-wide rounded-full border ${config.bg} ${sizeClasses[size]}`}
    >
      {showDot && <span className={`rounded-full ${config.dot} ${dotSizes[size]}`} />}
      {config.label}
    </span>
  );
};

export default StatusBadge;