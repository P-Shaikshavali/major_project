import { useState, useEffect } from 'react';
import { UploadCloud, Lock, Zap, ShieldCheck, Lightbulb, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// ── Stitch "Blue Sentinel" Design Tokens (Student Specific) ──────────────────
const DS = {
  bg:            '#F8F9FA',
  surface:       '#FFFFFF',
  blue:          '#1A73E8',
  blueDark:      '#005BBF',
  blueLight:     '#EBF3FD',
  blueMid:       '#D8E2FF',
  text:          '#111827',
  textMuted:     '#414754',
  textFaint:     '#727785',
  green:         '#10B981',
  greenLight:    '#ECFDF5',
  amber:         '#9E4300',
  amberLight:    '#FFDBCB',
  red:           '#B91C1C',
  redLight:      '#FEF2F2',
  shadowAmbient: '0 20px 40px rgba(44,47,49,0.06)',
  radiusCard:    '24px',
  radiusBtn:     '14px',
};

const CATEGORIES = [
  'Academic', 'Hostel', 'Admin', 'Safety',
  'Faculty Issue', 'Infrastructure', 'Examination', 'General',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
type Priority = typeof PRIORITIES[number];

const PRIORITY_COLORS: Record<Priority, { active: string; text: string }> = {
  Low:      { active: DS.blue,    text: '#FFFFFF' },
  Medium:   { active: DS.green,   text: '#FFFFFF' },
  High:     { active: DS.amber,   text: '#FFFFFF' },
  Critical: { active: DS.red,     text: '#FFFFFF' },
};

const predictCategory = (desc: string): { category: string; assignedTo: string; resolution: string } | null => {
  const d = desc.toLowerCase();
  if (d.length < 15) return null;
  if (d.includes('hostel') || d.includes('food') || d.includes('room') || d.includes('wifi') || d.includes('mess'))
    return { category: 'Hostel', assignedTo: 'Hostel Dean / Warden', resolution: '2–4 days' };
  if (d.includes('exam') || d.includes('mark') || d.includes('grade') || d.includes('result') || d.includes('attendance'))
    return { category: 'Academic', assignedTo: 'Department Faculty', resolution: '3–5 days' };
  if (d.includes('fee') || d.includes('portal') || d.includes('admission') || d.includes('certificate'))
    return { category: 'Admin', assignedTo: 'Administrative Office', resolution: '5–7 days' };
  if (d.includes('harass') || d.includes('safe') || d.includes('threat') || d.includes('security'))
    return { category: 'Safety', assignedTo: 'Dean of Students', resolution: '1–2 days (Urgent)' };
  if (d.includes('faculty') || d.includes('professor') || d.includes('teacher') || d.includes('discrimination'))
    return { category: 'Faculty Issue', assignedTo: 'HOD / Dean', resolution: '3–5 days' };
  return { category: 'General', assignedTo: 'Grievance Committee', resolution: '5–7 days' };
};

const SubmitComplaint = () => {
  const [desc,          setDesc]          = useState('');
  const [category,      setCategory]      = useState('');
  const [priority,      setPriority]      = useState<Priority>('Medium');
  const [anon,          setAnon]          = useState(false);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError,   setSubmitError]   = useState('');
  const [prediction,    setPrediction]    = useState<ReturnType<typeof predictCategory>>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setPrediction(predictCategory(desc));
  }, [desc]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (desc.length < 10) return;
    setSubmitError('');
    setSubmitSuccess(false);
    setIsSubmitting(true);
    try {
      await api.post('/grievance/create', {
        description: desc,
        category: category || prediction?.category || 'General',
        priority,
        isAnonymous: anon,
      });
      setSubmitSuccess(true);
      setTimeout(() => navigate('/dashboard/list'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Server unavailable.';
      setSubmitError(msg);
    } finally { setIsSubmitting(false); }
  };

  const cardStyle = {
    background: DS.surface, borderRadius: DS.radiusCard, padding: 40,
    boxShadow: DS.shadowAmbient, border: '1px solid rgba(255,255,255,0.8)',
  };

  return (
    <div style={{ padding: '48px', minHeight: '100vh', background: DS.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');`}</style>
      
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:DS.blueLight, padding:'4px 12px', borderRadius:20, marginBottom:16 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:DS.blue }} />
          <span style={{ fontSize:11, fontWeight:700, color:DS.blueDark, letterSpacing:'0.06em', textTransform:'uppercase' }}>Grievance Module</span>
        </div>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 36, fontWeight: 800, color: DS.text, letterSpacing: '-0.02em', margin: 0 }}>
          Submit Your Grievance
        </h1>
        <p style={{ fontSize: 16, color: DS.textMuted, marginTop: 12 }}>Your secure, anonymous portal to communicate issues to the institutional board.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, alignItems: 'start' }}>
        
        {/* Main Form Section */}
        <div style={cardStyle}>
          {submitSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRadius: 16, background: DS.greenLight, marginBottom: 24, border: `1px solid ${DS.green}20` }}>
              <ShieldCheck size={20} style={{ color: DS.green }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: DS.green }}>Complaint submitted successfully. Redirecting you...</p>
            </div>
          )}

          {submitError && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 20px', borderRadius: 16, background: DS.redLight, marginBottom: 24, border: `1px solid ${DS.red}20` }}>
              <Lock size={18} style={{ color: DS.red, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: DS.red }}>Submission Failed</p>
                <p style={{ fontSize: 13, color: DS.red, opacity: 0.8, marginTop: 2 }}>{submitError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            
            {/* Description Section */}
            <div>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text, marginBottom: 12 }}>Issue Description</p>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Describe your grievance in detail... (Min 10 characters)"
                style={{
                  width: '100%', minHeight: 180, padding: '20px', borderRadius: 20, 
                  background: DS.bg, border: '2px solid transparent', outline: 'none',
                  fontSize: 15, color: DS.text, fontFamily: 'inherit', lineHeight: 1.6,
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = DS.blue; e.target.style.boxShadow = `0 12px 24px ${DS.blue}10`; }}
                onBlur={e => { e.target.style.background = DS.bg; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: desc.length < 10 ? DS.red : DS.textFaint }}>{desc.length} / 2000 characters</span>
              </div>
            </div>

            {/* Config Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 800, color: DS.text, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</p>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  style={{ width: '100%', padding: '14px 18px', borderRadius: 12, border: 'none', background: DS.bg, fontSize: 14, fontWeight: 600, color: DS.text, outline: 'none' }}
                >
                  <option value="">{prediction ? `Suggested: ${prediction.category}` : "Select Category"}</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 800, color: DS.text, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Priority</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {PRIORITIES.map(p => (
                    <button 
                      key={p} type="button" onClick={() => setPriority(p)}
                      style={{ 
                        flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 700, 
                        background: priority === p ? PRIORITY_COLORS[p].active : DS.bg,
                        color: priority === p ? '#fff' : DS.textMuted,
                        transition: 'all 0.2s'
                      }}
                    >{p}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div style={{ padding: '20px 24px', borderRadius: 20, background: DS.blue + '08', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: DS.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <Lock size={20} style={{ color: DS.blue }} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: DS.text }}>Identity Masking</p>
                  <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 2 }}>Enabled: Investigators see a tracking ID only.</p>
                </div>
              </div>
              <button
                type="button" onClick={() => setAnon(!anon)}
                style={{ 
                  width: 56, height: 28, borderRadius: 28, background: anon ? DS.blue : DS.textFaint, border: 'none', 
                  cursor: 'pointer', position: 'relative', transition: 'background 0.3s'
                }}
              >
                <div style={{ position: 'absolute', top: 4, left: anon ? 32 : 4, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} />
              </button>
            </div>

            <button
              type="submit" disabled={isSubmitting || desc.length < 10}
              style={{
                width: '100%', padding: '20px', borderRadius: 18, border: 'none',
                background: isSubmitting ? DS.textMuted : DS.blue, color: '#fff',
                fontSize: 16, fontWeight: 800, fontFamily: "'Manrope', sans-serif",
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                boxShadow: `0 12px 32px ${DS.blue}30`, transition: 'all 0.2s'
              }}
              onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.transform = 'none' }}
            >
              {isSubmitting ? <Loader2 size={20} style={{ animation: 'spin 1.5s linear infinite' }} /> : <Zap size={18} fill="#fff" />}
              {isSubmitting ? 'SECURELY SUBMITTING...' : 'SECURELY SUBMIT GRIEVANCE'}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>

          </form>
        </div>

        {/* Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* AI Predictor Preview */}
          <div style={{ ...cardStyle, background: DS.blue, color: '#fff', padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} fill="#fff" />
              </div>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800 }}>AI Routing Insight</p>
            </div>
            
            {prediction ? (
              <div style={{ display:'flex', flexDirection:'column', gap:20, animation:'fadeIn 0.4s' }}>
                <div>
                  <p style={{ fontSize: 13, opacity: 0.8, fontWeight: 600 }}>Predicted Category</p>
                  <p style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{prediction.category}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', height: 1 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 12, opacity: 0.8, fontWeight: 600 }}>Authority</p>
                    <p style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{prediction.assignedTo}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, opacity: 0.8, fontWeight: 600 }}>SLA Target</p>
                    <p style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{prediction.resolution}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>Describe your situation to see how our AI routing engine will categorize and prioritize your grievance.</p>
            )}
          </div>

          {/* Guidelines */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <Lightbulb size={20} style={{ color: DS.blue }} />
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text }}>Submission Tips</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { title: 'Be Precise', text: 'Include dates, times, and clear sequence of events.' },
                { title: 'Evidence Matters', text: 'Prepare documentation to support your claim if asked.' },
                { title: 'SLA Awareness', text: 'Resolution varies by complexity and priority level.' }
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: DS.blue + '30', lineHeight: 1 }}>{i+1}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: DS.text }}>{tip.title}</p>
                    <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 4, lineHeight: 1.5 }}>{tip.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: 32, padding: '20px', borderRadius: 20, background: DS.bg, display: 'flex', alignItems: 'center', gap: 12 }}>
              <ShieldCheck size={20} style={{ color: DS.green }} />
              <p style={{ fontSize: 13, color: DS.textMuted, fontWeight: 500 }}>All communications are audited for harassment and integrity.</p>
            </div>
          </div>

        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SubmitComplaint;
