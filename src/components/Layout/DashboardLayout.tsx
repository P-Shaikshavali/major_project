import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, PlusCircle, BarChart3, LogOut, User, Sun, Moon, ShieldCheck, MessageSquare, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'Student';
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group"
      style={{
        background: isActive(to) ? 'rgba(37,99,235,0.15)' : 'transparent',
        color: isActive(to) ? '#60A5FA' : '#94A3B8',
      }}
      onMouseEnter={e => { if (!isActive(to)) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; if (!isActive(to)) e.currentTarget.style.color = '#CBD5E1'; }}
      onMouseLeave={e => { if (!isActive(to)) e.currentTarget.style.background = 'transparent'; if (!isActive(to)) e.currentTarget.style.color = '#94A3B8'; }}
    >
      <span className="shrink-0" style={{ color: isActive(to) ? '#60A5FA' : '#64748B' }}>{icon}</span>
      <span>{label}</span>
      {isActive(to) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
    </Link>
  );

  const SectionLabel = ({ label }: { label: string }) => (
    <p className="text-[10px] font-bold uppercase tracking-widest px-3 pt-4 pb-1" style={{ color: '#334155' }}>{label}</p>
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* ── Sidebar ── */}
      <aside
        className="w-56 shrink-0 hidden md:flex flex-col h-full select-none"
        style={{ background: '#0F172A', borderRight: '1px solid #1E293B' }}
      >
        {/* Logo */}
        <div className="px-4 py-5 flex items-center gap-2.5" style={{ borderBottom: '1px solid #1E293B' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#2563EB' }}>
            <ShieldCheck size={14} className="text-white" />
          </div>
          <Link to="/" className="font-bold text-sm tracking-tight text-white">E-Grievance</Link>
          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#1E3A5F', color: '#60A5FA' }}>DSS</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
          {userRole === 'Student' && (
            <>
              <SectionLabel label="Student" />
              <NavItem to="/dashboard/student" icon={<LayoutDashboard size={15} />} label="Overview" />
              <NavItem to="/dashboard/submit" icon={<PlusCircle size={15} />} label="Submit Complaint" />
              <NavItem to="/dashboard/list" icon={<FileText size={15} />} label="My Complaints" />
              <NavItem to="/dashboard/profile" icon={<User size={15} />} label="My Profile" />
            </>
          )}
          {['Faculty', 'Warden', 'Dean', 'Admin'].includes(userRole) && (
            <>
              <SectionLabel label="Authority" />
              <NavItem to="/dashboard/authority" icon={<Home size={15} />} label="Manage Queue" />
            </>
          )}
          {userRole === 'Admin' && (
            <>
              <SectionLabel label="Administration" />
              <NavItem to="/dashboard/admin" icon={<BarChart3 size={15} />} label="Analytics" />
            </>
          )}
          <SectionLabel label="Support" />
          <NavItem to="/dashboard/student" icon={<MessageSquare size={15} />} label="AI Chatbot" />
        </nav>

        {/* Footer */}
        <div className="px-2 pb-4 space-y-0.5" style={{ borderTop: '1px solid #1E293B', paddingTop: 12 }}>
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ color: '#64748B' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94A3B8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
          >
            {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ color: '#64748B' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#F87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
