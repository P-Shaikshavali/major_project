import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ShieldCheck, Lock, Eye, EyeOff, Zap, ArrowLeft, User, GraduationCap, Shield } from 'lucide-react';
import api from '../services/api';

// ── Sanitize input (XSS prevention) ──
const sanitize = (v: string) => v.replace(/[<>"'`]/g, '');

// ── Stitch "Volt Sentinel" Design Tokens ────────────────────────────────────
const DS = {
  bg:            '#F8F9FA',
  surface:       '#FFFFFF',
  blue:          '#1A73E8',
  blueDark:      '#005BBF',
  indigo:        '#6366F1',
  text:          '#111827',
  textMuted:     '#414754',
  textFaint:     '#727785',
  red:           '#EF4444',
  redLight:      '#FEF2F2',
  radiusCard:    '32px',
  radiusBtn:     '16px',
  shadowGlass:   '0 30px 60px rgba(0,0,0,0.12)',
};

const LoginPage = () => {
  const [isLogin, setIsLogin]     = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const sessionExpired = new URLSearchParams(window.location.search).get('reason') === 'session_expired';
  const [errorMsg, setErrorMsg]   = useState(sessionExpired ? '⏳ Your session has expired. Please log in again.' : '');
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

  const ROLE_ICONS: Record<string, any> = {
    Student: <GraduationCap size={16} />,
    Faculty: <User size={16} />,
    Warden:  <Shield size={16} />,
    Dean:    <Shield size={16} />,
    Admin:   <Zap size={16} />,
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
          outline: none;
        }
        .form-input:focus {
          background: white; border-color: ${DS.blue};
          box-shadow: 0 10px 20px rgba(26,115,232,0.06);
        }

        .btn-submit {
          background: linear-gradient(135deg, ${DS.blue}, ${DS.indigo});
          color: white; border: none; padding: 18px; border-radius: 16px;
          font-weight: 800; font-size: 16px; cursor: pointer;
          display: flex; align-items: center; justifyContent: center; gap: 10px;
          box-shadow: 0 12px 24px ${DS.blue}30;
          transition: all 0.2s;
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 30px ${DS.blue}40; }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .role-pill {
          padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 700;
          cursor: pointer; border: none; display: flex; align-items: center; gap: 8px;
          transition: all 0.2s; background: #F1F4F8; color: ${DS.textFaint};
        }
        .role-pill.active { background: white; color: ${DS.blue}; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      `}</style>
      
      <div className="mesh-bg" />

      {/* Top Left Back Button */}
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

        {/* Floating Glass Form Card */}
        <div className="floating-glass" style={{ padding: 48, borderRadius: DS.radiusCard }}>
          
          {/* Toggle Switch */}
          <div style={{ display: 'flex', background: '#F1F4F8', borderRadius: 12, padding: 5, marginBottom: 32 }}>
            <button onClick={() => setIsLogin(true)} style={{ flex: 1, padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', background: isLogin ? 'white' : 'transparent', color: isLogin ? DS.text : DS.textFaint, boxShadow: isLogin ? '0 4px 10px rgba(0,0,0,0.05)' : 'none', transition: '0.2s' }}>Sign In</button>
            <button onClick={() => setIsLogin(false)} style={{ flex: 1, padding: '12px 0', borderRadius: 10, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', background: !isLogin ? 'white' : 'transparent', color: !isLogin ? DS.text : DS.textFaint, boxShadow: !isLogin ? '0 4px 10px rgba(0,0,0,0.05)' : 'none', transition: '0.2s' }}>Sign Up</button>
          </div>

          {errorMsg && (
            <div style={{ padding: '14px 18px', background: DS.redLight, borderRadius: 14, color: DS.red, fontSize: 13, fontWeight: 600, marginBottom: 32, border: '1px solid ' + DS.red + '20' }}>
               {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: DS.textFaint, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Verification Name</label>
                <input required type="text" placeholder="Alex Sentinel" value={name} onChange={e => setName(e.target.value)} className="form-input" disabled={isLoading || LOCKED} />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: DS.textFaint, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Academic Email</label>
              <input required type="email" placeholder="alex@university.edu" value={email} onChange={e => setEmail(e.target.value)} className="form-input" disabled={isLoading || LOCKED} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: DS.textFaint, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pass-Key</label>
              <div style={{ position: 'relative' }}>
                <input required type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="form-input" style={{ paddingRight: 50 }} disabled={isLoading || LOCKED} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: DS.textFaint }}>
                  {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Role Grid */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: DS.textFaint, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Authorization Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {['Student', 'Faculty', 'Warden', 'Dean', 'Admin'].map(r => (
                  <button key={r} type="button" onClick={() => setRole(r)} disabled={isLoading || LOCKED} className={`role-pill ${role === r ? 'active' : ''}`}>
                    {ROLE_ICONS[r]} {r}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isLoading || LOCKED} className="btn-submit">
              {isLoading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Lock size={20} />}
              {isLogin ? 'AUTHENTICATE & ENTER' : 'GENERATE CREDENTIALS'}
            </button>
          </form>

        </div>
        
        <div style={{ textAlign: 'center', marginTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <ShieldCheck size={18} color={DS.blue} />
          <span style={{ fontSize: 13, color: DS.textFaint, fontWeight: 600 }}>End-to-End Cryptographic Validation Active</span>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoginPage;
