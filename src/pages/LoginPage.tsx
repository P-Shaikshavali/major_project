import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ShieldCheck, Lock, Eye, EyeOff, Zap, ArrowLeft } from 'lucide-react';
import api from '../services/api';

// ── Sanitize input (XSS prevention) ──
const sanitize = (v: string) => v.replace(/[<>"'`]/g, '');

// ── Stitch "Academic Sentinel" Design Tokens ──────────────────────────────────
const DS = {
  bg:            '#F8F9FA',
  surface:       '#FFFFFF',
  surfaceLow:    '#F3F4F5',
  surfaceHigh:   '#E1E3E4',
  blue:          '#1A73E8',
  blueDark:      '#005BBF',
  blueLight:     '#EBF3FD',
  blueMid:       '#D8E2FF',
  text:          '#111827',
  textMuted:     '#414754',
  textFaint:     '#727785',
  green:         '#1B6B3A',
  greenLight:    '#D9F0E3',
  red:           '#B91C1C',
  redLight:      '#FEF2F2',
  shadowAmbient: '0 20px 40px rgba(44,47,49,0.06)',
  radiusCard:    '20px',
  radiusBtn:     '12px',
  radiusMd:      '10px',
  radiusSm:      '8px',
};

const LoginPage = () => {
  const [isLogin, setIsLogin]     = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  // Check if redirected due to session expiry
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

  // ── Stitch Elegant Input Styles ──
  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: DS.radiusMd,
    background: DS.surfaceHigh, border: 'none', outline: 'none',
    fontSize: 14, color: DS.text, fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s',
  };

  const onFocus = (e: any) => {
    e.target.style.background = '#F0F5FF';
    e.target.style.boxShadow  = `inset 0 -2px 0 ${DS.blue}`;
  };
  const onBlur = (e: any) => {
    e.target.style.background = DS.surfaceHigh;
    e.target.style.boxShadow  = 'none';
  };

  return (
    <div style={{ backgroundColor: DS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>
      
      {/* Subtle background glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, background: DS.blueLight, filter: 'blur(100px)', zIndex: 0, borderRadius: '50%', opacity: 0.7 }} />

      {/* Top Left Back Button */}
      <Link to="/" style={{ position: 'absolute', top: 32, left: 32, display: 'flex', alignItems: 'center', gap: 8, color: DS.textMuted, textDecoration: 'none', fontWeight: 600, fontSize: 14, zIndex: 10 }}>
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440, padding: 24 }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', background: DS.blue, padding: 12, borderRadius: 14, marginBottom: 16 }}>
            <Zap size={28} color="#FFF" fill="#FFF" />
          </div>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: DS.text, letterSpacing: '-0.02em', marginBottom: 8 }}>
            VoltGrievance
          </h1>
          <p style={{ color: DS.textMuted, fontSize: 14.5 }}>
            Academic resolution, illuminated.
          </p>
        </div>

        {/* Form Card */}
        <div style={{ background: DS.surface, padding: 40, borderRadius: DS.radiusCard, boxShadow: DS.shadowAmbient, border: '1px solid rgba(255,255,255,0.8)' }}>
          
          <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, color: DS.text, letterSpacing: '-0.01em', marginBottom: 24 }}>
            {isLogin ? 'Sign in to portal' : 'Create an account'}
          </h2>

          {/* Toggle Login/Register */}
          <div style={{ display: 'flex', background: DS.surfaceLow, borderRadius: DS.radiusBtn, padding: 4, marginBottom: 24 }}>
            <button onClick={() => { setIsLogin(true); setErrorMsg(''); }} style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13.5, fontWeight: 600, border: 'none', cursor: 'pointer', background: isLogin ? DS.surface : 'transparent', color: isLogin ? DS.text : DS.textFaint, boxShadow: isLogin ? '0 2px 8px rgba(0,0,0,0.04)' : 'none', transition: 'all 0.2s' }}>
              Sign In
            </button>
            <button onClick={() => { setIsLogin(false); setErrorMsg(''); }} style={{ flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 13.5, fontWeight: 600, border: 'none', cursor: 'pointer', background: !isLogin ? DS.surface : 'transparent', color: !isLogin ? DS.text : DS.textFaint, boxShadow: !isLogin ? '0 2px 8px rgba(0,0,0,0.04)' : 'none', transition: 'all 0.2s' }}>
              Sign Up
            </button>
          </div>

          {errorMsg && (
            <div style={{ padding: '12px 16px', background: DS.redLight, borderLeft: `3px solid ${DS.red}`, borderRadius: DS.radiusSm, color: DS.red, fontSize: 13, fontWeight: 500, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>⚠</span> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: DS.textMuted, marginBottom: 6 }}>Full Name</label>
                <input required type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} style={fieldStyle} onFocus={onFocus} onBlur={onBlur} disabled={isLoading || LOCKED} />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: DS.textMuted, marginBottom: 6 }}>University Email</label>
              <input required type="email" placeholder="student@university.edu" value={email} onChange={e => setEmail(e.target.value)} style={fieldStyle} onFocus={onFocus} onBlur={onBlur} disabled={isLoading || LOCKED} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: DS.textMuted, marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input required type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ ...fieldStyle, paddingRight: 44 }} onFocus={onFocus} onBlur={onBlur} disabled={isLoading || LOCKED} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: DS.textFaint }}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: DS.textMuted, marginBottom: 8 }}>Access Role</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Student', 'Faculty', 'Warden', 'Dean', 'Admin'].map(r => (
                  <button key={r} type="button" onClick={() => setRole(r)} disabled={isLoading || LOCKED}
                    style={{
                      padding: '8px 16px', borderRadius: 40, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                      background: role === r ? DS.blueLight : DS.surfaceLow,
                      color: role === r ? DS.blueDark : DS.textFaint,
                      boxShadow: role === r ? `inset 0 0 0 1px ${DS.blue}` : 'none',
                      transition: 'all 0.2s'
                    }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isLoading || LOCKED} 
              style={{
                background: `linear-gradient(135deg, ${DS.blue}, ${DS.blueDark})`,
                color: '#FFF', fontWeight: 600, padding: '16px', borderRadius: DS.radiusBtn,
                fontSize: 15, border: 'none', cursor: (isLoading || LOCKED) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 4px 14px rgba(26,115,232,0.3)', marginTop: 8,
                opacity: (isLoading || LOCKED) ? 0.7 : 1, transition: 'all 0.2s'
            }}>
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
              {isLogin ? 'Login Securely' : 'Create Account'}
            </button>
          </form>

        </div>
        
        <div style={{ textAlign: 'center', marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <ShieldCheck size={16} color={DS.green} />
          <span style={{ fontSize: 12.5, color: DS.textFaint, fontWeight: 500 }}>Protected by VoltGrievance Zero-Knowledge Protocol</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
