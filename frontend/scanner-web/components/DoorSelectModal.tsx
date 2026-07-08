'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { DoorOpen, Server, Users, Landmark, X, Building2, BookOpen, UtensilsCrossed, Briefcase, Shield, GraduationCap, XCircle } from 'lucide-react';

interface DoorSelectModalProps {
  isOpen: boolean;
  onSelect: (door: string) => void;
  onClose: () => void;
}

const doors = [
  // General Access
  { id: 'main', name: 'Main Entrance', icon: <DoorOpen />, desc: 'Primary entry point', section: 'General Access' },
  { id: 'library', name: 'University Library', icon: <BookOpen />, desc: 'Reading rooms & archives', section: 'General Access' },
  { id: 'cafeteria', name: 'Cafeteria', icon: <UtensilsCrossed />, desc: 'Dining halls', section: 'General Access' },
  { id: 'medical-centre', name: 'Medical Centre', icon: <Shield />, desc: 'Health services & clinic', section: 'General Access' },
  { id: 'student-affairs', name: 'Student Affairs Office', icon: <Users />, desc: 'Student support services', section: 'General Access' },
  
  // Staff-Only
  { id: 'staff-office', name: 'Staff Office', icon: <Briefcase />, desc: 'Individual staff offices', section: 'Staff Areas' },
  { id: 'dept-office', name: 'Department Office', icon: <Building2 />, desc: 'Department administration', section: 'Staff Areas' },
  { id: 'dept-admin-office', name: 'Department Admin Office', icon: <Building2 />, desc: 'Faculty workspaces', section: 'Staff Areas' },
  { id: 'registry-office', name: 'Registry Office', icon: <Briefcase />, desc: 'Academic records & admissions', section: 'Staff Areas' },
  { id: 'bursary-office', name: 'Bursary Office', icon: <Briefcase />, desc: 'Financial services', section: 'Staff Areas' },
  { id: 'hr-office', name: 'Human Resources Office', icon: <Users />, desc: 'HR & personnel records', section: 'Staff Areas' },
  { id: 'staff-meeting-room', name: 'Staff Meeting Room', icon: <Users />, desc: 'Conference chambers', section: 'Staff Areas' },
  { id: 'senate-building', name: 'Senate Building Offices', icon: <Building2 />, desc: 'Academic planning', section: 'Staff Areas' },
  { id: 'academic-planning', name: 'Academic Planning Office', icon: <Briefcase />, desc: 'Curriculum development', section: 'Staff Areas' },
  
  // Restricted
  { id: 'server-room', name: 'Server Room', icon: <Server />, desc: 'Core infrastructure', section: 'Restricted Areas' },
  { id: 'network-ops', name: 'Network Operations Centre', icon: <Server />, desc: 'Network monitoring hub', section: 'Restricted Areas' },
  { id: 'exam-strong-room', name: 'Examination Strong Room', icon: <Shield />, desc: 'Secure exam materials', section: 'Restricted Areas' },
  { id: 'finance-archives', name: 'Finance Records Archive', icon: <Building2 />, desc: 'Financial records', section: 'Restricted Areas' },
  { id: 'security-control-room', name: 'Security Control Room', icon: <Shield />, desc: 'CCTV & surveillance', section: 'Restricted Areas' },
  { id: 'data-centre', name: 'Data Centre', icon: <Server />, desc: 'Primary data storage', section: 'Restricted Areas' },
  { id: 'vc-office', name: "Vice Chancellor's Office", icon: <Landmark />, desc: 'VC office - permission only', section: 'Restricted Areas' },
  { id: 'senate-chamber', name: 'Senate Chamber', icon: <Landmark />, desc: 'Senate meetings', section: 'Restricted Areas' },
  
  // Student Requestable
  { id: 'lab', name: 'Laboratory', icon: <GraduationCap />, desc: 'Practical work', section: 'Student Access' },
  { id: 'conf', name: 'Conference Room', icon: <Users />, desc: 'Meeting area', section: 'Student Access' },
  { id: 'exec', name: 'Executive Suite', icon: <Landmark />, desc: 'Management area', section: 'Student Access' },
  { id: 'registry-request', name: 'Registry (Student Request)', icon: <Briefcase />, desc: 'Certificate collection', section: 'Student Access' },
  { id: 'bursary-request', name: 'Bursary (Student Request)', icon: <Briefcase />, desc: 'Payment verification', section: 'Student Access' },
  { id: 'exam-office', name: 'Examination Office', icon: <GraduationCap />, desc: 'Exam inquiries', section: 'Student Access' },
  { id: 'ict-support', name: 'ICT Support Centre', icon: <Server />, desc: 'IT support', section: 'Student Access' },
  { id: 'computer-lab', name: 'Computer Laboratory', icon: <GraduationCap />, desc: 'After-hours practical', section: 'Student Access' },
  { id: 'research-lab', name: 'Research Laboratory', icon: <GraduationCap />, desc: 'Final-year projects', section: 'Student Access' },
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
            className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-[60] cursor-default"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] glass border-t border-primary/20 rounded-t-3xl max-w-4xl mx-auto flex flex-col max-h-[90vh]"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 overflow-y-auto">
              {doors.map((door) => (
                <button
                  key={door.id}
                  onClick={() => onSelect(door.id)}
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
