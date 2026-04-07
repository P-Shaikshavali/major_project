import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, ArrowRight, Lock, Fingerprint, Globe } from 'lucide-react';

// ── Stitch "Volt Sentinel" Design Tokens (Extreme Premium) ────────────────────
const DS = {
  bg:            '#F8F9FA',
  surface:       '#FFFFFF',
  blue:          '#1A73E8',
  blueDark:      '#005BBF',
  emerald:       '#10B981',
  emeraldDark:   '#065F46',
  indigo:        '#6366F1',
  text:          '#111827',
  textMuted:     '#414754',
  textFaint:     '#727785',
  radiusCard:    '28px',
  radiusBtn:     '16px',
};

const LandingPage = () => {
  return (
    <div style={{ backgroundColor: DS.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        
        .mesh-bg {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;
          background: 
            radial-gradient(circle at 0% 0%, ${DS.emerald}15 0%, transparent 40%),
            radial-gradient(circle at 100% 0%, ${DS.blue}15 0%, transparent 40%),
            radial-gradient(circle at 50% 100%, ${DS.indigo}10 0%, transparent 40%);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.04);
        }

        .btn-premium {
          background: linear-gradient(135deg, ${DS.blue}, ${DS.indigo});
          color: white; border: none; padding: 16px 32px; border-radius: ${DS.radiusBtn};
          font-weight: 700; font-size: 16px; cursor: pointer;
          display: inline-flex; align-items: center; gap: 10px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 25px ${DS.blue}30;
        }
        .btn-premium:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 15px 35px ${DS.blue}40; }

        .feature-item {
          transition: all 0.3s ease; border: 1px solid transparent;
        }
        .feature-item:hover {
          background: white; transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          border-color: rgba(0,0,0,0.02);
        }

        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
        .floating-element { animation: float 6s ease-in-out infinite; }
      `}</style>

      <div className="mesh-bg" />

      {/* ── STUNNING HEADER ─────────────────────────────────────────────────── */}
      <header style={{ 
        position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 100, 
        width: 'calc(100% - 48px)', maxWidth: 1200, padding: '12px 24px',
        borderRadius: 24, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: DS.blue, width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="#FFF" fill="#FFF" />
          </div>
          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 20, color: DS.text, letterSpacing: '-0.02em' }}>
            VoltGrievance
          </span>
        </div>

        <nav style={{ display: 'flex', gap: 24 }}>
          {['Intelligence', 'Security', 'Compliance'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{ color: DS.textMuted, fontSize: 13.5, fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}>{item}</a>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={{ padding: '10px 20px', fontSize: 13.5, fontWeight: 700, color: DS.text, textDecoration: 'none' }}>Portal Login</Link>
          <Link to="/dashboard/submit" className="btn-premium" style={{ padding: '10px 24px', fontSize: 13.5 }}>Submit Grievance</Link>
        </div>
      </header>

      {/* ── HERO SECTION ────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, paddingTop: 200, paddingBottom: 150, textAlign: 'center' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', padding: '8px 16px', borderRadius: 40, border: '1px solid #E5E7EB', marginBottom: 40, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: DS.emerald }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: DS.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Academic Sentinel Architecture v2.0</span>
          </div>

          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 'clamp(44px, 8vw, 84px)', color: DS.text, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 32 }}>
            Resolution through <br />
            <span style={{ background: `linear-gradient(135deg, ${DS.blue}, ${DS.emerald})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>intelligent clarity.</span>
          </h1>

          <p style={{ fontSize: 'clamp(17px, 2.5vw, 22px)', color: DS.textMuted, maxWidth: 720, margin: '0 auto 60px', lineHeight: 1.6, fontWeight: 400 }}>
            A high-fidelity grievance interface orchestrating AI-driven routing and zero-knowledge student protection. Secure your academic integrity with institutional-grade technology.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            <Link to="/dashboard/submit" className="btn-premium" style={{ fontSize: 17, padding: '20px 40px' }}>
               Initiate Grievance <ArrowRight size={20} />
            </Link>
            <Link to="/login" style={{ background: 'white', border: '1px solid #E5E7EB', color: DS.text, fontWeight: 700, padding: '20px 40px', borderRadius: DS.radiusBtn, textDecoration: 'none', fontSize: 17, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              Faculty Dashboard
            </Link>
          </div>
        </div>

        {/* Floating Modules */}
        <div style={{ position: 'absolute', top: '150px', left: '10%', zIndex: 0 }} className="floating-element">
          <div className="glass-card" style={{ padding: '16px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: DS.emerald + '15', color: DS.emerald, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: DS.text, margin: 0 }}>Identity Protected</p>
              <p style={{ fontSize: 10, color: DS.textMuted, margin: 0 }}>AES-256 Masking Active</p>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '100px', right: '12%', zIndex: 0, animationDelay: '-3s' }} className="floating-element">
          <div className="glass-card" style={{ padding: '16px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: DS.blue + '15', color: DS.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: DS.text, margin: 0 }}>AI Routing Engine</p>
              <p style={{ fontSize: 10, color: DS.textMuted, margin: 0 }}>Predictive Categorization</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE PILLARS ───────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '100px 24px', background: 'white', borderTop: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
            {[
              { icon: <Lock />, title: 'Zero-Knowledge Privacy', desc: 'Identities are cryptographically masked from the point of submission. Authority only sees Tracking IDs.' },
              { icon: <Globe />, title: 'Universal Routing', desc: 'Seamlessly connects multi-departmental grievances into a unified institutional board perspective.' },
              { icon: <Fingerprint />, title: 'Biometric Integrity', desc: 'Session-level security ensuring that only verified academic personnel can access decision support tools.' }
            ].map((f, i) => (
              <div key={i} className="feature-item" style={{ padding: 40, borderRadius: 28 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: DS.bg, color: DS.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: DS.text, marginBottom: 16 }}>{f.title}</h3>
                <p style={{ fontSize: 16, color: DS.textMuted, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ position: 'relative', zIndex: 1, padding: '80px 24px', background: DS.text, color: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
            <Zap size={24} color="#FFF" fill="#FFF" />
            <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>VoltGrievance</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>© 2026 Institutional Decison Support. Built for Academic Integrity.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
