"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VerifyAccessResponse } from "@/types/access";

export default function ResultPage() {
  const [result, setResult] = useState<VerifyAccessResponse | null>(null);
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem("accessResult");
    if (data) {
      setResult(JSON.parse(data));
      localStorage.removeItem("accessResult");
    }
  }, []);

  if (!result) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
      </main>
    );
  }

  const granted = result.status === "granted";

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">

        {/* Status icon */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center ring-8 
          ${granted
            ? "bg-green-900/40 ring-green-500/20"
            : "bg-red-900/40 ring-red-500/20"
          }`}>
          {granted ? (
            <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        {/* Status label */}
        <div>
          <h1 className={`text-3xl font-bold ${granted ? "text-green-400" : "text-red-400"}`}>
            {granted ? "Access Granted" : "Access Denied"}
          </h1>
          <p className="text-gray-400 mt-2 text-sm">{result.message}</p>
        </div>

        {/* User info card */}
        {(result.user || result.role) && (
          <div className="w-full rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/10">
            {result.user && (
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-gray-400 text-sm">Name</span>
                <span className="text-white font-medium text-sm">{result.user}</span>
              </div>
            )}
            {result.role && (
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-gray-400 text-sm">Role</span>
                <span className="text-white font-medium text-sm">{result.role}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <button
            id="scan-again-btn"
            onClick={() => router.back()}
            className="w-full py-4 rounded-2xl bg-white text-gray-950 font-semibold
                       hover:bg-gray-100 active:scale-[0.98] transition-all"
          >
            Scan Again
          </button>
          <button
            id="go-home-btn"
            onClick={() => router.push("/")}
            className="w-full py-3 rounded-2xl border border-white/15 text-gray-300 text-sm font-medium
                       hover:bg-white/5 active:scale-[0.98] transition-all"
          >
            Change Door
          </button>
        </div>
      </div>
    </main>
  );
}