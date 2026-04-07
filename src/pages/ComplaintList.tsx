import { Search, Filter, Loader2, FolderOpen, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

// ── Stitch "Academic Sentinel" Design Tokens ──────────────────────────────────
const DS = {
  bg:            '#F8F9FA',
  surface:       '#FFFFFF',
  surfaceLow:    '#F3F4F5',
  surfaceHigh:   '#E1E3E4',
  blue:          '#1A73E8',
  blueDark:      '#005BBF',
  blueLight:     '#EBF3FD',
  text:          '#111827',
  textMuted:     '#414754',
  textFaint:     '#727785',
  green:         '#1B6B3A',
  greenLight:    '#D9F0E3',
  amber:         '#9E4300',
  amberLight:    '#FFDBCB',
  red:           '#B91C1C',
  redLight:      '#FEF2F2',
  shadowAmbient: '0 20px 40px rgba(44,47,49,0.06)',
  radiusCard:    '20px',
  radiusBtn:     '12px',
};

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Resolved:   { bg: DS.greenLight, color: DS.green },
  Submitted:  { bg: DS.blueLight,  color: DS.blue },
  InProgress: { bg: DS.amberLight, color: DS.amber },
  Escalated:  { bg: DS.redLight,   color: DS.red },
};

interface GrievanceItem {
  id?: number | string;
  trackingId?: string;
  category?: string;
  status: string;
  description?: string;
  createdAt: string;
  [key: string]: unknown;
}

const ComplaintList = () => {
  const [complaints, setComplaints] = useState<GrievanceItem[]>([]);
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

  const onInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.background = '#F0F5FF';
    e.target.style.boxShadow = `inset 0 -2px 0 ${DS.blue}`;
  };
  const onInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.background = DS.surfaceLow;
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ padding: '40px 48px', minHeight: '100vh', background: DS.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');`}</style>
      
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 32 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: DS.blueLight, padding: '4px 12px', borderRadius: 20, marginBottom: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: DS.blue }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: DS.blueDark, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Grievance Archive</span>
          </div>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 32, fontWeight: 800, color: DS.text, letterSpacing: '-0.02em', margin: 0 }}>
            Complaint History
          </h1>
          <p style={{ fontSize: 15, color: DS.textMuted, marginTop: 8 }}>Track all your filed grievances and resolutions.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: DS.textFaint }} />
            <input
              type="text"
              placeholder="Search by ID or Category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ 
                padding: '12px 16px 12px 40px', background: DS.surfaceLow, border: 'none', borderRadius: DS.radiusBtn, 
                color: DS.text, fontSize: 14, outline: 'none', width: 260, transition: 'all 0.2s', fontWeight: 500
              }}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
            />
          </div>
          {/* Filter */}
          <div style={{ position: 'relative' }}>
            <Filter size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: DS.textFaint, pointerEvents: 'none' }} />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ 
                padding: '12px 36px 12px 36px', background: DS.surfaceLow, border: 'none', borderRadius: DS.radiusBtn, 
                color: DS.text, fontSize: 14, outline: 'none', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: 600, transition: 'all 0.2s'
              }}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="InProgress">In Progress</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: DS.textFaint, pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Table Card (No-Line Approach) */}
      <div style={{ background: DS.surface, borderRadius: DS.radiusCard, boxShadow: DS.shadowAmbient, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.8)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: DS.bg }}>
                {['Tracking ID', 'Category', 'Description', 'Date Filed', 'Status'].map(h => (
                  <th key={h} style={{ 
                    padding: '16px 24px', fontSize: 12, fontWeight: 700, color: DS.textFaint, 
                    textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                    borderBottom: `2px solid ${DS.surfaceLow}`
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '64px', textAlign: 'center' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 12px', color: DS.blue }} />
                    <p style={{ fontSize: 14, color: DS.textMuted, fontWeight: 500 }}>Fetching grievance records...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '80px', textAlign: 'center' }}>
                    <FolderOpen size={48} style={{ margin: '0 auto 16px', color: DS.textFaint, opacity: 0.2 }} />
                    <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text, letterSpacing: '-0.01em', marginBottom: 4 }}>
                      {search || filter !== 'All' ? 'No exact matches found.' : 'No grievances on record.'}
                    </p>
                    <p style={{ fontSize: 14, color: DS.textMuted }}>
                      {search || filter !== 'All' ? 'Try adjusting your search criteria.' : 'When you file a complaint, it will appear here.'}
                    </p>
                  </td>
                </tr>
              ) : filtered.map((item, i) => {
                const st = STATUS_STYLES[item.status] || STATUS_STYLES.Submitted;
                const isEven = i % 2 === 0;
                return (
                  <tr
                    key={i}
                    style={{ 
                      background: isEven ? DS.surface : DS.surfaceLow,
                      cursor: 'pointer', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F9FBFF'}
                    onMouseLeave={e => e.currentTarget.style.background = isEven ? DS.surface : DS.surfaceLow}
                  >
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: DS.blue, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{item.trackingId}</span>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: DS.text }}>{item.category || '—'}</span>
                    </td>
                    <td style={{ padding: '20px 24px', maxWidth: 300 }}>
                      <p style={{ fontSize: 14, color: DS.textMuted, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontWeight: 400 }}>{item.description || '—'}</p>
                    </td>
                    <td style={{ padding: '20px 24px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: 13, color: DS.textFaint, fontWeight: 500 }}>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 40, background: st.bg, color: st.color, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }} />
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
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: DS.surface, borderTop: `1px solid ${DS.surfaceLow}` }}>
            <p style={{ fontSize: 13, color: DS.textFaint, fontWeight: 500 }}>
              Showing <strong style={{ color: DS.text }}>{filtered.length}</strong> of <strong style={{ color: DS.text }}>{complaints.length}</strong> records
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintList;
