import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, AlertTriangle, TrendingUp, ClipboardList, RefreshCw, CheckCircle } from 'lucide-react';
import api from '../services/api';

const EM = '#10B981';
const CHART_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

const STATUS_MAP: Record<string, { bg: string; text: string }> = {
  Submitted:  { bg: '#EFF6FF', text: '#1D4ED8' },
  InProgress: { bg: '#FFFBEB', text: '#D97706' },
  Resolved:   { bg: '#ECFDF5', text: '#065F46' },
  Escalated:  { bg: '#FEF2F2', text: '#B91C1C' },
};

const KpiCard = ({ icon, label, value, color, bg }: any) => (
  <div className="card animate-up" style={{ padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${color},${color}55)` }} />
    <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{icon}</div>
    <p style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: 11.5, color: '#6B7280', marginTop: 5, fontWeight: 500 }}>{label}</p>
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
    { icon: <ClipboardList size={18}/>, label: 'Total Complaints',  value: complaints.length,   color: EM,       bg: '#ECFDF5' },
    { icon: <AlertTriangle size={18}/>,label: 'Escalated to Dean', value: escalated.length,     color: '#EF4444', bg: '#FEF2F2' },
    { icon: <TrendingUp size={18}/>,   label: 'Pending Review',    value: pending.length,        color: '#F59E0B', bg: '#FFFBEB' },
    { icon: <CheckCircle size={18}/>,  label: 'Resolved',          value: resolved.length,       color: '#059669', bg: '#ECFDF5' },
  ];

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: EM, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Dean's Office</p>
        <h1 style={{ fontSize: 23, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>Dean Dashboard</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>Institution-wide oversight — manage escalated grievances and monitor resolution trends.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {([['overview','Overview'], ['escalated','Escalated'], ['all','All Complaints']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{ padding: '7px 18px', borderRadius: 99, border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                     background: activeTab === key ? '#111827' : '#F3F4F6', color: activeTab === key ? '#fff' : '#6B7280' }}>
            {label} {key === 'escalated' && escalated.length > 0 && (
              <span style={{ marginLeft: 5, background: '#EF4444', color: '#fff', borderRadius: 99, padding: '1px 7px', fontSize: 10 }}>{escalated.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Chart + List row */}
      <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'overview' ? '1fr 1.8fr' : '1fr', gap: 16 }}>
        {activeTab === 'overview' && (
          <div className="card" style={{ padding: '20px 22px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Category Distribution</p>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 13 }}>
                No data yet
              </div>
            )}
          </div>
        )}

        {/* Complaints table */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
              {activeTab === 'escalated' ? 'Escalated Complaints' : activeTab === 'all' ? 'All Complaints' : 'Recent Complaints'}
            </p>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>
              <RefreshCw size={20} style={{ margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: 12 }}>Loading...</p>
            </div>
          ) : listToShow.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>
              <ShieldCheck size={24} style={{ margin: '0 auto 8px', color: EM }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>All Clear</p>
              <p style={{ fontSize: 12 }}>No items in this queue.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {listToShow.map((c: any, i: number) => {
                const sc = STATUS_MAP[c.status] || STATUS_MAP.Submitted;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < listToShow.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.text, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#111827', fontFamily: 'monospace' }}>{c.trackingId}</p>
                      <p style={{ fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.category} · {c.anonymousId}</p>
                    </div>
                    <select value={c.status} disabled={updatingId === c.id}
                      onChange={e => updateStatus(c.id, e.target.value)}
                      style={{ fontSize: 11, padding: '4px 8px', borderRadius: 7, border: '1.5px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', outline: 'none' }}>
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
