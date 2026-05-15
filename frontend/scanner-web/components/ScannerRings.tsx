'use client';

import { QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthState } from '../lib/useAuthFlow';

interface ScannerRingsProps {
  state: AuthState;
}

export const ScannerRings = ({ state }: ScannerRingsProps) => {
  const isVerifying = state === 'verifying';
  const isScanning = state === 'scanning';
  
  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      {/* Ripple Rings */}
      <div className={`absolute inset-0 rounded-full border-2 border-primary/40 animate-ripple ${isVerifying ? 'animate-[ripple_1s_infinite]' : ''}`} 
           style={{ animationDelay: '0s' }} 
      />
      <div className={`absolute inset-0 rounded-full border-2 border-primary/30 animate-ripple ${isVerifying ? 'animate-[ripple_0.8s_infinite]' : ''}`} 
           style={{ animationDelay: '0.5s' }} 
      />
      <div className={`absolute inset-0 rounded-full border-2 border-primary/20 animate-ripple ${isVerifying ? 'animate-[ripple_0.6s_infinite]' : ''}`}
           style={{ animationDelay: '1s' }}
      />
      
      {/* Center Circle */}
      <div className={`relative w-48 h-48 rounded-full flex items-center justify-center glass border border-primary/30 shadow-[0_0_40px_rgba(59,130,246,0.2)] transition-all duration-500
        ${isVerifying ? 'scale-110 border-purple-500/50 shadow-purple-500/30' : ''}
      `}>
        {/* Rotating Border */}
        <div className="absolute inset-2 rounded-full border border-dashed border-primary/40 animate-[spin_10s_linear_infinite]" />
        
        {isVerifying ? (
          <div className="relative">
             <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-10 h-10 bg-primary/20 blur-xl rounded-full animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <QrCode className={`w-20 h-20 text-primary transition-all duration-300 ${isScanning ? 'scale-90 opacity-50' : 'scale-100'}`} />
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '12px 12px' }} 
            />
          </div>
        )}

        {/* Glow inner */}
        <div className="absolute inset-0 bg-primary/5 rounded-full pointer-events-none" />
      </div>
    </div>
  );
};
