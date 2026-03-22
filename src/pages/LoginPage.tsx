import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ShieldCheck, Lock, Eye, EyeOff, Fingerprint, Zap, Users, BookOpen } from 'lucide-react';
import api from '../services/api';

// ── Sanitize input (XSS prevention) ──
const sanitize = (v: string) => v.replace(/[<>"'`]/g, '');

const LoginPage = () => {
  const [isLogin, setIsLogin]     = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const [failCount, setFailCount] = useState(0);
  const [showPwd, setShowPwd]     = useState(false);
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [role, setRole]           = useState('Student');
  const navigate = useNavigate();

  const LOCKED = failCount >= 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (LOCKED) return;
    setIsLoading(true); setErrorMsg('');
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email: sanitize(email), password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userRole', role);
        setFailCount(0);
        if (role === 'Student') navigate('/dashboard/student');
        else if (role === 'Admin') navigate('/dashboard/admin');
        else navigate('/dashboard/authority');
      } else {
        await api.post('/auth/register', { name: sanitize(name), email: sanitize(email), password, role });
        const loginRes = await api.post('/auth/login', { email: sanitize(email), password });
        localStorage.setItem('token', loginRes.data.token);
        localStorage.setItem('userRole', role);
        if (role === 'Student') navigate('/dashboard/student');
        else if (role === 'Admin') navigate('/dashboard/admin');
        else navigate('/dashboard/authority');
      }
    } catch (err: any) {
      setFailCount(c => c + 1);
      const msg = err.response?.data?.message || 'Authentication failed. Please try again.';
      setErrorMsg(LOCKED ? '⛔ Account temporarily locked after 5 failed attempts.' : msg);
    } finally { setIsLoading(false); }
  };

  const inputBase: React.CSSProperties = {
    width: '100%', height: 46, padding: '0 14px', border: '1.5px solid var(--border)',
    borderRadius: 10, background: 'var(--surface-low)', color: 'var(--text)',
    fontSize: 13.5, outline: 'none', fontFamily: 'inherit',
  };

  const features = [
    { icon: <Zap size={15} />, title: 'Real-time Tracking', desc: 'Follow every status change live.' },
    { icon: <ShieldCheck size={15} />, title: 'Privacy-First Anonymity', desc: 'Identity hidden from unauthorized viewers.' },
    { icon: <Users size={15} />, title: 'Multi-Role Portals', desc: 'Student · Faculty · Warden · Dean · Admin.' },
    { icon: <BookOpen size={15} />, title: 'AI-Powered Routing', desc: 'Smart case assignment with ML insights.' },
  ];

  return (
    <div style={{ minHeight: '100svh', width: '100%', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Left Brand Panel ── */}
      <div style={{
        width: '44%', flexShrink: 0, background: '#111827',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '44px 48px',
      }} className="hidden lg:flex">
        {/* Logo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1 }}>E-Grievance</p>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#10B981', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3 }}>Decision Support System</p>
            </div>
          </div>

          <h1 style={{ fontSize: 38, fontWeight: 800, color: '#F9FAFB', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 14 }}>
            AI-Based<br />E-Grievance<br />Decision Support
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 44 }}>
            A secure, privacy-preserving platform for raising, routing, and resolving institutional grievances — intelligently.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(16,185,129,0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#E5E7EB', marginBottom: 2 }}>{f.title}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security badge */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', marginBottom: 16 }}>
            <Lock size={13} style={{ color: '#10B981' }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: '#10B981' }}>Secured with AES-256 Encryption · JWT Auth</p>
          </div>
          <p style={{ fontSize: 11, color: '#374151' }}>Official Grievance Redressal System · Academic Year 2024–2025</p>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#FFFFFF', padding: '48px 32px' }}>
        {/* Mobile logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }} className="lg:hidden">
          <div style={{ width: 32, height: 32, borderRadius: 9, background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={16} color="#fff" />
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>E-Grievance DSS</p>
        </div>

        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Toggle */}
          <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {['Sign In', 'Sign Up'].map((t, i) => (
              <button key={t} type="button" onClick={() => { setIsLogin(i === 0); setErrorMsg(''); }}
                style={{
                  flex: 1, padding: '8px', borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all 0.18s',
                  background: (isLogin ? i === 0 : i === 1) ? '#FFFFFF' : 'transparent',
                  color: (isLogin ? i === 0 : i === 1) ? '#111827' : '#6B7280',
                  boxShadow: (isLogin ? i === 0 : i === 1) ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}>
                {t}
              </button>
            ))}
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 4, letterSpacing: '-0.01em' }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
            {isLogin ? 'Sign in to your secure portal.' : 'Join the E-Grievance platform.'}
          </p>

          {/* Error */}
          {errorMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', color: '#DC2626', fontSize: 12.5, fontWeight: 500, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'flex-start', border: '1px solid #FEE2E2' }}>
              <span style={{ fontSize: 14 }}>⚠️</span> {errorMsg}
            </div>
          )}

          {/* Lockout */}
          {LOCKED && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#111827', color: '#fff', fontSize: 12, marginBottom: 16 }}>
              🔒 Too many failed attempts. Please wait 5 minutes or reset your password.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" style={inputBase}
                  onFocus={e => { e.target.style.borderColor = '#10B981'; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--surface-low)'; }} />
              </div>
            )}

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>University Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@university.edu" style={inputBase}
                onFocus={e => { e.target.style.borderColor = '#10B981'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--surface-low)'; }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151' }}>Password</label>
                {isLogin && <button type="button" style={{ fontSize: 11.5, color: '#10B981', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Forgot password?</button>}
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                  style={{ ...inputBase, paddingRight: 44 }}
                  onFocus={e => { e.target.style.borderColor = '#10B981'; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--surface-low)'; }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                <Lock size={10} style={{ color: '#10B981' }} />
                <p style={{ fontSize: 11, color: '#10B981', fontWeight: 500 }}>End-to-end encrypted connection</p>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Your Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inputBase, cursor: 'pointer' }}
                onFocus={e => { e.target.style.borderColor = '#10B981'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--surface-low)'; }}>
                <option>Student</option>
                <option>Faculty</option>
                <option>Warden</option>
                <option>Dean</option>
                <option>Admin</option>
              </select>
            </div>

            <button type="submit" disabled={isLoading || LOCKED} className="btn-em"
              style={{ width: '100%', height: 46, marginTop: 4, fontSize: 14, borderRadius: 10, opacity: (isLoading || LOCKED) ? 0.6 : 1, cursor: (isLoading || LOCKED) ? 'not-allowed' : 'pointer' }}>
              {isLoading ? <><Loader2 size={16} className="animate-spin" /> Authenticating...</> : <><Fingerprint size={16} />{isLogin ? 'Login Securely' : 'Create Account'}</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12.5, color: '#6B7280', marginTop: 20 }}>
            {isLogin ? "Don't have an account?" : 'Already registered?'}{' '}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
              style={{ color: '#10B981', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
          <p style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/" style={{ fontSize: 11.5, color: '#9CA3AF' }}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
