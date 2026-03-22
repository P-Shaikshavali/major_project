import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Clock, AlertTriangle, Users, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const EM = '#10B981';
const CHART_COLORS = ['#10B981','#3B82F6','#8B5CF6','#F59E0B'];
const MOCK_STATS = { total:1024, avgResolution:'1.2d', escalated:7, activeUsers:234 };

const AdminAnalytics = () => {
  const [stats, setStats] = useState<any>(MOCK_STATS);
  const [catData, setCatData] = useState([
    { name:'Hostel (38%)', value:38 },{ name:'Academic (29%)', value:29 },
    { name:'Admin (21%)', value:21 },{ name:'Safety (12%)', value:12 },
  ]);
  const [monthlyData] = useState([
    {month:'Jan',count:62},{month:'Feb',count:58},{month:'Mar',count:78},
    {month:'Apr',count:76},{month:'May',count:54},{month:'Jun',count:70},
  ]);
  const clusters = [
    { cat:'Hostel WiFi', count:47, sev:'High', color:'#F59E0B', bg:'#FFFBEB' },
    { cat:'Exam Re-evaluation', count:31, sev:'Medium', color:EM, bg:'#ECFDF5' },
    { cat:'Fee Portal Issues', count:24, sev:'Low', color:'#3B82F6', bg:'#EFF6FF' },
    { cat:'Campus Safety', count:18, sev:'Critical', color:'#EF4444', bg:'#FEF2F2' },
  ];

  useEffect(() => {
    api.get('/dashboard/analytics').then(r => { setStats(r.data); }).catch(console.error);
  }, []);

  const kpis = [
    { icon:<LayoutDashboard size={18}/>, label:'Total Complaints', value:stats?.total??1024, color:EM, bg:'#ECFDF5' },
    { icon:<Clock size={18}/>,           label:'Avg Resolution',   value:stats?.avgResolution??'1.2d', color:'#3B82F6', bg:'#EFF6FF' },
    { icon:<AlertTriangle size={18}/>,   label:'Escalated Today',  value:stats?.escalated??7, color:'#EF4444', bg:'#FEF2F2' },
    { icon:<Users size={18}/>,           label:'Active Users',     value:stats?.activeUsers??234, color:'#8B5CF6', bg:'#F5F3FF' },
  ];

  return (
    <div style={{ padding:'28px 32px', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ marginBottom:24 }}>
        <p style={{ fontSize:11, fontWeight:700, color:EM, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Administration</p>
        <h1 style={{ fontSize:23, fontWeight:800, color:'#111827', letterSpacing:'-0.01em' }}>System Analytics</h1>
        <p style={{ fontSize:13, color:'#6B7280', marginTop:3 }}>Institution-level grievance metrics and AI clustering insights.</p>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
        {kpis.map((k,i) => (
          <div key={i} className="card animate-up" style={{ padding:'20px 22px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${k.color},${k.color}55)` }}/>
            <div style={{ width:36, height:36, borderRadius:10, background:k.bg, color:k.color, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>{k.icon}</div>
            <p style={{ fontSize:27, fontWeight:800, color:'#111827', lineHeight:1 }}>{k.value}</p>
            <p style={{ fontSize:11.5, color:'#6B7280', marginTop:5, fontWeight:500 }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:16, marginBottom:20 }}>
        <div className="card" style={{ padding:'20px 22px' }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:14 }}>Complaints by Category</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {catData.map((_,i) => <Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={{ fontSize:12,borderRadius:8,border:'none',boxShadow:'0 4px 16px rgba(0,0,0,0.1)' }}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'5px 12px', justifyContent:'center' }}>
            {catData.map((c,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:CHART_COLORS[i%CHART_COLORS.length], display:'inline-block' }}/>
                <span style={{ fontSize:11, color:'#6B7280' }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding:'20px 22px' }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:14 }}>Monthly Volume</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false} domain={[0,100]}/>
              <Tooltip contentStyle={{ fontSize:12,borderRadius:8,border:'none',boxShadow:'0 4px 16px rgba(0,0,0,0.1)' }}/>
              <Bar dataKey="count" fill={EM} radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Clustering */}
      <div className="card" style={{ padding:'20px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <ShieldCheck size={15} style={{ color:EM }}/>
            <p style={{ fontSize:13, fontWeight:700, color:'#111827' }}>AI Complaint Clustering Insights</p>
          </div>
          <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:99, background:'#ECFDF5', color:EM, letterSpacing:'0.05em' }}>AI-SECURED</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
          {clusters.map((cl,i) => (
            <div key={i} style={{ padding:'16px 18px', borderRadius:13, background:cl.bg, position:'relative', overflow:'hidden' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <p style={{ fontSize:13, fontWeight:700, color:cl.color, lineHeight:1.2 }}>{cl.cat}</p>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:'rgba(0,0,0,0.08)', color:cl.color, flexShrink:0 }}>{cl.sev}</span>
              </div>
              <p style={{ fontSize:28, fontWeight:800, color:cl.color, lineHeight:1 }}>{cl.count}</p>
              <p style={{ fontSize:10.5, color:cl.color, opacity:0.7, marginTop:3 }}>complaints clustered</p>
              <div style={{ marginTop:12, height:4, background:'rgba(0,0,0,0.06)', borderRadius:99, overflow:'hidden' }}>
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
