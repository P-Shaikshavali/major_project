import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, ClipboardList, User,
  MessageSquare, LogOut, ShieldCheck, Lock,
  GraduationCap, Home, Brain, ChevronRight
} from 'lucide-react';
import useSessionSecurity from '../../hooks/useSessionSecurity';

// ── Nav definitions per role ──────────────────────────────────────────────────
const NAV_BY_ROLE: Record<string, { to: string; icon: React.ReactNode; label: string }[]> = {
  Student: [
    { to: '/dashboard/student',  icon: <LayoutDashboard size={20} />, label: 'Overview'        },
    { to: '/dashboard/submit',   icon: <PlusCircle size={20} />,      label: 'Submit Complaint' },
    { to: '/dashboard/list',     icon: <ClipboardList size={20} />,   label: 'My Complaints'   },
    { to: '/dashboard/profile',  icon: <User size={20} />,            label: 'My Profile'      },
  ],
  Faculty: [
    { to: '/dashboard/faculty',    icon: <ShieldCheck size={20} />,    label: 'Decision Support' },
    { to: '/dashboard/authority',  icon: <ClipboardList size={20} />,  label: 'Complaint Queue'  },
  ],
  // "Warden" is the role stored in DB/JWT — maps to Hostel Dean dashboard
  Warden: [
    { to: '/dashboard/hosteldean', icon: <Home size={20} />,           label: 'Hostel Dashboard' },
    { to: '/dashboard/authority',  icon: <ClipboardList size={20} />,  label: 'Complaint Queue'  },
  ],
  HostelDean: [
    { to: '/dashboard/hosteldean', icon: <Home size={20} />,           label: 'Hostel Dashboard' },
    { to: '/dashboard/authority',  icon: <ClipboardList size={20} />,  label: 'Complaint Queue'  },
  ],
  HOD: [
    { to: '/dashboard/hod',        icon: <GraduationCap size={20} />,  label: 'HOD Dashboard'    },
    { to: '/dashboard/authority',  icon: <ClipboardList size={20} />,  label: 'Complaint Queue'  },
  ],
  Dean: [
    { to: '/dashboard/dean',       icon: <GraduationCap size={20} />,  label: 'Dean Dashboard'   },
    { to: '/dashboard/authority',  icon: <ClipboardList size={20} />,  label: 'All Complaints'   },
  ],
  Warden: [
    { to: '/dashboard/warden',    icon: <Home size={20} />,          label: 'Warden Dashboard' },
    { to: '/dashboard/authority', icon: <ClipboardList size={20} />, label: 'HOD Queue'        },
  ],
  HOD: [
    { to: '/dashboard/authority',  icon: <ClipboardList size={20} />, label: 'Complaint Queue'  },
    { to: '/dashboard/dean',       icon: <ShieldCheck size={20} />,   label: 'Dean Overview'   },
  ],
  Admin: [
    { to: '/dashboard/admin',      icon: <LayoutDashboard size={20} />, label: 'System Analytics' },
    { to: '/dashboard/authority',  icon: <ClipboardList size={20} />,   label: 'Complaint Queue'  },
    { to: '/dashboard/faculty',    icon: <Brain size={20} />,           label: 'Faculty View'     },
  ],
};

const ROLE_LABELS: Record<string, string> = {
<<<<<<< HEAD
  Student:    'Student Portal',
  Faculty:    'Faculty Portal',
  Warden:     'Warden Portal',
  HostelDean: 'Hostel Admin',
  HOD:        'HOD Portal',
  Dean:       "Dean's Office",
  Admin:      'Admin Portal',
=======
  Student: 'Student Portal', Faculty: 'Faculty Portal', Dean: "Dean's Office",
  HostelDean: 'Hostel Admin', Admin: 'Admin Portal',
  Warden: 'Warden Control', HOD: 'HOD Portal',
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
};


