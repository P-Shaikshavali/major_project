import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, ClipboardList, User,
  MessageSquare, LogOut, Moon, Sun, ShieldCheck, Lock,
  GraduationCap, Home, Brain
} from 'lucide-react';
import useSessionSecurity from '../../hooks/useSessionSecurity';

// ── Nav definitions per role ──────────────────────────────────────────────────
const NAV_BY_ROLE: Record<string, { to: string; icon: React.ReactNode; label: string }[]> = {
  Student: [
    { to: '/dashboard/student',  icon: <LayoutDashboard size={16} />, label: 'Overview'        },
    { to: '/dashboard/submit',   icon: <PlusCircle size={16} />,      label: 'Submit Complaint' },
    { to: '/dashboard/list',     icon: <ClipboardList size={16} />,   label: 'My Complaints'   },
    { to: '/dashboard/profile',  icon: <User size={16} />,            label: 'My Profile'      },
  ],
  Faculty: [
    { to: '/dashboard/faculty',    icon: <ShieldCheck size={16} />,   label: 'Decision Support' },
    { to: '/dashboard/authority',  icon: <ClipboardList size={16} />, label: 'Complaint Queue'  },
  ],
  Dean: [
    { to: '/dashboard/dean',       icon: <GraduationCap size={16} />, label: 'Dean Dashboard'   },
    { to: '/dashboard/authority',  icon: <ClipboardList size={16} />, label: 'All Complaints'   },
  ],
  HostelDean: [
    { to: '/dashboard/hosteldean', icon: <Home size={16} />,          label: 'Hostel Dashboard' },
    { to: '/dashboard/authority',  icon: <ClipboardList size={16} />, label: 'Complaint Queue'  },
  ],
  Admin: [
    { to: '/dashboard/admin',      icon: <LayoutDashboard size={16} />, label: 'System Analytics' },
    { to: '/dashboard/authority',  icon: <ClipboardList size={16} />,   label: 'Complaint Queue'  },
    { to: '/dashboard/faculty',    icon: <Brain size={16} />,           label: 'Faculty View'    },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  Student: 'STUDENT PORTAL', Faculty: 'FACULTY PORTAL', Dean: 'DEAN\'S OFFICE',
  HostelDean: 'HOSTEL ADMIN', Admin: 'ADMIN PORTAL',
};

const DashboardLayout = () => {
  useNavigate(); // kept for future programmatic navigation
  const role = localStorage.getItem('userRole') || 'Student';
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const { sessionState, timeLeft, extendSession, forceLogout } = useSessionSecurity();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const navItems = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.Student;

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 14px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: isActive ? 600 : 400,
    color: isActive ? '#FFFFFF' : 'var(--sidebar-text)',
    background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
    textDecoration: 'none',
    transition: 'all 0.15s',
    position: 'relative' as const,
    borderLeft: isActive ? '3px solid var(--em)' : '3px solid transparent',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100svh', width: '100%', background: 'var(--bg)' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0, background: 'var(--sidebar-bg)',
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky', top: 0, height: '100svh', overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--em)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={18} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>E-Grievance</p>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--em)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>DSS Portal</p>
            </div>
          </div>
        </div>

        {/* Session security badge */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, background: 'rgba(16,185,129,0.1)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--em)', flexShrink: 0 }} />
            <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--em)', letterSpacing: '0.05em' }}>SESSION SECURE</p>
            <Lock size={9} style={{ color: 'var(--em)', marginLeft: 'auto' }} />
          </div>
        </div>

        {/* Role badge */}
        <div style={{ padding: '12px 18px 6px' }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--sidebar-section)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            {ROLE_LABELS[role] ?? 'PORTAL'}
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '4px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} style={linkStyle} end>
              <span style={{ opacity: 0.85 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* Support section — AI Chatbot opens the chatbot FAB (no hard redirect needed) */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '10px 0', padding: '10px 0 4px' }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--sidebar-section)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, paddingLeft: 4 }}>SUPPORT</p>
            <button
              onClick={() => {
                // Trigger the chatbot FAB by clicking it programmatically
                const fab = document.querySelector('[data-chatbot-fab]') as HTMLButtonElement;
                if (fab) fab.click();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 400, color: 'var(--sidebar-text)', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <MessageSquare size={16} style={{ opacity: 0.75 }} />
              AI Chatbot
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={() => setDark(!dark)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: 'var(--sidebar-text)', fontSize: 12, width: '100%' }}
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={forceLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 12, width: '100%' }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', position: 'relative' }}>
        <Outlet />
      </main>

      {/* ── Session Warning Banner ── */}
      {sessionState === 'warning' && (
        <div className="session-warn">
          <span className="dot" />
          Session expires in <strong>{fmtTime(timeLeft)}</strong>
          <button
            onClick={extendSession}
            style={{ marginLeft: 8, background: 'var(--em)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, borderRadius: 6, padding: '4px 12px', cursor: 'pointer' }}
          >
            Stay Logged In
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
