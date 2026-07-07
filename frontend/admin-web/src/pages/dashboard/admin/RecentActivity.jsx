import React from "react";

const RecentActivity = ({ activities = [] }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getBadgeColor = (type) => {
    if (type === "access") return "badge-info";
    if (type === "admin") return "badge-warning";
    return "badge-neutral";
  };

  const getActionColor = (action) => {
    const lower = action.toLowerCase();
    if (lower.includes("granted") || lower.includes("create_user") || lower.includes("success")) {
      return "text-emerald-600";
    }
    if (lower.includes("denied") || lower.includes("delete") || lower.includes("revoke")) {
      return "text-rose-600";
    }
    return "text-gray-700";
  };

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md border border-gray-100 h-full">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
          Recent System Activity
          <span className="badge badge-primary badge-sm">Live</span>
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">Latest 5 events from access logs & admin actions</p>
      </div>

      <div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">
            No recent activity recorded.
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.id || index}
              className="px-5 py-3 hover:bg-blue-50/50 transition-colors duration-150"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-snug ${getActionColor(activity.action)}`}>
                    {activity.action}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge badge-xs ${getBadgeColor(activity.type)}`}>
                      {activity.type}
                    </span>
                    {activity.details?.result && (
                      <span className={`text-[10px] font-semibold uppercase ${
                        activity.details.result === "granted" ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {activity.details.result}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-gray-400 whitespace-nowrap mt-0.5">
                  {formatTime(activity.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;