const DS = {
<<<<<<< HEAD
  bg:             '#F8F9FA',
  surface:        '#FFFFFF',
  surfaceHigh:    '#E8ECF0',
  blue:           '#1A73E8',
  blueLight:      '#EBF3FD',
  emerald:        '#10B981',
  emeraldDark:    '#065F46',
  text:           '#111827',
  textMuted:      '#414754',
  textFaint:      '#727785',
  red:            '#EF4444',
  redLight:       '#FEF2F2',
  amber:          '#F59E0B',
  glass:          'rgba(255, 255, 255, 0.75)',
  glassDark:      'rgba(17, 24, 39, 0.85)',
  blur:           'blur(24px)',
=======
  bg: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceHigh: '#FFFFFF',
  blue: '#1A73E8',
  blueLight: '#EBF3FD',
  emerald: '#10B981',
  emeraldDark: '#059669',
  red: '#EF4444',
  redLight: '#FEF2F2',
  amber: '#F59E0B',
  text: '#111827',
  textMuted: '#414754',
  textFaint: '#727785',
  glass: 'rgba(255, 255, 255, 0.75)',
  glassDark: 'rgba(17, 24, 39, 0.85)',
  blur: 'blur(24px)',
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
  shadowFloating: '0 24px 48px rgba(0,0,0,0.08)',
};

