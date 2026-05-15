'use client';

import { NavBar } from '@/components/NavBar';
import { LeftPanel } from '@/components/LeftPanel';
import { AuthCard } from '@/components/AuthCard';
import { DoorSelectModal } from '@/components/DoorSelectModal';
import QRScanner from '@/components/QRScanner';
import { useAuthFlow } from '@/lib/useAuthFlow';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const {
    state,
    selectedDoor,
    result,
    startScan,
    selectDoor,
    cancelSelection,
    handleScanSuccess,
    reset
  } = useAuthFlow();

  return (
    <main className="min-h-screen relative flex flex-col">
      <NavBar />
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row pt-16">
        <LeftPanel />
        <AuthCard 
          state={state} 
          result={result} 
          onStartScan={startScan} 
          onReset={reset} 
        />
      </div>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-text-secondary text-sm glass border-t border-white/5 relative z-10">
        <p>
          © 2024 QR Auth System | <span className="text-white">Secure.</span> <span className="text-primary">Fast.</span> <span className="text-primary-light">Easy.</span>
        </p>
      </footer>

      {/* Overlays */}
      <DoorSelectModal 
        isOpen={state === 'door-select'} 
        onSelect={selectDoor} 
        onClose={cancelSelection} 
      />

      <AnimatePresence>
        {state === 'scanning' && selectedDoor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <QRScanner 
              doorName={selectedDoor} 
              onScan={handleScanSuccess} 
              onCancel={cancelSelection} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}