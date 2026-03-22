import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlusCircle, FolderOpen, Brain, TrendingUp, ChevronRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const EM = '#10B981';
const CHART_COLORS = ['#10B981','#3B82F6','#8B5CF6','#F59E0B'];
const STATUS_COLORS: Record<string,string> = { Resolved:'#10B981', Submitted:'#3B82F6', InProgress:'#F59E0B', Escalated:'#EF4444' };

const KpiCard = ({ icon, label, value, color, bg }: any) => (
  <div className="animate-up" style={{ background:'#fff', borderRadius:16, padding:'20px 22px', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column', gap:14, position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${color}, ${color}88)` }} />
    <div style={{ width:38, height:38, borderRadius:11, background:bg, display:'flex', alignItems:'center', justifyContent:'center', color }}>{icon}</div>
    <div>
      <p style={{ fontSize:28, fontWeight:800, color:'#111827', lineHeight:1 }}>{value}</p>
      <p style={{ fontSize:12, color:'#6B7280', marginTop:5, fontWeight:500 }}>{label}</p>
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
    { icon:<FolderOpen size={18}/>, label:'Total Complaints', value: data?.totalComplaints ?? 0, color: EM, bg:'#ECFDF5' },
    { icon:<TrendingUp size={18}/>, label:'Pending',          value: data?.pending ?? 0,          color:'#F59E0B', bg:'#FFFBEB' },
    { icon:<TrendingUp size={18}/>, label:'In Progress',      value: data?.inProgress ?? 0,       color:'#3B82F6', bg:'#EFF6FF' },
    { icon:<ShieldCheck size={18}/>,label:'Resolved',         value: data?.resolved ?? 0,         color:'#059669', bg:'#ECFDF5' },
  ];

  const categoryData = data?.categoryDistribution?.map((c:any) => ({ name:c.category, value:c.count })) || [
    { name:'Academic', value:4 }, { name:'Hostel', value:6 }, { name:'Admin', value:3 }, { name:'Safety', value:2 },
  ];
  const monthlyData = data?.monthlyTrends || [
    {month:'Jan',count:4},{month:'Feb',count:7},{month:'Mar',count:3},{month:'Apr',count:9},{month:'May',count:5},{month:'Jun',count:6},
  ];

  return (
    <div style={{ padding:'28px 32px', minHeight:'100vh', background:'var(--bg)' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:EM, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Student Dashboard</p>
          <h1 style={{ fontSize:23, fontWeight:800, color:'#111827', letterSpacing:'-0.01em' }}>Welcome back 👋</h1>
          <p style={{ fontSize:13, color:'#6B7280', marginTop:3 }}>Here's your grievance activity overview.</p>
        </div>
        <button className="btn-em" onClick={() => navigate('/dashboard/submit')} style={{ borderRadius:10, gap:7, padding:'10px 18px' }}>
          <PlusCircle size={15}/> New Complaint
        </button>
      </div>

      {/* KPI Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:22 }}>
        {kpis.map((k,i) => <KpiCard key={i} {...k}/>)}
      </div>

      {/* Charts Row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.3fr', gap:16, marginBottom:22 }}>
        <div className="card" style={{ padding:'20px 22px' }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:16 }}>Category Distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {categoryData.map((_:any, i:number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:'none', boxShadow:'0 4px 16px rgba(0,0,0,0.1)' }}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 14px', justifyContent:'center' }}>
            {categoryData.map((c:any, i:number) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:CHART_COLORS[i%CHART_COLORS.length], display:'inline-block' }}/>
                <span style={{ fontSize:11, color:'#6B7280' }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding:'20px 22px' }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#111827', marginBottom:16 }}>Monthly Trends</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:'#9CA3AF' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:'none', boxShadow:'0 4px 16px rgba(0,0,0,0.1)' }}/>
              <Bar dataKey="count" fill={EM} radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display:'grid', gridTemplateColumns:'1.8fr 1fr', gap:16 }}>
        {/* Recent Complaints */}
        <div className="card" style={{ padding:'20px 22px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#111827' }}>Recent Complaints</p>
            <button onClick={() => navigate('/dashboard/list')} style={{ fontSize:12, color:EM, fontWeight:600, background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>View all <ChevronRight size={13}/></button>
          </div>
          {(!data?.recentComplaints?.length) ? (
            <div style={{ textAlign:'center', padding:'32px 16px', color:'#9CA3AF' }}>
              <FolderOpen size={32} style={{ margin:'0 auto 10px', opacity:0.3 }}/>
              <p style={{ fontSize:12 }}>No complaints filed yet.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {data.recentComplaints.slice(0,5).map((c:any, i:number) => (
                <div key={i} style={{ display:'flex', alignItems:'center', padding:'10px 0', borderBottom: i<4?'1px solid #F3F4F6':'none', gap:12 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:STATUS_COLORS[c.status]||'#9CA3AF', flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:12.5, fontWeight:600, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.category}</p>
                    <p style={{ fontSize:11, color:'#9CA3AF', fontFamily:'monospace' }}>{c.trackingId}</p>
                  </div>
                  <span style={{ fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:99, background:`${STATUS_COLORS[c.status]||'#9CA3AF'}18`, color:STATUS_COLORS[c.status]||'#9CA3AF' }}>{c.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Profile */}
        <div className="card" style={{ padding:'20px 22px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <Brain size={15} style={{ color:EM }}/>
            <p style={{ fontSize:13, fontWeight:700, color:'#111827' }}>AI Behavioral Profile</p>
          </div>
          {!data?.behavioralAnalytics ? (
            <div style={{ textAlign:'center', padding:'24px 0', color:'#9CA3AF' }}>
              <Brain size={28} style={{ margin:'0 auto 8px', opacity:0.25 }}/>
              <p style={{ fontSize:12 }}>No behavioral data yet.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { label:'Credibility', v: Math.round(data.behavioralAnalytics.averageCredibility||0), color:EM },
                { label:'Resolution', v: Math.round(data.behavioralAnalytics.resolutionEfficiency||0), color:'#3B82F6' },
                { label:'Escalation', v: Math.round(data.behavioralAnalytics.escalationRate||0), color:'#F59E0B' },
              ].map((m,i) => (
                <div key={i}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:11.5, color:'#6B7280', fontWeight:500 }}>{m.label}</span>
                    <span style={{ fontSize:11.5, fontWeight:700, color:m.color }}>{m.v}%</span>
                  </div>
                  <div style={{ height:5, background:'#F3F4F6', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ width:`${Math.min(m.v,100)}%`, height:'100%', background:m.color, borderRadius:99, transition:'width 0.7s ease' }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => navigate('/dashboard/profile')} style={{ marginTop:16, width:'100%', padding:'8px', borderRadius:8, background:'#ECFDF5', color:EM, fontSize:12, fontWeight:600, border:'none', cursor:'pointer' }}>
            View Full Profile →
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
