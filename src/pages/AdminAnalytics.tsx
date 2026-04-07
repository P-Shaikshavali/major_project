<<<<<<< HEAD
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
=======
import { useEffect, useState, useCallback } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  LayoutDashboard, Clock, AlertTriangle, Users, ShieldCheck, Shield,
  Bell, CheckCircle, RefreshCw, Loader2, DollarSign
} from 'lucide-react';
import api from '../services/api';

// ── Design Tokens ─────────────────────────────────────────────────────────────
const DS = {
  bg:           '#F8F9FA',
  surface:      '#FFFFFF',
  surfaceLow:   '#F3F4F5',
  surfaceHigh:  '#E1E3E4',
  emerald:      '#10B981',
  emeraldDark:  '#065F46',
  emeraldLight: '#ECFDF5',
  text:         '#111827',
  textMuted:    '#414754',
  textFaint:    '#727785',
  blue:         '#1A73E8',
  blueLight:    '#EBF3FD',
  amber:        '#9E4300',
  amberLight:   '#FFDBCB',
  red:          '#B91C1C',
  redLight:     '#FEF2F2',
  shadow:       '0 20px 40px rgba(44,47,49,0.06)',
  radiusCard:   '20px',
  radiusBtn:    '12px',
};

const CHART_COLORS = [DS.emerald, DS.blue, '#8B5CF6', DS.amber];
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)

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
<<<<<<< HEAD
  const [view, setView] = useState<'analytics' | 'queue'>('analytics');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revealedIds, setRevealedIds] = useState<Record<string, any>>({});
=======
  const [activeTab, setActiveTab] = useState<'analytics' | 'fee'>('analytics');
  const [stats, setStats]         = useState<AdminStats>(MOCK_STATS);
  const [feeList, setFeeList]     = useState<FeeRecord[]>([]);
  const [feeLoading, setFeeLoading] = useState(false);
  const [remindingId, setRemindingId] = useState<number | null>(null);
  const [toast, setToast]         = useState('');

  const [catData] = useState([
    { name: 'Hostel (38%)', value: 38 }, { name: 'Academic (29%)', value: 29 },
    { name: 'Dept (21%)',   value: 21 }, { name: 'Safety (12%)', value: 12 },
  ]);
  const [monthlyData] = useState([
    { month: 'Jan', count: 62 }, { month: 'Feb', count: 58 }, { month: 'Mar', count: 78 },
    { month: 'Apr', count: 76 }, { month: 'May', count: 54 }, { month: 'Jun', count: 70 },
  ]);
  const clusters = [
    { cat: 'Hostel WiFi',   count: 47, sev: 'High',     color: DS.amber,   bg: DS.amberLight },
    { cat: 'Exam Re-eval',  count: 31, sev: 'Medium',   color: DS.emerald, bg: DS.emeraldLight },
    { cat: 'Fee Portal',    count: 24, sev: 'Low',       color: DS.blue,    bg: DS.blueLight },
    { cat: 'Campus Safety', count: 18, sev: 'Critical',  color: DS.red,     bg: DS.redLight },
  ];
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)

  // -- fetch analytics
  useEffect(() => {
<<<<<<< HEAD
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
=======
    api.get('/dashboard/admin').then(r => setStats(r.data)).catch(console.error);
  }, []);

  // -- fetch fee list when tab is active
  const loadFees = useCallback(() => {
    setFeeLoading(true);
    api.get('/fee/all')
      .then(r => setFeeList(Array.isArray(r.data) ? r.data : []))
      .catch(() => setFeeList([]))
      .finally(() => setFeeLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'fee') loadFees();
  }, [activeTab, loadFees]);

  // -- send fee reminder
  const sendReminder = async (userId: number, name: string) => {
    setRemindingId(userId);
    try {
      const res = await api.post(`/fee/remind/${userId}`);
      setToast(res.data?.message ?? `Reminder sent to ${name}`);
      loadFees(); // refresh
    } catch {
      setToast('Failed to send reminder. Please try again.');
    } finally {
      setRemindingId(null);
      setTimeout(() => setToast(''), 4000);
    }
  };

  const kpis = [
    { icon: <LayoutDashboard size={22}/>, label: 'Total Complaints', value: stats.total,       color: DS.emerald, bg: DS.emeraldLight },
    { icon: <Clock size={22}/>,           label: 'Avg Resolution',   value: stats.avgResolution, color: DS.blue,    bg: DS.blueLight },
    { icon: <AlertTriangle size={22}/>,   label: 'Escalated',        value: stats.escalated,    color: DS.red,     bg: DS.redLight },
    { icon: <Users size={22}/>,           label: 'Active Users',     value: stats.activeUsers,  color: '#8B5CF6',  bg: '#F5F3FF' },
  ];

  const cardStyle = {
    background: DS.surface, borderRadius: DS.radiusCard, padding: 24,
    boxShadow: DS.shadow, border: '1px solid rgba(255,255,255,0.8)',
  };

  const unpaidCount = feeList.filter(f => f.status !== 'Paid').length;

  return (
    <div style={{ padding: '40px 48px', minHeight: '100vh', background: DS.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: DS.text, color: '#fff', padding: '14px 24px', borderRadius: 14,
          fontSize: 14, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: DS.emeraldLight, padding: '4px 12px', borderRadius: 20, marginBottom: 12 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: DS.emerald }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: DS.emeraldDark, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Administration</span>
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
        </div>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: DS.text, letterSpacing: '-0.02em', margin: 0 }}>Admin Control Panel</h1>
        <p style={{ fontSize: 15, color: DS.textMuted, marginTop: 8 }}>Supervise all complaint queues and manage student fee reminders.</p>
      </div>

