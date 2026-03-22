import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlusCircle, FolderOpen, Brain, TrendingUp, ChevronRight, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// ── Stitch "Academic Sentinel" Design Tokens ──────────────────────────────────
const DS = {
  bg:            '#F8F9FA',
  surface:       '#FFFFFF',
  surfaceLow:    '#F3F4F5',
  surfaceHigh:   '#E1E3E4',
  blue:          '#1A73E8',
  blueDark:      '#005BBF',
  blueLight:     '#EBF3FD',
  text:          '#111827',
  textMuted:     '#414754',
  textFaint:     '#727785',
  green:         '#1B6B3A',
  greenLight:    '#D9F0E3',
  amber:         '#9E4300',
  amberLight:    '#FFDBCB',
  red:           '#B91C1C',
  redLight:      '#FEF2F2',
  shadowAmbient: '0 20px 40px rgba(44,47,49,0.06)',
  radiusCard:    '20px',
  radiusBtn:     '12px',
};

// Refined Chart Colors (Academic Sentinel Palette)
const CHART_COLORS = [DS.blue, DS.green, DS.amber, '#6366F1', '#8B5CF6'];
const STATUS_COLORS: Record<string, string> = { Resolved: DS.green, Submitted: DS.blue, InProgress: DS.amber, Escalated: DS.red };
const STATUS_BGS: Record<string, string> = { Resolved: DS.greenLight, Submitted: DS.blueLight, InProgress: DS.amberLight, Escalated: DS.redLight };

const KpiCard = ({ icon, label, value, color, bg }: any) => (
  <div style={{ background: DS.surface, borderRadius: DS.radiusCard, padding: '24px', boxShadow: DS.shadowAmbient, display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid rgba(255,255,255,0.8)' }}>
    <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
    <div>
      <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: DS.text, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 6, fontWeight: 500 }}>{label}</p>
    </div>
  </div>
);

