"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CardSimulator, { DOORS } from '@/components/CardSimulator';
import AuthStatus from '@/components/AuthStatus';
import UserInfo from '@/components/UserInfo';
import LogTable from '@/components/LogTable';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

const BACKEND_URL = "http://localhost:5000/api";

export default function Dashboard() {
  const [selectedDoor, setSelectedDoor] = useState(DOORS[0]);
  const [authStatus, setAuthStatus] = useState('idle'); // idle | processing | done
  const [authResult, setAuthResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ failedToday: 0 });

  // Load logs on mount
  useEffect(() => {
    fetchLogs();
    // Refresh logs periodically
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/access/logs`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setLogs(data);
        // Calculate failed attempts
        const today = new Date().toDateString();
        const failedToday = data.filter(log => 
          log.result === 'denied' && 
          new Date(log.timestamp).toDateString() === today
        ).length;
        setStats({ failedToday });
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const handleTap = async (card) => {
    setAuthStatus('processing');
    setAuthResult(null);

    // Simulate network latency for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const response = await fetch(`${BACKEND_URL}/access/tap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: card.uid,
          readerId: selectedDoor.id,
          door: selectedDoor.label
        })
      });

      const data = await response.json();
      setAuthResult({ ...data, uid: card.uid }); // Merge UID back for display
      setAuthStatus('done');
      
      // Immediate log refresh
      fetchLogs();

      // Reset to idle after 5 seconds
      setTimeout(() => {
        setAuthStatus(prev => prev === 'done' ? 'idle' : prev);
      }, 5000);

    } catch (error) {
      console.error("Tap failed:", error);
      setAuthStatus('idle');
      alert("Network Error: Could not connect to authentication server.");
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-200">
      <Header />

      <main className="flex-1 overflow-hidden p-6 gap-6 grid grid-cols-12 max-w-[1600px] mx-auto w-full">
        
        {/* Left Panel - Control & Input */}
        <div className="col-span-12 lg:col-span-3 space-y-6 flex flex-col">
          <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] flex-1">
            <CardSimulator 
              onTap={handleTap} 
              selectedDoor={selectedDoor}
              setSelectedDoor={setSelectedDoor}
              isLoading={authStatus === 'processing'}
            />
          </section>

          {/* Alert Panel */}
          <section className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl flex items-start gap-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest">Time Restriction</h4>
              <p className="text-[10px] font-bold text-amber-600/80 mt-1 leading-relaxed">
                Lab Access Restricted<br />
                Available: 08:00 – 18:00
              </p>
            </div>
          </section>
        </div>

        {/* Center Panel - Main Verification Engine */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
          <section className="flex-1">
            <AuthStatus 
              status={authStatus} 
              result={authResult} 
              door={selectedDoor}
            />
          </section>

          {/* Quick Logs Summary or Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Failed Attempts Today</p>
                <p className="text-2xl font-black text-white">{stats.failedToday}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Encryption Level</p>
                <p className="text-2xl font-black text-white">AES-256</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - User Meta */}
        <div className="col-span-12 lg:col-span-3">
          <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] h-full">
            <UserInfo result={authResult} status={authStatus} />
          </section>
        </div>

        {/* Bottom Section - Audit Trails (Full Width) */}
        <div className="col-span-12 h-80 min-h-[320px] mt-2">
          <LogTable logs={logs} />
        </div>

      </main>

      {/* Footer / Copyright */}
      <footer className="px-6 py-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-sm border-t border-slate-900">
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
          &copy; 2026 University Security Management Systems. All rights reserved.
        </p>
        <div className="flex gap-4">
          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">v4.2.1-SECURE</span>
          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Node ID: ADM-XP-01</span>
        </div>
      </footer>
    </div>
  );
}
