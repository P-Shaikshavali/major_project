import { useEffect, useState } from 'react';
import { ShieldCheck, Home, Wifi, Utensils, AlertTriangle, CheckCircle, TrendingUp, ClipboardList, RefreshCw, Shield } from 'lucide-react';
import api from '../services/api';

// ── Stitch "Emerald Sentinel" Design Tokens ──────────────────────────────────
const DS = {
  bg:            '#F8F9FA',
  surface:       '#FFFFFF',
  surfaceLow:    '#F3F4F5',
  surfaceHigh:   '#E1E3E4',
  emerald:       '#10B981',
  emeraldDark:   '#065F46',
  emeraldLight:  '#ECFDF5',
  text:          '#111827',
  textMuted:     '#414754',
  textFaint:     '#727785',
  blue:          '#1A73E8',
  blueLight:     '#EBF3FD',
  amber:         '#9E4300',
  amberLight:    '#FFDBCB',
  red:           '#B91C1C',
  redLight:      '#FEF2F2',
  shadowAmbient: '0 20px 40px rgba(44,47,49,0.06)',
  radiusCard:    '20px',
  radiusBtn:     '12px',
};

const STATUS_MAP: Record<string, { bg: string; text: string }> = {
  Submitted:  { bg: DS.blueLight,   text: DS.blue },
  InProgress: { bg: DS.amberLight,  text: DS.amber },
  Resolved:   { bg: DS.emeraldLight,text: DS.emerald },
  Escalated:  { bg: DS.redLight,    text: DS.red },
};

const KpiCard = ({ icon, label, value, color, bg }: any) => (
  <div style={{ background: DS.surface, borderRadius: DS.radiusCard, padding: '24px', boxShadow: DS.shadowAmbient, display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid rgba(255,255,255,0.8)' }}>
    <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
    <div>
      <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: DS.text, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 6, fontWeight: 500 }}>{label}</p>
    </div>
  </div>
);

const HOSTEL_CATS = ['Hostel', 'Facilities', 'Safety', 'Admin'];

const QUICK_TIPS = [
  { icon: <Home size={16} />, label: 'Room Issues', tip: 'Assign maintenance staff immediately for physical damage reports.' },
  { icon: <Wifi size={16} />, label: 'WiFi / Connectivity', tip: 'Cluster repeated WiFi complaints by block and escalate to IT Department.' },
  { icon: <Utensils size={16} />, label: 'Mess / Food', tip: 'Monthly mess committee review recommended if > 3 complaints in a week.' },
  { icon: <AlertTriangle size={16} />, label: 'Safety Issues', tip: 'All safety complaints must be resolved within 24 hours per campus policy.' },
];

