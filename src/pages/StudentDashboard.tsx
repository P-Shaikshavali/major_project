import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FolderOpen, Clock, CheckCircle, AlertTriangle, TrendingUp, ChevronRight, PlusCircle, Brain } from 'lucide-react';
import api from '../services/api';

const Card = ({ children, className = '', style = {} }: any) => (
  <div className={`card-hover animate-up ${className}`} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', ...style }}>
    {children}
  </div>
);

const StudentDashboard = () => {
  const [data, setData] = useState({
    totalComplaints: 0, pending: 0, inProgress: 0, resolved: 0,
    recentComplaints: [] as any[],
    behavioralAnalytics: { insight: '', resolutionEfficiency: 0, escalationRate: 0, averageCredibility: 0 },
  });

  useEffect(() => {
    api.get('/dashboard/student').then(res => setData(res.data)).catch(console.error);
  }, []);

  const kpis = [
    { label: 'Total Complaints', value: data.totalComplaints, icon: <FolderOpen size={18} />, color: 'var(--blue)', bg: 'var(--blue-light)' },
    { label: 'Pending', value: data.pending, icon: <Clock size={18} />, color: 'var(--amber)', bg: 'var(--amber-light)' },
    { label: 'In Progress', value: data.inProgress, icon: <TrendingUp size={18} />, color: 'var(--purple)', bg: 'var(--purple-light)' },
    { label: 'Resolved', value: data.resolved, icon: <CheckCircle size={18} />, color: 'var(--green)', bg: 'var(--green-light)' },
  ];

  const pieData = [
    { name: 'Academic', value: 35, color: '#2563EB' },
    { name: 'Hostel', value: 28, color: '#8B5CF6' },
    { name: 'Admin', value: 22, color: '#10B981' },
    { name: 'Safety', value: 15, color: '#F59E0B' },
  ];

  const barData = [
    { m: 'Jan', v: 4 }, { m: 'Feb', v: 7 }, { m: 'Mar', v: 3 },
    { m: 'Apr', v: 9 }, { m: 'May', v: 5 }, { m: 'Jun', v: 6 },
  ];

  const statusStyle: Record<string, any> = {
    Resolved: { background: 'var(--green-light)', color: 'var(--green)' },
    Submitted: { background: 'var(--blue-light)', color: 'var(--blue)' },
    InProgress: { background: 'var(--amber-light)', color: 'var(--amber)' },
    Escalated: { background: 'var(--red-light)', color: 'var(--red)' },
  };

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Student Dashboard</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Welcome back 👋</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Here's your grievance activity overview.</p>
        </div>
        <Link to="/dashboard/submit"
          className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all"
          style={{ background: 'var(--blue)' }}
          onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--blue)'}
        >
          <PlusCircle size={15} /> New Complaint
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((k, i) => (
          <Card key={i} style={{ padding: '18px 20px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              {k.icon}
            </div>
            <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{k.value}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{k.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Pie Chart */}
        <Card style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Category Distribution</p>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-md)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                {d.name}
              </div>
            ))}
          </div>
        </Card>

        {/* Bar Chart */}
        <Card style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Monthly Trends</p>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-faint)', fontSize: 11 }} dy={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-faint)', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-md)', fontSize: 12 }} cursor={{ fill: 'var(--blue-light)', radius: 4 }} />
                <Bar dataKey="v" fill="var(--blue)" radius={[5, 5, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Complaints */}
        <Card style={{ padding: '20px 24px', gridColumn: 'span 2' }}>
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Recent Complaints</p>
            <Link to="/dashboard/list" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--blue)' }}>
              View all <ChevronRight size={13} />
            </Link>
          </div>
          {(data.recentComplaints || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-faint)' }}>
              <FolderOpen size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>No complaints filed yet.</p>
            </div>
          ) : (data.recentComplaints || []).map((c: any, i: number, arr: any[]) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FolderOpen size={14} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex justify-between gap-2">
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{c.category}</p>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, flexShrink: 0, ...(statusStyle[c.status] || statusStyle.Submitted) }}>{c.status}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginTop: 2 }}>{c.description || 'No description.'}</p>
              </div>
            </div>
          ))}
        </Card>

        {/* AI Panel */}
        <Card style={{ padding: '20px 24px' }}>
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--purple-light)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={14} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>AI Behavioral Profile</p>
          </div>
          {data.behavioralAnalytics?.insight ? (
            <>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>{data.behavioralAnalytics.insight}</p>
              {[
                { label: 'Resolution Efficiency', value: data.behavioralAnalytics.resolutionEfficiency, color: 'var(--blue)' },
                { label: 'Escalation Rate', value: data.behavioralAnalytics.escalationRate, color: 'var(--red)' },
                { label: 'Credibility Score', value: data.behavioralAnalytics.averageCredibility, color: 'var(--green)' },
              ].map((m, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{Math.round(m.value)}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round(m.value)}%`, background: m.color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-faint)' }}>
              <AlertTriangle size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <p style={{ fontSize: 12 }}>No behavioral data yet.</p>
            </div>
          )}
          <Link to="/dashboard/profile" className="flex items-center justify-center gap-1 w-full text-xs font-semibold mt-4 py-2 rounded-lg" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
            View Full Profile <ChevronRight size={13} />
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
