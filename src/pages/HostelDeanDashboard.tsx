import { useEffect, useState, useCallback } from 'react';
import {
  ClipboardList, CheckCircle, Clock, AlertTriangle,
  Brain, ChevronDown, Filter, RefreshCw, ShieldCheck,
} from 'lucide-react';
// @ts-ignore
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import api from '../services/api';

const DS = {
  bg:           '#F9FAFB',
  surface:      '#FFFFFF',
  surfaceLow:   '#F1F4F6',
  charcoal:     '#111827',
  emerald:      '#10B981',
  emeraldDark:  '#065F46',
  emeraldLight: '#ECFDF5',
  text:         '#2B3437',
  textMuted:    '#586064',
  textFaint:    '#9CA3AF',
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
  shadow:       '0 4px 12px rgba(17,24,39,0.05)',
  shadowHover:  '0 6px 20px rgba(17,24,39,0.09)',
  radius:       '16px',
  radiusSm:     '8px',
};

const STATUS_MAP: Record<string, { bg: string; color: string; label: string }> = {
  Submitted:  { bg: DS.surfaceLow,   color: DS.textMuted,  label: 'Submitted'   },
  InProgress: { bg: DS.blueLight,    color: DS.blue,       label: 'In Progress' },
  Resolved:   { bg: DS.greenLight,   color: DS.green,      label: 'Resolved'    },
  Escalated:  { bg: DS.redLight,     color: DS.red,        label: 'Escalated'   },
};

const PRIORITY_MAP: Record<string, { bg: string; color: string; dot: string }> = {
  High:   { bg: DS.redLight,    color: DS.red,    dot: '#EF4444' },
  Medium: { bg: DS.amberLight,  color: DS.amber,  dot: '#F59E0B' },
  Low:    { bg: DS.greenLight,  color: DS.green,  dot: DS.emerald },
};

const Badge = ({ bg, color, children, dot }: any) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: dot ? 5 : 0, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: bg, color }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />}
    {children}
  </span>
);

