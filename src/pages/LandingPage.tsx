import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Clock, ArrowRight } from 'lucide-react';

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
  // Ambient Soft Shadows for No-Line Philosophy
  shadowAmbient: '0 20px 40px rgba(44,47,49,0.06)',
  shadowHover:   '0 30px 60px rgba(26,115,232,0.12)',
  radiusCard:    '20px',
  radiusBtn:     '12px',
};

const LandingPage = () => {
  return (
    <div style={{ backgroundColor: DS.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        
        .nav-link { color: ${DS.textMuted}; font-weight: 500; font-size: 14.5px; transition: color 0.2s; }
        .nav-link:hover { color: ${DS.blue}; }
        
        .btn-primary {
          background: linear-gradient(135deg, ${DS.blue}, ${DS.blueDark});
          color: #FFF; font-weight: 600; padding: 14px 28px; border-radius: ${DS.radiusBtn};
          font-size: 15px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(26,115,232,0.3);
          border: none; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-primary:hover { box-shadow: 0 6px 20px rgba(26,115,232,0.4); transform: translateY(-1px); }
        
        .btn-ghost {
          background: transparent; color: ${DS.text}; font-weight: 600; padding: 14px 28px; 
          border-radius: ${DS.radiusBtn}; font-size: 15px; transition: all 0.2s;
        }
        .btn-ghost:hover { background: ${DS.surfaceHigh}; }
        
        .feature-card {
          background: ${DS.surface}; border-radius: ${DS.radiusCard}; padding: 40px;
          box-shadow: ${DS.shadowAmbient}; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255,255,255,0.8);
        }
        .feature-card:hover { transform: translateY(-4px); box-shadow: ${DS.shadowHover}; }
      `}</style>

      {/* ── HEADER / NAV (Glassmorphism) ────────────────────────────────────── */}
      <header style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, 
        background: 'rgba(248,249,250,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.4)'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: DS.blue, padding: 8, borderRadius: 10 }}>
              <Zap size={20} color="#FFF" fill="#FFF" />
            </div>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 20, color: DS.text, letterSpacing: '-0.03em' }}>
              VoltGrievance
            </span>
          </div>

          <nav style={{ display: 'none', gap: 32 }} className="md-flex">
            <a href="#features" className="nav-link">Intelligence</a>
            <a href="#security" className="nav-link">Security</a>
            <a href="#compliance" className="nav-link">Compliance</a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/login" className="btn-ghost" style={{ padding: '10px 20px' }}>Login Securely</Link>
            <Link to="/dashboard/submit" className="btn-primary" style={{ padding: '10px 24px' }}>Submit Grievance</Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 180, paddingBottom: 120, textAlign: 'center', paddingLeft: 24, paddingRight: 24, overflow: 'hidden', position: 'relative' }}>
        
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: DS.blueLight, filter: 'blur(120px)', zIndex: 0, borderRadius: '50%', opacity: 0.6 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EFF6FF', padding: '8px 16px', borderRadius: 40, border: '1px solid #DBEAFE', marginBottom: 32 }}>
            <span style={{ fontSize: 13 }}>✨</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: DS.blueDark, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Now with Deep AI Pattern Recognition</span>
          </div>

          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 'clamp(48px, 6vw, 76px)', color: DS.text, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 24 }}>
            Academic resolution, <br /><span style={{ background: `linear-gradient(135deg, ${DS.blue}, #7C3AED)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>illuminated.</span>
          </h1>

          <p style={{ fontSize: 'clamp(17px, 2vw, 21px)', color: DS.textMuted, maxWidth: 650, margin: '0 auto 48px', lineHeight: 1.6, fontWeight: 400 }}>
            A privacy-first, decentralized grievance interface. AI routes your issues instantly while protecting student identities with military-grade zero-knowledge architecture.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/dashboard/submit" className="btn-primary" style={{ padding: '18px 36px', fontSize: 16 }}>
              Submit a Grievance <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-ghost" style={{ padding: '18px 36px', fontSize: 16, background: DS.surface, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              View Faculty Portal
            </Link>
          </div>
        </div>

        {/* Hero Abstract Mockup */}
        <div style={{ marginTop: 80, position: 'relative', zIndex: 1, maxWidth: 1000, margin: '80px auto 0' }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(40px)', 
            border: '1px solid rgba(255,255,255,1)', borderRadius: 24, padding: 8,
            boxShadow: '0 40px 100px rgba(26,115,232,0.1)'
          }}>
            <div style={{ background: DS.surface, borderRadius: 20, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #F3F4F5' }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: DS.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Routing Intelligence</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: DS.greenLight, color: DS.green, padding: '4px 8px', borderRadius: 6, fontWeight: 700, fontSize: 13 }}>99.2%</div>
                  <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 24, fontWeight: 800, color: DS.text }}>Accuracy Match</h3>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                 <div style={{ width: 160, height: 8, background: DS.surfaceLow, borderRadius: 10, overflow: 'hidden' }}><div style={{ width: '99%', height: '100%', background: DS.blue }}></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '120px 24px', background: DS.surface, borderTop: `1px solid ${DS.surfaceLow}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 42, color: DS.text, letterSpacing: '-0.02em', marginBottom: 16 }}>
              Intelligent. Secure. Anonymous.
            </h2>
            <p style={{ fontSize: 18, color: DS.textMuted, maxWidth: 600, margin: '0 auto' }}>
              Built specifically for academic institutions requiring strict compliance and rigorous student protection.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
            
            {/* Feature 1 */}
            <div className="feature-card">
              <div style={{ width: 56, height: 56, background: DS.blueLight, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <Zap size={26} color={DS.blue} />
              </div>
              <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: DS.text, marginBottom: 12, letterSpacing: '-0.01em' }}>
                AI Routing Engine
              </h3>
              <p style={{ fontSize: 15, color: DS.textMuted, lineHeight: 1.6 }}>
                Natural Language Processing analyzes complaint sentiment and context, automatically directing it to the exact right authority within milliseconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div style={{ width: 56, height: 56, background: DS.blueLight, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <ShieldCheck size={26} color={DS.blue} />
              </div>
              <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: DS.text, marginBottom: 12, letterSpacing: '-0.01em' }}>
                Identity Masking
              </h3>
              <p style={{ fontSize: 15, color: DS.textMuted, lineHeight: 1.6 }}>
                Strict anonymity protocols. Faculty and Wardens only see a generated Tracking ID. Student identities are never exposed during the resolution process.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div style={{ width: 56, height: 56, background: DS.blueLight, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <Clock size={26} color={DS.blue} />
              </div>
              <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: DS.text, marginBottom: 12, letterSpacing: '-0.01em' }}>
                Real-time Escalation
              </h3>
              <p style={{ fontSize: 15, color: DS.textMuted, lineHeight: 1.6 }}>
                Dynamic SLA tracking. Unresolved high-priority issues are automatically escalated to Deans or executive leadership after 3 days to maintain compliance.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0A0F1A', padding: '80px 24px 40px', color: '#FFF' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 10 }}>
              <Zap size={20} color="#FFF" />
            </div>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em' }}>
              VoltGrievance
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: 32, marginBottom: 60 }}>
            <a href="#" style={{ color: '#8B949E', textDecoration: 'none', fontSize: 14 }}>Privacy Policy</a>
            <a href="#" style={{ color: '#8B949E', textDecoration: 'none', fontSize: 14 }}>Terms of Service</a>
            <a href="#" style={{ color: '#8B949E', textDecoration: 'none', fontSize: 14 }}>Security Posture</a>
          </div>

          <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 40 }} />
          
          <p style={{ color: '#6E7681', fontSize: 13 }}>
            © {new Date().getFullYear()} VoltGrievance. Built for Academic Excellence.
          </p>

        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