const HostelDeanDashboard = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState<'all' | 'pending' | 'resolved'>('pending');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    api.get('/dashboard/authority')
      .then(r => {
        // Hostel Dean sees hostel-category complaints
        const filtered = (r.data || []).filter((c: any) =>
          HOSTEL_CATS.includes(c.category) || c.assignedTo === 'Warden'
        );
        setComplaints(filtered);
      })
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      await api.put(`/faculty/update-status/${id}`, { newStatus: status, resolutionNote: '', recommendEscalation: false });
      setComplaints(p => p.map(c => (c.id === id ? { ...c, status } : c)));
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  const pending  = complaints.filter(c => c.status === 'Submitted' || c.status === 'InProgress');
  const resolved = complaints.filter(c => c.status === 'Resolved');
  const listToShow = activeTab === 'pending' ? pending : activeTab === 'resolved' ? resolved : complaints;

  const kpis = [
    { icon: <ClipboardList size={22}/>,  label: 'Hostel Complaints', value: complaints.length,           color: DS.emerald, bg: DS.emeraldLight },
    { icon: <AlertTriangle size={22}/>,  label: 'Pending Action',    value: pending.length,              color: DS.amber,   bg: DS.amberLight },
    { icon: <TrendingUp size={22}/>,     label: 'Escalated Issues',  value: complaints.filter(c => c.isEscalated).length, color: DS.red,     bg: DS.redLight },
    { icon: <CheckCircle size={22}/>,    label: 'Resolved',          value: resolved.length,             color: DS.blue,    bg: DS.blueLight },
  ];

  const cardStyle = {
    background: DS.surface, borderRadius: DS.radiusCard, padding: 32, 
    boxShadow: DS.shadowAmbient, border: '1px solid rgba(255,255,255,0.8)'
  };

  return (
    <div style={{ padding: '40px 48px', minHeight: '100vh', background: DS.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>
      
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: DS.emeraldLight, padding: '4px 12px', borderRadius: 20, marginBottom: 12 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: DS.emerald }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: DS.emeraldDark, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Hostel Administration</span>
        </div>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: DS.text, letterSpacing: '-0.02em', margin: 0 }}>
          Hostel Dean Dashboard
        </h1>
        <p style={{ fontSize: 15, color: DS.textMuted, marginTop: 8 }}>Manage active hostel-related grievances — rooms, mess, WiFi, and safety oversight.</p>
      </div>

      {/* FAQs / Missing feature Note: I'll stick to the actual code logic but style it up */}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginBottom: 32 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* Privacy notice - Full length */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: DS.radiusCard, background: DS.emeraldLight, marginBottom: 24 }}>
        <ShieldCheck size={20} style={{ color: DS.emerald, flexShrink: 0 }} />
        <p style={{ fontSize: 14, color: DS.emeraldDark, fontWeight: 500 }}>
          <strong>Privacy Protocol Active:</strong> Student identities reflect strictly as anonymized IDs during the resolution process.
        </p>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: '#FFFFFF', padding: '6px 14px', borderRadius: 40 }}>
          <Shield size={14} style={{ color: DS.emerald }} />
          <p style={{ fontSize: 11, fontWeight: 800, color: DS.emeraldDark, letterSpacing: '0.06em' }}>IDENTITY PROTECTED</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 24 }}>
        {/* Complaint Queue */}
        <div style={cardStyle}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
             <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text, letterSpacing: '-0.01em' }}>Targeted Grievance Queue</p>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: `2px solid ${DS.surfaceLow}`, paddingBottom: 16 }}>
            {([['pending','Pending'], ['resolved','Resolved'], ['all','All']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{ 
                  padding: '10px 24px', borderRadius: 40, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  background: activeTab === key ? DS.text : 'transparent', color: activeTab === key ? '#FFFFFF' : DS.textFaint 
                }}>
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: DS.textMuted }}>
              <RefreshCw size={24} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite', color: DS.emerald }} />
              <p style={{ fontSize: 14, fontWeight: 500 }}>Fetching hostel records...</p>
            </div>
          ) : listToShow.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: DS.textFaint }}>
              <ShieldCheck size={40} style={{ margin: '0 auto 16px', color: DS.emerald, opacity: 0.8 }} />
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text, letterSpacing: '-0.01em', marginBottom: 4 }}>Queue Clear</p>
              <p style={{ fontSize: 14 }}>No actionable items in this filter block.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {listToShow.map((c: any, i: number) => {
                const sc = STATUS_MAP[c.status] || STATUS_MAP.Submitted;
                return (
                  <div key={i} style={{ 
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px', 
                    background: DS.surfaceLow, borderRadius: 12, transition: 'background 0.2s' 
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FBFF'}
                  onMouseLeave={e => e.currentTarget.style.background = DS.surfaceLow}>
                    
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: sc.text, flexShrink: 0 }} />
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: DS.text, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{c.trackingId}</p>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 40, background: sc.bg, color: sc.text }}>{c.status}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 40, background: DS.surface, color: DS.textMuted, border: `1px solid ${DS.surfaceHigh}` }}>{c.category}</span>
                      </div>
                      <p style={{ fontSize: 12, color: DS.textMuted, fontFamily: 'monospace', fontWeight: 600 }}>{c.anonymousId}</p>
                    </div>
                    
                    <select value={c.status} disabled={updatingId === c.id}
                      onChange={e => updateStatus(c.id, e.target.value)}
                      style={{ 
                        fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: DS.radiusBtn, 
                        border: 'none', background: sc.bg, color: sc.text, 
                        cursor: 'pointer', outline: 'none', transition: 'all 0.2s',
                        boxShadow: `0 2px 8px rgba(0,0,0,0.04)`
                      }}>
                      <option value="Submitted">Submitted</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Tips Panel */}
        <div style={cardStyle}>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text, letterSpacing: '-0.01em', marginBottom: 24 }}>Moderation Protocols</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {QUICK_TIPS.map((t, i) => (
              <div key={i} style={{ padding: '16px', borderRadius: DS.radiusBtn, background: i % 2 === 0 ? DS.emeraldLight : DS.surfaceLow }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: DS.emeraldDark }}>
                  {t.icon}
                  <p style={{ fontSize: 13, fontWeight: 800, color: DS.text }}>{t.label}</p>
                </div>
                <p style={{ fontSize: 13, color: DS.textMuted, lineHeight: 1.6, fontWeight: 400 }}>{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default HostelDeanDashboard;
