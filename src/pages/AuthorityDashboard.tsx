import { useState, useEffect } from 'react';
import { ShieldOff, Fingerprint, Calendar, Edit, Loader2 } from 'lucide-react';
import api from '../services/api';

const STATUS_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  Submitted:  { bg: 'var(--blue-light)',   color: 'var(--blue)',   dot: 'var(--blue)' },
  InProgress: { bg: 'var(--amber-light)',  color: 'var(--amber)',  dot: 'var(--amber)' },
  Escalated:  { bg: 'var(--red-light)',    color: 'var(--red)',    dot: 'var(--red)' },
  Resolved:   { bg: 'var(--green-light)',  color: 'var(--green)',  dot: 'var(--green)' },
};

const AuthorityDashboard = () => {
  const [filter, setFilter] = useState('Pending');
  const [stats, setStats] = useState({ newItems: 0, escalated: 0, resolved: 0 });
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = () => {
    setIsLoading(true);
    api.get('/dashboard/authority')
      .then(res => {
        setStats({ newItems: res.data.newItems ?? 0, escalated: res.data.escalated ?? 0, resolved: res.data.resolved ?? 0 });
        setQueue(res.data.queue ?? []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const updateStatus = async (id: number, trackingId: string, currentStatus: string) => {
    const newStatus = prompt(`Update status for ${trackingId}:`, currentStatus);
    if (!newStatus || newStatus === currentStatus) return;
    try {
      await api.put(`/grievance/update-status/${id}`, { status: newStatus });
      fetchDashboard();
    } catch { alert('Failed to update.'); }
  };

  const FILTERS = ['All', 'Pending', 'Escalated', 'Resolved'];
  const filtered = filter === 'All' ? queue : queue.filter(c => {
    if (filter === 'Pending') return c.status === 'Submitted' || c.status === 'InProgress';
    if (filter === 'Escalated') return c.isEscalated || c.status === 'Escalated';
    if (filter === 'Resolved') return c.status === 'Resolved';
    return true;
  });

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Authority Queue</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Complaint Management</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Review and update complaint statuses.</p>
        </div>

        {/* Stats Chips */}
        <div className="hidden md:flex items-center gap-3">
          {[
            { label: 'New', value: stats.newItems, color: 'var(--blue)', bg: 'var(--blue-light)' },
            { label: 'Escalated', value: stats.escalated, color: 'var(--red)', bg: 'var(--red-light)' },
            { label: 'Resolved', value: stats.resolved, color: 'var(--green)', bg: 'var(--green-light)' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99, background: s.bg }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Anonymity Notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 8, background: 'var(--blue-light)', border: '1px solid var(--blue-mid)', marginBottom: 20 }}>
        <ShieldOff size={16} style={{ color: 'var(--blue)', flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 500 }}>
          <strong>Privacy Notice:</strong> Student identities are protected by the system. You are viewing anonymized complaint data.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {FILTERS.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '6px 16px', borderRadius: 99, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: filter === tab ? 'var(--blue)' : 'var(--surface)',
              color: filter === tab ? '#fff' : 'var(--text-muted)',
              boxShadow: filter === tab ? '0 2px 8px rgba(37,99,235,0.25)' : 'var(--shadow-sm)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--blue)', marginBottom: 12 }} />
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading queue...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green-light)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>✓</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Queue Clear</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>No {filter.toLowerCase()} items requiring action.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => {
            const st = STATUS_STYLES[item.status] || STATUS_STYLES.Submitted;
            return (
              <div
                key={item.id}
                className="card-hover"
                style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 4, background: 'var(--blue-light)', color: 'var(--blue)' }}>
                    {item.category}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: st.bg, color: st.color }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot }} />
                    {item.status}
                  </span>
                </div>

                {/* Description */}
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.45, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.description}
                </p>

                {/* Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
                  <div className="flex items-center gap-2" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    <Fingerprint size={13} style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: 'monospace' }}>{item.trackingId}</span>
                  </div>

                  {/* Anonymity display */}
                  {item.user ? (
                    <div className="flex items-center gap-2" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      <ShieldOff size={13} style={{ flexShrink: 0 }} />
                      <span>Identity visible (Admin override)</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: 'var(--green-light)', color: 'var(--green)' }}>
                        🛡 Identity Protected by System
                      </span>
                    </div>
                  )}
                  {item.anonymousId && (
                    <div className="flex items-center gap-2" style={{ fontSize: 12, color: 'var(--text-faint)', fontFamily: 'monospace' }}>
                      Anonymous ID: {item.anonymousId}
                    </div>
                  )}

                  <div className="flex items-center gap-2" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    <Calendar size={13} style={{ flexShrink: 0 }} />
                    <span>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => updateStatus(item.id, item.trackingId, item.status)}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-semibold text-white transition-all"
                  style={{ background: 'var(--blue)', marginTop: 'auto', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--blue)'}
                >
                  <Edit size={13} /> Update Status
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AuthorityDashboard;
