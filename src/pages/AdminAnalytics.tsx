import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { 
  LayoutDashboard, Clock, AlertTriangle, Users, 
  ShieldCheck, Shield, EyeOff, Eye, RefreshCw 
} from 'lucide-react';
import api from '../services/api';

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
  amber:         '#9E4300',
  red:           '#B91C1C',
  shadowAmbient: '0 20px 40px rgba(44,47,49,0.06)',
  radiusCard:    '20px',
  radiusBtn:     '12px',
};

const CHART_COLORS = [DS.emerald, DS.blue, '#8B5CF6', DS.amber, DS.red];

// ── Types ─────────────────────────────────────────────────────────────────────
interface AdminStats {
  total: number; active: number; escalated: number; resolved: number;
  highPriority: number; activeUsers: number; avgResolution: string;
  byRole?: { warden: number; faculty: number; hod: number; dean: number; admin: number };
}

interface FeeRecord {
  id: number; userId: number; studentName: string; studentEmail: string;
  semester: string; status: string; dueDate: string;
  reminderSentAt?: string; reminderCount: number; isOverdue: boolean;
}

const MOCK_STATS: AdminStats = {
  total: 0, active: 0, escalated: 0, resolved: 0,
  highPriority: 0, activeUsers: 0, avgResolution: 'N/A'
};

