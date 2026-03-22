import { useState, useEffect } from 'react';
import { UploadCloud, Lock, Zap, ShieldCheck, Lightbulb, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// ── Stitch "Academic Sentinel" Design Tokens ──────────────────────────────────
const DS = {
  bg:            '#F9FAFB',
  surface:       '#FFFFFF',
  surfaceLow:    '#F3F4F5',
  surfaceHigh:   '#E1E3E4',
  blue:          '#1A73E8',
  blueDark:      '#005BBF',
  blueLight:     '#EBF3FD',
  blueMid:       '#D8E2FF',
  text:          '#191C1D',
  textMuted:     '#414754',
  textFaint:     '#727785',
  amber:         '#9E4300',
  amberLight:    '#FFDBCB',
  green:         '#1B6B3A',
  greenLight:    '#D9F0E3',
  // shadows — Stitch academic ambient (not dark smudge)
  shadow:        '0 4px 24px rgba(44,47,49,0.06)',
  shadowFocus:   '0 8px 32px rgba(26,115,232,0.10)',
  radius:        '16px',
  radiusMd:      '10px',
  radiusSm:      '8px',
};

const CATEGORIES = [
  'Academic', 'Hostel', 'Admin', 'Safety',
  'Faculty Issue', 'Infrastructure', 'Examination', 'General',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
type Priority = typeof PRIORITIES[number];

const PRIORITY_COLORS: Record<Priority, { active: string; text: string }> = {
  Low:      { active: '#1A73E8', text: '#FFFFFF' },
  Medium:   { active: '#1B6B3A', text: '#FFFFFF' },
  High:     { active: '#9E4300', text: '#FFFFFF' },
  Critical: { active: '#B91C1C', text: '#FFFFFF' },
};

// AI category predictor (frontend heuristic — matches backend eventually)
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
  const [desc,        setDesc]        = useState('');
  const [category,    setCategory]    = useState('');
  const [priority,    setPriority]    = useState<Priority>('Medium');
  const [anon,        setAnon]        = useState(false);
  const [isSubmitting,setIsSubmitting]= useState(false);
  const [prediction,  setPrediction]  = useState<ReturnType<typeof predictCategory>>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setPrediction(predictCategory(desc));
  }, [desc]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (desc.length < 10) return;
    setIsSubmitting(true);
    try {
      await api.post('/grievance/create', {
        description: desc,
        category: category || prediction?.category || 'General',
        priority,
        isAnonymous: anon,
      });
      navigate('/dashboard/list');
    } catch { alert('Failed to submit. Check your connection and try again.'); }
    finally { setIsSubmitting(false); }
  };

  // ── Field style (Stitch Elegant Input) ─────────────────────────────────────
  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: DS.radiusMd,
    background: DS.surfaceHigh,
    border: 'none',
    outline: 'none',
    fontSize: 13.5,
    color: DS.text,
    fontFamily: "'Inter', sans-serif",
    transition: 'background 0.2s, box-shadow 0.2s',
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.background = '#F0F5FF';
    e.target.style.boxShadow  = `inset 0 -2px 0 ${DS.blue}`;
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.background = DS.surfaceHigh;
    e.target.style.boxShadow  = 'none';
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <p style={{ fontSize: 11.5, fontWeight: 600, color: DS.textMuted, marginBottom: 7, letterSpacing: '0.02em', fontFamily: "'Inter', sans-serif" }}>
      {children}
    </p>
  );

  return (
    <div style={{ padding: '32px 36px', minHeight: '100vh', background: DS.bg, fontFamily: "'Inter', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>

      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: DS.blue, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 5, fontFamily: "'Inter', sans-serif" }}>
          New Grievance
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: DS.text, letterSpacing: '-0.02em', fontFamily: "'Manrope', sans-serif", lineHeight: 1.2 }}>
          Submit Your Complaint
        </h1>
        <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 5, fontFamily: "'Inter', sans-serif" }}>
          Your identity is protected. AI routes your issue to the right authority automatically.
        </p>
      </div>

      {/* Two column layout — 8/4 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'flex-start' }}>

        {/* ── LEFT: Main Form Card ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: DS.surface, borderRadius: DS.radius,
            boxShadow: DS.shadow, padding: '32px 36px',
            display: 'flex', flexDirection: 'column', gap: 22,
          }}>

            {/* Card label */}
            <div>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: DS.blue, letterSpacing: '0.09em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
                FILE A GRIEVANCE
              </p>
            </div>

            {/* 1. Category dropdown */}
            <div>
              <Label>Complaint Category</Label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ ...fieldStyle, cursor: 'pointer', appearance: 'auto' }}
                onFocus={onFocus as any}
                onBlur={onBlur as any}
              >
                <option value="">Select category (or let AI decide)...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {prediction && !category && (
                <p style={{ fontSize: 11.5, color: DS.blue, marginTop: 5, fontFamily: "'Inter', sans-serif" }}>
                  💡 AI suggests: <strong>{prediction.category}</strong>
                </p>
              )}
            </div>

            {/* 2. Priority pill-toggle */}
            <div>
              <Label>Priority Level</Label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                {PRIORITIES.map(p => {
                  const isActive = priority === p;
                  const pc = PRIORITY_COLORS[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      style={{
                        padding: '7px 20px', borderRadius: 99, border: 'none', cursor: 'pointer',
                        fontSize: 12.5, fontWeight: 600, transition: 'all 0.18s',
                        background: isActive ? pc.active : DS.surfaceHigh,
                        color: isActive ? pc.text : DS.textMuted,
                        boxShadow: isActive ? `0 2px 10px ${pc.active}40` : 'none',
                        fontFamily: "'Inter', sans-serif",
                      }}>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Description textarea */}
            <div>
              <Label>Describe Your Grievance <span style={{ color: '#B91C1C' }}>*</span></Label>
              <textarea
                rows={6}
                required
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Describe the issue in detail — include dates, locations, and any relevant people involved. The more specific you are, the faster your grievance gets resolved."
                style={{ ...fieldStyle, resize: 'vertical' }}
                onFocus={onFocus as any}
                onBlur={onBlur as any}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                <p style={{ fontSize: 11, color: desc.length < 10 && desc.length > 0 ? '#B91C1C' : DS.textFaint }}>
                  {desc.length < 10 && desc.length > 0 ? 'Minimum 10 characters required' : ''}
                </p>
                <p style={{ fontSize: 11, color: desc.length > 1800 ? '#B91C1C' : DS.textFaint }}>
                  {desc.length} / 2000
                </p>
              </div>
            </div>

            {/* 4. File upload — ghost dashed border (Stitch "ghost border" exception) */}
            <div>
              <Label>Attach Evidence <span style={{ fontWeight: 400 }}>(Optional)</span></Label>
              <label
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 8, padding: '28px 20px',
                  borderRadius: DS.radiusMd, cursor: 'pointer', transition: 'all 0.2s',
                  border: `1.5px dashed rgba(193,198,214,0.5)`, /* Stitch ghost border */
                  background: DS.surfaceLow,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = DS.blueLight;
                  e.currentTarget.style.borderColor = `rgba(26,115,232,0.3)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = DS.surfaceLow;
                  e.currentTarget.style.borderColor = `rgba(193,198,214,0.5)`;
                }}
              >
                <UploadCloud size={22} style={{ color: DS.textFaint }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: DS.textMuted }}>Click to upload or drag & drop</p>
                  <p style={{ fontSize: 11.5, color: DS.textFaint, marginTop: 3 }}>PDF, JPG, PNG — max 10 MB</p>
                </div>
                <input type="file" style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png" />
              </label>
            </div>

            {/* 5. Anonymous Mode toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderRadius: DS.radiusMd, background: DS.surfaceLow,
            }}>
              <div style={{ flex: 1, marginRight: 16 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: DS.text, marginBottom: 3, fontFamily: "'Inter', sans-serif" }}>
                  Anonymous Mode
                </p>
                <p style={{ fontSize: 11.5, color: DS.textMuted, lineHeight: 1.5 }}>
                  Your identity will be masked from handling staff. Dean/Admin can see it for investigation.
                </p>
              </div>
              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={anon}
                onClick={() => setAnon(!anon)}
                style={{
                  width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
                  background: anon ? DS.blue : DS.surfaceHigh,
                  position: 'relative', flexShrink: 0, transition: 'background 0.2s',
                }}>
                <span style={{
                  position: 'absolute', top: 3, left: anon ? 22 : 3,
                  width: 18, height: 18, borderRadius: '50%', background: '#FFFFFF',
                  transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                }} />
              </button>
            </div>

            {/* Submit button — Stitch gradient CTA */}
            <button
              type="submit"
              disabled={isSubmitting || desc.length < 10}
              style={{
                width: '100%', padding: '15px 24px', borderRadius: DS.radiusMd, border: 'none',
                background: `linear-gradient(135deg, ${DS.blue}, ${DS.blueDark})`,
                color: '#FFFFFF', fontSize: 15, fontWeight: 700,
                cursor: (isSubmitting || desc.length < 10) ? 'not-allowed' : 'pointer',
                opacity: (isSubmitting || desc.length < 10) ? 0.65 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                fontFamily: "'Manrope', sans-serif", letterSpacing: '0.01em',
                transition: 'all 0.2s', boxShadow: `0 4px 16px ${DS.blue}40`,
              }}
              onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.boxShadow = `0 6px 24px ${DS.blue}60`; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${DS.blue}40`; }}
            >
              {isSubmitting
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
                : <><Lock size={15} /> Submit Grievance Securely →</>}
            </button>
          </div>
        </form>

        {/* ── RIGHT: Sidebar cards ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* AI Routing Preview — Stitch AI signature: blue left border */}
          <div style={{
            background: DS.surface, borderRadius: DS.radius, boxShadow: DS.shadow,
            padding: '20px 22px', borderLeft: `3px solid ${DS.blue}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Zap size={14} style={{ color: DS.blue }} />
              <p style={{ fontSize: 11, fontWeight: 700, color: DS.blue, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
                AI Routing Engine
              </p>
            </div>
            <p style={{ fontSize: 12, color: DS.textMuted, marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>
              Live routing prediction based on your description.
            </p>

            {prediction ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[
                  { label: 'Category',    value: prediction.category    },
                  { label: 'Assigned To', value: prediction.assignedTo  },
                  { label: 'Est. Resolution', value: prediction.resolution },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11.5, color: DS.textFaint, fontFamily: "'Inter', sans-serif" }}>{r.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: DS.text, fontFamily: "'Inter', sans-serif" }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: 4, padding: '7px 12px', borderRadius: DS.radiusSm, background: DS.greenLight, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={12} style={{ color: DS.green }} />
                  <p style={{ fontSize: 11.5, fontWeight: 600, color: DS.green, fontFamily: "'Inter', sans-serif" }}>
                    Likely valid complaint
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px 0', textAlign: 'center' }}>
                <Zap size={20} style={{ margin: '0 auto 6px', color: DS.textFaint, opacity: 0.4 }} />
                <p style={{ fontSize: 12, color: DS.textFaint, fontFamily: "'Inter', sans-serif" }}>
                  Start typing to see routing prediction...
                </p>
              </div>
            )}
          </div>

          {/* Privacy Commitment — Stitch blue tinted card */}
          <div style={{
            background: DS.blueLight, borderRadius: DS.radius, boxShadow: DS.shadow,
            padding: '20px 22px', borderLeft: `3px solid ${DS.blue}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Lock size={14} style={{ color: DS.blue }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: DS.blueDark, fontFamily: "'Manrope', sans-serif" }}>
                Privacy First
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                'Anonymous ID generated on submission',
                'No direct student identity shared with faculty',
                'Encrypted at rest and in transit',
                'GDPR-aligned data policies',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                  <ShieldCheck size={13} style={{ color: DS.blue, flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: '#1E3A5F', lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filing Tips */}
          <div style={{ background: DS.surface, borderRadius: DS.radius, boxShadow: DS.shadow, padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Lightbulb size={14} style={{ color: '#9E4300' }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: DS.text, fontFamily: "'Manrope', sans-serif" }}>
                Filing Tips
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                'Be specific — include dates, locations, and people involved.',
                'Choose the right category for faster resolution.',
                'Upload evidence to strengthen your case.',
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: DS.blueMid, color: DS.blueDark,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, fontFamily: "'Inter', sans-serif",
                  }}>{i + 1}</span>
                  <p style={{ fontSize: 12, color: DS.textMuted, lineHeight: 1.55, fontFamily: "'Inter', sans-serif" }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default SubmitComplaint;
