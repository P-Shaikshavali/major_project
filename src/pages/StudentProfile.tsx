import { useEffect, useState } from 'react';
import { Brain, ShieldCheck, TrendingUp, Clock, CheckCircle, AlertTriangle, User, GraduationCap, Hash } from 'lucide-react';
import api from '../services/api';

// ── Stitch "Blue Sentinel" Design Tokens ──────────────────────────────────
const DS = {
  bg:            '#F8F9FA',
  surface:       '#FFFFFF',
  surfaceLow:    '#F0F2F4',
  blue:          '#1A73E8',
  blueDark:      '#005BBF',
  blueLight:     '#EBF3FD',
  text:          '#111827',
  textMuted:     '#414754',
  textFaint:     '#727785',
  green:         '#10B981',
  greenLight:    '#ECFDF5',
  amber:         '#F59E0B',
  amberLight:    '#FFFBEB',
  red:           '#EF4444',
  redLight:      '#FEF2F2',
  purple:        '#8B5CF6',
  purpleLight:   '#F5F3FF',
  shadowAmbient: '0 20px 40px rgba(44,47,49,0.06)',
  radiusCard:    '24px',
  radiusPill:    '12px',
};

const Card = ({ children, style = {}, noPadding = false }: any) => (
  <div style={{ 
    background: DS.surface, borderRadius: DS.radiusCard, padding: noPadding ? 0 : 32, 
    boxShadow: DS.shadowAmbient, border: '1px solid rgba(255,255,255,0.8)',
    display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', ...style 
  }}>
    {children}
  </div>
);

