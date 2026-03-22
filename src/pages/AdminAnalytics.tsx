import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ListChecks, Timer, AlertTriangle, ShieldCheck, Users } from 'lucide-react';

const Card = ({ children, style = {} }: any) => (
  <div className="card-hover animate-up" style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', ...style }}>
    {children}
  </div>
);

const AdminAnalytics = () => {
  const pieData = [
    { name: 'Hostel',   value: 38, color: '#2563EB' },
    { name: 'Academic', value: 29, color: '#8B5CF6' },
    { name: 'Admin',    value: 21, color: '#10B981' },
    { name: 'Safety',   value: 12, color: '#F59E0B' },
  ];
  const barData = [
    { m: 'Jan', v: 65 }, { m: 'Feb', v: 59 }, { m: 'Mar', v: 80 },
    { m: 'Apr', v: 81 }, { m: 'May', v: 56 }, { m: 'Jun', v: 72 },
  ];
  const clusters = [
    { category: 'Hostel WiFi', count: 47, severity: 'High', color: 'var(--amber)', bg: 'var(--amber-light)' },
    { category: 'Exam Re-evaluation', count: 31, severity: 'Medium', color: 'var(--blue)', bg: 'var(--blue-light)' },
    { category: 'Fee Portal Issues', count: 24, severity: 'Low', color: 'var(--green)', bg: 'var(--green-light)' },
    { category: 'Campus Safety', count: 18, severity: 'Critical', color: 'var(--red)', bg: 'var(--red-light)' },
  ];

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div className="mb-7">
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Administration</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>System Analytics</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Institution-level grievance metrics and AI clustering insights.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: <ListChecks size={17} />, label: 'Total Complaints', value: '1,024', color: 'var(--blue)',   bg: 'var(--blue-light)' },
          { icon: <Timer size={17} />,      label: 'Avg Resolution',   value: '1.2d',  color: 'var(--green)',  bg: 'var(--green-light)' },
          { icon: <AlertTriangle size={17} />, label: 'Escalated Today', value: '7',  color: 'var(--amber)',  bg: 'var(--amber-light)' },
          { icon: <Users size={17} />,      label: 'Active Users',     value: '234',   color: 'var(--purple)', bg: 'var(--purple-light)' },
        ].map((m, i) => (
          <Card key={i} style={{ padding: '18px 20px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: m.bg, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              {m.icon}
            </div>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{m.value}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{m.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Complaints by Category</p>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={58} outerRadius={82} paddingAngle={3} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-md)', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                {d.name} ({d.value}%)
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Monthly Volume</p>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -26, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-faint)', fontSize: 11 }} dy={6} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-faint)', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-md)', fontSize: 12 }} cursor={{ fill: 'var(--blue-light)', radius: 4 }} />
                <Bar dataKey="v" fill="var(--blue)" radius={[5, 5, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* AI Cluster Insights */}
      <Card style={{ padding: '20px 24px' }}>
        <div className="flex items-center gap-2 mb-5">
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--purple-light)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={14} />
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>AI Complaint Clustering Insights</p>
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: 'var(--purple-light)', color: 'var(--purple)' }}>Secured</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {clusters.map((c, i) => (
            <div key={i} style={{ padding: '14px 16px', borderRadius: 10, background: c.bg, border: `1px solid ${c.color}20` }}>
              <div className="flex items-start justify-between mb-2">
                <p style={{ fontSize: 13, fontWeight: 600, color: c.color }}>{c.category}</p>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${c.color}22`, color: c.color }}>{c.severity}</span>
              </div>
              <p style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.count}</p>
              <p style={{ fontSize: 11, color: c.color, opacity: 0.7, marginTop: 2 }}>complaints clustered</p>
              <div style={{ height: 3, background: `${c.color}30`, borderRadius: 99, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(c.count / 50) * 100}%`, background: c.color, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
