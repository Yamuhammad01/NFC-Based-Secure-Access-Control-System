import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaShieldAlt,
  FaWifi,
  FaLock,
  FaUserShield,
  FaUserTie,
  FaUserGraduate,
  FaCheckCircle,
  FaArrowRight,
  FaExternalLinkAlt,
  FaServer,
  FaClock,
  FaExclamationTriangle,
  FaHistory,
  FaDoorOpen,
  FaPlay,
  FaLayerGroup
} from 'react-icons/fa';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState(0);

  const handleLaunchDemo = (email, password, role) => {
    navigate('/login', {
      state: {
        email,
        password,
        role,
        autoFill: true,
        message: `Auto-filled with ${role.toUpperCase()} credentials. Click Sign In to continue.`,
        type: 'info'
      }
    });
  };

  const demoAccounts = [
    {
      role: 'Admin',
      name: 'System Administrator',
      email: 'admin@university.edu.ng',
      password: 'AdminPassword123!',
      cardUid: 'ADM88888',
      clearance: 'Master Clearance',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: FaUserShield,
      iconColor: 'text-rose-600',
      borderColor: 'border-rose-200 hover:border-rose-400',
      accentBg: 'bg-rose-50',
      btnColor: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
      features: [
        'Real-time Access & Health Overview Dashboard',
        'Full Cardholder CRUD & Lifecycle Management',
        'Instant Remote Card Revocation & Replacement',
        'Temporary Zone Access Ticket Approvals',
        'Immutable Security Audit Log Inspector with Excel Export'
      ]
    },
    {
      role: 'Staff',
      name: 'Dr. Abdullahi Isa (Faculty)',
      email: 'staff@university.edu.ng',
      password: 'StaffPassword123!',
      cardUid: 'STF10001',
      clearance: 'Faculty & Lab Access',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: FaUserTie,
      iconColor: 'text-indigo-600',
      borderColor: 'border-indigo-200 hover:border-indigo-400 ring-2 ring-indigo-500/20',
      accentBg: 'bg-indigo-50',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
      isPopular: true,
      features: [
        'Digital NFC Staff ID Badge with Dynamic QR',
        'Personal Door Tap Logs & Chronological Activity Feed',
        'One-Click Lost/Stolen Card Replacement Request',
        'Temporary Elevated Zone Clearance Request',
        'Security Event Notifications & Access Matrix'
      ]
    },
    {
      role: 'Student',
      name: 'Fatima Aliyu (Undergraduate)',
      email: 'student@university.edu.ng',
      password: 'StudentPassword123!',
      cardUid: 'STD20001',
      clearance: 'Student Schedule Access',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: FaUserGraduate,
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200 hover:border-emerald-400',
      accentBg: 'bg-emerald-50',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
      features: [
        'Student Identification Profile & Digital ID',
        'Time-Windowed Campus Zone Access (Library, Labs)',
        'Personal Access Verification History',
        'Self-Service Lost Card Reporting',
        'Live Permission Scope & Security Alerts'
      ]
    }
  ];

  const scenarios = [
    {
      title: '1. Live NFC Tap & Edge Verification',
      badge: 'Normal Flow',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      summary: 'Test how physical hardware reader terminals verify NFC cards in under 50ms against live RBAC policies.',
      steps: [
        {
          label: 'Launch Scanner Terminal',
          desc: 'Open the deployed Scanner Client terminal at nfc-based-secure-access-control-sys-five.vercel.app.'
        },
        {
          label: 'Select Reader Zone',
          desc: 'Select "RD-001 (Main Gate)" or "RD-003 (Department Lab)".'
        },
        {
          label: 'Simulate NFC Tap',
          desc: 'Enter Staff UID STF10001 or Admin UID ADM88888 and tap.'
        },
        {
          label: 'Edge Result',
          desc: 'Terminal flashes green "ACCESS GRANTED" with audible confirmation and commits an immutable AccessLog entry.'
        }
      ],
      expectedResult: 'HTTP 200 • status: "granted" • Pipeline latency: <45ms'
    },
    {
      title: '2. Strict Anti-Passback & Anti-Tailgating',
      badge: 'Security Violation',
      badgeColor: 'bg-amber-100 text-amber-800',
      summary: 'Prevent tailgating and card-passing by validating that every entry tap has a matching prior exit.',
      steps: [
        {
          label: 'Initial Entry Tap',
          desc: 'Tap card STF10001 at RD-001 with direction "entry" (Access is Granted).'
        },
        {
          label: 'Consecutive Entry Tap',
          desc: 'Without exiting, attempt another "entry" tap with the same card UID.'
        },
        {
          label: 'Engine Detection',
          desc: 'State-aware anti-passback engine evaluates historical directional state and detects duplicate entry.'
        },
        {
          label: 'Edge Result',
          desc: 'Terminal turns red "ACCESS DENIED (anti_passback_violation)" and logs a high-priority security violation.'
        }
      ],
      expectedResult: 'HTTP 403 • status: "denied" • code: "anti_passback_violation"'
    },
    {
      title: '3. Instant Card Revocation & Remote Lockout',
      badge: 'Zero-Downtime Defense',
      badgeColor: 'bg-rose-100 text-rose-800',
      summary: 'Observe how administrative card status changes propagate across readers instantly without terminal restarts.',
      steps: [
        {
          label: 'Log In as Admin',
          desc: 'Access the Admin Dashboard using admin@university.edu.ng and open Card Management.'
        },
        {
          label: 'Revoke or Suspend Card',
          desc: 'Find card STF10001 or STD20002 and click "Suspend Card" or "Report Lost".'
        },
        {
          label: 'Attempt Reader Tap',
          desc: 'Switch to the Scanner Client terminal and attempt an NFC tap with the newly suspended card.'
        },
        {
          label: 'Edge Result',
          desc: 'Terminal immediately returns "ACCESS DENIED (card_inactive)" and logs an unauthorized tap attempt.'
        }
      ],
      expectedResult: 'HTTP 403 • status: "denied" • code: "card_inactive"'
    },
    {
      title: '4. Temporary Access Request & Ticket Approval',
      badge: 'Delegated Workflow',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      summary: 'Experience the full temporary clearance escalation lifecycle from user request to administrative approval.',
      steps: [
        {
          label: 'Staff Ticket Submission',
          desc: 'Staff requests temporary 24-hour clearance to a restricted area (e.g., Server Room).'
        },
        {
          label: 'Admin Ticket Review',
          desc: 'Administrator navigates to Temporary Access in the portal and inspects Ticket TKT-8849.'
        },
        {
          label: 'One-Click Approval',
          desc: 'Administrator clicks "Approve Request". Mongoose updates authorization policies in real time.'
        },
        {
          label: 'Reader Tap Verification',
          desc: 'Staff taps their card at the Server Room reader (RD-002) — access is immediately granted!'
        }
      ],
      expectedResult: 'Status changed to "approved" • Immediate dynamic door unlock'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* ── TOP ANNOUNCEMENT BANNER ── */}
      <aside aria-label="System announcement" className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white text-xs py-2 px-4 border-b border-indigo-800/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wide">
              Live Demo Ready
            </span>
            <span className="text-indigo-100">
              Enterprise NFC Physical Access Control, Hardware Simulation & Audit Intelligence
            </span>
          </div>
          <div className="flex items-center gap-3 text-indigo-200 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              API & Cloud Services Active
            </span>
            <span className="hidden md:inline text-indigo-400">•</span>
            <a
              href="https://nfc-based-secure-access-control-sys-five.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-indigo-200 underline font-medium flex items-center gap-1"
            >
              Open Scanner Terminal <FaExternalLinkAlt className="text-[10px]" />
            </a>
          </div>
        </div>
      </aside>

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <FaShieldAlt className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">NFC Access Control</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                  v2.0 Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Campus & Facility Security Suite</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#pipeline" className="hover:text-indigo-600 transition-colors">8-Stage Pipeline</a>
            <a href="#demo-access" className="hover:text-indigo-600 transition-colors">Demo Accounts</a>
            <a href="#scenarios" className="hover:text-indigo-600 transition-colors">E2E Scenarios</a>
            <a href="#architecture" className="hover:text-indigo-600 transition-colors">Architecture</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://nfc-based-secure-access-control-sys-five.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              <FaWifi className="text-indigo-500 rotate-90" />
              Scanner Terminal
            </a>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all hover:translate-y-[-1px]"
            >
              <FaLock className="text-xs" />
              Sign In / Demo
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION: 5-SECOND PROJECT UNDERSTANDING ── */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-white via-slate-50/50 to-indigo-50/30">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-blue-400/10 via-indigo-500/10 to-purple-400/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* 5-Second Attention Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 shadow-xs mb-6">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span className="text-xs font-semibold text-indigo-800 tracking-wide uppercase">
                Zero-Trust Physical Security • Sub-50ms Decision
              </span>
            </div>

            {/* Core Value Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Real-Time NFC Physical Access Control{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800">
                &amp; Security Intelligence Suite
              </span>
            </h1>

            {/* 5-Second Clarity Paragraph */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              A production-ready campus security ecosystem that verifies physical NFC card taps in under <span className="font-semibold text-indigo-700">50ms</span> through an <span className="font-semibold text-slate-800">8-stage verification pipeline</span>, enforces <span className="font-semibold text-slate-800">anti-passback tailgating defense</span>, and provides immediate administrative control.
            </p>

            {/* Quick 5-Second Value Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 max-w-3xl mx-auto">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs text-center">
                <div className="text-xl sm:text-2xl font-black text-indigo-600">&lt;50ms</div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">Edge Tap Latency</div>
                <div className="text-[10px] text-slate-400">Sub-second gate unlocking</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs text-center">
                <div className="text-xl sm:text-2xl font-black text-blue-600">8-Stage</div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">Zero-Trust Pipeline</div>
                <div className="text-[10px] text-slate-400">Strict multi-layer validation</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs text-center">
                <div className="text-xl sm:text-2xl font-black text-emerald-600">Strict</div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">Anti-Passback</div>
                <div className="text-[10px] text-slate-400">Anti-tailgating prevention</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs text-center">
                <div className="text-xl sm:text-2xl font-black text-rose-600">Instant</div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">Lockout &amp; Revoke</div>
                <div className="text-[10px] text-slate-400">Zero terminal restart needed</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 mb-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <a
                href="#demo-access"
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all hover:translate-y-[-1px] flex items-center justify-center gap-2"
              >
                <FaPlay className="text-xs" />
                Select Demo Account (Autofill)
              </a>
              <a
                href="https://nfc-based-secure-access-control-sys-five.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-indigo-700 bg-white hover:bg-indigo-50/60 border border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <FaWifi className="text-indigo-600 rotate-90 text-sm" />
                Launch Scanner Client Terminal
                <FaExternalLinkAlt className="text-xs text-slate-400" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3 DEMO ACCOUNTS WITH 1-CLICK AUTOFILL ── */}
      <section id="demo-access" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Interactive Evaluation Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Pre-Configured Demo Accounts
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Select any role below. Clicking <strong className="text-slate-800">"1-Click Launch &amp; Autofill"</strong> instantly navigates to the login screen with credentials pre-populated so you can immediately inspect the portal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {demoAccounts.map((demo) => {
              const IconComponent = demo.icon;
              return (
                <div
                  key={demo.role}
                  className={`bg-white rounded-2xl border ${demo.borderColor} p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all relative ${
                    demo.isPopular ? 'ring-2 ring-indigo-600/30' : ''
                  }`}
                >
                  {demo.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      Recommended Staff Flow
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${demo.accentBg} flex items-center justify-center ${demo.iconColor} text-xl shadow-xs`}>
                          <IconComponent />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{demo.role} Access</h3>
                          <p className="text-xs text-slate-500">{demo.name}</p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">NFC UID:</span>
                            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              {demo.cardUid}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${demo.badgeColor}`}>
                        {demo.clearance}
                      </span>
                    </div>

                    {/* Features List */}
                    <div className="mb-6">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Unlocked Capabilities:
                      </div>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {demo.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <FaCheckCircle className="text-emerald-500 text-xs mt-0.5 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleLaunchDemo(demo.email, demo.password, demo.role)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white ${demo.btnColor} shadow-sm transition-all hover:translate-y-[-1px] flex items-center justify-center gap-2`}
                    >
                      <span>1-Click Launch &amp; Autofill</span>
                      <FaArrowRight className="text-xs" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 8-STAGE ZERO-TRUST PIPELINE BREAKDOWN ── */}
      <section id="pipeline" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Deterministic Security Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Multi-Stage Zero-Trust Verification Pipeline
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Every contactless tap at <code className="text-xs bg-slate-200 px-1.5 py-0.5 rounded text-indigo-700 font-mono">/api/access/tap</code> must pass all 8 independent security checkpoints before physical relays release the door strike.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Reader Validation',
                desc: 'Verifies reader registration, active status, and cryptographic hardware credentials.',
                code: 'invalid_reader',
                icon: FaServer
              },
              {
                step: '02',
                title: 'UID Lookup',
                desc: 'Locates NFC card UID in the database and checks cardholder assignment.',
                code: 'invalid_card',
                icon: FaWifi
              },
              {
                step: '03',
                title: 'Card State Machine',
                desc: 'Ensures card status is "active", rejecting lost, stolen, or replaced credentials.',
                code: 'card_inactive',
                icon: FaShieldAlt
              },
              {
                step: '04',
                title: 'Cardholder Status',
                desc: 'Validates user account status (must be fully active and not suspended by HR/Admin).',
                code: 'user_inactive',
                icon: FaUserShield
              },
              {
                step: '05',
                title: 'Multi-Zone RBAC',
                desc: 'Evaluates user role against the door reader zone allowedRoles authorization array.',
                code: 'unauthorized_zone',
                icon: FaLayerGroup
              },
              {
                step: '06',
                title: 'Schedule & Time-Window',
                desc: 'Ensures current timestamp falls within the reader zone approved access hours.',
                code: 'outside_time_window',
                icon: FaClock
              },
              {
                step: '07',
                title: 'Anti-Passback Engine',
                desc: 'Prevents card sharing & tailgating by enforcing strict alternate Entry ➔ Exit sequences.',
                code: 'anti_passback_violation',
                icon: FaDoorOpen
              },
              {
                step: '08',
                title: 'Immutable Audit Log',
                desc: 'Writes a cryptographic, tamper-evident AccessLog record before dispatching unlock signal.',
                code: 'commit_success',
                icon: FaHistory
              }
            ].map((stage) => {
              const Icon = stage.icon;
              return (
                <div key={stage.step} className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-black text-indigo-600/30">{stage.step}</span>
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">
                        <Icon />
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">{stage.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{stage.desc}</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Denial Code:</span>
                    <span className="font-mono font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                      {stage.code}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── END-TO-END WALKTHROUGH SCENARIOS (WITH SCANNER SIMULATION) ── */}
      <section id="scenarios" className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Interactive Test Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              End-to-End Walkthrough Scenarios
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Follow these scripted steps using the deployed <strong className="text-slate-800">Scanner Client</strong> terminal and the <strong className="text-slate-800">Admin Dashboard</strong> to experience the full security workflow.
            </p>
          </div>

          {/* Scenario Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {scenarios.map((sc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveScenario(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeScenario === idx
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sc.title}
              </button>
            ))}
          </div>

          {/* Active Scenario Card */}
          <div className="max-w-4xl mx-auto bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4 mb-6">
              <div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${scenarios[activeScenario].badgeColor}`}>
                  {scenarios[activeScenario].badge}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">{scenarios[activeScenario].title}</h3>
              </div>
              <a
                href="https://nfc-based-secure-access-control-sys-five.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors self-start sm:self-auto"
              >
                <FaWifi className="rotate-90 text-[10px]" />
                Open Live Scanner Client
                <FaExternalLinkAlt className="text-[10px]" />
              </a>
            </div>

            <p className="text-sm text-slate-600 mb-6">{scenarios[activeScenario].summary}</p>

            <div className="space-y-4 mb-6">
              {scenarios[activeScenario].steps.map((st, i) => (
                <div key={i} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{st.label}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 text-slate-200 rounded-xl p-3.5 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-slate-400 text-[11px]">System Output:</span>
              <span className="font-semibold text-emerald-400">{scenarios[activeScenario].expectedResult}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── DUAL DEPLOYMENT LINK SHOWCASE ── */}
      <section id="architecture" className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Live Micro-Frontend Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Production Deployed Applications
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              The project is split into focused micro-frontends mirroring real-world physical security architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Admin Web Card */}
            <div className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                    <FaUserShield />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Live Portal
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900">Admin &amp; Cardholder Web Application</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                  The primary administrative control center for issuing cards, managing users, approving temporary tickets, and viewing security audits.
                </p>
                <div className="font-mono text-xs text-indigo-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 break-all mb-4">
                  https://nfc-based-secure-access-control-sys-eight.vercel.app/
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>Access Management Portal</span>
                <FaArrowRight className="text-xs" />
              </button>
            </div>

            {/* Scanner Client Card */}
            <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                    <FaWifi className="rotate-90" />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span> Reader Terminal
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900">Scanner Client Hardware Terminal</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                  Simulates physical wall-mounted access terminals deployed at campus turnstiles and server rooms with live NFC tap processing.
                </p>
                <div className="font-mono text-xs text-blue-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 break-all mb-4">
                  https://nfc-based-secure-access-control-sys-five.vercel.app/
                </div>
              </div>
              <a
                href="https://nfc-based-secure-access-control-sys-five.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <span>Open Terminal in New Tab</span>
                <FaExternalLinkAlt className="text-xs" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <FaShieldAlt />
              </div>
              <div>
                <span className="font-bold text-white text-sm">NFC-Based Secure Access Control</span>
                <p className="text-[11px] text-slate-500">Enterprise Hardware Simulation &amp; Authorization Platform</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">React 19</span>
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">Tailwind CSS v4</span>
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">Node.js / Express</span>
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">MongoDB</span>
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">Vercel</span>
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="hover:text-white transition-colors"
              >
                Sign In
              </button>
              <span>•</span>
              <a
                href="https://nfc-based-secure-access-control-sys-five.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Scanner Terminal
              </a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-slate-600 text-[11px]">
            &copy; {new Date().getFullYear()} NFC-Based Secure Access Control System. University Security &amp; Access Engineering.
          </div>
        </div>
      </footer>
    </div>
  );
}
