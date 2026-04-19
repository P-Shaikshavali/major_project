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

const Badge = ({ bg, color, label }: any) => (
  <span style={{ padding: '4px 10px', borderRadius: '6px', background: bg, color: color, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
    {label}
  </span>
);

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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: DS.bg }}>
      <RefreshCw size={40} className="spin" color={DS.blue} />
    </div>
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
