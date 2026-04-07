import { useEffect, useState } from 'react';
import { ShieldCheck, Shield, ChevronDown } from 'lucide-react';
import api from '../services/api';

// ── Stitch "Emerald Sentinel" Design Tokens ──────────────────────────────────
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
  blueLight:     '#EBF3FD',
  amber:         '#9E4300',
  amberLight:    '#FFDBCB',
  red:           '#B91C1C',
  redLight:      '#FEF2F2',
  shadowAmbient: '0 20px 40px rgba(44,47,49,0.06)',
  radiusCard:    '20px',
  radiusBtn:     '12px',
};

const STATUS_COLORS: Record<string,{text:string,bg:string}> = {
  Submitted:  { text: DS.blue,    bg: DS.blueLight },
  InProgress: { text: DS.amber,   bg: DS.amberLight },
  Escalated:  { text: DS.red,     bg: DS.redLight },
  Resolved:   { text: DS.emerald, bg: DS.emeraldLight },
};
const TABS = ['All','Pending','Escalated','Resolved'];

interface GrievanceDetails {
  id: string;
  status: string;
  priority: string;
  category: string;
  trackingId: string;
  createdAt: string;
  description: string;
  anonymousId?: string;
  [key: string]: unknown; // fallback
}

const AuthorityDashboard = () => {
  const [complaints, setComplaints]   = useState<GrievanceDetails[]>([]);
  const [activeTab, setActiveTab]     = useState('Pending');
  const [updatingId, setUpdatingId]   = useState<string|null>(null);

  useEffect(() => {
    api.get('/dashboard/authority').then(r => {
      const data = r.data?.queue || r.data?.Queue || (Array.isArray(r.data) ? r.data : []);
      setComplaints(data);
    }).catch(() => setComplaints([]));
  }, []);

  const filtered = complaints.filter(c => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending')   return c.status === 'Submitted' || c.status === 'InProgress';
    if (activeTab === 'Escalated') return c.status === 'Escalated';
    if (activeTab === 'Resolved')  return c.status === 'Resolved';
    return true;
  });

  const counts = {
    New:       complaints.filter(c=>c.status==='Submitted').length,
    Escalated: complaints.filter(c=>c.status==='Escalated').length,
    Resolved:  complaints.filter(c=>c.status==='Resolved').length,
  };

  const updateStatus = async (id:string, status:string) => {
    setUpdatingId(id);
    try {
      await api.put(`/grievance/update-status/${id}`, { status });
      setComplaints(p => p.map(c => c.id===id ? {...c,status} : c));
    } catch(e){ console.error(e); }
    finally { setUpdatingId(null); }
  };

  return (
    <div style={{ padding: '40px 48px', minHeight: '100vh', background: DS.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>
      
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 32 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: DS.emeraldLight, padding: '4px 12px', borderRadius: 20, marginBottom: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: DS.emerald }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: DS.emeraldDark, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Authority Queue</span>
          </div>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: DS.text, letterSpacing: '-0.02em', margin: 0 }}>
            Complaint Management
          </h1>
          <p style={{ fontSize: 15, color: DS.textMuted, marginTop: 8 }}>Review and update centralized complaint statuses.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: 'New', v: counts.New, color: DS.blue, bg: DS.blueLight },
            { label: 'Escalated', v: counts.Escalated, color: DS.red, bg: DS.redLight },
            { label: 'Resolved', v: counts.Resolved, color: DS.emerald, bg: DS.emeraldLight },
          ].map((b,i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: DS.radiusCard, background: DS.surface, boxShadow: DS.shadowAmbient, border: '1px solid rgba(255,255,255,0.8)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: b.color }}>{b.v}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: DS.textMuted }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderRadius: DS.radiusCard, background: DS.emeraldLight, marginBottom: 32 }}>
        <ShieldCheck size={20} style={{ color: DS.emerald, flexShrink: 0 }} />
        <p style={{ fontSize: 14, color: DS.emeraldDark, fontWeight: 500 }}>
          <strong>Privacy Protocol Active:</strong> Student identities are protected by the system. You are viewing anonymized records.
        </p>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: '#FFFFFF', padding: '6px 14px', borderRadius: 40 }}>
          <Shield size={14} style={{ color: DS.emerald }} />
          <p style={{ fontSize: 11, fontWeight: 800, color: DS.emeraldDark, letterSpacing: '0.06em' }}>STRICT MASKING</p>
        </div>
      </div>

      {/* Filter Tabs & Content Container */}
      <div style={{ background: DS.surface, borderRadius: DS.radiusCard, boxShadow: DS.shadowAmbient, padding: 32, border: '1px solid rgba(255,255,255,0.8)' }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32, borderBottom: `2px solid ${DS.surfaceLow}`, paddingBottom: 16 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 24px', borderRadius: 40, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: activeTab === tab ? DS.text : 'transparent',
                color: activeTab === tab ? '#FFFFFF' : DS.textFaint,
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Complaints List Phase */}
        {filtered.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: DS.emeraldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ShieldCheck size={32} style={{ color: DS.emerald }} />
            </div>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 800, color: DS.text, letterSpacing: '-0.01em', marginBottom: 4 }}>Queue Clear</p>
            <p style={{ fontSize: 14, color: DS.textMuted }}>No pending items require moderation under this filter.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map((c:GrievanceDetails, i:number) => {
              const sc = STATUS_COLORS[c.status] || STATUS_COLORS.Submitted;
              return (
                <div key={i} style={{ 
                  padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, 
                  background: DS.surfaceLow, borderRadius: 16, transition: 'background 0.2s' 
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FBFF'}
                onMouseLeave={e => e.currentTarget.style.background = DS.surfaceLow}>
                  
                  {/* Anon ID Ghost Icon */}
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: DS.surfaceHigh, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Shield size={20} style={{ color: DS.textFaint }} />
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: DS.emeraldDark, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        {c.anonymousId || `ANON-${String(i+1).padStart(4,'0')}`}
                      </p>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 40, background: sc.bg, color: sc.text }}>
                        {c.status}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 40, background: DS.surface, color: DS.textMuted, border: `1px solid ${DS.surfaceHigh}` }}>
                        {c.category}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: DS.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 400 }}>
                      {c.description}
                    </p>
                  </div>
                  
                  <div style={{ flexShrink: 0, position: 'relative' }}>
                    <select
                      value={c.status}
                      onChange={e => updateStatus(c.id, e.target.value)}
                      disabled={updatingId === c.id}
                      style={{ 
                        padding: '10px 36px 10px 16px', borderRadius: DS.radiusBtn, border: 'none', 
                        fontSize: 13, fontWeight: 600, background: DS.surface, color: DS.text, 
                        cursor: 'pointer', outline: 'none', appearance: 'none', boxShadow: `0 2px 8px rgba(0,0,0,0.04)`
                      }}
                      onFocus={e => { e.target.style.background = '#F0F5FF'; e.target.style.boxShadow = `inset 0 -2px 0 ${DS.emerald}`; }}
                      onBlur={e => { e.target.style.background = DS.surface; e.target.style.boxShadow = `0 2px 8px rgba(0,0,0,0.04)`; }}
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Escalated">Escalated</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: DS.textFaint, pointerEvents: 'none' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorityDashboard;
