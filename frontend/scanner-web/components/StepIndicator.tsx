'use client';

import { motion } from 'framer-motion';
import { QrCode, Lock, CheckCircle2 } from 'lucide-react';
import { AuthState } from '../lib/useAuthFlow';

interface StepIndicatorProps {
  state: AuthState;
}

export const StepIndicator = ({ state }: StepIndicatorProps) => {
  const getStepStatus = (step: number) => {
    if (step === 1) {
      if (['idle', 'door-select', 'scanning'].includes(state)) return 'active';
      return 'completed';
    }
    if (step === 2) {
      if (['verifying'].includes(state)) return 'active';
      if (['granted'].includes(state)) return 'completed';
      return 'idle';
    }
    if (step === 3) {
      if (['granted'].includes(state)) return 'completed';
      return 'idle';
    }
    return 'idle';
  };

  const steps = [
    { id: 1, label: 'Scan QR', icon: <QrCode className="w-5 h-5" /> },
    { id: 2, label: 'Verifying', icon: <Lock className="w-5 h-5" /> },
    { id: 3, label: 'Access Granted', icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  return (
    <div className="w-full flex items-center justify-between px-4 lg:px-20 mb-12">
      {steps.map((step, idx) => {
        const status = getStepStatus(step.id);
        const isActive = status === 'active';
        const isCompleted = status === 'completed';

        return (
          <div key={step.id} className="flex-1 flex items-center relative">
            <div className="flex flex-col items-center z-10">
              <motion.div
                animate={{
                  backgroundColor: isCompleted ? '#22c55e' : isActive ? '#3b82f6' : 'rgba(30, 41, 59, 0.5)',
                  borderColor: isCompleted ? '#22c55e' : isActive ? '#3b82f6' : 'rgba(71, 85, 105, 0.3)',
                  scale: isActive ? 1.1 : 1,
                }}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 shadow-lg ${isActive ? 'animate-step-glow' : ''}`}
              >
                <div className={`${isCompleted || isActive ? 'text-white' : 'text-slate-500'}`}>
                  {step.icon}
                </div>
              </motion.div>
              <span className={`mt-2 text-xs font-medium uppercase tracking-wider ${isActive || isCompleted ? 'text-white' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div className="flex-1 h-[2px] bg-slate-800 mx-2 -translate-y-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: isCompleted ? '100%' : '0%',
                    backgroundColor: isCompleted ? '#22c55e' : '#3b82f6'
                  }}
                  className="h-full"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
