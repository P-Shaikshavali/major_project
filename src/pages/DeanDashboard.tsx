import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, AlertTriangle, TrendingUp, ClipboardList, RefreshCw, CheckCircle, Shield } from 'lucide-react';
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

const CHART_COLORS = [DS.emerald, DS.blue, '#8B5CF6', DS.amber];

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

const DeanDashboard = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'escalated' | 'all'>('overview');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    api.get('/dashboard/authority')
      .then(r => setComplaints(r.data || []))
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

  const escalated  = complaints.filter(c => c.isEscalated || c.status === 'Escalated');
  const pending    = complaints.filter(c => c.status === 'Submitted' || c.status === 'InProgress');
  const resolved   = complaints.filter(c => c.status === 'Resolved');

  const listToShow = activeTab === 'escalated' ? escalated : activeTab === 'all' ? complaints : complaints.slice(0, 5);

  const catData = complaints.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(catData).map(([name, value]) => ({ name, value }));

  const kpis = [
    { icon: <ClipboardList size={22}/>, label: 'Total Complaints',  value: complaints.length,   color: DS.emerald, bg: DS.emeraldLight },
    { icon: <AlertTriangle size={22}/>, label: 'Escalated to Dean', value: escalated.length,    color: DS.red,     bg: DS.redLight },
    { icon: <TrendingUp size={22}/>,    label: 'Pending Review',    value: pending.length,      color: DS.amber,   bg: DS.amberLight },
    { icon: <CheckCircle size={22}/>,   label: 'Resolved',          value: resolved.length,     color: DS.blue,    bg: DS.blueLight },
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
          <span style={{ fontSize: 11, fontWeight: 700, color: DS.emeraldDark, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Dean's Office</span>
        </div>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: DS.text, letterSpacing: '-0.02em', margin: 0 }}>
          Dean Dashboard
        </h1>
        <p style={{ fontSize: 15, color: DS.textMuted, marginTop: 8 }}>Institution-wide oversight — manage escalated grievances and monitor resolution trends.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginBottom: 32 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {([['overview','Overview'], ['escalated','Escalated'], ['all','All Complaints']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{ 
              padding: '10px 24px', borderRadius: 40, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: activeTab === key ? DS.text : 'transparent', 
              color: activeTab === key ? '#FFFFFF' : DS.textFaint 
            }}>
            {label} 
            {key === 'escalated' && escalated.length > 0 && (
              <span style={{ marginLeft: 6, background: DS.red, color: '#fff', borderRadius: 40, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                {escalated.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Chart + List row */}
      <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'overview' ? '1fr 1.8fr' : '1fr', gap: 24 }}>
        
        {activeTab === 'overview' && (
          <div style={cardStyle}>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text, letterSpacing: '-0.01em', marginBottom: 24 }}>Category Distribution</p>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" stroke="none" paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 13, borderRadius: DS.radiusBtn, border: 'none', boxShadow: DS.shadowAmbient, fontWeight: 500 }} itemStyle={{ color: DS.text }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: DS.textFaint, fontSize: 14 }}>
                No category data available
              </div>
            )}
            
            {pieData.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px', justifyContent: 'center', marginTop: 16 }}>
                {pieData.map((c:any, i:number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span style={{ fontSize: 13, color: DS.textMuted, fontWeight: 500 }}>{c.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Complaints Table Card */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text, letterSpacing: '-0.01em' }}>
              {activeTab === 'escalated' ? 'Action Required (Escalated)' : activeTab === 'all' ? 'Complaint Archive' : 'Recent Overview'}
            </p>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: DS.textMuted }}>
              <RefreshCw size={24} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite', color: DS.emerald }} />
              <p style={{ fontSize: 14, fontWeight: 500 }}>Fetching institution records...</p>
            </div>
          ) : listToShow.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: DS.textFaint }}>
              <ShieldCheck size={40} style={{ margin: '0 auto 16px', color: DS.emerald, opacity: 0.8 }} />
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text, letterSpacing: '-0.01em', marginBottom: 4 }}>All Clear</p>
              <p style={{ fontSize: 14 }}>No items present in this queue.</p>
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
                      <p style={{ fontSize: 14, fontWeight: 700, color: DS.text, fontFamily: 'monospace', letterSpacing: '0.05em', marginBottom: 2 }}>{c.trackingId}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, color: DS.textMuted, fontWeight: 600 }}>{c.category}</span>
                        <span style={{ fontSize: 12, color: DS.textFaint }}>·</span>
                        <span style={{ fontSize: 12, color: DS.textFaint, fontFamily: 'monospace' }}>{c.anonymousId}</span>
                      </div>
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
                      <option value="Escalated">Escalated</option>
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DeanDashboard;
