import React from 'react';
import { History, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const LogTable = ({ logs }) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col h-full">
      <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <History className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="font-black text-white tracking-tight uppercase text-sm">Recent Access Audit Logs</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Feed</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-900/90 backdrop-blur-md">
              <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Timestamp</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Personnel</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Role</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Access Point</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 text-right">Clearance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <tr key={log.id || index} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-4">
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-slate-500 transition-colors">
                        <span className="text-[10px] font-bold text-slate-300">{log.userName?.charAt(0) || '?'}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter bg-slate-800 px-2 py-1 rounded">
                      {log.role}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-300">{log.door}</span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{log.readerId}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                        log.result === 'granted' 
                          ? "text-green-400 bg-green-500/5 border-green-500/20" 
                          : "text-red-400 bg-red-500/5 border-red-500/20"
                      )}>
                        {log.result === 'granted' ? 'Authorized' : 'Denied'}
                      </span>
                      {log.result === 'granted' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 text-slate-600">
                    <History className="w-12 h-12 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest">System idle: No recent audit trails</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex justify-center">
        <button className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-blue-400 uppercase tracking-widest transition-colors">
          View Full Encryption Logs
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default LogTable;
