'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, User, QrCode } from 'lucide-react';

const features = [
  {
    icon: <Shield className="w-5 h-5 text-primary" />,
    title: 'Secure',
    description: 'Encrypted authentication for maximum security.',
  },
  {
    icon: <Zap className="w-5 h-5 text-primary" />,
    title: 'Fast',
    description: 'Instant verification in just a moment.',
  },
  {
    icon: <User className="w-5 h-5 text-primary" />,
    title: 'Easy',
    description: "Simply scan and you're good to go.",
  },
];

export const LeftPanel = () => {
  return (
    <div className="w-full lg:w-[35%] flex flex-col justify-center p-8 lg:p-12 space-y-12">
      <div className="space-y-4">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-5xl lg:text-6xl font-extrabold text-white leading-tight"
        >
          Secure Access <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
            with QR
          </span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-text-secondary text-lg max-w-md"
        >
          Scan your QR code to authenticate and gain secure access to restricted areas.
        </motion.p>
      </div>

      <div className="space-y-6">
        {features.map((feature, idx) => (
          <motion.div 
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="flex items-start gap-4 group"
          >
            <div className="mt-1 w-10 h-10 rounded-xl glass border border-border/30 flex items-center justify-center group-hover:border-primary/50 transition-colors">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{feature.title}</h3>
              <p className="text-text-secondary text-sm">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative pt-10 flex justify-center lg:justify-start">
        {/* Floating QR Card Animation */}
        <div className="relative w-64 h-40 group">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="animate-float relative w-full h-full glass rounded-2xl border border-primary/30 flex flex-col p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
             {/* Card Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '16px 16px' }} 
            />
            
            <div className="flex justify-between items-start mb-auto relative z-10">
              <QrCode className="w-8 h-8 text-primary/80" />
              <div className="w-10 h-6 bg-white/10 rounded-md border border-white/20" />
            </div>
            
            <div className="mt-auto relative z-10">
              <div className="h-2 w-32 bg-white/20 rounded-full mb-2" />
              <div className="h-2 w-20 bg-white/10 rounded-full" />
            </div>

            {/* Glowing Pulse */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          </div>
          
          {/* Base Platform */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-12 bg-primary/10 rounded-[50%] blur-xl" />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-1 border border-primary/20 rounded-[50%] shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
        </div>
      </div>
    </div>
  );
};
