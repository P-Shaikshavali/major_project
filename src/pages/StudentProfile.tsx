import { useEffect, useState } from 'react';
import { Brain, ShieldCheck, TrendingUp, Clock, CheckCircle, AlertTriangle, User, GraduationCap, Hash } from 'lucide-react';
import api from '../services/api';

const Card = ({ children, style = {} }: any) => (
  <div className="animate-up" style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', ...style }}>
    {children}
  </div>
);

const ProgressBar = ({ value, color }: { value: number; color: string }) => (
  <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: color, borderRadius: 99, transition: 'width 0.7s ease' }} />
  </div>
);

const StudentProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api.get('/dashboard/student').then(res => {
      setAnalytics(res.data.behavioralAnalytics);
      setHistory(res.data.recentComplaints || []);
    }).catch(console.error);
    // Profile from localStorage for now
    setProfile({ name: 'Student User', studentId: 'STU-2024-001', department: 'Computer Science', year: '3rd Year', role: 'Student' });
  }, []);

  const credibility = Math.round(analytics?.averageCredibility || 0);
  const efficiency  = Math.round(analytics?.resolutionEfficiency || 0);
  const escalation  = Math.round(analytics?.escalationRate || 0);

  const behaviorMetrics = [
    { icon: <TrendingUp size={16} />, label: 'Resolution Efficiency', value: efficiency, color: 'var(--blue)', desc: 'Rate of complaints resolved without escalation' },
    { icon: <AlertTriangle size={16} />, label: 'Escalation Rate', value: escalation, color: 'var(--red)', desc: 'Percentage of complaints escalated to higher authority' },
    { icon: <CheckCircle size={16} />, label: 'Credibility Score', value: credibility, color: 'var(--green)', desc: 'System-computed credibility based on complaint history' },
    { icon: <Clock size={16} />, label: 'Avg Response Time', value: 72, color: 'var(--purple)', desc: 'Average hours until complaint is first responded to' },
  ];

  const STATUS_COLORS: Record<string, string> = {
    Resolved: 'var(--green)', Submitted: 'var(--blue)', InProgress: 'var(--amber)', Escalated: 'var(--red)',
  };

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div className="mb-7">
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Intelligent Profile Module</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Student Profile</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>AI-generated behavioral insights and complaint analytics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Identity Card */}
          <Card style={{ padding: '24px', overflow: 'hidden', position: 'relative' }}>
            {/* Decorative gradient */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #2563EB, #8B5CF6)' }} />
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <User size={26} />
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{profile?.name || '—'}</p>
            <p style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, marginTop: 2 }}>{profile?.role}</p>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: <Hash size={13} />, label: 'Student ID', value: profile?.studentId },
                { icon: <GraduationCap size={13} />, label: 'Department', value: profile?.department },
                { icon: <Clock size={13} />, label: 'Year', value: profile?.year },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2" style={{ fontSize: 12 }}>
                  <span style={{ color: 'var(--text-faint)' }}>{f.icon}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{f.label}:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{f.value || '—'}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: '8px 12px', borderRadius: 8, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={13} style={{ color: 'var(--blue)' }} />
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue)' }}>Identity secured by E-Grievance DSS</p>
            </div>
          </Card>

          {/* Credibility Score */}
          <Card style={{ padding: '20px 22px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Overall Credibility Score</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>AI-computed trust rating based on complaint accuracy.</p>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 44, fontWeight: 800, color: credibility >= 70 ? 'var(--green)' : credibility >= 40 ? 'var(--amber)' : 'var(--red)', lineHeight: 1 }}>{credibility}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>out of 100</p>
            </div>
            <ProgressBar value={credibility} color={credibility >= 70 ? 'var(--green)' : credibility >= 40 ? 'var(--amber)' : 'var(--red)'} />
            <div className="flex justify-between mt-2" style={{ fontSize: 10, color: 'var(--text-faint)' }}>
              <span>Low</span><span>Medium</span><span>High</span>
            </div>
          </Card>
        </div>

        {/* Right Column (2/3) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Behavior Metrics */}
          <div className="grid grid-cols-2 gap-4">
            {behaviorMetrics.map((m, i) => (
              <Card key={i} style={{ padding: '16px 18px' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${m.color}15`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {m.icon}
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{m.label}</p>
                </div>
                <p style={{ fontSize: 22, fontWeight: 800, color: m.color, marginBottom: 6 }}>{m.value}%</p>
                <ProgressBar value={m.value} color={m.color} />
                <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 8, lineHeight: 1.4 }}>{m.desc}</p>
              </Card>
            ))}
          </div>

          {/* AI Insights Panel */}
          {analytics?.insight && (
            <Card style={{ padding: '20px 22px' }}>
              <div className="flex items-center gap-2 mb-3">
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--purple-light)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={14} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>AI Behavioral Insight</p>
                <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--purple-light)', color: 'var(--purple)' }}>AI-GENERATED</span>
              </div>
              <div style={{ padding: '14px 16px', borderRadius: 8, background: 'var(--purple-light)', border: '1px solid var(--purple-light)' }}>
                <p style={{ fontSize: 13, color: 'var(--navy-mid)', lineHeight: 1.65 }}>{analytics.insight}</p>
              </div>
            </Card>
          )}

          {/* Complaint Timeline */}
          <Card style={{ padding: '20px 22px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Complaint History Timeline</p>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-faint)' }}>
                <Clock size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p style={{ fontSize: 12 }}>No complaint history yet.</p>
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: 28 }}>
                {/* Line */}
                <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 1.5, background: 'var(--border)', borderRadius: 99 }} />
                {history.map((c: any, i: number) => (
                  <div key={i} style={{ position: 'relative', marginBottom: i < history.length - 1 ? 20 : 0 }}>
                    {/* Dot */}
                    <div style={{ position: 'absolute', left: -21, top: 3, width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[c.status] || 'var(--border)', border: '2px solid var(--surface)', zIndex: 1 }} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{c.category}</p>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 99, background: `${STATUS_COLORS[c.status] || 'var(--border)'}1A`, color: STATUS_COLORS[c.status] || 'var(--text-muted)' }}>{c.status}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'monospace', marginLeft: 'auto' }}>{c.trackingId}</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
