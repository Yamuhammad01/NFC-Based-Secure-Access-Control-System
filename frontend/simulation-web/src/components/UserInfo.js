import React from 'react';
import { User, Fingerprint, Shield, Activity, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const UserInfo = ({ result, status }) => {
  const hasUser = status === 'done' && result?.status === 'granted' && result.user;
  
  return (
    <div className="space-y-6 h-full flex flex-col">
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
        <Activity className="w-3.5 h-3.5" />
        Verification Payload
      </h3>

      <div className="flex-1 space-y-4">
        {hasUser ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Profile Card */}
            <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-[2rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
              
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-xl mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-xl font-black text-white leading-tight">{result.user}</h4>
                <div className="mt-2 px-4 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{result.role}</span>
                </div>
              </div>
            </div>

            {/* Details List */}
            <div className="grid gap-3">
              <DetailItem icon={Fingerprint} label="UID Reference" value={result.uid || "CONFIDENTIAL"} />
              <DetailItem icon={Shield} label="Security Level" value={`Level ${result.accessLevel || '1'}`} />
              <DetailItem icon={Calendar} label="Status" value="Verified Active" variant="success" />
              <DetailItem icon={Activity} label="Last Checkpoint" value={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 border-2 border-dashed border-slate-800 rounded-[2rem]">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800">
              <Shield className="w-8 h-8 text-slate-700" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">No User Active</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan a valid credential to view personnel information and clearance levels.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-loose text-center">
          Proprietary Intelligence System<br />
          Restricted Access Only
        </p>
      </div>
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value, variant }) => (
  <div className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-800 rounded-xl">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
    <span className={cn(
      "text-xs font-black",
      variant === 'success' ? "text-green-400" : "text-slate-200"
    )}>{value}</span>
  </div>
);

export default UserInfo;
