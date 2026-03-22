import { Search, Filter, Loader2, FolderOpen, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Resolved:   { bg: 'var(--green-light)',   color: 'var(--green)' },
  Submitted:  { bg: 'var(--blue-light)',    color: 'var(--blue)' },
  InProgress: { bg: 'var(--amber-light)',   color: 'var(--amber)' },
  Escalated:  { bg: 'var(--red-light)',     color: 'var(--red)' },
};

const ComplaintList = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    api.get('/grievance/my').then(res => setComplaints(res.data)).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const filtered = complaints.filter(c => {
    const matchSearch = !search || c.trackingId?.toLowerCase().includes(search.toLowerCase()) || c.category?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>My Complaints</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Complaint History</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Track all your submitted grievances and their status.</p>
        </div>
        <div className="flex gap-2">
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input
              type="text"
              placeholder="Search by ID or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', fontSize: 12, outline: 'none', width: 200 }}
              onFocus={e => { e.target.style.borderColor = 'var(--blue)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
            />
          </div>
          {/* Filter */}
          <div style={{ position: 'relative' }}>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ padding: '8px 28px 8px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text-muted)', fontSize: 12, outline: 'none', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <option value="All">All Status</option>
              <option value="Submitted">Submitted</option>
              <option value="InProgress">In Progress</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Tracking ID', 'Category', 'Description', 'Date Filed', 'Status'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center' }}>
                    <Loader2 size={20} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--blue)' }} />
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading complaints...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center' }}>
                    <FolderOpen size={28} style={{ margin: '0 auto 8px', color: 'var(--text-faint)', opacity: 0.5 }} />
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{search || filter !== 'All' ? 'No matching complaints found.' : 'No complaints filed yet.'}</p>
                  </td>
                </tr>
              ) : filtered.map((item, i) => {
                const st = STATUS_STYLES[item.status] || STATUS_STYLES.Submitted;
                return (
                  <tr
                    key={i}
                    style={{ borderTop: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', fontFamily: 'monospace' }}>{item.trackingId}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{item.category || '—'}</span>
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: 260 }}>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.description || '—'}</p>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: st.bg, color: st.color }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!isLoading && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>
              Showing <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> of <strong style={{ color: 'var(--text)' }}>{complaints.length}</strong> complaints
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintList;
