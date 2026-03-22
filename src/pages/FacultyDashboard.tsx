import { useEffect, useState, useCallback } from 'react';
import {
  ClipboardList, CheckCircle, Clock, TrendingUp, Shield, AlertTriangle,
  Brain, ChevronDown, Filter, RefreshCw, ShieldCheck, Zap
} from 'lucide-react';
import api from '../services/api';

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
// Constants & helpers
// ─────────────────────────────────────────────────────────────────────────────
const EM = '#10B981';

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  Submitted:  { bg: '#F3F4F6', text: '#374151', label: 'Submitted'  },
  InProgress: { bg: '#EFF6FF', text: '#1D4ED8', label: 'In Progress'},
  Resolved:   { bg: '#ECFDF5', text: '#065F46', label: 'Resolved'   },
  Escalated:  { bg: '#FEF2F2', text: '#B91C1C', label: 'Escalated'  },
};

const PRIORITY_MAP: Record<string, { bg: string; text: string; dot: string }> = {
  High:   { bg: '#FEF2F2', text: '#DC2626', dot: '#EF4444' },
  Medium: { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B' },
  Low:    { bg: '#ECFDF5', text: '#059669', dot: EM         },
};

const MOCK_COMPLAINTS: FacultyGrievance[] = [
  {
    id: 1, trackingId: 'GRV-0001', anonymousId: 'ANON-4F2A9C',
    category: 'Academic', description: 'Marks not updated on portal after re-evaluation request submitted 3 weeks ago.',
    priority: 'High', status: 'Submitted', assignedTo: 'Faculty',
    createdAt: new Date(Date.now() - 4*86400000).toISOString(),
    isEscalated: false, credibilityScore: 78, similarCount: 6,
    aiRecommendation: '📊 Similar issues reported 6 times — systemic pattern detected. | 🔴 High urgency complaint — requires immediate attention.',
    suggestEscalation: true, escalationReason: 'High priority, unresolved for 4 days.',
    resolutionNote: '',
  },
  {
    id: 2, trackingId: 'GRV-0002', anonymousId: 'ANON-7B1D3E',
    category: 'Academic', description: 'Attendance marked absent for a class that was attended physically. Faculty confirmation pending.',
    priority: 'Medium', status: 'InProgress', assignedTo: 'Faculty',
    createdAt: new Date(Date.now() - 2*86400000).toISOString(),
    isEscalated: false, credibilityScore: 65, similarCount: 3,
    aiRecommendation: '⚠️ This complaint matches 3 similar open issues. | ✅ High credibility score — report is likely genuine.',
    suggestEscalation: false, escalationReason: '', resolutionNote: '',
  },
  {
    id: 3, trackingId: 'GRV-0003', anonymousId: 'ANON-2C8F10',
    category: 'Hostel', description: 'WiFi connectivity extremely poor in Block D for the past 10 days.',
    priority: 'Medium', status: 'Submitted', assignedTo: 'Warden',
    createdAt: new Date(Date.now() - 1*86400000).toISOString(),
    isEscalated: false, credibilityScore: 82, similarCount: 9,
    aiRecommendation: '📊 Similar issues reported 9 times — systemic pattern detected.',
    suggestEscalation: false, escalationReason: '', resolutionNote: '',
  },
  {
    id: 4, trackingId: 'GRV-0004', anonymousId: 'ANON-5E3C21',
    category: 'Safety', description: 'Security cameras not functioning near the main gate for the last week.',
    priority: 'High', status: 'Escalated', assignedTo: 'Faculty',
    createdAt: new Date(Date.now() - 7*86400000).toISOString(),
    isEscalated: true, credibilityScore: 91, similarCount: 2,
    aiRecommendation: '🔴 High urgency complaint. | 🚨 Complaint has been escalated — review required.',
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
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, color, bg }: any) => (
  <div className="card animate-up" style={{ padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${color},${color}55)` }}/>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{icon}</div>
    <p style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: 11.5, color: '#6B7280', marginTop: 5, fontWeight: 500 }}>{label}</p>
  </div>
);

interface ComplaintCardProps {
  complaint: FacultyGrievance;
  onUpdate: (id: number, status: string, note: string, escalate: boolean) => void;
}

const ComplaintCard = ({ complaint: c, onUpdate }: ComplaintCardProps) => {
  const [expanded,    setExpanded]    = useState(false);
  const [selStatus,   setSelStatus]   = useState(c.status);
  const [note,        setNote]        = useState(c.resolutionNote);
  const [escalate,    setEscalate]    = useState(false);
  const [saving,      setSaving]      = useState(false);

  const sc  = STATUS_MAP[c.status]   || STATUS_MAP.Submitted;
  const pc  = PRIORITY_MAP[c.priority] || PRIORITY_MAP.Low;
  const daysOld = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 86400000);

  const handleSave = async () => {
    if (selStatus === c.status && !note && !escalate) return;
    setSaving(true);
    await onUpdate(c.id, selStatus, note, escalate);
    setSaving(false);
    setExpanded(false);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden', transition: 'box-shadow 0.2s' }}
         onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.09)'}
         onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'}>

      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 20px', borderBottom: expanded ? '1px solid #F3F4F6' : 'none' }}>
        {/* Anon avatar */}
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Shield size={18} style={{ color: '#9CA3AF' }}/>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Row 1: IDs + badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 700, color: '#374151', background: '#F9FAFB', padding: '2px 8px', borderRadius: 6 }}>{c.trackingId}</span>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#9CA3AF' }}>{c.anonymousId}</span>
            {/* Status badge */}
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: sc.bg, color: sc.text }}>{sc.label}</span>
            {/* Priority badge */}
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: pc.bg, color: pc.text, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: pc.dot, flexShrink: 0 }}/>
              {c.priority}
            </span>
            {/* Category */}
            <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: '#F3F4F6', color: '#6B7280' }}>{c.category}</span>
            {/* Escalation badge */}
            {c.isEscalated && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertTriangle size={10}/> ESCALATED
              </span>
            )}
          </div>

          {/* Description */}
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {c.description}
          </p>

          {/* Row 3: meta */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 10 }}>
            {/* Similar count */}
            {c.similarCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Brain size={12} style={{ color: EM }}/>
                <span style={{ fontSize: 11.5, color: EM, fontWeight: 600 }}>
                  Matches {c.similarCount} similar issue{c.similarCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {/* Age */}
            <span style={{ fontSize: 11.5, color: '#9CA3AF' }}>
              {daysOld === 0 ? 'Today' : daysOld === 1 ? 'Yesterday' : `${daysOld} days ago`}
            </span>
            {/* Credibility */}
            <span style={{ fontSize: 11.5, color: '#9CA3AF' }}>Credibility: <b style={{ color: c.credibilityScore >= 70 ? EM : c.credibilityScore < 40 ? '#EF4444' : '#F59E0B' }}>{c.credibilityScore}%</b></span>
          </div>
        </div>

        {/* Action toggle */}
        <button onClick={() => setExpanded(!expanded)}
          style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 8, border: `1.5px solid ${expanded ? EM : '#E5E7EB'}`, background: expanded ? '#ECFDF5' : 'transparent', color: expanded ? EM : '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.18s' }}>
          {expanded ? 'Close' : 'Manage'} <ChevronDown size={13} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}/>
        </button>
      </div>

      {/* ── Expanded Decision Support Panel ── */}
      {expanded && (
        <div className="animate-in" style={{ padding: '18px 20px', background: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* AI Recommendation */}
          <div style={{ padding: '12px 16px', borderRadius: 12, background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <Brain size={14} style={{ color: EM }}/>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#065F46', letterSpacing: '0.03em', textTransform: 'uppercase' }}>AI Decision Support</p>
            </div>
            <p style={{ fontSize: 12.5, color: '#047857', lineHeight: 1.6 }}>{c.aiRecommendation}</p>
          </div>

          {/* Escalation warning */}
          {c.suggestEscalation && (
            <div style={{ padding: '11px 14px', borderRadius: 10, background: '#FEF9C3', border: '1px solid #FDE68A', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertTriangle size={14} style={{ color: '#B45309', flexShrink: 0, marginTop: 1 }}/>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 2 }}>May require escalation to higher authority</p>
                <p style={{ fontSize: 11.5, color: '#78350F' }}>{c.escalationReason}</p>
              </div>
            </div>
          )}

          {/* Identity protection notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderRadius: 9, background: '#F3F4F6' }}>
            <ShieldCheck size={12} style={{ color: EM }}/>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>Student Identity Protected by System — Only Anonymous ID is visible.</p>
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Update Status</label>
              <select value={selStatus} onChange={e => setSelStatus(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid #E5E7EB', fontSize: 13, background: '#fff', color: '#111827', outline: 'none', cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = EM}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}>
                <option value="Submitted">Submitted</option>
                <option value="InProgress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', marginTop: 24 }}>
                <input type="checkbox" checked={escalate} onChange={e => setEscalate(e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: EM }}/>
                <span style={{ fontSize: 12.5, color: '#374151', fontWeight: 500 }}>Recommend Escalation</span>
              </label>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Resolution Note <span style={{ color: '#9CA3AF' }}>(optional)</span></label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="Add context or resolution steps taken..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1.5px solid #E5E7EB', fontSize: 12.5, resize: 'vertical', fontFamily: 'inherit', outline: 'none', color: '#111827', background: '#fff' }}
              onFocus={e => e.target.style.borderColor = EM}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-em"
            style={{ alignSelf: 'flex-start', padding: '9px 20px', borderRadius: 9, fontSize: 13, opacity: saving ? 0.7 : 1 }}>
            {saving ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }}/> Saving...</> : <><CheckCircle size={13}/> Save Decision</>}
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
  const [view,       setView]       = useState<'dashboard' | 'complaints' | 'analytics'>('dashboard');
  const [complaints, setComplaints] = useState<FacultyGrievance[]>([]);
  const [analytics,  setAnalytics]  = useState<FacultyAnalytics | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterCategory, ] = useState('');
  const [sort,           setSort]           = useState('latest');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterPriority) params.set('priority', filterPriority);
      if (filterStatus)   params.set('status',   filterStatus);
      if (filterCategory) params.set('category', filterCategory);
      params.set('sort', sort);

      const [gRes, aRes] = await Promise.all([
        api.get(`/faculty/grievances?${params}`),
        api.get('/faculty/analytics'),
      ]);
      setComplaints(gRes.data);
      setAnalytics(aRes.data);
    } catch {
      // Use mock data when backend not running
      setComplaints(MOCK_COMPLAINTS);
      setAnalytics(MOCK_ANALYTICS);
    } finally {
      setLoading(false);
    }
  }, [filterPriority, filterStatus, filterCategory, sort]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async (id: number, status: string, note: string, escalate: boolean) => {
    try {
      await api.put(`/faculty/update-status/${id}`, { newStatus: status, resolutionNote: note, recommendEscalation: escalate });
    } catch { /* offline */ }
    setComplaints(p => p.map(c => c.id === id ? { ...c, status, resolutionNote: note, isEscalated: escalate || c.isEscalated } : c));
  };

  const an = analytics ?? MOCK_ANALYTICS;
  const kpis = [
    { icon: <ClipboardList size={18}/>, label: 'Total Assigned',      value: an.totalAssigned,  color: EM,       bg: '#ECFDF5' },
    { icon: <Clock size={18}/>,         label: 'Pending',             value: an.pending,         color: '#F59E0B', bg: '#FFFBEB' },
    { icon: <TrendingUp size={18}/>,    label: 'In Progress',         value: an.inProgress,      color: '#3B82F6', bg: '#EFF6FF' },
    { icon: <CheckCircle size={18}/>,   label: 'Resolved',            value: an.resolved,        color: '#059669', bg: '#ECFDF5' },
    { icon: <AlertTriangle size={18}/>, label: 'Escalated',           value: an.escalated,       color: '#EF4444', bg: '#FEF2F2' },
    { icon: <Zap size={18}/>,           label: 'Avg Resolution (hrs)',value: an.avgResolutionHours, color: '#8B5CF6', bg: '#F5F3FF' },
  ];

  // ── TAB: Dashboard Overview ──────────────────────────────────────
  const DashboardView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k}/>)}
      </div>

      {/* AI Insights */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Brain size={15} style={{ color: EM }}/>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>AI System Insights</p>
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#ECFDF5', color: EM, letterSpacing: '0.05em' }}>AI-POWERED</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {an.aiInsights.map((insight, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 10, background: i === 0 ? '#ECFDF5' : '#F9FAFB', alignItems: 'flex-start' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: EM, marginTop: 5, flexShrink: 0 }}/>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Complaint Category Breakdown</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {an.categoryBreakdown.map((cat, i) => {
            const pct = an.totalAssigned > 0 ? Math.round((cat.count / an.totalAssigned) * 100) : 0;
            return (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{cat.category}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{cat.count} ({pct}%)</span>
                </div>
                <div style={{ height: 6, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: EM, borderRadius: 99, transition: 'width 0.7s ease' }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── TAB: Complaints ───────────────────────────────────────────────
  const ComplaintsView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Privacy Notice */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderRadius: 12, background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
        <ShieldCheck size={14} style={{ color: EM, flexShrink: 0 }}/>
        <p style={{ fontSize: 12.5, color: '#065F46', fontWeight: 500 }}>
          <strong>Privacy Enforcement Active:</strong> Student identities are masked at the backend. Only Anonymous IDs are visible.
        </p>
        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: EM, letterSpacing: '0.05em', flexShrink: 0 }}>IDENTITY PROTECTED</span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: '14px 16px', background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <Filter size={13} style={{ color: '#6B7280' }}/>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', marginRight: 4 }}>Filters:</span>
        {(['All', 'High', 'Medium', 'Low'] as const).map(p => (
          <button key={p} onClick={() => setFilterPriority(p === 'All' ? '' : p)}
            style={{ padding: '5px 14px', borderRadius: 99, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                     background: filterPriority === (p === 'All' ? '' : p) ? '#111827' : '#F3F4F6',
                     color: filterPriority === (p === 'All' ? '' : p) ? '#fff' : '#6B7280' }}>
            {p}
          </button>
        ))}
        <div style={{ width: 1, height: 18, background: '#E5E7EB' }}/>
        {(['All', 'Submitted', 'InProgress', 'Resolved', 'Escalated'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s === 'All' ? '' : s)}
            style={{ padding: '5px 14px', borderRadius: 99, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                     background: filterStatus === (s === 'All' ? '' : s) ? '#111827' : '#F3F4F6',
                     color: filterStatus === (s === 'All' ? '' : s) ? '#fff' : '#6B7280' }}>
            {s === 'InProgress' ? 'In Progress' : s}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 12, fontWeight: 500, color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}>
            <option value="latest">Latest First</option>
            <option value="priority">High Priority First</option>
          </select>
        </div>
      </div>

      {/* Complaint Count */}
      <p style={{ fontSize: 12, color: '#6B7280', padding: '0 4px' }}>{complaints.length} complaint{complaints.length !== 1 ? 's' : ''} found</p>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}/>
          <p style={{ fontSize: 13 }}>Loading complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="card" style={{ padding: '56px 24px', textAlign: 'center', color: '#9CA3AF' }}>
          <ShieldCheck size={28} style={{ margin: '0 auto 10px', color: EM }}/>
          <p style={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}>Queue Clear</p>
          <p style={{ fontSize: 12.5 }}>No complaints match current filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {complaints.map(c => (
            <ComplaintCard key={c.id} complaint={c} onUpdate={handleUpdate}/>
          ))}
        </div>
      )}
    </div>
  );

  // ── TAB: Analytics ───────────────────────────────────────────────
  const AnalyticsView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {kpis.map((k, i) => <KpiCard key={i} {...k}/>)}
      </div>
      <DashboardView />
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────
  const navItems = [
    { key: 'dashboard',   label: 'Dashboard',    icon: <TrendingUp size={15}/> },
    { key: 'complaints',  label: 'Complaints',   icon: <ClipboardList size={15}/> },
    { key: 'analytics',   label: 'Analytics',    icon: <Brain size={15}/> },
  ] as const;

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: EM, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Faculty Portal</p>
          <h1 style={{ fontSize: 23, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>
            Decision Support Interface
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>
            Privacy-preserving grievance management with AI-assisted analysis.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 99, background: '#ECFDF5' }}>
            <Shield size={12} style={{ color: EM }}/>
            <span style={{ fontSize: 11, fontWeight: 700, color: EM, letterSpacing: '0.05em' }}>IDENTITY MASKED</span>
          </div>
          <button onClick={fetchData} style={{ padding: '7px 14px', borderRadius: 9, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={12}/> Refresh
          </button>
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {navItems.map(item => (
          <button key={item.key} onClick={() => setView(item.key as any)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 18px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, transition: 'all 0.15s',
              background: view === item.key ? '#111827' : '#F3F4F6',
              color:      view === item.key ? '#fff'    : '#6B7280',
            }}>
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {view === 'dashboard'  && <DashboardView/>}
      {view === 'complaints' && <ComplaintsView/>}
      {view === 'analytics'  && <AnalyticsView/>}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default FacultyDashboard;
