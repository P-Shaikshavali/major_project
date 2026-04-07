import { useEffect, useState, useRef } from 'react';
import { Brain, ShieldCheck, Clock, CheckCircle, AlertTriangle, User, Hash, GraduationCap, Server, Send, LayoutDashboard, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../services/api';

const DS = {
  bg:            '#F8F9FA',
  surface:       '#FFFFFF',
  surfaceLow:    '#F2F5F8',
  blue:          '#1A73E8',
  blueDark:      '#005BBF',
  blueLight:     '#EBF3FD',
  text:          '#111827',
  textMuted:     '#414754',
  textFaint:     '#727785',
  green:         '#10B981',
  amber:         '#F59E0B',
  red:           '#EF4444',
  purple:        '#8B5CF6',
  radiusCard:    '24px',
  radiusPill:    '12px',
  shadowAmbient: '0 24px 48px rgba(0,0,0,0.04)',
};

<<<<<<< HEAD
const CHART_COLORS = [DS.blue, DS.purple, DS.green, DS.amber];

const StudentProfile = () => {
  const [data, setData] = useState<any>(null);
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ai', text: "Hello! Need me to find out about your specific complaints or suggest a category?" }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ── HIT THE NEW INTELLIGENCE ENDPOINT ──
    api.get('/student/profile/intelligence')
       .then(res => setData(res.data))
       .catch(console.error);
=======
interface CardProps { children: React.ReactNode; style?: React.CSSProperties; noPadding?: boolean; }
const Card = ({ children, style = {}, noPadding = false }: CardProps) => (
  <div style={{ 
    background: DS.surface, borderRadius: DS.radiusCard, padding: noPadding ? 0 : 32, 
    boxShadow: DS.shadowAmbient, border: '1px solid rgba(255,255,255,0.8)',
    display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', ...style 
  }}>
    {children}
  </div>
);

const ProgressBar = ({ value, color }: { value: number; color: string }) => (
  <div style={{ height: 8, background: DS.surfaceLow, borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: color, borderRadius: 99, transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
  </div>
);

const StudentProfile = () => {
  const [profile] = useState<{name: string, studentId: string, department: string, year: string, role: string} | null>({ name: 'Student User', studentId: 'STU-2024-001', department: 'Computer Science', year: '3rd Year', role: 'Student' });
  const [analytics, setAnalytics] = useState<{averageCredibility?: number, resolutionEfficiency?: number, escalationRate?: number, insight?: string} | null>(null);
  const [history, setHistory] = useState<{trackingId: string, category: string, status: string, createdAt: string}[]>([]);

  useEffect(() => {
    api.get('/dashboard/student').then(res => {
      setAnalytics(res.data.behavioralAnalytics);
      setHistory(res.data.recentComplaints || []);
    }).catch(console.error);
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    const userQ = chatMsg.trim();
    setChatHistory(prev => [...prev, { sender: 'user', text: userQ }]);
    setChatMsg("");

    try {
      const res = await api.post('/chatbot/detect', { text: userQ });
      setChatHistory(prev => [...prev, { sender: 'ai', text: `Suggested Category: ${res.data.detectedCategory}. Confidence: High.` }]);
    } catch {
      setChatHistory(prev => [...prev, { sender: 'ai', text: "Ah, I'm currently unable to parse that request. Please try 'suggest category' or check manually!" }]);
    }
  };

  if (!data) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: DS.textFaint }}>Loading Behavioral Intelligence Profile...</div>;
  }

  const { userInfo, behaviorMetrics, credibilityModel, patternAnalysis, recentActivity, aiInsights } = data;

  const scoreColor = credibilityModel.level === 'High' ? DS.green : credibilityModel.level === 'Medium' ? DS.amber : DS.red;

  // Mocked chart logic since API doesn't return full distribution
  const pieData = patternAnalysis.mostFrequentCategory !== "None" 
      ? [{ name: patternAnalysis.mostFrequentCategory, value: 70 }, { name: 'Others', value: 30 }] 
      : [{ name: 'Empty', value: 100 }];
      
  const barData = [
    { name: 'Total', count: behaviorMetrics.totalComplaints },
    { name: 'Resolved', count: behaviorMetrics.resolvedComplaints },
    { name: 'Escalated', count: behaviorMetrics.escalatedComplaints }
  ];

  return (
    <div style={{ padding: '48px', minHeight: '100vh', background: DS.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .card-lux { background: #FFFFFF; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.05); overflow: hidden; transition: 0.3s; }
        .card-lux:hover { box-shadow: 0 30px 60px rgba(0,0,0,0.05); transform: translateY(-2px); }
        .scroll-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: DS.blueLight, padding: '6px 16px', borderRadius: 20, marginBottom: 12 }}>
            <Server size={14} color={DS.blue} />
            <span style={{ fontSize: 11, fontWeight: 800, color: DS.blueDark, letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI Profile System</span>
          </div>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 36, fontWeight: 800, color: DS.text, letterSpacing: '-0.02em', margin: 0 }}>Behavioral Intelligence</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 32 }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          {/* 1. Profile Card */}
          <div className="card-lux" style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: DS.surfaceLow, color: DS.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <User size={40} />
            </div>
            <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 24, fontWeight: 800, color: DS.text, margin: 0 }}>{userInfo.name}</h2>
            <p style={{ fontSize: 13, color: DS.textFaint, marginTop: 4 }}>{userInfo.email}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24, padding: 20, background: DS.surfaceLow, borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: DS.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}><GraduationCap size={14} /> Dept:</span>
                <span style={{ fontWeight: 600, color: DS.text }}>{userInfo.department}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: DS.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> Year:</span>
                <span style={{ fontWeight: 600, color: DS.text }}>{userInfo.year}</span>
              </div>
            </div>
          </div>

          {/* 3. Credibility Score */}
          <div className="card-lux" style={{ padding: 32, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: scoreColor }} />
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, color: DS.text, marginBottom: 24 }}>System Credibility</p>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
               <span style={{ fontSize: 56, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{credibilityModel.score}</span>
               <span style={{ fontSize: 14, fontWeight: 700, color: DS.textFaint, textTransform: 'uppercase' }}>/ 100</span>
            </div>
            
            <div style={{ height: 8, background: DS.surfaceLow, borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
               <div style={{ height: '100%', width: `${credibilityModel.score}%`, background: scoreColor, borderRadius: 4 }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <span style={{ fontSize: 13, fontWeight: 600, color: DS.textMuted }}>Confidence Level</span>
               <span style={{ fontSize: 13, fontWeight: 800, padding: '4px 12px', background: scoreColor + '1A', color: scoreColor, borderRadius: 12 }}>{credibilityModel.level}</span>
            </div>
          </div>

          {/* 7. Chatbot Integration */}
          <div className="card-lux" style={{ display: 'flex', flexDirection: 'column', height: 400 }}>
             <div style={{ padding: 20, borderBottom: '1px solid ' + DS.surfaceLow, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Brain size={20} color={DS.blue} />
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800 }}>Profile Assistant</span>
             </div>
             
             <div className="scroll-hide" style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                    <div style={{ 
                      padding: '12px 16px', borderRadius: 16, fontSize: 13, lineHeight: 1.5,
                      background: msg.sender === 'user' ? DS.blue : DS.surfaceLow,
                      color: msg.sender === 'user' ? '#fff' : DS.text,
                      borderBottomRightRadius: msg.sender === 'user' ? 4 : 16,
                      borderBottomLeftRadius: msg.sender === 'ai' ? 4 : 16,
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
             </div>

             <form onSubmit={handleChat} style={{ padding: 16, borderTop: '1px solid ' + DS.surfaceLow, display: 'flex', gap: 10 }}>
               <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="e.g. 'suggest category'" required
                  style={{ flex: 1, padding: '12px 16px', border: '1px solid ' + DS.surfaceLow, borderRadius: 12, outline: 'none', background: DS.bg, fontSize: 13 }} />
               <button type="submit" style={{ background: DS.blue, color: '#fff', border: 'none', borderRadius: 12, width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Send size={16} />
               </button>
             </form>
          </div>

        </div>


        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* 2. Metrics Dashboard Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { label: 'Total', count: behaviorMetrics.totalComplaints, icon: <LayoutDashboard size={18}/>, color: DS.text },
              { label: 'Resolved', count: behaviorMetrics.resolvedComplaints, icon: <CheckCircle size={18}/>, color: DS.green },
              { label: 'Pending', count: behaviorMetrics.pendingComplaints, icon: <Clock size={18}/>, color: DS.blue },
              { label: 'Escalated', count: behaviorMetrics.escalatedComplaints, icon: <AlertTriangle size={18}/>, color: DS.red },
            ].map((m, i) => (
              <div key={i} className="card-lux" style={{ padding: 24 }}>
                <div style={{ color: m.color, marginBottom: 12 }}>{m.icon}</div>
                <p style={{ fontSize: 32, fontWeight: 900, color: DS.text, margin: 0, lineHeight: 1 }}>{m.count}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: DS.textMuted, marginTop: 6 }}>{m.label}</p>
              </div>
            ))}
          </div>

          {/* 4. AI Insights Panel */}
          <div className="card-lux" style={{ padding: 32, background: `linear-gradient(135deg, #1E293B, #0F172A)`, color: '#fff' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Brain size={24} color={DS.blueLight} />
                <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 20, fontWeight: 800, margin: 0 }}>Strategic AI Insights</h3>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {aiInsights.map((insight: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 12, background: 'rgba(255,255,255,0.05)', padding: '16px 20px', borderRadius: 16 }}>
                    <span style={{ color: DS.blueLight, marginTop: 2 }}>✦</span>
                    <span style={{ fontSize: 14, lineHeight: 1.6, fontWeight: 500 }}>{insight}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* 6. Mini Analytics (Charts) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20 }}>
            {/* Category Pie */}
            <div className="card-lux" style={{ padding: 24 }}>
               <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: DS.text, marginBottom: 20 }}>Category Grouping</p>
               <ResponsiveContainer width="100%" height={240}>
                 <PieChart>
                   <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                     {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                   </Pie>
                   <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: DS.shadowAmbient }} />
                 </PieChart>
               </ResponsiveContainer>
               <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13, fontWeight: 600, color: DS.textMuted }}>
                 Dominant: {patternAnalysis.mostFrequentCategory}
               </div>
            </div>

            {/* Trends Bar */}
            <div className="card-lux" style={{ padding: 24 }}>
               <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: DS.text, marginBottom: 20 }}>Complaint Flow</p>
               <ResponsiveContainer width="100%" height={240}>
                 <BarChart data={barData} barSize={32}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={DS.surfaceLow} />
                   <XAxis dataKey="name" tick={{ fontSize: 11, fill: DS.textFaint }} axisLine={false} tickLine={false} dy={10} />
                   <YAxis tick={{ fontSize: 11, fill: DS.textFaint }} axisLine={false} tickLine={false} width={30} />
                   <Tooltip cursor={{ fill: DS.surfaceLow }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: DS.shadowAmbient }} />
                   <Bar dataKey="count" fill={DS.blue} radius={[4,4,0,0]} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
          
          {/* 5. Complaint History */}
          <div className="card-lux" style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
               <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 18, fontWeight: 800, margin: 0 }}>Recent Activity</h3>
               <button style={{ background: 'none', border: 'none', color: DS.blue, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                 View All <ChevronRight size={14} />
               </button>
            </div>

            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid ' + DS.surfaceLow }}>
                    <th style={{ padding: '0 16px 16px', fontSize: 11, fontWeight: 800, color: DS.textFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tracking ID</th>
                    <th style={{ padding: '0 16px 16px', fontSize: 11, fontWeight: 800, color: DS.textFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</th>
                    <th style={{ padding: '0 16px 16px', fontSize: 11, fontWeight: 800, color: DS.textFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                    <th style={{ padding: '0 16px 16px', fontSize: 11, fontWeight: 800, color: DS.textFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: DS.textFaint, fontSize: 14 }}>No historical patterns documented.</td></tr>
                  )}
                  {recentActivity.map((g: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid ' + DS.surfaceLow }}>
                      <td style={{ padding: '16px', fontSize: 13, fontFamily: 'monospace', color: DS.textMuted }}>{g.trackingId}</td>
                      <td style={{ padding: '16px', fontSize: 14, fontWeight: 600, color: DS.text }}>{g.category}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, background: DS.surfaceLow, padding: '4px 10px', borderRadius: 40, textTransform: 'uppercase' }}>
                          {g.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: 13, color: DS.textMuted }}>
                         {new Date(g.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default StudentProfile;