const KpiCard = ({ icon, label, value, color, bg }: any) => (
  <div style={{ background: DS.surface, borderRadius: DS.radius, boxShadow: DS.shadow, padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${color},${color}40)` }} />
    <div style={{ width: 38, height: 38, borderRadius: DS.radiusSm, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{icon}</div>
    <p style={{ fontSize: 32, fontWeight: 800, color: DS.charcoal, lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: 12, color: DS.textMuted, marginTop: 6, fontWeight: 600 }}>{label}</p>
  </div>
);

// Expanded complaint card
function ExpandedComplaintCard({ complaint: c, onUpdate }: any) {
  const [expanded, setExpanded] = useState(false);
  const [valStatus, setValStatus] = useState(c.status);
  const [valNote, setValNote] = useState(c.resolutionNote || '');
  const [valEsc, setValEsc] = useState(c.isEscalated);

  const sc = STATUS_MAP[c.status] || STATUS_MAP.Submitted;
  const pc = PRIORITY_MAP[c.priority] || PRIORITY_MAP.Low;

  const saveAction = () => {
    onUpdate(c.id, valStatus, valNote, valEsc);
    setExpanded(false);
  }

  return (
    <div style={{ background: DS.surface, borderRadius: DS.radius, boxShadow: DS.shadow, overflow: 'hidden' }}>
       <div style={{ padding: '24px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, padding: '4px 8px', background: DS.surfaceLow, borderRadius: 6 }}>{c.trackingId}</span>
                <span style={{ fontSize: 12, color: DS.textFaint }}>{c.anonymousId}</span>
                <Badge bg={sc.bg} color={sc.color}>{sc.label}</Badge>
                <Badge bg={pc.bg} color={pc.color} dot={pc.dot}>{c.priority}</Badge>
                {c.isEscalated && <Badge bg={DS.redLight} color={DS.red}>🚨 ESCALATED FLAG</Badge>}
                {(!c.isEscalated && (c.priority === 'High' || new Date(c.createdAt).getTime() < Date.now() - 172800000)) && (
                   <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', background: DS.red, color: '#fff', borderRadius: 6, animation: 'pulse 2s infinite' }}>Recommended for escalation</span>
                )}
             </div>
             <p style={{ fontSize: 14, color: DS.text, lineHeight: 1.6, marginBottom: 16 }}>{c.description}</p>
             <div style={{ display: 'flex', gap: 24, fontSize: 12, color: DS.textMuted, fontWeight: 500 }}>
                <span><Brain size={12} style={{ display:'inline', marginRight: 4, color: DS.emerald }} /> {c.similarCount} similar patterns</span>
                <span><ShieldCheck size={12} style={{ display:'inline', marginRight: 4, color: DS.emerald }} /> Masked Identity Priority</span>
                <span><Clock size={12} style={{ display:'inline', marginRight: 4 }} /> {new Date(c.createdAt).toLocaleDateString()}</span>
             </div>
          </div>
          <button onClick={() => setExpanded(!expanded)} style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 8, background: expanded ? DS.emeraldLight : DS.bg, border: `1px solid ${expanded ? DS.emerald : DS.surfaceLow}`, color: expanded ? DS.emeraldDark : DS.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
             {expanded ? 'Close Action' : 'Take Action'} <ChevronDown size={14} style={{ transform: expanded ? 'rotate(180deg)' : 'none' }} />
          </button>
       </div>
       {expanded && (
          <div style={{ background: DS.bg, padding: 24, borderTop: `1px solid ${DS.surfaceLow}`, display: 'flex', flexDirection: 'column', gap: 20 }}>
             <div style={{ background: DS.surface, borderLeft: `3px solid ${DS.emerald}`, padding: 16, borderRadius: DS.radiusSm, boxShadow: DS.shadow }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: DS.emeraldDark, textTransform: 'uppercase', marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}><Brain size={14} /> Hostel Rules Moderation</p>
                <p style={{ fontSize: 13, color: DS.text, fontWeight: 500 }}>{c.aiRecommendation || "Hostel safety guidelines state infrastructural threats should be escalated within 24 hours."}</p>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>
                <div>
                   <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8 }}>Target Status</label>
                   <select value={valStatus} onChange={e => setValStatus(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${DS.surfaceLow}`, fontSize: 14 }}>
                      <option value="Submitted">Submitted (Pending)</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Resolved">Mark Resolved</option>
                   </select>

                   <label style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 20, cursor: 'pointer' }}>
                      <input type="checkbox" checked={valEsc} onChange={e => setValEsc(e.target.checked)} style={{ width: 16, height: 16, accentColor: DS.emerald }} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Escalate to Admin</span>
                   </label>
                </div>
                <div>
                   <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8 }}>Resolution Documentation</label>
                   <textarea value={valNote} onChange={e => setValNote(e.target.value)} rows={3} placeholder="Add specific resolution steps... (e.g. Dispatched maintenance)" style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${DS.surfaceLow}`, fontSize: 14, outline: 'none', resize: 'vertical' }} />
                </div>
             </div>
             <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button onClick={saveAction} style={{ background: DS.emerald, color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                   <CheckCircle size={16} /> Update Record
                </button>
             </div>
          </div>
       )}
    </div>
  );
}

export default function HostelDeanDashboard() {
  const [view, setView] = useState<'dashboard' | 'complaints'>('dashboard');
  const [complaints, setComplaints] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('Submitted');
  const [filterType, setFilterType] = useState('All');
  const [clusterMode, setClusterMode] = useState(false);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const gRes = await api.get('/warden/grievances');
      const aRes = await api.get('/faculty/analytics');
      setComplaints(gRes.data || []);
      setAnalytics(aRes.data);
    } catch { 
      setComplaints([]);
    } finally { 
      if (!isSilent) setLoading(false); 
    }
  }, []);

  useEffect(() => {
    fetchData();
    const connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5275/hubs/grievance")
      .withAutomaticReconnect()
      .build();
    connection.start().then(() => {
        connection.on("ReceiveSystemUpdate", () => fetchData(true));
    }).catch(console.error);
    return () => { connection.stop(); };
  }, [fetchData]);

  const handleUpdate = async (id: number, status: string, note: string, escalate: boolean) => {
    try {
      await api.put(`/warden/update-status?id=${id}`, { status: status, resolutionNote: note, recommendEscalation: escalate });
      setComplaints(p => p.map(c => c.id === id ? { ...c, status, resolutionNote: note, isEscalated: escalate || c.isEscalated } : c));
    } catch { }
  };

  // Local filtering & Clustering
  let visibleComplaints = complaints.filter(c => filterStatus === 'All' || c.status === filterStatus);
  if (filterPriority) visibleComplaints = visibleComplaints.filter(c => c.priority === filterPriority);
  
  if (filterType !== 'All') {
     const t = filterType.toLowerCase();
     visibleComplaints = visibleComplaints.filter(c => (c.description || '').toLowerCase().includes(t) || (c.category && c.category.toLowerCase().includes(t)));
  }

  const generateClusters = () => {
    const clusters: Record<string, any[]> = { "Food/Mess Issues": [], "Room Infrastructure": [], "Water/Electricity": [], "Facilities/Cleaning": [], "General": [] };
    visibleComplaints.forEach(c => {
       let d = (c.description || '').toLowerCase();
       if (d.includes('food') || d.includes('mess')) clusters["Food/Mess Issues"].push(c);
       else if (d.includes('room') || d.includes('bed') || d.includes('paint')) clusters["Room Infrastructure"].push(c);
       else if (d.includes('water') || d.includes('electricity') || d.includes('power')) clusters["Water/Electricity"].push(c);
       else if (d.includes('clean') || d.includes('bathroom') || d.includes('facilities')) clusters["Facilities/Cleaning"].push(c);
       else clusters["General"].push(c);
    });
    return clusters;
  };

  const an = analytics || { totalAssigned: 0, pending: 0, inProgress: 0, resolved: 0, escalated: 0, avgResolutionHours: 0, categoryBreakdown: [], aiInsights: [] };
  const kpis = [
    { icon: <ClipboardList size={18}/>, label: 'Hostel Records',     value: an.totalAssigned,       color: DS.charcoal, bg: DS.surfaceLow },
    { icon: <Clock size={18}/>,         label: 'Pending Action',     value: an.pending,             color: DS.amber,   bg: DS.amberLight   },
    { icon: <CheckCircle size={18}/>,   label: 'Resolved',           value: an.resolved,            color: DS.green,   bg: DS.greenLight   },
    { icon: <AlertTriangle size={18}/>, label: 'Escalated Issues',   value: an.escalated,           color: DS.red,     bg: DS.redLight     },
  ];

  return (
    <div style={{ padding: '40px 48px', minHeight: '100vh', background: 'transparent', fontFamily: "'Inter', sans-serif" }}>

       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
         <div>
           <p style={{ fontSize: 12, fontWeight: 700, color: DS.emerald, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>WARDEN PORTAL</p>
           <h1 style={{ fontSize: 28, fontWeight: 800, color: DS.charcoal, margin: 0 }}>
             {view === 'dashboard' ? 'Hostel Grievance Dashboard' : 'Hostel Safety Queue'}
           </h1>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
           <button onClick={() => setView('dashboard')}  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: view === 'dashboard'  ? DS.charcoal : DS.surfaceLow, color: view === 'dashboard'  ? '#fff' : DS.textMuted }}>Dashboard</button>
           <button onClick={() => setView('complaints')} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: view === 'complaints' ? DS.charcoal : DS.surfaceLow, color: view === 'complaints' ? '#fff' : DS.textMuted }}>Queue</button>
           <button onClick={() => fetchData(false)} style={{ background: DS.surface, border: `1px solid ${DS.surfaceLow}`, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
             <RefreshCw size={14} style={{ color: DS.emerald }} /> Sync
           </button>
         </div>
       </div>

       {view === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {kpis.map((k, i) => <KpiCard key={i} {...k} />)}
             </div>
             <div style={{ background: DS.surface, borderRadius: DS.radius, padding: 32, boxShadow: DS.shadow, border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                  <Brain size={20} style={{ color: DS.emerald }} />
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Infrastructure Audit Insights</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {an.aiInsights && an.aiInsights.length > 0 ? an.aiInsights.map((ins: string, i: number) => (
                     <div key={i} style={{ padding: 16, background: DS.surfaceLow, borderRadius: 12, fontSize: 14, color: DS.text, fontWeight: 500, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <span style={{ color: DS.emerald }}>✦</span> {ins}
                     </div>
                  )) : <p style={{ fontSize: 14, color: DS.textMuted }}>No anomalies detected.</p>}
                </div>
             </div>
          </div>
       )}

       {view === 'complaints' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, background: DS.surface, padding: 16, borderRadius: DS.radius, boxShadow: DS.shadow, alignItems: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                <Filter size={16} style={{ color: DS.textMuted, marginRight: 8 }} />
                {[ {l: 'Active', v: 'Submitted'}, {l: 'Pending', v: 'InProgress'}, {l: 'Resolved', v: 'Resolved'}, {l: 'All', v: 'All'} ].map(f => (
                   <button key={f.v} onClick={() => setFilterStatus(f.v)}
                     style={{ padding: '6px 16px', borderRadius: 99, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                              background: filterStatus === f.v ? DS.charcoal : DS.surfaceLow, color: filterStatus === f.v ? '#fff' : DS.textMuted }}>
                      {f.l}
                   </button>
                ))}
                <div style={{ flex: 1, borderLeft: `1px solid ${DS.surfaceLow}`, margin: '0 8px', height: 24 }} />
                {clusterMode ? (
                   <button onClick={() => setClusterMode(false)} style={{ padding: '6px 14px', borderRadius: 8, background: DS.charcoal, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Back to List</button>
                ) : (
                   <button onClick={() => setClusterMode(true)} style={{ padding: '6px 14px', borderRadius: 8, background: DS.emeraldLight, color: DS.emeraldDark, border: `1px solid ${DS.emerald}`, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Cluster Views</button>
                )}
             </div>

             {clusterMode ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
                  {Object.entries(generateClusters()).filter(([_, group]) => group.length > 0).map(([name, group]) => (
                     <div key={name} style={{ background: DS.surface, borderRadius: DS.radius, padding: 20, boxShadow: DS.shadow, borderTop: `4px solid ${DS.emerald}`, border: '1px solid rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: DS.charcoal, marginTop: 0, marginBottom: 16 }}>{name}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {group.map((c: any) => (
                             <div key={c.id} style={{ padding: 12, background: DS.bg, border: `1px solid ${DS.surfaceLow}`, borderRadius: 8, fontSize: 13, cursor: 'pointer' }} onClick={() => setClusterMode(false)}>
                               <p style={{ margin: '0 0 4px 0', fontWeight: 700 }}>{c.trackingId}</p>
                               <p style={{ margin: 0, color: DS.textMuted, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description}</p>
                             </div>
                          ))}
                        </div>
                     </div>
                  ))}
                </div>
             ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {visibleComplaints.map(c => <ExpandedComplaintCard key={c.id} complaint={c} onUpdate={handleUpdate} />)}
                  {visibleComplaints.length === 0 && <p style={{ textAlign: 'center', color: DS.textFaint, padding: 40 }}>No complaints matches your filters.</p>}
                </div>
             )}
          </div>
       )}
       <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
    </div>
  );
}
