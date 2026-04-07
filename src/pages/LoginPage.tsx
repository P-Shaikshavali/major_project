import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ShieldCheck, Lock, Eye, EyeOff, Zap, ArrowLeft, User, GraduationCap, Shield } from 'lucide-react';
import api from '../services/api';

// ── Sanitize input (XSS prevention) ──────────────────────────────────────────
const sanitize = (v: string) => v.replace(/[<>"'`]/g, '');

// ── Stitch "Volt Sentinel" Design Tokens ─────────────────────────────────────
const DS = {
  bg:          '#F8F9FA',
  surface:     '#FFFFFF',
  blue:        '#1A73E8',
  blueDark:    '#005BBF',
  indigo:      '#6366F1',
  text:        '#111827',
  textMuted:   '#414754',
  textFaint:   '#727785',
  red:         '#EF4444',
  redLight:    '#FEF2F2',
  radiusCard:  '32px',
  shadowGlass: '0 30px 60px rgba(0,0,0,0.12)',
};

// ── Role → route mapping (uses server-returned role after login) ──────────────
const roleRoute = (role: string) => {
  switch (role) {
    case 'Student':  return '/dashboard/profile';
    case 'Dean':     return '/dashboard/dean';
    case 'HOD':      return '/dashboard/hod';
    case 'Faculty':  return '/dashboard/faculty';
    case 'Warden':   return '/dashboard/hosteldean';
    case 'Admin':    return '/dashboard/admin';
    default:         return '/dashboard/authority';
  }
};

const LoginPage = () => {
  const [isLogin, setIsLogin]       = useState(true);
  const [isLoading, setIsLoading]   = useState(false);
  const sessionExpired = new URLSearchParams(window.location.search).get('reason') === 'session_expired';
  const [errorMsg, setErrorMsg]     = useState(sessionExpired ? '⏳ Your session has expired. Please log in again.' : '');
  const [successMsg, setSuccessMsg] = useState('');
  const [failCount, setFailCount]   = useState(0);
  const [showPwd, setShowPwd]       = useState(false);
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [role, setRole]             = useState('Student');
  const navigate = useNavigate();

  const LOCKED = failCount >= 5;

  // ── Frontend validation ───────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!email.includes('@') || !email.includes('.')) return 'Please enter a valid email address.';
    if (password.length < 6)                           return 'Password must be at least 6 characters.';
    if (!isLogin && name.trim().length < 2)            return 'Name must be at least 2 characters.';
    // Student must use @edu.in college email
    if (!isLogin && role === 'Student' && !email.toLowerCase().endsWith('@edu.in'))
      return 'Student must use college email (@edu.in)';
    return null;
  };


  // ── Form submission ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (LOCKED) return;
<<<<<<< HEAD

    const validationError = validate();
    if (validationError) { setErrorMsg(validationError); return; }

    setIsLoading(true); setErrorMsg(''); setSuccessMsg('');
=======
    setIsLoading(true); setErrorMsg('');
    
    // ── Email Domain Validation ──────────────────────────────────────────────
    if (!isLogin) {
      const emailLower = email.toLowerCase();
      if (role === 'Student' && !emailLower.endsWith('@edu.in')) {
        setErrorMsg('❌ Access Denied: Student account registration requires a college "@edu.in" email.');
        setIsLoading(false); return;
      }
    }

>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
    try {
      if (isLogin) {
        // ── LOGIN FLOW ────────────────────────────────────────────────────
        const res = await api.post('/auth/login', {
          email:    sanitize(email).toLowerCase(),
          password,
        });
        const serverRole = res.data.role as string;
        localStorage.setItem('token',    res.data.token);
        localStorage.setItem('userRole', serverRole);
        setFailCount(0);
<<<<<<< HEAD
        navigate(roleRoute(serverRole));

      } else {
        // ── SIGNUP FLOW ───────────────────────────────────────────────────
        await api.post('/auth/signup', {
          name:     sanitize(name),
          email:    sanitize(email).toLowerCase(),
          password,
          role,
        });

        // Show success banner
        setSuccessMsg('✅ Signup successful! Logging you into your portal...');
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Auto-login with same credentials
        const loginRes = await api.post('/auth/login', {
          email:    sanitize(email).toLowerCase(),
          password,
        });
        const serverRole = loginRes.data.role as string;
        localStorage.setItem('token',    loginRes.data.token);
        localStorage.setItem('userRole', serverRole);
        navigate(roleRoute(serverRole));
=======
        
        // Comprehensive Role-Based Navigation
        if (role === 'Student') navigate('/dashboard/student');
        else if (role === 'Faculty') navigate('/dashboard/faculty');
        else if (role === 'Dean') navigate('/dashboard/dean');
        else if (role === 'Admin') navigate('/dashboard/admin');
        else if (role === 'Warden') navigate('/dashboard/warden');
        else if (role === 'HOD') navigate('/dashboard/authority');
        else navigate('/dashboard/authority');
      } else {
        await api.post('/auth/register', { name: sanitize(name), email: sanitize(email), password, role });
        const loginRes = await api.post('/auth/login', { email: sanitize(email), password });
        localStorage.setItem('token', loginRes.data.token);
        localStorage.setItem('userRole', role);
        
        if (role === 'Student') navigate('/dashboard/student');
        else if (role === 'Faculty') navigate('/dashboard/faculty');
        else if (role === 'Dean') navigate('/dashboard/dean');
        else if (role === 'Admin') navigate('/dashboard/admin');
        else if (role === 'Warden') navigate('/dashboard/warden');
        else if (role === 'HOD') navigate('/dashboard/authority');
        else navigate('/dashboard/authority');
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setFailCount(c => c + 1);
      setSuccessMsg('');
      const status    = err.response?.status;
      const serverMsg = err.response?.data?.message || '';

      let msg = 'Authentication failed. Please try again.';
      if (status === 409)           msg = '⚠️ User already exists. Please sign in instead.';
      else if (status === 422)      msg = serverMsg || 'Student must use college email (@edu.in)';
      else if (status === 401)      msg = 'Invalid email or password.';
      else if (serverMsg)           msg = serverMsg;

      setErrorMsg(LOCKED ? '⛔ Account locked after 5 failed attempts. Refresh to try again.' : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const ROLE_ICONS: Record<string, React.ReactNode> = {
    Student: <GraduationCap size={16} />,
    Faculty: <User          size={16} />,
    Warden:  <Shield        size={16} />,
    Dean:    <Shield        size={16} />,
    HOD:     <Zap           size={16} />,
    Admin:   <Zap           size={16} />,
  };

  return (
    <div style={{ backgroundColor: DS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        .mesh-bg {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;
          background:
            radial-gradient(circle at 10% 10%, ${DS.blue}10 0%, transparent 40%),
            radial-gradient(circle at 90% 90%, ${DS.indigo}10 0%, transparent 40%);
        }

        .floating-glass {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: ${DS.shadowGlass};
          transform: translateY(0);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .floating-glass:hover { transform: translateY(-5px); }

        .form-input {
          width: 100%; padding: 16px 20px; border-radius: 14px;
          background: #F1F4F8; border: 2px solid transparent;
          font-size: 15px; color: ${DS.text}; transition: all 0.2s;
          outline: none; box-sizing: border-box;
        }
        .form-input:focus {
          background: white; border-color: ${DS.blue};
          box-shadow: 0 10px 20px rgba(26,115,232,0.06);
        }

        .btn-submit {
          background: linear-gradient(135deg, ${DS.blue}, ${DS.indigo});
          color: white; border: none; padding: 18px; border-radius: 16px;
          font-weight: 800; font-size: 16px; cursor: pointer; width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 12px 24px ${DS.blue}30; transition: all 0.2s;
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 30px ${DS.blue}40; }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .role-pill {
          padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 700;
          cursor: pointer; border: none; display: flex; align-items: center; gap: 8px;
          transition: all 0.2s; background: #F1F4F8; color: ${DS.textFaint};
        }
        .role-pill.active { background: white; color: ${DS.blue}; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .alert-box { animation: fadeIn 0.25s ease forwards; }
      `}</style>

      <div className="mesh-bg" />

      <Link to="/" style={{ position: 'absolute', top: 40, left: 40, display: 'flex', alignItems: 'center', gap: 10, color: DS.textMuted, textDecoration: 'none', fontWeight: 700, fontSize: 13, zIndex: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        <ArrowLeft size={16} /> Dashboard Home
      </Link>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480, padding: 24 }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', background: DS.blue, padding: 14, borderRadius: 16, marginBottom: 20, boxShadow: '0 10px 20px ' + DS.blue + '30' }}>
            <Zap size={32} color="#FFF" fill="#FFF" />
          </div>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 32, color: DS.text, letterSpacing: '-0.03em', margin: 0 }}>
            VoltGrievance
          </h1>
          <p style={{ color: DS.textMuted, fontSize: 15, marginTop: 8 }}>Secure Academic Decision Support Portal</p>
        </div>

        {/* Floating Glass Card */}
        <div className="floating-glass" style={{ padding: 48, borderRadius: DS.radiusCard }}>

          {/* Sign In / Sign Up Toggle */}
          <div style={{ display: 'flex', background: '#F1F4F8', borderRadius: 12, padding: 5, marginBottom: 32 }}>
            <button id="btn-switch-login"  onClick={() => { setIsLogin(true);  setErrorMsg(''); setSuccessMsg(''); }} style={{ flex: 1, padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', background: isLogin ? 'white' : 'transparent', color: isLogin ? DS.text : DS.textFaint, boxShadow: isLogin ? '0 4px 10px rgba(0,0,0,0.05)' : 'none', transition: '0.2s' }}>Sign In</button>
            <button id="btn-switch-signup" onClick={() => { setIsLogin(false); setErrorMsg(''); setSuccessMsg(''); }} style={{ flex: 1, padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', background: !isLogin ? 'white' : 'transparent', color: !isLogin ? DS.text : DS.textFaint, boxShadow: !isLogin ? '0 4px 10px rgba(0,0,0,0.05)' : 'none', transition: '0.2s' }}>Sign Up</button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="alert-box" style={{ padding: '14px 18px', background: DS.redLight, borderRadius: 14, color: DS.red, fontSize: 13, fontWeight: 600, marginBottom: 24, border: '1px solid ' + DS.red + '20' }}>
              {errorMsg}
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="alert-box" style={{ padding: '14px 18px', background: '#ECFDF5', borderRadius: 14, color: '#059669', fontSize: 13, fontWeight: 600, marginBottom: 24, border: '1px solid rgba(16,185,129,0.2)' }}>
              {successMsg}
            </div>
          )}

          <form id="auth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Name — signup only */}
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: DS.textFaint, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Full Name</label>
                <input
                  id="input-name"
                  required type="text" minLength={2} maxLength={100}
                  placeholder="e.g. Alex Sentinel"
                  value={name} onChange={e => setName(e.target.value)}
                  className="form-input" disabled={isLoading || LOCKED}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: DS.textFaint, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Academic Email</label>
              <input
                id="input-email"
                required type="email"
                placeholder="alex@university.edu"
                value={email} onChange={e => setEmail(e.target.value)}
                className="form-input" disabled={isLoading || LOCKED}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: DS.textFaint, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Password {!isLogin && <span style={{ color: DS.textFaint, textTransform: 'none', fontWeight: 500 }}>(min 6 chars)</span>}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="input-password"
                  required type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••" minLength={6}
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="form-input" style={{ paddingRight: 50 }}
                  disabled={isLoading || LOCKED}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: DS.textFaint }}>
                  {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Role Picker */}
            <div>
<<<<<<< HEAD
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: DS.textFaint, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isLogin ? 'Your Role (for display)' : 'Register As'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {(['Student', 'Faculty', 'Warden', 'Dean', 'HOD', 'Admin'] as const).map(r => (
                  <button key={r} id={`role-${r}`} type="button" onClick={() => setRole(r)} disabled={isLoading || LOCKED} className={`role-pill ${role === r ? 'active' : ''}`}>
                    {ROLE_ICONS[r]} {r}
=======
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: DS.textFaint, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Authorization Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {['Student', 'Faculty', 'Warden', 'HOD', 'Dean', 'Admin'].map(r => (
                  <button key={r} type="button" onClick={() => setRole(r)} disabled={isLoading || LOCKED} className={`role-pill ${role === r ? 'active' : ''}`}>
                    {ROLE_ICONS[r] || <Shield size={16} />} {r}
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
                  </button>
                ))}
              </div>
            </div>

            <button id="btn-submit" type="submit" disabled={isLoading || LOCKED} className="btn-submit">
              {isLoading
                ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                : <Lock size={20} />}
              {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <ShieldCheck size={18} color={DS.blue} />
          <span style={{ fontSize: 13, color: DS.textFaint, fontWeight: 600 }}>End-to-End Cryptographic Validation Active</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
