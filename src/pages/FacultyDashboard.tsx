import { useEffect, useState, useCallback } from 'react';
import {
  ClipboardList, CheckCircle, Clock, TrendingUp, Shield, AlertTriangle,
  Brain, ChevronDown, Filter, RefreshCw, ShieldCheck, Zap, BarChart2
} from 'lucide-react';
import api from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Stitch Emerald Sentinel Design Tokens
// ─────────────────────────────────────────────────────────────────────────────
const DS = {
  bg:           '#F9FAFB',   // Page background
  surface:      '#FFFFFF',   // Card surface (lowest)
  surfaceLow:   '#F1F4F6',   // Secondary grouping
  surfaceHigh:  '#E2E9EC',   // Deeply recessed
  charcoal:     '#111827',   // Sidebar + dark text
  emerald:      '#10B981',   // Primary accent
  emeraldDark:  '#065F46',   // Emerald on text
  emeraldLight: '#ECFDF5',   // Emerald tinted bg
  emeraldBorder:'#A7F3D0',   // Emerald border tint
  text:         '#2B3437',   // Body text
  textMuted:    '#586064',   // Secondary text
  textFaint:    '#9CA3AF',   // Placeholder
  amber:        '#D97706',
  amberLight:   '#FFFBEB',
  blue:         '#1D4ED8',
  blueLight:    '#EFF6FF',
  red:          '#B91C1C',
  redLight:     '#FEF2F2',
  purple:       '#7C3AED',
  purpleLight:  '#F5F3FF',
  green:        '#059669',
  greenLight:   '#ECFDF5',
  shadow:       '0 2px 12px rgba(17,24,39,0.05)', // Ambient light layering
  shadowHover:  '0 4px 20px rgba(17,24,39,0.09)',
  radius:       '14px',
  radiusSm:     '8px',
};

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
const Badge = ({ bg, color, children, dot }: any) => (
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
const KpiCard = ({ icon, label, value, color, bg }: any) => (
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
const FacultyDashboard = () => {
  const [view,          setView]          = useState<'dashboard' | 'complaints' | 'analytics'>('dashboard');
  const [complaints,    setComplaints]    = useState<FacultyGrievance[]>([]);
  const [analytics,     setAnalytics]     = useState<FacultyAnalytics | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [filterPriority,setFilterPriority] = useState('');
  const [filterStatus,  setFilterStatus]  = useState('');
  const [sort,          setSort]          = useState('latest');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterPriority) params.set('priority', filterPriority);
      if (filterStatus)   params.set('status',   filterStatus);
      params.set('sort', sort);
      const [gRes, aRes] = await Promise.all([
        api.get(`/faculty/grievances?${params}`),
        api.get('/faculty/analytics'),
      ]);
      setComplaints(gRes.data);
      setAnalytics(aRes.data);
    } catch {
      setComplaints(MOCK_COMPLAINTS);
      setAnalytics(MOCK_ANALYTICS);
    } finally { setLoading(false); }
  }, [filterPriority, filterStatus, sort]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async (id: number, status: string, note: string, escalate: boolean) => {
    try {
      await api.put(`/faculty/update-status/${id}`, { newStatus: status, resolutionNote: note, recommendEscalation: escalate });
    } catch { /**/ }
    setComplaints(p => p.map(c => c.id === id ? { ...c, status, resolutionNote: note, isEscalated: escalate || c.isEscalated } : c));
  };

  const an = analytics ?? MOCK_ANALYTICS;

  const kpis = [
    { icon: <ClipboardList size={18}/>, label: 'Total Assigned',       value: an.totalAssigned,       color: DS.emerald, bg: DS.emeraldLight },
    { icon: <Clock size={18}/>,         label: 'Pending Action',        value: an.pending,             color: DS.amber,   bg: DS.amberLight   },
    { icon: <TrendingUp size={18}/>,    label: 'In Progress',           value: an.inProgress,          color: DS.blue,    bg: DS.blueLight    },
    { icon: <CheckCircle size={18}/>,   label: 'Resolved Cases',        value: an.resolved,            color: DS.green,   bg: DS.greenLight   },
    { icon: <AlertTriangle size={18}/>, label: 'Escalated',             value: an.escalated,           color: DS.red,     bg: DS.redLight     },
    { icon: <Zap size={18}/>,           label: 'Avg Resolution (hrs)',  value: an.avgResolutionHours,  color: DS.purple,  bg: DS.purpleLight  },
  ];

  // ── Filter pill helper ────────────────────────────────────────────────────
  const PillBtn = ({ label, active, onClick }: any) => (
    <button onClick={onClick}
      style={{
        padding: '5px 14px', borderRadius: 99, border: 'none', fontSize: 12, fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.15s',
        background: active ? DS.charcoal : DS.surfaceLow,
        color: active ? '#FFFFFF' : DS.textMuted,
      }}>
      {label}
    </button>
  );

  // ── DASHBOARD VIEW ────────────────────────────────────────────────────────
  const DashboardView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>

      {/* AI System Insights — Stitch AI component: left 2px emerald border */}
      <div style={{ background: DS.surface, borderRadius: DS.radius, boxShadow: DS.shadow, padding: '22px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <Brain size={15} style={{ color: DS.emerald }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: DS.charcoal, letterSpacing: '-0.01em' }}>AI System Insights</p>
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: DS.emeraldLight, color: DS.emeraldDark, letterSpacing: '0.05em' }}>AI-POWERED</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {an.aiInsights.map((ins, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '11px 16px', borderRadius: DS.radiusSm, background: i === 0 ? DS.emeraldLight : DS.surfaceLow, alignItems: 'flex-start' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: DS.emerald, marginTop: 6, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: DS.text, lineHeight: 1.55 }}>{ins}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div style={{ background: DS.surface, borderRadius: DS.radius, boxShadow: DS.shadow, padding: '22px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <BarChart2 size={15} style={{ color: DS.textMuted }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: DS.charcoal, letterSpacing: '-0.01em' }}>Complaint Category Breakdown</p>
        </div>
        {an.categoryBreakdown.map((cat, i) => {
          const pct = an.totalAssigned > 0 ? Math.round((cat.count / an.totalAssigned) * 100) : 0;
          return (
            <div key={i} style={{ marginBottom: i < an.categoryBreakdown.length - 1 ? 16 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, color: DS.text, fontWeight: 500 }}>{cat.category}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: DS.charcoal }}>{cat.count} ({pct}%)</span>
              </div>
              <div style={{ height: 6, background: DS.surfaceLow, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: DS.emerald, borderRadius: 99, transition: 'width 0.7s ease' }} />
              </div>
            </div>
          );
        })}

        {/* Action Required notice */}
        {an.escalated > 0 && (
          <div style={{ marginTop: 18, padding: '12px 16px', borderRadius: DS.radiusSm, background: DS.redLight, borderLeft: `3px solid ${DS.red}` }}>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: DS.red }}>
              Action Required — {an.escalated} pending high-priority escalation{an.escalated !== 1 ? 's' : ''} waiting for faculty approval.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // ── COMPLAINTS VIEW ───────────────────────────────────────────────────────
  const ComplaintsView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Privacy banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: DS.radius, background: DS.emeraldLight, borderLeft: `3px solid ${DS.emerald}` }}>
        <ShieldCheck size={14} style={{ color: DS.emerald, flexShrink: 0 }} />
        <p style={{ fontSize: 12.5, color: DS.emeraldDark, fontWeight: 500 }}>
          <strong>Privacy Enforcement Active:</strong> Student identities are masked at the backend. Only Anonymous IDs are visible.
        </p>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: DS.emeraldDark, letterSpacing: '0.05em', flexShrink: 0 }}>IDENTITY PROTECTED</span>
      </div>

      {/* Filter bar — white card, no border per Stitch "no-line rule" */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: '14px 18px', background: DS.surface, borderRadius: DS.radius, boxShadow: DS.shadow }}>
        <Filter size={13} style={{ color: DS.textFaint }} />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: DS.text, marginRight: 4 }}>Filters:</span>
        {['All','High','Medium','Low'].map(p => (
          <PillBtn key={p} label={p} active={filterPriority === (p === 'All' ? '' : p)} onClick={() => setFilterPriority(p === 'All' ? '' : p)} />
        ))}
        <div style={{ width: 1, height: 18, background: DS.surfaceHigh }} />
        {[['All',''],['Submitted','Submitted'],['InProgress','In Progress'],['Resolved','Resolved'],['Escalated','Escalated']].map(([val, label]) => (
          <PillBtn key={val} label={label || 'All'} active={filterStatus === val && !(val === 'All')} onClick={() => setFilterStatus(val === 'All' ? '' : val)} />
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: DS.radiusSm, border: `1px solid rgba(171,179,183,0.25)`, fontSize: 12, color: DS.text, background: DS.surface, outline: 'none', cursor: 'pointer' }}>
            <option value="latest">Latest First</option>
            <option value="priority">High Priority First</option>
          </select>
        </div>
      </div>

      {/* Count */}
      <p style={{ fontSize: 12, color: DS.textFaint, padding: '0 4px' }}>{complaints.length} complaint{complaints.length !== 1 ? 's' : ''} found</p>

      {/* Complaint Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, background: DS.surface, borderRadius: DS.radius }}>
          <RefreshCw size={24} style={{ margin: '0 auto 12px', color: DS.emerald, animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 13, color: DS.textMuted }}>Loading complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div style={{ background: DS.surface, borderRadius: DS.radius, boxShadow: DS.shadow, padding: '56px 24px', textAlign: 'center' }}>
          <ShieldCheck size={28} style={{ margin: '0 auto 10px', color: DS.emerald }} />
          <p style={{ fontWeight: 600, color: DS.text, marginBottom: 4 }}>Queue Clear</p>
          <p style={{ fontSize: 12.5, color: DS.textMuted }}>No complaints match current filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {complaints.map(c => <ComplaintCard key={c.id} complaint={c} onUpdate={handleUpdate} />)}
        </div>
      )}
    </div>
  );

  // ── TAB HEADER ────────────────────────────────────────────────────────────
  const tabs = [
    { key: 'dashboard',  label: 'Dashboard',  icon: <TrendingUp size={14}/> },
    { key: 'complaints', label: 'Assigned Complaints', icon: <ClipboardList size={14}/> },
    { key: 'analytics',  label: 'Analytics',  icon: <BarChart2 size={14}/> },
  ] as const;

  return (
    <div style={{ padding: '32px 36px', minHeight: '100vh', background: DS.bg, fontFamily: "'Inter', sans-serif" }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: DS.emerald, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>Faculty Portal</p>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: DS.charcoal, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Decision Support Interface</h1>
          <p style={{ fontSize: 15, color: DS.textMuted, marginTop: 8 }}>Privacy-preserving grievance management with AI-assisted analysis.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 99, background: DS.emeraldLight }}>
            <Shield size={12} style={{ color: DS.emerald }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: DS.emeraldDark, letterSpacing: '0.05em' }}>IDENTITY MASKED</span>
          </div>
          <button onClick={fetchData}
            style={{ padding: '7px 16px', borderRadius: DS.radiusSm, border: `1px solid rgba(171,179,183,0.25)`, background: DS.surface, color: DS.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: DS.shadow }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setView(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 20px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, transition: 'all 0.18s',
              background: view === t.key ? DS.charcoal : DS.surfaceLow,
              color:      view === t.key ? '#FFFFFF'   : DS.textMuted,
              boxShadow:  view === t.key ? '0 2px 8px rgba(17,24,39,0.15)' : 'none',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {view === 'dashboard'  && <DashboardView />}
      {view === 'complaints' && <ComplaintsView />}
      {view === 'analytics'  && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
          </div>
          <DashboardView />
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default FacultyDashboard;
