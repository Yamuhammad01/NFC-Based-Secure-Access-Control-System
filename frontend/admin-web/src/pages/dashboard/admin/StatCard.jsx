import React from "react";

const StatCard = ({ title, value, icon, colorClass, bgClass, trend, delay = 0 }) => {
  return (
    <div
      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`p-3 rounded-xl transition-transform group-hover:scale-105 ${bgClass} ${colorClass}`}>
          {icon}
        </div>
        {trend && (
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              trend.type === "positive"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : trend.type === "negative"
                ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                : "bg-slate-100 text-slate-600 border border-slate-200/60"
            }`}
          >
            {trend.text}
          </span>
        )}
      </div>

      <div>
        <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1">
          {value !== undefined && value !== null ? value.toLocaleString() : "—"}
        </div>
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          {title}
        </p>
      </div>
    </div>
  );
};

export default StatCard;