// ── Fee Status Badge ──────────────────────────────────────────────────────────
const FeeBadge = ({ status, isOverdue }: { status: string; isOverdue: boolean }) => {
  const displayStatus = isOverdue ? 'Overdue' : status;
  const map: Record<string, { color: string; bg: string }> = {
    Paid:    { color: DS.emerald,    bg: DS.emeraldLight },
    Unpaid:  { color: '#9E4300',     bg: '#FFDBCB' },
    Overdue: { color: DS.red,        bg: DS.redLight },
  };
  const style = map[displayStatus] ?? { color: DS.textFaint, bg: DS.surfaceLow };
  return (
    <span style={{
      fontSize: 11, fontWeight: 800, padding: '4px 12px',
      borderRadius: 99, background: style.bg, color: style.color
    }}>{displayStatus}</span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AdminAnalytics = () => {
  const [view, setView] = useState<'analytics' | 'queue'>('analytics');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revealedIds, setRevealedIds] = useState<Record<string, any>>({});

  // -- fetch analytics
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevealIdentity = async (trackingId: string) => {
    try {
      const reason = window.prompt("ROOT SECURITY INCIDENT: Provide administrative justification for unlocking this user's identity:");
      if (!reason) return;
      const res = await api.post('/admin/reveal-identity', { trackingId, reason });
      setRevealedIds(prev => ({ ...prev, [trackingId]: res.data }));
      alert("Encryption Broken. Footprint Authored to Audit Trail.");
    } catch (err: any) {
      alert("Failed to decrypt: " + err.response?.data?.message);
    }
  };

  const cStats = data?.globalStats || { totalComplaints: 0, avgResolutionDays: 0, escalatedToday: 0, activeUsers: 0 };
  const kpis = [
    { icon: <LayoutDashboard size={22}/>, label: 'Global Volume', value: cStats.totalComplaints, color: DS.emerald, bg: DS.emeraldLight },
    { icon: <Clock size={22}/>, label: 'Avg Resolution', value: (cStats.avgResolutionDays || 0) + ' Days', color: DS.blue, bg: '#EBF3FD' },
    { icon: <AlertTriangle size={22}/>, label: 'Escalation Breach', value: cStats.escalatedToday, color: DS.red, bg: '#FEF2F2' },
    { icon: <Users size={22}/>, label: 'Platform Accounts', value: cStats.activeUsers, color: '#8B5CF6', bg: '#F5F3FF' },
  ];

  const cardStyle = { background: DS.surface, borderRadius: DS.radiusCard, padding: 32, boxShadow: DS.shadowAmbient, display: 'flex', flexDirection: 'column' as const };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'transparent' }}>
      <RefreshCw size={40} className="spin" color={DS.blue} />
    </div>
  );

  return (
    <div style={{ flex: 1, padding: '40px 48px', minHeight: '100vh', background: 'transparent', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 28, fontWeight: 800, color: DS.text, margin: 0 }}>
            Universal Operations Command
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setView('analytics')} style={{ padding: '8px 16px', borderRadius: 8, background: view==='analytics' ? DS.text : DS.surfaceLow, color: view==='analytics' ? '#fff' : DS.textMuted, fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 13 }}>Telemetry</button>
          <button onClick={() => setView('queue')} style={{ padding: '8px 16px', borderRadius: 8, background: view==='queue' ? DS.text : DS.surfaceLow, color: view==='queue' ? '#fff' : DS.textMuted, fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 13 }}>Matrix</button>
          <button onClick={() => fetchData()} style={{ background: DS.surface, border: `1px solid ${DS.surfaceLow}`, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
            <RefreshCw size={14} style={{ color: DS.blue }} /> Sync
          </button>
        </div>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: DS.text, letterSpacing: '-0.02em', margin: 0 }}>Admin Control Panel</h1>
        <p style={{ fontSize: 15, color: DS.textMuted, marginTop: 8 }}>Supervise all complaint queues and manage student fee reminders.</p>
      </div>

      {view === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {kpis.map((k, i) => (
              <div key={i} style={{ background: DS.surface, padding: 24, borderRadius: 16, boxShadow: DS.shadowAmbient, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
                <div>
                  <p style={{ fontSize: 26, fontWeight: 800, color: DS.text, margin: 0, lineHeight: 1.2 }}>{k.value}</p>
                  <p style={{ fontSize: 12, color: DS.textMuted, fontWeight: 600, margin: 0 }}>{k.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24 }}>
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 24px' }}>Category Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={data?.categoryDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" stroke="none" paddingAngle={4}>
                    {(data?.categoryDistribution || []).map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: DS.shadowAmbient }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 24px' }}>System Volume Trends</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data?.monthlyVolume} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={DS.surfaceLow} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: DS.textMuted }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: DS.textMuted }} />
                  <RechartsTooltip cursor={{ fill: DS.surfaceLow }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: DS.shadowAmbient }}/>
                  <Bar dataKey="count" fill={DS.blue} radius={[6, 6, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {view === 'queue' && (
        <div style={{ background: DS.surface, borderRadius: 16, boxShadow: DS.shadowAmbient, overflow: 'hidden' }}>
           <div style={{ padding: 24, borderBottom: `1px solid ${DS.surfaceLow}` }}>
             <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Global Grievance Database</h3>
           </div>
           <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: DS.surfaceLow, color: DS.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '16px 24px', fontWeight: 700 }}>Tracking ID</th>
                    <th style={{ padding: '16px 24px', fontWeight: 700 }}>Category</th>
                    <th style={{ padding: '16px 24px', fontWeight: 700 }}>Status/Priority</th>
                    <th style={{ padding: '16px 24px', fontWeight: 700 }}>Authority Lock</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.allGrievances?.map((g: any, i: number) => {
                    const r = revealedIds[g.trackingId];
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${DS.surfaceLow}`, fontSize: 13, color: DS.text, fontWeight: 600 }}>
                        <td style={{ padding: '16px 24px', fontFamily: 'monospace', fontWeight: 700 }}>{g.trackingId}</td>
                        <td style={{ padding: '16px 24px' }}>{g.category}</td>
                        <td style={{ padding: '16px 24px' }}>{g.status} | {g.priority}</td>
                        <td style={{ padding: '16px 24px' }}>
                          {!r ? (
                            <button onClick={() => handleRevealIdentity(g.trackingId)} style={{ background: DS.surfaceLow, border: 'none', padding: '6px 12px', borderRadius: 8, color: DS.red, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
                              <EyeOff size={14} /> DECRYPT
                            </button>
                          ) : (
                            <div style={{ background: DS.emeraldLight, color: DS.emeraldDark, padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                               <Eye size={14} /> {r.name} ({r.studentId})
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
            </table>
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminAnalytics;
