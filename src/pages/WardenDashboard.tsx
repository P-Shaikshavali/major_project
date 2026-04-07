import { useState, useEffect, useCallback } from 'react';
import {
  Shield, CheckCircle, Clock,
  ChevronDown, ChevronUp,
  User, Eye, EyeOff, TrendingUp, Zap, Home, RefreshCw, ArrowUpCircle,
  ClipboardList, Loader2, X
} from 'lucide-react';
import api from '../services/api';

// ── Design System: Warden "Iron Guard" Tokens ─────────────────────────────────
const DS = {
  bg:           '#0F1117',
  surface:      '#1A1D27',
  surfaceHigh:  '#21253A',
  surfaceLow:   '#13151F',
  border:       'rgba(255,255,255,0.06)',
  borderHover:  'rgba(255,255,255,0.14)',
  text:         '#F1F5F9',
  textMuted:    '#94A3B8',
  textFaint:    '#475569',
  emerald:      '#10B981',
  emeraldLight: 'rgba(16,185,129,0.12)',
  emeraldDark:  '#059669',
  amber:        '#F59E0B',
  amberLight:   'rgba(245,158,11,0.12)',
  red:          '#EF4444',
  redLight:     'rgba(239,68,68,0.12)',
  blue:         '#3B82F6',
  blueLight:    'rgba(59,130,246,0.12)',
  purple:       '#8B5CF6',
  purpleLight:  'rgba(139,92,246,0.12)',
  radius:       '16px',
  radiusLg:     '24px',
  shadow:       '0 4px 24px rgba(0,0,0,0.4)',
  shadowHover:  '0 8px 32px rgba(0,0,0,0.55)',
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface WardenGrievance {
  id: number;
  trackingId: string;
  anonymousId: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  createdAt: string;
  isEscalated: boolean;
  similarCount: number;
}

interface WardenAnalytics {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  mostFrequentIssue: string;
}

interface StudentDetails {
  name: string;
  email: string;
  department: string;
}

// ── Priority & Status Maps ────────────────────────────────────────────────────
const PRIORITY_MAP: Record<string, { color: string; bg: string; dot: string }> = {
  High:   { color: DS.red,     bg: DS.redLight,    dot: DS.red },
  Medium: { color: DS.amber,   bg: DS.amberLight,  dot: DS.amber },
  Low:    { color: DS.emerald, bg: DS.emeraldLight, dot: DS.emerald },
};
const STATUS_MAP: Record<string, { color: string; bg: string; label: string }> = {
  Submitted:  { color: DS.blue,    bg: DS.blueLight,    label: 'Submitted'   },
  InProgress: { color: DS.amber,   bg: DS.amberLight,   label: 'In Progress' },
  Resolved:   { color: DS.emerald, bg: DS.emeraldLight, label: 'Resolved'    },
  Escalated:  { color: DS.red,     bg: DS.redLight,     label: 'Escalated'   },
};

// ── KPI Card Component ────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, color, bg }: {
  icon: React.ReactNode; label: string; value: number | string; color: string; bg: string;
}) => (
  <div style={{
    background: DS.surface, borderRadius: DS.radius, padding: '20px 24px',
    border: `1px solid ${DS.border}`, display: 'flex', alignItems: 'center', gap: 16,
  }}>
    <div style={{ width: 48, height: 48, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 28, fontWeight: 800, color: DS.text, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</p>
      <p style={{ fontSize: 12, color: DS.textMuted, marginTop: 4, fontWeight: 500 }}>{label}</p>
    </div>
  </div>
);

// ── Badge ─────────────────────────────────────────────────────────────────────
const Badge = ({ color, bg, children, dot }: { color: string; bg: string; children: React.ReactNode; dot?: string }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: dot ? 5 : 0,
    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: bg, color,
  }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />}
    {children}
  </span>
);

