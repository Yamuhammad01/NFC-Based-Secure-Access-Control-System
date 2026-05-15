import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Cpu, Loader2, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

const AuthStatus = ({ status, result, door }) => {
  const isIdle = status === 'idle';
  const isProcessing = status === 'processing';
  const isGranted = status === 'done' && result?.status === 'granted';
  const isDenied = status === 'done' && result?.status === 'denied';

  return (
    <div className="h-full flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/30">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {isIdle && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
              <div className="relative w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-2xl mx-auto">
                <Cpu className="w-10 h-10 text-blue-400 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">Ready for Verification</h3>
              <p className="text-slate-400 max-w-[240px] mx-auto text-sm leading-relaxed">
                Please place your university access card on the reader to proceed.
              </p>
            </div>
          </motion.div>
        )}

        {isProcessing && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="relative">
              <Loader2 className="w-20 h-20 text-blue-500 animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-6 h-6 text-slate-400" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Reading Card...</h3>
              <p className="text-xs font-mono text-blue-400 uppercase tracking-widest">Encrypting Tunnel</p>
            </div>
          </motion.div>
        )}

        {isGranted && (
          <motion.div
            key="granted"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full h-full flex flex-col items-center justify-center bg-green-500/5"
          >
            <div className="relative mb-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.4)]"
              >
                <Unlock className="w-16 h-16 text-white" />
              </motion.div>
              {/* Particle Effects */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400 rounded-full"
                  animate={{
                    x: Math.cos(i * 60 * Math.PI / 180) * 80,
                    y: Math.sin(i * 60 * Math.PI / 180) * 80,
                    opacity: [1, 0],
                    scale: [1, 0.5]
                  }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
            
            <div className="text-center space-y-2 mb-8">
              <span className="bg-green-500 text-white px-6 py-1.5 rounded-full text-sm font-black uppercase tracking-widest shadow-lg shadow-green-500/20">
                Access Granted
              </span>
              <h3 className="text-3xl font-black text-white mt-4">{result.user}</h3>
              <p className="text-green-400 font-mono text-sm uppercase tracking-wider">{result.role}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm px-6">
              <div className="bg-slate-900/80 border border-green-500/20 p-3 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Location</p>
                <p className="text-sm font-bold text-slate-200 truncate">{door.label}</p>
              </div>
              <div className="bg-slate-900/80 border border-green-500/20 p-3 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Time</p>
                <p className="text-sm font-bold text-slate-200">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </motion.div>
        )}

        {isDenied && (
          <motion.div
            key="denied"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full h-full flex flex-col items-center justify-center bg-red-500/5"
          >
            <div className="relative mb-8">
              <motion.div 
                animate={{ x: [-10, 10, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
                className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.4)]"
              >
                <Lock className="w-16 h-16 text-white" />
              </motion.div>
            </div>
            
            <div className="text-center space-y-4 px-8">
              <span className="bg-red-500 text-white px-6 py-1.5 rounded-full text-sm font-black uppercase tracking-widest shadow-lg shadow-red-500/20">
                Access Denied
              </span>
              <div className="space-y-1 mt-4">
                <h3 className="text-2xl font-black text-white">Authorization Failed</h3>
                <p className="text-red-400 font-bold bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 inline-block">
                  {result.message}
                </p>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-3 text-slate-500 bg-slate-900/50 px-5 py-2.5 rounded-2xl border border-slate-800">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Unauthorized attempt logged</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthStatus;
