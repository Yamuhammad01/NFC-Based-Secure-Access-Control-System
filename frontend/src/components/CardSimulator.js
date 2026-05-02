import React from 'react';
import { CreditCard, MapPin, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const CARDS = [
  { id: 'student', label: 'Student Card', uid: '04AA112233', color: 'blue' },
  { id: 'staff', label: 'Staff Card', uid: '0499887766', color: 'indigo' },
  { id: 'admin', label: 'Admin Card', uid: '0455667788', color: 'slate' },
  { id: 'invalid', label: 'Invalid Card', uid: '0000000000', color: 'red' },
];

const DOORS = [
  { id: 'MAIN_GATE_01', label: 'Main Gate', location: 'Campus Entrance' },
  { id: 'LAB_01', label: 'Laboratory', location: 'Science Building' },
  { id: 'STAFF_OFFICE_01', label: 'Staff Office', location: 'Admin Block A' },
  { id: 'ADMIN_OFFICE_01', label: 'Admin Office', location: 'Admin Block B' },
  { id: 'SERVER_ROOM_01', label: 'Server Room', location: 'IT Center' },
];

const CardSimulator = ({ onTap, selectedDoor, setSelectedDoor, isLoading }) => {
  return (
    <div className="space-y-8">
      {/* Door Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" />
          Select Access Point
        </label>
        <div className="relative group">
          <select 
            value={selectedDoor.id}
            onChange={(e) => setSelectedDoor(DOORS.find(d => d.id === e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 py-3 px-4 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer"
          >
            {DOORS.map(door => (
              <option key={door.id} value={door.id}>{door.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none group-hover:text-slate-300 transition-colors" />
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Reader ID:</span>
          <span className="text-xs font-mono text-blue-400">{selectedDoor.id}</span>
        </div>
      </div>

      {/* Card Grid */}
      <div className="space-y-4">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <CreditCard className="w-3.5 h-3.5" />
          Simulate Card Tap
        </label>
        <div className="grid gap-4">
          {CARDS.map((card) => (
            <button
              key={card.id}
              disabled={isLoading}
              onClick={() => onTap(card)}
              className={cn(
                "relative overflow-hidden group p-4 rounded-2xl border transition-all duration-300 text-left active:scale-[0.98]",
                card.id === 'invalid' 
                  ? "border-slate-800 bg-slate-900/50 hover:bg-red-900/10 hover:border-red-500/30"
                  : "border-slate-800 bg-slate-900 hover:border-blue-500/30 hover:bg-slate-800/80"
              )}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-200 group-hover:text-white transition-colors">{card.label}</h4>
                  <p className="text-xs font-mono text-slate-500 mt-1">{card.uid}</p>
                </div>
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  card.id === 'invalid' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-400"
                )}>
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              
              {/* Card Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardSimulator;
export { DOORS };
