import React from "react";

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // danger, warning, success, info
  loading = false,
  showNotesField = false,
  notesPlaceholder = "Add a note (optional)",
  notesValue = "",
  onNotesChange,
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: "text-rose-500 bg-rose-50",
      button: "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25",
      border: "border-rose-100",
    },
    warning: {
      icon: "text-amber-500 bg-amber-50",
      button: "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/25",
      border: "border-amber-100",
    },
    success: {
      icon: "text-emerald-500 bg-emerald-50",
      button: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25",
      border: "border-emerald-100",
    },
    info: {
      icon: "text-blue-500 bg-blue-50",
      button: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25",
      border: "border-blue-100",
    },
  };

  const style = typeStyles[type] || typeStyles.danger;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className={`px-6 py-5 border-b ${style.border}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.icon}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-extrabold text-lg text-slate-800">{title}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 font-medium leading-relaxed mb-4">
            {message}
          </p>

          {showNotesField && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Review Notes
              </label>
              <textarea
                value={notesValue}
                onChange={(e) => onNotesChange && onNotesChange(e.target.value)}
                placeholder={notesPlaceholder}
                rows={3}
                className="textarea textarea-bordered w-full rounded-xl border-slate-200 text-sm resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-5 pt-3 flex gap-3 border-t border-slate-50 bg-slate-50/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-sm disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 px-5 rounded-xl font-extrabold text-sm transition-all disabled:opacity-50 ${style.button}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-xs"></span>
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;