const DashboardLayout = () => {
  useNavigate(); // kept for future programmatic navigation
  const role = localStorage.getItem('userRole') || 'Student';
<<<<<<< HEAD
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_dark] = useState(() => document.documentElement.classList.contains('dark'));
=======
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
  const { sessionState, timeLeft, extendSession, forceLogout } = useSessionSecurity();

  // Glassmorphic state: true = expanded sidebar, false = iconic sidebar
  const [isExpanded, setIsExpanded] = useState(true);

  const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.Student;
  const isStudent = role === 'Student';
  const accent = isStudent ? DS.blue : DS.emerald;
  const accentLight = isStudent ? DS.blueLight : '#ECFDF5';

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: isExpanded ? '12px 18px' : '12px',
    borderRadius: 16,
    fontSize: 14,
    fontWeight: isActive ? 700 : 500,
    color: isActive ? accent : DS.textMuted,
    background: isActive ? accentLight : 'transparent',
    textDecoration: 'none',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    position: 'relative' as const,
    whiteSpace: 'nowrap' as const,
    justifyContent: isExpanded ? 'flex-start' : 'center',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100svh', width: '100%', background: DS.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .mesh-bg-app {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;
          background: 
            radial-gradient(circle at 10% 10%, ${DS.blue}08 0%, transparent 40%),
            radial-gradient(circle at 90% 90%, ${DS.emerald}08 0%, transparent 40%);
        }
      `}</style>
      <div className="mesh-bg-app" />
      
      {/* ── Floating Glassmorphic Sidebar ── */}
      <div style={{ 
        position: 'sticky', top: 0, height: '100svh', display: 'flex', alignItems: 'center', 
        paddingLeft: 24, paddingRight: 0, paddingBottom: 24, paddingTop: 24, zIndex: 100 
      }}>
        <aside style={{
          width: isExpanded ? 260 : 80,
          height: '100%',
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 30px 60px rgba(26,115,232,0.08)',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          
          {/* Toggle Button */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ 
<<<<<<< HEAD
              position: 'absolute',
              right: isExpanded ? 16 : 0,
              left:  isExpanded ? 'auto' : 0,
              top: 24, width: 28, height: 28,
              margin: isExpanded ? 0 : '0 auto',
=======
              position: 'absolute', right: isExpanded ? 16 : 0, top: 24, width: 28, height: 28, 
               margin: isExpanded ? 0 : '0 auto', left: isExpanded ? 'auto' : 0, // center if collapsed
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
              borderRadius: '50%', background: DS.surface, border: `1px solid ${DS.surfaceHigh}`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, 
              color: DS.text, boxShadow: `0 4px 12px rgba(0,0,0,0.05)`, transition: 'transform 0.4s' 
            }}>

            <ChevronRight size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.4s' }} />
          </button>

          {/* Logo Section */}
          <div style={{ padding: isExpanded ? '32px 24px 24px' : '32px 0 24px', display: 'flex', flexDirection: 'column', alignItems: isExpanded ? 'flex-start' : 'center', borderBottom: `1px solid rgba(0,0,0,0.04)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 8px 16px ${accent}40` }}>
                <ShieldCheck size={20} color="#fff" />
              </div>
              
              {isExpanded && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text, lineHeight: 1 }}>E-Grievance</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 4 }}>DSS Portal</p>
                </div>
              )}
            </div>
          </div>

          {/* Role Badge */}
          {isExpanded && (
            <div style={{ padding: '24px 24px 8px' }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: DS.textFaint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {ROLE_LABELS[role] ?? 'PORTAL'}
              </p>
            </div>
          )}

          {/* Navigation */}
          <nav style={{ flex: 1, padding: isExpanded ? '12px 20px' : '24px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} style={linkStyle} end title={item.label}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
                {isExpanded && <span style={{ animation: 'fadeIn 0.3s' }}>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div style={{ padding: isExpanded ? '24px' : '24px 12px', borderTop: `1px solid rgba(0,0,0,0.04)`, display: 'flex', flexDirection: 'column', gap: 8 }}>
            
            {/* Support / Chatbot */}
            <button
              onClick={() => { const fab = document.querySelector('[data-chatbot-fab]') as HTMLButtonElement; if (fab) fab.click(); }}
              title="AI Support"
              style={{ 
                display: 'flex', alignItems: 'center', gap: 14, padding: isExpanded ? '12px 18px' : '12px', borderRadius: 16, 
                fontSize: 14, fontWeight: 600, color: DS.text, background: DS.surface, border: 'none', cursor: 'pointer', 
                width: '100%', transition: 'all 0.2s', boxShadow: `0 4px 12px rgba(0,0,0,0.05)`, justifyContent: isExpanded ? 'flex-start' : 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <MessageSquare size={18} style={{ color: accent }} />
              {isExpanded && <span style={{ animation: 'fadeIn 0.3s' }}>AI Chatbot</span>}
            </button>

            {/* Logout */}
            <button
              onClick={forceLogout}
              title="Logout"
              style={{ 
                display: 'flex', alignItems: 'center', gap: 14, padding: isExpanded ? '12px 18px' : '12px', borderRadius: 16, 
                fontSize: 14, fontWeight: 600, color: DS.red, background: 'transparent', border: 'none', cursor: 'pointer', 
                width: '100%', transition: 'all 0.2s', justifyContent: isExpanded ? 'flex-start' : 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.background = DS.redLight}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={18} />
              {isExpanded && <span style={{ animation: 'fadeIn 0.3s' }}>Logout</span>}
            </button>

          </div>
        </aside>
      </div>

      {/* ── Main Content Area ── */}
      <main style={{ flex: 1, minWidth: 0, paddingLeft: 0, position: 'relative' }}>
        <Outlet />
      </main>

      {/* ── Session Warning Banner (Floating Glass) ── */}
      {sessionState === 'warning' && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: DS.glassDark, backdropFilter: DS.blur, border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff', padding: '16px 24px', borderRadius: 99, fontSize: 13, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 12, zIndex: 9999, boxShadow: DS.shadowFloating,
          animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <Lock size={16} style={{ color: DS.amber }} />
          <span>Session expires in <strong style={{ fontFamily: 'monospace', fontSize: 14 }}>{fmtTime(timeLeft)}</strong></span>
          <button
            onClick={extendSession}
            style={{ 
              marginLeft: 12, background: DS.emerald, border: 'none', color: '#fff', 
              fontSize: 13, fontWeight: 700, borderRadius: 99, padding: '8px 16px', cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = DS.emeraldDark}
            onMouseLeave={e => e.currentTarget.style.background = DS.emerald}
          >
            Extend Session
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
