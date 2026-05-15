'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Info } from 'lucide-react';
import { StepIndicator } from './StepIndicator';
import { ScannerRings } from './ScannerRings';
import { ResultCard } from './ResultCard';
import { AuthState, ScanResult } from '../lib/useAuthFlow';

interface AuthCardProps {
  state: AuthState;
  result: ScanResult | null;
  onStartScan: () => void;
  onReset: () => void;
}

export const AuthCard = ({ state, result, onStartScan, onReset }: AuthCardProps) => {
  const showScanner = ['idle', 'door-select', 'scanning', 'verifying'].includes(state);
  const showResult = ['granted', 'denied'].includes(state);

  return (
    <div className="w-full lg:w-[65%] flex items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-5xl glass-glow glass rounded-[2.5rem] border border-border/30 p-8 lg:p-16 flex flex-col items-center relative overflow-hidden">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Title Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
            QR Authentication
          </h2>
          <p className="text-text-secondary text-lg">
            Scan your QR code to authenticate for access
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator state={state} />

        {/* Main Interaction Area */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 min-h-[400px]">
          <AnimatePresence mode="wait">
            {showScanner && (
              <motion.div
                key="scanner-area"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center"
              >
                <ScannerRings state={state} />
                
                {state === 'idle' && (
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(59,130,246,0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onStartScan}
                    className="mt-8 px-10 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
                  >
                    Click to Scan QR Code
                  </motion.button>
                )}

                {state === 'verifying' && (
                  <p className="mt-8 text-primary font-bold text-xl animate-pulse">
                    Verifying credentials...
                  </p>
                )}
              </motion.div>
            )}

            {showResult && (
              <ResultCard 
                key="result-area"
                state={state as 'granted' | 'denied'} 
                result={result} 
                onReset={onReset} 
              />
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Tip Bar */}
        <div className="mt-16 w-full glass border border-white/5 rounded-2xl p-6 flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
            <Shield className="w-5 h-5" />
          </div>
          <p className="text-text-secondary flex-1">
            <span className="text-primary font-bold mr-2">Tip:</span>
            Keep your QR code steady until authentication is complete.
          </p>
          <Info className="w-5 h-5 text-white/20" />
        </div>
      </div>
    </div>
  );
};
