'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, User, Clock, Calendar, DoorOpen } from 'lucide-react';
import { ScanResult } from '../lib/useAuthFlow';

interface ResultCardProps {
  result: ScanResult | null;
  state: 'granted' | 'denied';
  onReset: () => void;
}

export const ResultCard = ({ result, state, onReset }: ResultCardProps) => {
  const isGranted = state === 'granted';

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`glass border-2 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden
        ${isGranted ? 'border-success/30 shadow-success/10' : 'border-red-500/30 shadow-red-500/10'}
      `}
    >
      {/* Background Particles (for granted) */}
      {isGranted && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{ 
                '--tx': `${(Math.random() - 0.5) * 200}px`, 
                '--ty': `${(Math.random() - 0.5) * 200}px`,
                left: '50%',
                top: '50%',
                animationDelay: `${Math.random() * 0.5}s`
              } as any} 
            />
          ))}
        </div>
      )}

      <div className="flex flex-col items-center text-center relative z-10">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 
          ${isGranted ? 'bg-success/20 text-success' : 'bg-red-500/20 text-red-500'}
        `}>
          {isGranted ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
        </div>

        <h2 className={`text-3xl font-extrabold mb-2 ${isGranted ? 'text-success' : 'text-red-500'}`}>
          {isGranted ? 'Access Granted!' : 'Access Denied'}
        </h2>
        <p className="text-text-secondary mb-8">
          {isGranted ? 'Authentication successful' : result?.error || 'Invalid QR Code detected'}
        </p>

        {isGranted && result && (
          <div className="w-full space-y-4 text-left border-t border-white/5 pt-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-text-secondary">
                <User className="w-4 h-4" />
                <span className="text-sm">User ID</span>
              </div>
              <span className="text-white font-mono">{result.userId}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-text-secondary">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Time</span>
              </div>
              <span className="text-success font-mono">{result.time}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-text-secondary">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Date</span>
              </div>
              <span className="text-success font-mono">{result.date}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-text-secondary">
                <DoorOpen className="w-4 h-4" />
                <span className="text-sm">Door</span>
              </div>
              <span className="text-white font-medium">{result.door}</span>
            </div>
          </div>
        )}

        <button
          onClick={onReset}
          className={`mt-8 w-full py-4 rounded-xl font-bold transition-all
            ${isGranted ? 'bg-success/20 text-success border border-success/30 hover:bg-success/30' : 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30'}
          `}
        >
          {isGranted ? 'Scan Again' : 'Try Again'}
        </button>
      </div>
    </motion.div>
  );
};