<<<<<<< HEAD
      {view === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {kpis.map((k, i) => (
              <div key={i} style={{ background: DS.surface, padding: 24, borderRadius: 16, boxShadow: DS.shadowAmbient, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</div>
                <div>
                  <p style={{ fontSize: 26, fontWeight: 800, color: DS.text, margin: 0, lineHeight: 1.2 }}>{k.value}</p>
                  <p style={{ fontSize: 12, color: DS.textMuted, fontWeight: 600, margin: 0 }}>{k.label}</p>
=======
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[
          { key: 'analytics', label: '📊 System Analytics', badge: null },
          { key: 'fee',       label: '💰 Fee Management',   badge: unpaidCount > 0 ? unpaidCount : null },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as 'analytics' | 'fee')}
            style={{
              padding: '9px 22px', borderRadius: 12, border: 'none',
              fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
              background: activeTab === t.key ? DS.emerald : DS.surface,
              color: activeTab === t.key ? '#fff' : DS.textMuted,
              boxShadow: DS.shadow,
            }}
          >
            {t.label}
            {t.badge && (
              <span style={{ marginLeft: 8, background: DS.red, color: '#fff', padding: '2px 8px', borderRadius: 99, fontSize: 11 }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══ ANALYTICS TAB ══════════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 28 }}>
            {kpis.map((k, i) => (
              <div key={i} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderTop: `3px solid ${k.color}` }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{k.icon}</div>
                <div>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 28, fontWeight: 800, color: DS.text, lineHeight: 1, letterSpacing: '-0.03em' }}>{k.value}</p>
                  <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 4, fontWeight: 500 }}>{k.label}</p>
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
                </div>
              </div>
            ))}
          </div>

<<<<<<< HEAD
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
=======
          {/* Role Breakdown */}
          {stats.byRole && (
            <div style={{ ...cardStyle, marginBottom: 28 }}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: DS.text, marginBottom: 16 }}>
                🔀 Complaint Distribution by Role
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {Object.entries(stats.byRole).map(([role, count]) => (
                  <div key={role} style={{ flex: 1, minWidth: 120, background: DS.surfaceLow, borderRadius: 14, padding: '16px 20px', textAlign: 'center' }}>
                    <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 28, fontWeight: 800, color: DS.text }}>{count}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>{role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24, marginBottom: 28 }}>
            <div style={cardStyle}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: DS.text, marginBottom: 20 }}>Distribution by Category</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={catData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" stroke="none" paddingAngle={2}>
                    {catData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 13, borderRadius: 12, border: 'none', boxShadow: DS.shadow }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={cardStyle}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: DS.text, marginBottom: 20 }}>Monthly Incident Volume</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData} barSize={34} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={DS.surfaceHigh} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: DS.textMuted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: DS.textMuted }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 13, borderRadius: 12, border: 'none', boxShadow: DS.shadow }} />
                  <Bar dataKey="count" fill={DS.emerald} radius={[6, 6, 0, 0]} />
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
<<<<<<< HEAD
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

