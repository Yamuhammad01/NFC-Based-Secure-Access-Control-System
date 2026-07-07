import React from "react";

const StatCard = ({ title, value, icon, colorClass, bgClass, delay = 0 }) => {
  return (
    <div
      className="stat bg-white/80 backdrop-blur rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`stat-figure ${colorClass}`}>
        <div className={`p-3 rounded-xl ${bgClass}`}>{icon}</div>
      </div>
      <div className="stat-title text-gray-500 text-xs uppercase tracking-wider font-semibold">
        {title}
      </div>
      <div className={`stat-value text-2xl md:text-3xl font-extrabold ${colorClass}`}>
        {value ?? "—"}
      </div>
    </div>
  );
};

export default StatCard;