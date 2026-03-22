import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Clock, AlertTriangle, Users, ShieldCheck, Shield } from 'lucide-react';
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
const MOCK_STATS = { total:1024, avgResolution:'1.2d', escalated:7, activeUsers:234 };

const AdminAnalytics = () => {
  const [stats, setStats] = useState<any>(MOCK_STATS);
  const [catData] = useState([
    { name:'Hostel (38%)', value:38 },{ name:'Academic (29%)', value:29 },
    { name:'Admin (21%)', value:21 },{ name:'Safety (12%)', value:12 },
  ]);
  const [monthlyData] = useState([
    {month:'Jan',count:62},{month:'Feb',count:58},{month:'Mar',count:78},
    {month:'Apr',count:76},{month:'May',count:54},{month:'Jun',count:70},
  ]);
  const clusters = [
    { cat:'Hostel WiFi', count:47, sev:'High', color:DS.amber, bg:DS.amberLight },
    { cat:'Exam Re-eval', count:31, sev:'Medium', color:DS.emerald, bg:DS.emeraldLight },
    { cat:'Fee Portal', count:24, sev:'Low', color:DS.blue, bg:DS.blueLight },
    { cat:'Campus Safety', count:18, sev:'Critical', color:DS.red, bg:DS.redLight },
  ];

  useEffect(() => {
    api.get('/dashboard/analytics').then(r => { setStats(r.data); }).catch(console.error);
  }, []);

  const kpis = [
    { icon:<LayoutDashboard size={22}/>, label:'Total Complaints', value:stats?.total??1024,      color:DS.emerald, bg:DS.emeraldLight },
    { icon:<Clock size={22}/>,           label:'Avg Resolution Time',value:stats?.avgResolution??'1.2d', color:DS.blue,    bg:DS.blueLight },
    { icon:<AlertTriangle size={22}/>,   label:'Escalated Today',  value:stats?.escalated??7,     color:DS.red,     bg:DS.redLight },
    { icon:<Users size={22}/>,           label:'Active Users',     value:stats?.activeUsers??234, color:'#8B5CF6',  bg:'#F5F3FF' },
  ];

  const cardStyle = {
    background: DS.surface, borderRadius: DS.radiusCard, padding: 32, 
    boxShadow: DS.shadowAmbient, border: '1px solid rgba(255,255,255,0.8)',
    display: 'flex', flexDirection: 'column' as const
  };

  return (
    <div style={{ padding:'40px 48px', minHeight:'100vh', background:DS.bg, fontFamily:"'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>
      
      {/* Header */}
      <div style={{ marginBottom:32, display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:DS.emeraldLight, padding:'4px 12px', borderRadius:20, marginBottom:12 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:DS.emerald }} />
            <span style={{ fontSize:11, fontWeight:700, color:DS.emeraldDark, letterSpacing:'0.06em', textTransform:'uppercase' }}>Administration</span>
          </div>
          <h1 style={{ fontFamily:"'Manrope', sans-serif", fontSize:32, fontWeight:800, color:DS.text, letterSpacing:'-0.02em', margin:0 }}>
            System Analytics
          </h1>
          <p style={{ fontSize:15, color:DS.textMuted, marginTop:8 }}>Institution-level grievance metrics and AI clustering insights.</p>
        </div>
      </div>

      {/* FAQs / Missing feature Note: I'll stick to the actual code logic but style it up */}

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24, marginBottom:32 }}>
        {kpis.map((k,i) => (
          <div key={i} style={{ ...cardStyle, padding:'24px', gap:16, borderTop:`3px solid ${k.color}` }}>
            <div style={{ width:44, height:44, borderRadius:14, background:k.bg, color:k.color, display:'flex', alignItems:'center', justifyContent:'center' }}>{k.icon}</div>
            <div>
              <p style={{ fontFamily:"'Manrope', sans-serif", fontSize:32, fontWeight:800, color:DS.text, lineHeight:1, letterSpacing:'-0.03em' }}>{k.value}</p>
              <p style={{ fontSize:13, color:DS.textMuted, marginTop:6, fontWeight:500 }}>{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:24, marginBottom:32 }}>
        <div style={cardStyle}>
          <p style={{ fontFamily:"'Manrope', sans-serif", fontSize:18, fontWeight:800, color:DS.text, letterSpacing:'-0.01em', marginBottom:24 }}>Distribution by Category</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" stroke="none" paddingAngle={2}>
                {catData.map((_,i) => <Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={{ fontSize:13,borderRadius:DS.radiusBtn,border:'none',boxShadow:DS.shadowAmbient,fontWeight:500 }} itemStyle={{ color:DS.text }}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'12px 20px', justifyContent:'center', marginTop:16 }}>
            {catData.map((c,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:10, height:10, borderRadius:'50%', background:CHART_COLORS[i%CHART_COLORS.length] }}/>
                <span style={{ fontSize:13, color:DS.textMuted, fontWeight:500 }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div style={cardStyle}>
          <p style={{ fontFamily:"'Manrope', sans-serif", fontSize:18, fontWeight:800, color:DS.text, letterSpacing:'-0.01em', marginBottom:24 }}>Monthly Incident Volume</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} barSize={36} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={DS.surfaceHigh} vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize:12, fill:DS.textMuted, fontWeight:500 }} axisLine={false} tickLine={false} dy={10}/>
              <YAxis tick={{ fontSize:12, fill:DS.textMuted, fontWeight:500 }} axisLine={false} tickLine={false} dx={-10}/>
              <Tooltip cursor={{ fill:DS.surfaceLow }} contentStyle={{ fontSize:13,borderRadius:DS.radiusBtn,border:'none',boxShadow:DS.shadowAmbient,fontWeight:500 }}/>
              <Bar dataKey="count" fill={DS.emerald} radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Clustering */}
      <div style={cardStyle}>
        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:16, marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:DS.emeraldLight, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <ShieldCheck size={18} style={{ color:DS.emerald }}/>
            </div>
            <p style={{ fontFamily:"'Manrope', sans-serif", fontSize:18, fontWeight:800, color:DS.text, letterSpacing:'-0.01em' }}>AI Complaint Clustering</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:DS.surfaceLow, padding:'6px 14px', borderRadius:40 }}>
            <Shield size={14} style={{ color:DS.emerald }}/>
            <span style={{ fontSize:11, fontWeight:800, color:DS.emeraldDark, letterSpacing:'0.06em' }}>PATTERN RECOGNITION ACTIVE</span>
          </div>
        </div>
        
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
          {clusters.map((cl,i) => (
            <div key={i} style={{ padding:'24px', borderRadius:16, background:cl.bg, transition:'transform 0.2s', cursor:'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                <p style={{ fontSize:14, fontWeight:800, color:cl.color, lineHeight:1.3 }}>{cl.cat}</p>
                <span style={{ fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:40, background:DS.surface, color:cl.color, flexShrink:0, boxShadow:`0 2px 4px rgba(0,0,0,0.04)` }}>{cl.sev}</span>
              </div>
              <p style={{ fontFamily:"'Manrope', sans-serif", fontSize:36, fontWeight:800, color:cl.color, lineHeight:1 }}>{cl.count}</p>
              <p style={{ fontSize:12, fontWeight:600, color:cl.color, opacity:0.8, marginTop:4 }}>incidents grouped</p>
              <div style={{ marginTop:24, height:6, background:'rgba(255,255,255,0.4)', borderRadius:99, overflow:'hidden' }}>
                <div style={{ width:`${Math.min((cl.count/50)*100,100)}%`, height:'100%', background:cl.color, borderRadius:99 }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