=======

          {/* AI Clustering */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: DS.emeraldLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={18} style={{ color: DS.emerald }} />
              </div>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text }}>AI Complaint Clustering</p>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: DS.surfaceLow, padding: '6px 14px', borderRadius: 40 }}>
                <Shield size={14} style={{ color: DS.emerald }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: DS.emeraldDark, letterSpacing: '0.06em' }}>PATTERN RECOGNITION ACTIVE</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {clusters.map((cl, i) => (
                <div key={i} style={{ padding: '20px', borderRadius: 14, background: cl.bg }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: cl.color, lineHeight: 1.3 }}>{cl.cat}</p>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 40, background: DS.surface, color: cl.color }}>{cl.sev}</span>
                  </div>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: cl.color, lineHeight: 1 }}>{cl.count}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: cl.color, opacity: 0.8, marginTop: 4 }}>incidents grouped</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ══ FEE MANAGEMENT TAB ════════════════════════════════════════════════ */}
      {activeTab === 'fee' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: DS.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: DS.blue }}>
                <DollarSign size={20} />
              </div>
              <div>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text }}>Student Fee Management</p>
                <p style={{ fontSize: 13, color: DS.textMuted }}>View status & send payment reminders. No payment processing.</p>
              </div>
            </div>
            <button
              onClick={loadFees}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: DS.surfaceLow, border: 'none', borderRadius: 10, padding: '8px 16px', color: DS.textMuted, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Summary Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Paid',    count: feeList.filter(f => f.status === 'Paid').length,                color: DS.emerald, bg: DS.emeraldLight },
              { label: 'Unpaid',  count: feeList.filter(f => f.status === 'Unpaid' && !f.isOverdue).length, color: '#9E4300', bg: '#FFDBCB' },
              { label: 'Overdue', count: feeList.filter(f => f.isOverdue || f.status === 'Overdue').length, color: DS.red,     bg: DS.redLight },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.count}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.label}</p>
              </div>
            ))}
          </div>

          {feeLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: DS.textMuted }}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: DS.emerald, margin: '0 auto 12px', display: 'block' }} />
              <p>Loading fee records...</p>
              <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
            </div>
          ) : feeList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: DS.textFaint }}>
              <p style={{ fontSize: 15, fontWeight: 600 }}>No students registered yet.</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>Fee records are auto-created when students register.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: DS.surfaceLow }}>
                    {['Student', 'Email', 'Semester', 'Status', 'Due Date', 'Last Reminded', 'Reminders', 'Action'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 700, color: DS.textFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {feeList.map((f, i) => (
                    <tr key={f.id} style={{ borderBottom: `1px solid ${DS.surfaceLow}`, background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: DS.text }}>{f.studentName}</td>
                      <td style={{ padding: '14px 16px', color: DS.textMuted, fontSize: 13 }}>{f.studentEmail}</td>
                      <td style={{ padding: '14px 16px', color: DS.textMuted }}>{f.semester}</td>
                      <td style={{ padding: '14px 16px' }}><FeeBadge status={f.status} isOverdue={f.isOverdue} /></td>
                      <td style={{ padding: '14px 16px', color: DS.textMuted, fontSize: 13 }}>{new Date(f.dueDate).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 16px', color: DS.textFaint, fontSize: 12 }}>
                        {f.reminderSentAt ? new Date(f.reminderSentAt).toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ background: DS.surfaceLow, borderRadius: 99, padding: '3px 10px', fontSize: 13, fontWeight: 700 }}>{f.reminderCount}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {f.status === 'Paid' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: DS.emerald, fontWeight: 700 }}>
                            <CheckCircle size={14} /> Paid
                          </span>
                        ) : (
                          <button
                            onClick={() => sendReminder(f.userId, f.studentName)}
                            disabled={remindingId === f.userId}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              background: remindingId === f.userId ? DS.surfaceHigh : DS.red,
                              color: remindingId === f.userId ? DS.textMuted : '#fff',
                              border: 'none', borderRadius: 8, padding: '7px 14px',
                              fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                          >
                            {remindingId === f.userId
                              ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                              : <Bell size={12} />
                            }
                            {remindingId === f.userId ? 'Sending...' : 'Send Reminder'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
    </div>
  );
};

export default AdminAnalytics;