const ProgressBar = ({ value, color }: { value: number; color: string }) => (
  <div style={{ height: 8, background: DS.surfaceLow, borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: color, borderRadius: 99, transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
  </div>
);

const StudentProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api.get('/dashboard/student').then(res => {
      setAnalytics(res.data.behavioralAnalytics);
      setHistory(res.data.recentComplaints || []);
    }).catch(console.error);
    setProfile({ name: 'Student User', studentId: 'STU-2024-001', department: 'Computer Science', year: '3rd Year', role: 'Student' });
  }, []);

  const credibility = Math.round(analytics?.averageCredibility || 0);
  const efficiency  = Math.round(analytics?.resolutionEfficiency || 0);
  const escalation  = Math.round(analytics?.escalationRate || 0);

  const behaviorMetrics = [
    { icon: <TrendingUp size={20} />, label: 'Resolution Efficiency', value: efficiency, color: DS.blue, desc: 'Likelihood of issues being resolved quickly.' },
    { icon: <AlertTriangle size={20} />, label: 'Escalation Rate', value: escalation, color: DS.red, desc: 'Frequency of high-level authority involvement.' },
    { icon: <CheckCircle size={20} />, label: 'Accuracy Score', value: credibility, color: DS.green, desc: 'Factual consistency in reported grievances.' },
    { icon: <Clock size={20} />, label: 'Response Receipt', value: 72, color: DS.purple, desc: 'Average time for official acknowledgement.' },
  ];

  const STATUS_COLORS: Record<string, string> = {
    Resolved: DS.green, Submitted: DS.blue, InProgress: DS.amber, Escalated: DS.red,
  };

  return (
    <div style={{ padding: '48px', minHeight: '100vh', background: DS.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:DS.blueLight, padding:'4px 12px', borderRadius:20, marginBottom:16 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:DS.blue }} />
          <span style={{ fontSize:11, fontWeight:700, color:DS.blueDark, letterSpacing:'0.06em', textTransform:'uppercase' }}>Behavioral Profile</span>
        </div>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 36, fontWeight: 800, color: DS.text, letterSpacing: '-0.02em', margin: 0 }}>
          Student Analytics
        </h1>
        <p style={{ fontSize: 16, color: DS.textMuted, marginTop: 12 }}>AI-generated behavioral insights based on your institutional interactions.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 32, alignItems: 'start' }}>
        
        {/* Sidebar Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Identity Card */}
          <Card style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: DS.blueLight, color: DS.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <User size={40} />
            </div>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, color: DS.text, margin: 0 }}>{profile?.name}</h2>
            <p style={{ fontSize: 13, fontWeight: 700, color: DS.blue, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{profile?.role}</p>
            
            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
              {[
                { label: 'Student ID', value: profile?.studentId, icon: <Hash size={14} /> },
                { label: 'Department', value: profile?.department, icon: <GraduationCap size={14} /> },
                { label: 'Year', value: profile?.year, icon: <Clock size={14} /> },
              ].map((f, i) => (
                <div key={i}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: DS.textFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span style={{ color: DS.blue, opacity: 0.8 }}>{f.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: DS.text }}>{f.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32, padding: '12px', borderRadius: 16, background: DS.bg, border: '1px solid rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={16} style={{ color: DS.green }} />
              <p style={{ fontSize: 11, fontWeight: 600, color: DS.textMuted }}>Identity protected by VoltGrievance</p>
            </div>
          </Card>

          {/* Credibility Score */}
          <Card style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: credibility >= 70 ? DS.green : credibility >= 40 ? DS.amber : DS.red }} />
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 800, color: DS.text }}>System Trust Rating</p>
            <div style={{ margin: '24px 0', textAlign: 'center' }}>
               <p style={{ fontSize: 56, fontWeight: 900, color: credibility >= 70 ? DS.green : credibility >= 40 ? DS.amber : DS.red, lineHeight: 1 }}>{credibility}%</p>
               <p style={{ fontSize: 13, fontWeight: 600, color: DS.textFaint, marginTop: 10 }}>Factual Consistency Score</p>
            </div>
            <ProgressBar value={credibility} color={credibility >= 70 ? DS.green : credibility >= 40 ? DS.amber : DS.red} />
          </Card>
        </div>

        {/* Main Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          {/* Behavior Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {behaviorMetrics.map((m, i) => (
              <Card key={i} style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: m.color + '1A', color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {m.icon}
                  </div>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: DS.text }}>{m.label}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                  <p style={{ fontSize: 32, fontWeight: 900, color: m.color, margin: 0 }}>{m.value}%</p>
                </div>
                <ProgressBar value={m.value} color={m.color} />
                <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 16, lineHeight: 1.5 }}>{m.desc}</p>
              </Card>
            ))}
          </div>

          {/* AI Insight Section */}
          <Card style={{ background: `linear-gradient(135deg, ${DS.purple}, #6366F1)`, color: '#fff' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Brain size={24} fill="#fff" />
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 800 }}>AI Strategic Insight</p>
             </div>
             <div style={{ background: 'rgba(255,255,255,0.15)', padding: '24px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.2)' }}>
                <p style={{ fontSize: 15, lineHeight: 1.7, fontWeight: 500 }}>
                  {analytics?.insight || "Your current interaction patterns suggest a high resolution efficiency. Maintaining clear evidence links in your grievances will likely keep your credibility score within the top 5% of the student body."}
                </p>
             </div>
          </Card>

          {/* Timeline Section */}
          <Card>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text, marginBottom: 32 }}>Institutional Interaction Timeline</p>
            {history.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '48px 0', opacity: 0.5 }}>
                  <Clock size={40} style={{ margin: '0 auto 16px' }} />
                  <p>No historical interactions recorded yet.</p>
               </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32, position: 'relative' }}>
                {/* Visual Line */}
                <div style={{ position: 'absolute', left: 47, top: 0, bottom: 0, width: 2, background: DS.surfaceLow }} />
                
                {history.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start', position: 'relative' }}>
                    <div style={{ 
                      width: 96, fontSize: 11, fontWeight: 800, color: DS.textFaint, textAlign: 'right', paddingTop: 14, 
                      textTransform: 'uppercase', letterSpacing: '0.04em' 
                    }}>
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                    
                    <div style={{ 
                      width: 14, height: 14, borderRadius: '50%', background: STATUS_COLORS[c.status] || DS.blue, 
                      border: '4px solid #fff', boxShadow: '0 0 0 2px ' + (STATUS_COLORS[c.status] || DS.blue) + '30',
                      zIndex: 1, marginTop: 14
                    }} />
                    
                    <div style={{ flex: 1, background: DS.bg, padding: '16px 20px', borderRadius: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: DS.text }}>{c.category}</p>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 40, background: (STATUS_COLORS[c.status] || DS.blue) + '15', color: STATUS_COLORS[c.status] || DS.blue, textTransform: 'uppercase' }}>{c.status}</span>
                      </div>
                      <p style={{ fontSize: 12, color: DS.textMuted, marginTop: 4, fontFamily: 'monospace' }}>Record ID: {c.trackingId}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
