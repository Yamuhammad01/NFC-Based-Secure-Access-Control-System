'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { DoorOpen, Server, Users, Landmark, X } from 'lucide-react';

interface DoorSelectModalProps {
  isOpen: boolean;
  onSelect: (door: string) => void;
  onClose: () => void;
}

const doors = [
  { id: 'main', name: 'Main Entrance', icon: <DoorOpen />, desc: 'Primary entry point' },
  { id: 'server', name: 'Server Room', icon: <Server />, desc: 'High security access' },
  { id: 'conf', name: 'Conference Room', icon: <Users />, desc: 'Public meeting area' },
  { id: 'exec', name: 'Executive Suite', icon: <Landmark />, desc: 'Restricted management' },
];

export const DoorSelectModal = ({ isOpen, onSelect, onClose }: DoorSelectModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] glass border-t border-primary/20 rounded-t-3xl p-8 max-w-4xl mx-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white">Select Access Point</h2>
                <p className="text-text-secondary">Choose the door you wish to authenticate for</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {doors.map((door) => (
                <button
                  key={door.id}
                  onClick={() => onSelect(door.name)}
                  className="flex items-center gap-4 p-6 rounded-2xl glass border border-border/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {door.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{door.name}</h3>
                    <p className="text-text-secondary text-sm">{door.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-semibold"
            >
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
