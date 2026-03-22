import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ShieldCheck, Eye, BookOpen, Users, Lock } from 'lucide-react';
import api from '../services/api';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg('');
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userRole', role);
        if (role === 'Student') navigate('/dashboard/student');
        else if (role === 'Admin') navigate('/dashboard/admin');
        else navigate('/dashboard/authority');
      } else {
        await api.post('/auth/register', { name, email, password, role });
        const loginRes = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', loginRes.data.token);
        localStorage.setItem('userRole', role);
        if (role === 'Student') navigate('/dashboard/student');
        else if (role === 'Admin') navigate('/dashboard/admin');
        else navigate('/dashboard/authority');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally { setIsLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid var(--border)',
    borderRadius: 8, background: 'var(--bg)', color: 'var(--text)',
    fontSize: 13, outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s',
  };

  const features = [
    { icon: <Eye size={16} />, title: 'Real-time Tracking', desc: 'Follow your grievance from submission to resolution.' },
    { icon: <ShieldCheck size={16} />, title: 'Privacy-Preserving', desc: 'Student identities protected by default.' },
    { icon: <Users size={16} />, title: 'Multi-Role System', desc: 'Student, Faculty, Warden, Dean, Admin.' },
    { icon: <BookOpen size={16} />, title: 'AI Decision Support', desc: 'Smart routing and behavioral insights.' },
  ];

  return (
    <div style={{ minHeight: '100svh', width: '100%', display: 'flex', background: 'var(--bg)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex flex-col justify-between" style={{ width: '44%', background: '#0F172A', padding: '48px 52px', flexShrink: 0 }}>
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 64 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.01em' }}>E-Grievance</span>
            <span style={{ marginLeft: 4, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#1E3A5F', color: '#60A5FA' }}>DSS</span>
          </div>

          <h1 style={{ fontSize: 40, fontWeight: 800, color: '#F1F5F9', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.02em' }}>
            AI-Based<br />E-Grievance<br />Decision Support
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 48 }}>
            A secure, privacy-preserving platform for raising, routing, and resolving institutional grievances with AI-powered intelligence.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1E293B', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  {f.icon}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#CBD5E1', marginBottom: 2 }}>{f.title}</p>
                  <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#334155', marginTop: 48 }}>Official grievance redressal system · Academic Year 2024–2025</p>
      </div>

      {/* Right — Form Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px 32px' }}>
        {/* Mobile logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }} className="lg:hidden">
          <ShieldCheck size={24} style={{ color: 'var(--blue)' }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>E-Grievance</span>
        </div>

        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Toggle */}
          <div style={{ display: 'flex', background: 'var(--border)', borderRadius: 10, padding: 3, marginBottom: 28 }}>
            {['Sign In', 'Sign Up'].map((tab, i) => (
              <button
                key={tab}
                type="button"
                onClick={() => setIsLogin(i === 0)}
                style={{
                  flex: 1, padding: '8px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: (isLogin ? i === 0 : i === 1) ? 'var(--surface)' : 'transparent',
                  color: (isLogin ? i === 0 : i === 1) ? 'var(--text)' : 'var(--text-muted)',
                  boxShadow: (isLogin ? i === 0 : i === 1) ? 'var(--shadow-sm)' : 'none',
                }}
              >{tab}</button>
            ))}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
            {isLogin ? 'Sign in to access your portal.' : 'Join the E-Grievance platform.'}
          </p>

          {errorMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--red-light)', color: 'var(--red)', fontSize: 12, fontWeight: 500, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertIcon /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-mid)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>University Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@university.edu" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-mid)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Password</label>
                {isLogin && <button type="button" style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Forgot password?</button>}
              </div>
              <div style={{ position: 'relative' }}>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-mid)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                <Lock size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Your Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-mid)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}>
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Warden">Warden</option>
                <option value="Dean">Dean</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', padding: '11px', borderRadius: 8, background: 'var(--blue)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, transition: 'all 0.2s' }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--blue)'; }}
            >
              {isLoading ? <><Loader2 size={15} className="animate-spin" /> Authenticating...</> : (isLogin ? 'Login to Portal' : 'Create Account')}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--blue)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
          <p style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/" style={{ fontSize: 11, color: 'var(--text-faint)' }}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export default LoginPage;
