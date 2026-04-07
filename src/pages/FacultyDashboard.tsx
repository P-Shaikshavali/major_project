import { useEffect, useState } from 'react';
import { 
  FileText, CheckCircle, Clock, 
  ShieldCheck, RefreshCw, Send 
} from 'lucide-react';
import api from '../services/api';

// ── Stitch "Slate Professional" Design Tokens ────────────────────────────────
const DS = {
  bg:          '#F1F5F9',
  surface:     '#FFFFFF',
  surfaceLow:  '#F8FAFC',
  slate:       '#475569',
  slateDark:   '#1E293B',
  slateLight:  '#F1F5F9',
  blue:        '#2563EB',
  blueLight:   '#EFF6FF',
  emerald:     '#059669',
  emeraldLight:'#ECFDF5',
  amber:       '#D97706',
  amberLight:  '#FFFBEB',
  red:         '#DC2626',
  redLight:    '#FEF2F2',
  shadow:      '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  radius:      '12px',
};

<<<<<<< HEAD
const Badge = ({ bg, color, label }: any) => (
  <span style={{ padding: '4px 10px', borderRadius: '6px', background: bg, color: color, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
    {label}
  </span>
);

=======
// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface FacultyGrievance {
  id: number;
  trackingId: string;
  anonymousId: string;
  category: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: string;
  assignedTo: string;
  createdAt: string;
  resolvedAt?: string;
  isEscalated: boolean;
  credibilityScore: number;
  similarCount: number;
  aiRecommendation: string;
  suggestEscalation: boolean;
  escalationReason: string;
  resolutionNote: string;
}

interface FacultyAnalytics {
  totalAssigned: number;
  pending: number;
  inProgress: number;
  resolved: number;
  escalated: number;
  avgResolutionHours: number;
  categoryBreakdown: { category: string; count: number }[];
  aiInsights: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data (fallback when API not running)
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_COMPLAINTS: FacultyGrievance[] = [
  {
    id: 1, trackingId: 'GRV-0001', anonymousId: 'ANON-4F2A9C', category: 'Academic',
    description: 'Marks not updated on portal after re-evaluation request submitted 3 weeks ago.',
    priority: 'High', status: 'Submitted', assignedTo: 'Faculty',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    isEscalated: true, credibilityScore: 78, similarCount: 6,
    aiRecommendation: '📊 Similar issues reported 6 times — systemic pattern detected. | 🔴 High urgency — immediate attention required.',
    suggestEscalation: true, escalationReason: 'High priority, unresolved for 4 days.', resolutionNote: '',
  },
  {
    id: 2, trackingId: 'GRV-0002', anonymousId: 'ANON-7B1D3E', category: 'Academic',
    description: 'Attendance marked absent for a class that was attended physically. Faculty confirmation pending.',
    priority: 'Medium', status: 'InProgress', assignedTo: 'Faculty',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    isEscalated: false, credibilityScore: 65, similarCount: 3,
    aiRecommendation: '⚠️ Matches 3 similar issues. | ✅ High credibility score — report likely genuine.',
    suggestEscalation: false, escalationReason: '', resolutionNote: '',
  },
  {
    id: 3, trackingId: 'GRV-0003', anonymousId: 'ANON-2C8F10', category: 'Hostel',
    description: 'WiFi connectivity extremely poor in Block D for the past 10 days.',
    priority: 'Medium', status: 'Submitted', assignedTo: 'Warden',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    isEscalated: false, credibilityScore: 82, similarCount: 9,
    aiRecommendation: '📊 Similar issues reported 9 times — systemic pattern detected in Block D infrastructure.',
    suggestEscalation: false, escalationReason: '', resolutionNote: '',
  },
  {
    id: 4, trackingId: 'GRV-0004', anonymousId: 'ANON-5E3C21', category: 'Safety',
    description: 'Security cameras not functioning near the main gate for the last week.',
    priority: 'High', status: 'Escalated', assignedTo: 'Faculty',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    isEscalated: true, credibilityScore: 91, similarCount: 2,
    aiRecommendation: '🔴 High urgency. | 🚨 Escalated — review required.',
    suggestEscalation: false, escalationReason: '', resolutionNote: 'Escalated to Dean office.',
  },
];

const MOCK_ANALYTICS: FacultyAnalytics = {
  totalAssigned: 24, pending: 9, inProgress: 6, resolved: 7, escalated: 2,
  avgResolutionHours: 18.4,
  categoryBreakdown: [
    { category: 'Academic', count: 11 },
    { category: 'Hostel',   count: 7  },
    { category: 'Safety',   count: 4  },
    { category: 'Admin',    count: 2  },
  ],
  aiInsights: [
    'High frequency of Academic complaints detected (11 cases).',
    'Urgent complaints increasing — 8 new grievances in the last 7 days.',
    'High backlog alert: 62% of complaints are unresolved.',
    'Repeated issue pattern observed — 2 complaint(s) escalated.',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Status / Priority tokens — Stitch Emerald Sentinel
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { bg: string; color: string; label: string }> = {
  Submitted:  { bg: DS.surfaceHigh, color: DS.textMuted,  label: 'Submitted'   },
  InProgress: { bg: DS.blueLight,   color: DS.blue,       label: 'In Progress' },
  Resolved:   { bg: DS.greenLight,  color: DS.green,      label: 'Resolved'    },
  Escalated:  { bg: DS.redLight,    color: DS.red,        label: 'Escalated'   },
};
const PRIORITY_MAP: Record<string, { bg: string; color: string; dot: string }> = {
  High:   { bg: DS.redLight,    color: DS.red,    dot: '#EF4444' },
  Medium: { bg: DS.amberLight,  color: DS.amber,  dot: '#F59E0B' },
  Low:    { bg: DS.greenLight,  color: DS.green,  dot: DS.emerald },
};

// ─────────────────────────────────────────────────────────────────────────────
// Pill badge
// ─────────────────────────────────────────────────────────────────────────────
interface BadgeProps { bg: string; color: string; children: React.ReactNode; dot?: string; }
const Badge = ({ bg, color, children, dot }: BadgeProps) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: dot ? 5 : 0,
    fontSize: 10.5, fontWeight: 700, padding: '3px 10px',
    borderRadius: 99, background: bg, color,
  }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />}
    {children}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// KPI Card — Stitch style: tonal depth + colored top strip
// ─────────────────────────────────────────────────────────────────────────────
interface KpiCardProps { icon: React.ReactNode; label: string; value: number | string; color: string; bg: string; }
const KpiCard = ({ icon, label, value, color, bg }: KpiCardProps) => (
  <div style={{
    background: DS.surface, borderRadius: DS.radius,
    boxShadow: DS.shadow, padding: '22px 24px',
    position: 'relative', overflow: 'hidden',
    transition: 'box-shadow 0.2s',
  }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = DS.shadowHover}
    onMouseLeave={e => e.currentTarget.style.boxShadow = DS.shadow}>
    {/* Top color strip — Stitch card accent */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${color},${color}40)` }} />
    <div style={{ width: 38, height: 38, borderRadius: DS.radiusSm, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
      {icon}
    </div>
    <p style={{ fontSize: 30, fontWeight: 800, color: DS.charcoal, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</p>
    <p style={{ fontSize: 11.5, color: DS.textMuted, marginTop: 6, fontWeight: 500 }}>{label}</p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Complaint Card — full Stitch Emerald Sentinel card
// ─────────────────────────────────────────────────────────────────────────────
interface ComplaintCardProps {
  complaint: FacultyGrievance;
  onUpdate: (id: number, status: string, note: string, escalate: boolean) => void;
}

const ComplaintCard = ({ complaint: c, onUpdate }: ComplaintCardProps) => {
  const [expanded,  setExpanded]  = useState(false);
  const [selStatus, setSelStatus] = useState(c.status);
  const [note,      setNote]      = useState(c.resolutionNote);
  const [escalate,  setEscalate]  = useState(false);
  const [saving,    setSaving]    = useState(false);

  const sc  = STATUS_MAP[c.status] ?? STATUS_MAP.Submitted;
  const pc  = PRIORITY_MAP[c.priority] ?? PRIORITY_MAP.Low;
  // eslint-disable-next-line react-hooks/purity
  const daysOld = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 86400000);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(c.id, selStatus, note, escalate);
    setSaving(false);
    setExpanded(false);
  };

  return (
    <div style={{
      background: DS.surface, borderRadius: DS.radius, boxShadow: DS.shadow,
      overflow: 'hidden', transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = DS.shadowHover}
      onMouseLeave={e => e.currentTarget.style.boxShadow = DS.shadow}>

      {/* Card body */}
      <div style={{ display: 'flex', gap: 16, padding: '18px 22px', alignItems: 'flex-start' }}>

        {/* Anon avatar — Stitch ghost circle */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: DS.surfaceLow, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <Shield size={18} style={{ color: DS.textFaint }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badge row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 700, color: DS.text, background: DS.surfaceLow, padding: '2px 8px', borderRadius: 6 }}>{c.trackingId}</span>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: DS.textFaint }}>{c.anonymousId}</span>
            <Badge bg={sc.bg} color={sc.color}>{sc.label}</Badge>
            <Badge bg={pc.bg} color={pc.color} dot={pc.dot}>{c.priority}</Badge>
            <Badge bg={DS.surfaceLow} color={DS.textMuted}>{c.category}</Badge>
            {c.isEscalated && <Badge bg={DS.redLight} color={DS.red}>🚨 ESCALATED</Badge>}
          </div>

          {/* Description — Stitch Body-MD */}
          <p style={{
            fontSize: 13, color: DS.text, lineHeight: 1.6,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            marginBottom: 10,
          }}>{c.description}</p>

          {/* Meta row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            {c.similarCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: DS.emerald, fontWeight: 600 }}>
                <Brain size={12} />
                Matches {c.similarCount} similar issue{c.similarCount !== 1 ? 's' : ''}
              </span>
            )}
            <span style={{ fontSize: 11.5, color: DS.textFaint }}>
              {daysOld === 0 ? 'Today' : daysOld === 1 ? 'Yesterday' : `${daysOld} days ago`}
            </span>
            <span style={{ fontSize: 11.5, color: DS.textFaint }}>
              Credibility: <strong style={{ color: c.credibilityScore >= 70 ? DS.emerald : c.credibilityScore < 40 ? DS.red : DS.amber }}>{c.credibilityScore}%</strong>
            </span>
          </div>
        </div>

        {/* Manage button */}
        <button onClick={() => setExpanded(!expanded)}
          style={{
            flexShrink: 0, padding: '7px 16px', borderRadius: DS.radiusSm, cursor: 'pointer',
            fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            border: `1.5px solid ${expanded ? DS.emerald : DS.surfaceHigh}`,
            background: expanded ? DS.emeraldLight : DS.surface,
            color: expanded ? DS.emeraldDark : DS.textMuted,
            transition: 'all 0.2s',
          }}>
          {expanded ? 'Close' : 'Manage'}
          <ChevronDown size={13} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
      </div>

      {/* ── Expanded Decision Support Panel — Stitch AI Component signature ── */}
      {expanded && (
        <div style={{ padding: '18px 22px', background: DS.surfaceLow, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* AI Recommendation — 2px left emerald border (Stitch AI component) */}
          <div style={{
            padding: '14px 18px', borderRadius: DS.radiusSm, background: DS.surface,
            borderLeft: `3px solid ${DS.emerald}`,
            boxShadow: DS.shadow,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <Brain size={14} style={{ color: DS.emerald }} />
              <p style={{ fontSize: 11, fontWeight: 700, color: DS.emeraldDark, letterSpacing: '0.06em', textTransform: 'uppercase' }}>AI Decision Support</p>
            </div>
            <p style={{ fontSize: 12.5, color: DS.text, lineHeight: 1.65 }}>{c.aiRecommendation}</p>
          </div>

          {/* Escalation warning */}
          {c.suggestEscalation && (
            <div style={{ padding: '12px 16px', borderRadius: DS.radiusSm, background: '#FFFBEB', borderLeft: '3px solid #F59E0B', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertTriangle size={14} style={{ color: '#B45309', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 2 }}>May require escalation to higher authority</p>
                <p style={{ fontSize: 11.5, color: '#78350F' }}>{c.escalationReason}</p>
              </div>
            </div>
          )}

          {/* Identity protection notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: DS.radiusSm, background: DS.surface }}>
            <ShieldCheck size={12} style={{ color: DS.emerald }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: DS.textMuted }}>Student Identity Protected by System — Only Anonymous ID visible to Faculty.</p>
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: DS.text, marginBottom: 6 }}>Update Status</label>
              <select value={selStatus} onChange={e => setSelStatus(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: DS.radiusSm,
                  border: `1px solid rgba(171,179,183,0.25)`, /* Ghost border — Stitch */
                  fontSize: 13, background: DS.surface, color: DS.text, outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}>
                <option value="Submitted">Submitted</option>
                <option value="InProgress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', paddingTop: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={escalate} onChange={e => setEscalate(e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: DS.emerald }} />
                <span style={{ fontSize: 12.5, color: DS.text, fontWeight: 500 }}>Recommend Escalation</span>
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: DS.text, marginBottom: 6 }}>
              Resolution Note <span style={{ color: DS.textFaint, fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="Add context or resolution steps taken..."
              style={{
                width: '100%', padding: '10px 14px', borderRadius: DS.radiusSm,
                border: `1px solid rgba(171,179,183,0.25)`,
                fontSize: 12.5, resize: 'vertical', fontFamily: 'inherit',
                outline: 'none', color: DS.text, background: DS.surface,
              }} />
          </div>

          <button onClick={handleSave} disabled={saving}
            style={{
              alignSelf: 'flex-start', padding: '9px 22px', borderRadius: DS.radiusSm, border: 'none',
              background: DS.emerald, color: '#E1FFEC', fontSize: 13, fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
              display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#059669'; }}
            onMouseLeave={e => { e.currentTarget.style.background = DS.emerald; }}>
            {saving
              ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
              : <><CheckCircle size={13} /> Save Decision</>}
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Faculty Dashboard Page
// ─────────────────────────────────────────────────────────────────────────────
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
const FacultyDashboard = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Corrected endpoint from /api/FacultyGrievance/my-queue to /faculty/grievances
      const res = await api.get('/faculty/grievances');
      setComplaints(res.data || []);
      setStats({
        total: res.data.length,
        pending: res.data.filter((c: any) => c.status !== 'Resolved').length,
        resolved: res.data.filter((c: any) => c.status === 'Resolved').length
      });
    } catch (err) {
      console.error("Faculty Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: number) => {
    if (!resolution.trim()) return alert("Please provide resolution details.");
    try {
      // Corrected endpoint to /faculty/update-status
      await api.put(`/faculty/update-status/${id}`, { newStatus: 'Resolved', response: resolution });
      setResolution('');
      setSelectedId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

<<<<<<< HEAD
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: DS.bg }}>
      <RefreshCw size={40} className="spin" color={DS.blue} />
    </div>
=======
  const kpis = [
    { icon: <ClipboardList size={18}/>, label: 'Total Assigned',       value: an.totalAssigned,       color: DS.emerald, bg: DS.emeraldLight },
    { icon: <Clock size={18}/>,         label: 'Pending Action',        value: an.pending,             color: DS.amber,   bg: DS.amberLight   },
    { icon: <TrendingUp size={18}/>,    label: 'In Progress',           value: an.inProgress,          color: DS.blue,    bg: DS.blueLight    },
    { icon: <CheckCircle size={18}/>,   label: 'Resolved Cases',        value: an.resolved,            color: DS.green,   bg: DS.greenLight   },
    { icon: <AlertTriangle size={18}/>, label: 'Escalated',             value: an.escalated,           color: DS.red,     bg: DS.redLight     },
    { icon: <Zap size={18}/>,           label: 'Avg Resolution (hrs)',  value: an.avgResolutionHours,  color: DS.purple,  bg: DS.purpleLight  },
  ];

  // ── Filter pill helper ────────────────────────────────────────────────────
  const PillBtn = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button onClick={onClick}
      style={{
        padding: '5px 14px', borderRadius: 99, border: 'none', fontSize: 12, fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.15s',
        background: active ? DS.charcoal : DS.surfaceLow,
        color: active ? '#FFFFFF' : DS.textMuted,
      }}>
      {label}
    </button>
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
  );

  return (
    <div style={{ flex: 1, padding: '40px 48px', minHeight: '100vh', background: 'transparent' }}>
      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: DS.slateDark, margin: 0 }}>Faculty Resolver Portal</h1>
        <p style={{ color: DS.slate, marginTop: 4 }}>Manage and resolve academic grievances assigned to you.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Assigned To Me', value: stats.total, icon: <FileText size={20}/>, c: DS.blue },
          { label: 'Awaiting Action', value: stats.pending, icon: <Clock size={20}/>, c: DS.amber },
          { label: 'Resolved Success', value: stats.resolved, icon: <CheckCircle size={20}/>, c: DS.emerald }
        ].map((s, i) => (
          <div key={i} style={{ background: DS.surface, padding: 24, borderRadius: DS.radius, boxShadow: DS.shadow, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ color: s.c }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 12, color: DS.slate, fontWeight: 600, margin: 0 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedId ? '1fr 400px' : '1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {complaints.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', background: DS.surface, borderRadius: DS.radius }}>
              <ShieldCheck size={48} color={DS.emerald} style={{ marginBottom: 16, opacity: 0.5 }} />
              <p style={{ fontWeight: 600, color: DS.slate }}>No active grievances in your queue.</p>
            </div>
          ) : complaints.map((c: any) => (
            <div key={c.id} onClick={() => setSelectedId(c.id)}
              style={{ 
                background: DS.surface, padding: 24, borderRadius: DS.radius, boxShadow: DS.shadow, cursor: 'pointer',
                borderLeft: selectedId === c.id ? `4px solid ${DS.blue}` : 'none',
                opacity: c.status === 'Resolved' ? 0.7 : 1
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>{c.trackingId}</span>
                <Badge bg={c.priority === 'High' ? DS.redLight : DS.blueLight} color={c.priority === 'High' ? DS.red : DS.blue} label={c.priority} />
              </div>
              <p style={{ fontSize: 14, color: DS.slateDark, margin: '0 0 16px' }}>{c.description}</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Badge bg={DS.surfaceLow} color={DS.slate} label={c.status} />
                <span style={{ fontSize: 12, color: DS.slate, fontWeight: 500 }}>{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Panel */}
        {selectedId && (
          <div style={{ background: DS.surface, padding: 24, borderRadius: DS.radius, boxShadow: DS.shadow, position: 'sticky', top: 24, height: 'fit-content' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Resolve Grievance</h3>
            {complaints.find(c => c.id === selectedId)?.status === 'Resolved' ? (
              <div style={{ background: DS.emeraldLight, padding: 16, borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 13, color: DS.emerald, fontWeight: 600 }}>This issue has been resolved.</p>
              </div>
            ) : (
              <>
                <textarea 
                  placeholder="Describe the resolution or actions taken..."
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                  style={{ width: '100%', height: 150, padding: 12, borderRadius: 8, border: `1px solid ${DS.bg}`, marginBottom: 16, resize: 'none', fontSize: 13 }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => handleResolve(selectedId)}
                    style={{ flex: 1, background: DS.blue, color: '#fff', border: 'none', padding: '10px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Send size={16} /> Mark Resolved
                  </button>
                  <button onClick={() => setSelectedId(null)}
                    style={{ background: DS.surfaceLow, color: DS.slate, border: 'none', padding: '10px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