// ── Student Details Modal ─────────────────────────────────────────────────────
const StudentDetailModal = ({
  anonymousId, onClose
}: { anonymousId: string; onClose: () => void }) => {
  const [details, setDetails] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    api.get(`/warden/student-details/${anonymousId}`)
      .then(r => { setDetails(r.data); setLoading(false); })
      .catch(() => { setError('Access denied or identity not found.'); setLoading(false); });
  }, [anonymousId]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ background: DS.surface, borderRadius: DS.radiusLg, padding: '36px', width: 440, border: `1px solid ${DS.border}`, boxShadow: DS.shadowHover, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: DS.surfaceHigh, border: 'none', borderRadius: 8, cursor: 'pointer', padding: 6, color: DS.textMuted }}>
          <X size={16} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: DS.purpleLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: DS.purple }}>
            <User size={20} />
          </div>
          <div>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text }}>Student Identity</p>
            <p style={{ fontSize: 12, color: DS.textFaint, fontFamily: 'monospace' }}>{anonymousId}</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: DS.textMuted }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: DS.purple }} />
            <p style={{ marginTop: 12, fontSize: 13 }}>Decrypting identity securely...</p>
          </div>
        ) : error ? (
          <div style={{ background: DS.redLight, borderRadius: 12, padding: '14px 18px', color: DS.red, fontSize: 13, fontWeight: 600 }}>{error}</div>
        ) : details ? (
          <div>
            <div style={{ background: DS.amberLight, borderRadius: 12, padding: '12px 16px', marginBottom: 20, border: `1px solid ${DS.amber}20` }}>
              <p style={{ fontSize: 12, color: DS.amber, fontWeight: 700 }}>⚠️ This identity unlock has been recorded in the Audit Log for security purposes.</p>
            </div>
            {revealed ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[['Name', details.name], ['Email', details.email], ['Department', details.department]].map(([k, v]) => (
                  <div key={k} style={{ background: DS.surfaceLow, padding: '14px 18px', borderRadius: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: DS.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{k}</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: DS.text }}>{v}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: 13, color: DS.textMuted, marginBottom: 20 }}>Identity is encrypted. Click below to reveal.</p>
                <button
                  onClick={() => setRevealed(true)}
                  style={{ background: DS.purple, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto' }}
                >
                  <Eye size={16} /> Reveal Student Identity
                </button>
              </div>
            )}
          </div>
        ) : null}
        <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