const StudentDashboard = () => {
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/student').then(r => setData(r.data)).catch(console.error);
  }, []);

  const kpis = [
    { icon: <FolderOpen size={22} />, label: 'Total Complaints', value: data?.totalComplaints ?? 0, color: DS.blue, bg: DS.blueLight },
    { icon: <TrendingUp size={22} />, label: 'Pending',          value: data?.pending ?? 0,          color: DS.amber, bg: DS.amberLight },
    { icon: <Zap size={22} />,        label: 'In Progress',      value: data?.inProgress ?? 0,       color: '#6366F1', bg: '#EEF2FF' },
    { icon: <ShieldCheck size={22} />,label: 'Resolved',         value: data?.resolved ?? 0,         color: DS.green, bg: DS.greenLight },
  ];

  const categoryData = data?.categoryDistribution?.map((c:any) => ({ name:c.category, value:c.count })) || [
    { name:'Academic', value:4 }, { name:'Hostel', value:6 }, { name:'Admin', value:3 }, { name:'Safety', value:2 },
  ];
  const monthlyData = data?.monthlyTrends || [
    {month:'Jan',count:4},{month:'Feb',count:7},{month:'Mar',count:3},{month:'Apr',count:9},{month:'May',count:5},{month:'Jun',count:6},
  ];

  const cardStyle = {
    background: DS.surface, borderRadius: DS.radiusCard, padding: 32, 
    boxShadow: DS.shadowAmbient, border: '1px solid rgba(255,255,255,0.8)'
  };

  return (
    <div style={{ padding: '40px 48px', minHeight: '100vh', background: DS.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: DS.blueLight, padding: '4px 12px', borderRadius: 20, marginBottom: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: DS.blue }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: DS.blueDark, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Student Portal</span>
          </div>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: DS.text, letterSpacing: '-0.02em', margin: 0 }}>
            Welcome back, Student
          </h1>
          <p style={{ fontSize: 15, color: DS.textMuted, marginTop: 8 }}>Here is your unified grievance resolution overview.</p>
        </div>
        <button onClick={() => navigate('/dashboard/submit')} 
          style={{ 
            background: `linear-gradient(135deg, ${DS.blue}, ${DS.blueDark})`, color: '#FFF', 
            padding: '14px 24px', borderRadius: DS.radiusBtn, fontWeight: 600, fontSize: 14, 
            display: 'flex', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(26,115,232,0.3)', transition: 'all 0.2s'
          }}>
          <PlusCircle size={18} /> File Grievance
        </button>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 32 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, marginBottom: 32 }}>
        <div style={cardStyle}>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text, letterSpacing: '-0.01em', marginBottom: 24 }}>Category Distribution</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" stroke="none" paddingAngle={2}>
                {categoryData.map((_:any, i:number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: DS.radiusBtn, border: 'none', boxShadow: DS.shadowAmbient, fontWeight: 500 }} itemStyle={{ color: DS.text }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px', justifyContent: 'center', marginTop: 16 }}>
            {categoryData.map((c:any, i:number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span style={{ fontSize: 13, color: DS.textMuted, fontWeight: 500 }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text, letterSpacing: '-0.01em', marginBottom: 24 }}>Resolution Trends</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke={DS.surfaceLow} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: DS.textFaint }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 12, fill: DS.textFaint }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip cursor={{ fill: DS.surfaceLow }} contentStyle={{ fontSize: 13, borderRadius: DS.radiusBtn, border: 'none', boxShadow: DS.shadowAmbient, fontWeight: 500 }} />
              <Bar dataKey="count" fill={DS.blue} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        
        {/* Recent Complaints */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text, letterSpacing: '-0.01em' }}>Recent Grievances</p>
            <button onClick={() => navigate('/dashboard/list')} style={{ fontSize: 13, color: DS.blue, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View Archive <ChevronRight size={14} />
            </button>
          </div>
          
          {(!data?.recentComplaints?.length) ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: DS.textFaint }}>
              <FolderOpen size={40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p style={{ fontSize: 14 }}>No grievances filed yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.recentComplaints.slice(0, 5).map((c:any, i:number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '16px', background: DS.surfaceLow, borderRadius: 12, gap: 16 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[c.status] || DS.textFaint, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: DS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{c.category}</p>
                    <p style={{ fontSize: 12, color: DS.textFaint, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{c.trackingId}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '6px 14px', borderRadius: 40, background: STATUS_BGS[c.status] || DS.surfaceHigh, color: STATUS_COLORS[c.status] || DS.textFaint }}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Profile Summary */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ background: DS.blueLight, padding: 8, borderRadius: 10 }}><Brain size={18} color={DS.blue} /></div>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text, letterSpacing: '-0.01em' }}>AI Profile</p>
          </div>
          
          {!data?.behavioralAnalytics ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: DS.textFaint }}>
              <p style={{ fontSize: 13 }}>Gathering behavioral data...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { label: 'Credibility Score', v: Math.round(data.behavioralAnalytics.averageCredibility || 0), color: DS.green },
                { label: 'Resolution Speed', v: Math.round(data.behavioralAnalytics.resolutionEfficiency || 0), color: DS.blue },
                { label: 'Escalation Rate', v: Math.round(data.behavioralAnalytics.escalationRate || 0), color: DS.amber },
              ].map((m, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: DS.textMuted, fontWeight: 500 }}>{m.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.v}%</span>
                  </div>
                  <div style={{ height: 6, background: DS.surfaceLow, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(m.v, 100)}%`, height: '100%', background: m.color, borderRadius: 99, transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button onClick={() => navigate('/dashboard/profile')} 
            style={{ 
              marginTop: 32, width: '100%', padding: '12px', borderRadius: DS.radiusBtn, background: DS.blueLight, color: DS.blueDark, 
              fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'background 0.2s' 
            }}>
            View Full AI Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
