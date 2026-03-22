import { useEffect, useState } from 'react';
import { ShieldCheck, Home, Wifi, Utensils, AlertTriangle, CheckCircle, TrendingUp, ClipboardList, RefreshCw } from 'lucide-react';
import api from '../services/api';

const EM = '#10B981';

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

const HOSTEL_CATS = ['Hostel', 'Facilities', 'Safety', 'Admin'];

const QUICK_TIPS = [
  { icon: <Home size={14} />, label: 'Room Issues', tip: 'Assign maintenance staff immediately for physical damage reports.' },
  { icon: <Wifi size={14} />, label: 'WiFi / Connectivity', tip: 'Cluster repeated WiFi complaints by block and escalate to IT.' },
  { icon: <Utensils size={14} />, label: 'Mess / Food', tip: 'Monthly mess committee review recommended if > 3 complaints in a week.' },
  { icon: <AlertTriangle size={14} />, label: 'Safety Issues', tip: 'All safety complaints must be resolved within 24 hours per policy.' },
];

const HostelDeanDashboard = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState<'all' | 'pending' | 'resolved'>('pending');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    api.get('/dashboard/authority')
      .then(r => {
        // Hostel Dean sees hostel-category complaints
        const filtered = (r.data || []).filter((c: any) =>
          HOSTEL_CATS.includes(c.category) || c.assignedTo === 'Warden'
        );
        setComplaints(filtered);
      })
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

  const pending  = complaints.filter(c => c.status === 'Submitted' || c.status === 'InProgress');
  const resolved = complaints.filter(c => c.status === 'Resolved');
  const listToShow = activeTab === 'pending' ? pending : activeTab === 'resolved' ? resolved : complaints;

  const kpis = [
    { icon: <ClipboardList size={18}/>,  label: 'Hostel Complaints', value: complaints.length,  color: EM,        bg: '#ECFDF5' },
    { icon: <AlertTriangle size={18}/>,  label: 'Pending',           value: pending.length,      color: '#F59E0B', bg: '#FFFBEB' },
    { icon: <CheckCircle size={18}/>,    label: 'Resolved',          value: resolved.length,     color: '#059669', bg: '#ECFDF5' },
    { icon: <TrendingUp size={18}/>,     label: 'Escalated',         value: complaints.filter(c => c.isEscalated).length, color: '#EF4444', bg: '#FEF2F2' },
  ];

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: EM, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Hostel Administration</p>
        <h1 style={{ fontSize: 23, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>Hostel Dean Dashboard</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>Manage hostel-related grievances — rooms, mess, WiFi, and safety.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* Privacy notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderRadius: 12, background: '#ECFDF5', border: '1px solid #A7F3D0', marginBottom: 20 }}>
        <ShieldCheck size={14} style={{ color: EM, flexShrink: 0 }} />
        <p style={{ fontSize: 12.5, color: '#065F46', fontWeight: 500 }}>
          <strong>Privacy Active:</strong> Student identities are anonymized. Only Anonymous IDs are visible.
        </p>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: EM }}>IDENTITY PROTECTED</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 16 }}>
        {/* Complaint Queue */}
        <div className="card" style={{ padding: '20px 22px' }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {([['pending','Pending'], ['resolved','Resolved'], ['all','All']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{ padding: '5px 14px', borderRadius: 99, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                         background: activeTab === key ? '#111827' : '#F3F4F6', color: activeTab === key ? '#fff' : '#6B7280' }}>
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>
              <RefreshCw size={20} style={{ margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: 12 }}>Loading...</p>
            </div>
          ) : listToShow.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>
              <ShieldCheck size={24} style={{ margin: '0 auto 8px', color: EM }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Queue Clear</p>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>{c.trackingId}</p>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: sc.bg, color: sc.text }}>{c.status}</span>
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: '#F3F4F6', color: '#6B7280' }}>{c.category}</span>
                      </div>
                      <p style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>{c.anonymousId}</p>
                    </div>
                    <select value={c.status} disabled={updatingId === c.id}
                      onChange={e => updateStatus(c.id, e.target.value)}
                      style={{ fontSize: 11, padding: '4px 8px', borderRadius: 7, border: '1.5px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer', outline: 'none' }}>
                      <option value="Submitted">Submitted</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Tips Panel */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Hostel Management Tips</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {QUICK_TIPS.map((t, i) => (
              <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: i % 2 === 0 ? '#ECFDF5' : '#F9FAFB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, color: EM }}>
                  {t.icon}
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{t.label}</p>
                </div>
                <p style={{ fontSize: 11.5, color: '#6B7280', lineHeight: 1.5 }}>{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default HostelDeanDashboard;