// ── Complaint Card ─────────────────────────────────────────────────────────────
const ComplaintCard = ({
  complaint, onUpdateStatus
}: {
  complaint: WardenGrievance;
  onUpdateStatus: (id: number, status: string, note: string, escalate: boolean) => Promise<void>;
}) => {
  const [expanded, setExpanded]             = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selStatus, setSelStatus]           = useState(complaint.status);
  const [note, setNote]                     = useState('');
  const [escalate, setEscalate]             = useState(false);
  const [saving, setSaving]                 = useState(false);

  const priority = PRIORITY_MAP[complaint.priority] ?? PRIORITY_MAP.Low;
  const status   = STATUS_MAP[complaint.status]   ?? STATUS_MAP.Submitted;
  // eslint-disable-next-line react-hooks/purity
  const daysOld  = Math.floor((Date.now() - new Date(complaint.createdAt).getTime()) / 86400000);
  const isRepeat = complaint.similarCount > 2;

  const handleSave = async () => {
    setSaving(true);
    await onUpdateStatus(complaint.id, selStatus, note, escalate);
    setSaving(false);
    setExpanded(false);
  };

  return (
    <>
      {showStudentModal && <StudentDetailModal anonymousId={complaint.anonymousId} onClose={() => setShowStudentModal(false)} />}
      <div style={{
        background: DS.surface, borderRadius: DS.radius, border: `1px solid ${expanded ? DS.borderHover : DS.border}`,
        overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: expanded ? DS.shadowHover : DS.shadow,
      }}>
        {/* Card Header */}
        <div
          onClick={() => setExpanded(e => !e)}
          style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', cursor: 'pointer' }}
        >
          {/* Priority indicator */}
          <div style={{ width: 4, height: 48, borderRadius: 4, background: priority.dot, flexShrink: 0 }} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: DS.text, background: DS.surfaceLow, padding: '2px 8px', borderRadius: 6 }}>{complaint.trackingId}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: DS.textFaint }}>{complaint.anonymousId}</span>
              <Badge color={status.color} bg={status.bg}>{status.label}</Badge>
              <Badge color={priority.color} bg={priority.bg} dot={priority.dot}>{complaint.priority}</Badge>
              <Badge color={DS.textMuted} bg={DS.surfaceLow}>{complaint.category}</Badge>
              {isRepeat && (
                <Badge color={DS.amber} bg={DS.amberLight}>🔁 {complaint.similarCount}x repeated</Badge>
              )}
              {complaint.isEscalated && (
                <Badge color={DS.red} bg={DS.redLight}>🚨 Escalated</Badge>
              )}
            </div>
            <p style={{ fontSize: 13, color: DS.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{complaint.description}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: DS.textFaint }}>{daysOld}d ago</span>
            {expanded ? <ChevronUp size={16} color={DS.textFaint} /> : <ChevronDown size={16} color={DS.textFaint} />}
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div style={{ borderTop: `1px solid ${DS.border}`, padding: '24px 26px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Description full */}
            <div style={{ background: DS.surfaceLow, borderRadius: 12, padding: '16px 20px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: DS.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Full Description</p>
              <p style={{ fontSize: 14, color: DS.textMuted, lineHeight: 1.7 }}>{complaint.description}</p>
            </div>

            {/* AI Repeated Issue Detection */}
            {isRepeat && (
              <div style={{ background: DS.amberLight, borderRadius: 12, padding: '16px 20px', border: `1px solid ${DS.amber}25` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Zap size={14} color={DS.amber} />
                  <p style={{ fontSize: 12, fontWeight: 800, color: DS.amber, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Repeated Issue Detection</p>
                </div>
                <p style={{ fontSize: 13, color: DS.amber }}>
                  Similar <strong>{complaint.category}</strong> issues reported <strong>{complaint.similarCount} times</strong> in the last 30 days. This may indicate a systemic problem requiring priority attention.
                </p>
              </div>
            )}

            {/* Timestamps */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                ['Submitted', new Date(complaint.createdAt).toLocaleDateString()],
                ['Category', complaint.category],
                ['Age', `${daysOld} day(s)`],
              ].map(([k, v]) => (
                <div key={k} style={{ background: DS.surfaceLow, borderRadius: 10, padding: '12px 16px' }}>
                  <p style={{ fontSize: 11, color: DS.textFaint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{k}</p>
                  <p style={{ fontSize: 14, color: DS.text, fontWeight: 600 }}>{v}</p>
                </div>
              ))}
            </div>

            {/* Student Details Button */}
            <button
              onClick={() => setShowStudentModal(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: DS.purpleLight, color: DS.purple, border: `1px solid ${DS.purple}30`,
                borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                alignSelf: 'flex-start',
              }}
            >
              <Eye size={14} /> View Student Info (Controlled Access)
            </button>

            {/* Resolution Actions */}
            {complaint.status !== 'Resolved' && !complaint.isEscalated && (
              <div style={{ background: DS.surfaceLow, borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: DS.text }}>Resolution Actions</p>

                {/* Status Selector */}
                <div style={{ display: 'flex', gap: 10 }}>
                  {['InProgress', 'Resolved'].map(s => (
                    <button
                      key={s}
                      onClick={() => setSelStatus(s)}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        border: `2px solid ${selStatus === s ? (s === 'Resolved' ? DS.emerald : DS.amber) : DS.border}`,
                        background: selStatus === s ? (s === 'Resolved' ? DS.emeraldLight : DS.amberLight) : 'transparent',
                        color: selStatus === s ? (s === 'Resolved' ? DS.emerald : DS.amber) : DS.textMuted,
                      }}
                    >
                      {s === 'InProgress' ? '⏳ In Progress' : '✅ Mark Resolved'}
                    </button>
                  ))}
                </div>

                {/* Resolution Note */}
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add resolution note or action taken..."
                  rows={3}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10, border: `1px solid ${DS.border}`,
                    background: DS.surfaceHigh, color: DS.text, fontSize: 13, fontFamily: "'Inter', sans-serif",
                    resize: 'none', outline: 'none', boxSizing: 'border-box',
                  }}
                />

                {/* Escalate Option */}
                {(complaint.priority === 'High' || daysOld >= 2) && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={escalate}
                      onChange={e => setEscalate(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: DS.red }}
                    />
                    <span style={{ fontSize: 13, color: DS.red, fontWeight: 600 }}>
                      <ArrowUpCircle size={14} style={{ display: 'inline', marginRight: 4 }} />
                      Escalate to HOD/Dean (High Priority or Unresolved)
                    </span>
                  </label>
                )}

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: selStatus === 'Resolved' ? DS.emerald : DS.amber,
                    color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    alignSelf: 'flex-start', opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={16} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// ── Main Warden Dashboard ─────────────────────────────────────────────────────
const WardenDashboard = () => {
  const [complaints, setComplaints] = useState<WardenGrievance[]>([]);
  const [analytics,  setAnalytics]  = useState<WardenAnalytics | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState<'all' | 'pending' | 'resolved' | 'escalated'>('pending');
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, aRes] = await Promise.all([
        api.get('/warden/grievances'),
        api.get('/warden/analytics'),
      ]);
      setComplaints(Array.isArray(gRes.data) ? gRes.data : []);
      setAnalytics(aRes.data);
    } catch {
      setComplaints([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time refresh polling every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(Date.now());
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleUpdateStatus = async (id: number, status: string, note: string, escalate: boolean) => {
    try {
      await api.put(`/warden/update-status/${id}`, { newStatus: status, resolutionNote: note, escalate });
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: escalate ? 'Escalated' : status, isEscalated: escalate || c.isEscalated } : c));
    } catch { /**/ }
  };

  const filtered = complaints.filter(c => {
    if (activeTab === 'all')      return true;
    if (activeTab === 'pending')  return c.status === 'Submitted' || c.status === 'InProgress';
    if (activeTab === 'resolved') return c.status === 'Resolved';
    if (activeTab === 'escalated') return c.isEscalated || c.status === 'Escalated';
    return true;
  });

  const an = analytics ?? { totalComplaints: 0, pendingComplaints: 0, resolvedComplaints: 0, mostFrequentIssue: 'None' };

  const kpis = [
    { icon: <ClipboardList size={20} />, label: 'Total Assigned',    value: an.totalComplaints,   color: DS.blue,    bg: DS.blueLight    },
    { icon: <Clock size={20} />,         label: 'Pending',           value: an.pendingComplaints,  color: DS.amber,   bg: DS.amberLight   },
    { icon: <CheckCircle size={20} />,   label: 'Resolved',          value: an.resolvedComplaints, color: DS.emerald, bg: DS.emeraldLight },
    { icon: <TrendingUp size={20} />,    label: 'Top Issue',         value: an.mostFrequentIssue,  color: DS.purple,  bg: DS.purpleLight  },
  ];

  const tabs: { key: typeof activeTab; label: string; count: number }[] = [
    { key: 'pending',   label: 'Pending',   count: complaints.filter(c => c.status === 'Submitted' || c.status === 'InProgress').length },
    { key: 'escalated', label: 'Escalated', count: complaints.filter(c => c.isEscalated || c.status === 'Escalated').length },
    { key: 'resolved',  label: 'Resolved',  count: complaints.filter(c => c.status === 'Resolved').length },
    { key: 'all',       label: 'All',       count: complaints.length },
  ];

  return (
    <div style={{ padding: '36px 48px', minHeight: '100vh', background: DS.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${DS.surfaceHigh}; border-radius: 4px; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: DS.emeraldLight, padding: '4px 12px', borderRadius: 20, marginBottom: 12, border: `1px solid ${DS.emerald}25` }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: DS.emerald }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: DS.emerald, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Warden Control Centre</span>
          </div>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: DS.text, letterSpacing: '-0.02em', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Shield size={28} color={DS.emerald} />
            Warden Dashboard
          </h1>
          <p style={{ fontSize: 15, color: DS.textMuted, marginTop: 8 }}>
            Manage hostel grievances, resolve complaints, and control student identity access.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <button
            onClick={fetchData}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: DS.surface, border: `1px solid ${DS.border}`, borderRadius: 10, padding: '8px 16px', color: DS.textMuted, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <span style={{ fontSize: 11, color: DS.textFaint }}>Last: {new Date(lastRefresh).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* ── KPI Analytics Header ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* ── Tab Nav ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 18px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s',
              background: activeTab === t.key ? DS.emerald : DS.surface,
              color: activeTab === t.key ? '#fff' : DS.textMuted,
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                marginLeft: 8, background: activeTab === t.key ? 'rgba(255,255,255,0.25)' : DS.surfaceHigh,
                padding: '1px 8px', borderRadius: 99, fontSize: 11,
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Complaint List ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: DS.textMuted }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: DS.emerald, margin: '0 auto 16px' }} />
          <p>Loading assigned grievances...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: DS.textFaint }}>
          <Home size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: DS.textMuted }}>No complaints in this category</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>All clear! Or try the "All" tab to see everything.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(c => (
            <ComplaintCard key={c.id} complaint={c} onUpdateStatus={handleUpdateStatus} />
          ))}
        </div>
      )}

      {/* Floating role indicator */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, background: DS.surface, border: `1px solid ${DS.border}`,
        borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: DS.shadow, zIndex: 100,
      }}>
        <EyeOff size={14} color={DS.emerald} />
        <span style={{ fontSize: 12, fontWeight: 700, color: DS.textMuted }}>Identity Masking Active</span>
      </div>
    </div>
  );
};

export default WardenDashboard;
