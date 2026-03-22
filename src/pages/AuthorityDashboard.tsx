import { useEffect, useState } from 'react';
import { ShieldCheck, Shield } from 'lucide-react';
import api from '../services/api';

const EM = '#10B981';
const STATUS_COLORS: Record<string,{text:string,bg:string}> = {
  Submitted: { text:'#3B82F6', bg:'#EFF6FF' },
  InProgress:{ text:'#D97706', bg:'#FFFBEB' },
  Escalated: { text:'#EF4444', bg:'#FEF2F2' },
  Resolved:  { text:EM,       bg:'#ECFDF5' },
};
const TABS = ['All','Pending','Escalated','Resolved'];

const AuthorityDashboard = () => {
  const [complaints, setComplaints]   = useState<any[]>([]);
  const [activeTab, setActiveTab]     = useState('Pending');
  const [updatingId, setUpdatingId]   = useState<string|null>(null);

  useEffect(() => {
    api.get('/dashboard/authority').then(r => setComplaints(r.data || [])).catch(() => setComplaints([]));
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
    <div style={{ padding:'28px 32px', minHeight:'100vh', background:'var(--bg)' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:EM, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Authority Queue</p>
          <h1 style={{ fontSize:23, fontWeight:800, color:'#111827', letterSpacing:'-0.01em' }}>Complaint Management</h1>
          <p style={{ fontSize:13, color:'#6B7280', marginTop:3 }}>Review and update complaint statuses.</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {[
            { label:'New', v:counts.New, color:'#3B82F6', bg:'#EFF6FF' },
            { label:'Escalated', v:counts.Escalated, color:'#EF4444', bg:'#FEF2F2' },
            { label:'Resolved', v:counts.Resolved, color:EM, bg:'#ECFDF5' },
          ].map((b,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:99, background:b.bg }}>
              <span style={{ fontSize:15, fontWeight:800, color:b.color }}>{b.v}</span>
              <span style={{ fontSize:11.5, fontWeight:600, color:b.color }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Banner */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 16px', borderRadius:12, background:'#ECFDF5', border:'1px solid #A7F3D0', marginBottom:20 }}>
        <Shield size={14} style={{ color:EM, flexShrink:0 }}/>
        <p style={{ fontSize:12.5, color:'#065F46', fontWeight:500 }}>
          <strong>Privacy Notice:</strong> Student identities are protected by the system. You are viewing anonymized complaint data.
        </p>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:5 }}>
          <ShieldCheck size={12} style={{ color:EM }}/>
          <p style={{ fontSize:10, fontWeight:700, color:EM, letterSpacing:'0.05em' }}>IDENTITY PROTECTED</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={()=>setActiveTab(tab)}
            style={{
              padding:'7px 18px', borderRadius:99, fontSize:12.5, fontWeight:600, border:'none', cursor:'pointer', transition:'all 0.15s',
              background: activeTab===tab ? '#111827' : '#F3F4F6',
              color: activeTab===tab ? '#fff' : '#6B7280',
            }}>{tab}</button>
        ))}
      </div>

      {/* Complaints */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding:'56px 24px', textAlign:'center', color:'#9CA3AF' }}>
          <div style={{ width:48, height:48, borderRadius:12, background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
            <ShieldCheck size={22} style={{ color:EM }}/>
          </div>
          <p style={{ fontSize:14, fontWeight:600, color:'#374151', marginBottom:4 }}>Queue Clear</p>
          <p style={{ fontSize:12.5 }}>No pending items requiring action.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filtered.map((c:any, i:number) => {
            const sc = STATUS_COLORS[c.status] || { text:'#6B7280', bg:'#F3F4F6' };
            return (
              <div key={i} className="card animate-up" style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:16 }}>
                {/* Anon ID */}
                <div style={{ width:44, height:44, borderRadius:12, background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Shield size={18} style={{ color:'#9CA3AF' }}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <p style={{ fontSize:12.5, fontWeight:700, color:'#111827', fontFamily:'monospace' }}>{c.anonymousId||`ANON-${String(i+1).padStart(4,'0')}`}</p>
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:sc.bg, color:sc.text }}>{c.status}</span>
                    <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:99, background:'#F3F4F6', color:'#6B7280' }}>{c.category}</span>
                  </div>
                  <p style={{ fontSize:12, color:'#6B7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.description}</p>
                </div>
                <div style={{ flexShrink:0 }}>
                  <select
                    value={c.status}
                    onChange={e => updateStatus(c.id, e.target.value)}
                    disabled={updatingId===c.id}
                    style={{ padding:'7px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', fontSize:12, background:'#F9FAFB', color:'#111827', cursor:'pointer', outline:'none' }}
                    onFocus={e=>e.target.style.borderColor=EM}
                    onBlur={e=>e.target.style.borderColor='#E5E7EB'}
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Escalated">Escalated</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AuthorityDashboard;
