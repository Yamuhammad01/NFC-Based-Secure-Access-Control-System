'use client';

import { Shield } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const NavBar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass border-b border-border/20 backdrop-blur-md px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div className="flex items-center text-xl font-bold tracking-tight">
          <span className="text-primary mr-1">QR</span>
          <span className="text-white">Auth System</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </nav>
  );
};
