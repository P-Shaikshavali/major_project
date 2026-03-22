import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Minimize2 } from 'lucide-react';

type Msg = { sender: 'bot' | 'user'; text: string };

const getReply = (text: string): string => {
  const t = text.toLowerCase();
  if (t.includes('hostel') || t.includes('food') || t.includes('room') || t.includes('mess') || t.includes('wifi'))
    return 'That sounds like a **Hostel** issue. I recommend selecting "Hostel" when submitting — it will be routed to the Warden.';
  if (t.includes('mark') || t.includes('grade') || t.includes('exam') || t.includes('result') || t.includes('class'))
    return 'This appears to be an **Academic** grievance. Select "Academic" to route it to the Faculty or Dean of Academics.';
  if (t.includes('fee') || t.includes('payment') || t.includes('portal') || t.includes('admission'))
    return 'This sounds like an **Admin** issue. Select "Admin / Administration" to route it to the admin office.';
  if (t.includes('harass') || t.includes('threat') || t.includes('bully') || t.includes('safe'))
    return '⚠️ This is a **Safety** concern. Please select "Safety & Conduct" — it will be treated as high priority and escalated immediately.';
  if (t.includes('status') || t.includes('update') || t.includes('complaint'))
    return 'You can check the status of your complaints under "My Complaints" in the sidebar. Each complaint has a tracking ID.';
  if (t.includes('anonymous') || t.includes('identity') || t.includes('private'))
    return 'Your identity is protected by default when filing complaints to Faculty and Warden roles. Only Admins can view your real identity with oversight.';
  return "I can help you categorize and submit your complaint. Try describing your issue — e.g., \"mess food quality\" or \"exam result dispute\".";
};

const SmartChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { sender: 'bot', text: 'Hi! I\'m your AI grievance assistant. Describe your issue and I\'ll help route it to the right department.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: getReply(text) }]);
    }, 900);
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Chat Window */}
      {isOpen && (
        <div
          className="animate-up"
          style={{
            position: 'absolute', bottom: 64, right: 0, width: 340,
            background: 'var(--surface, #fff)', borderRadius: 16,
            border: '1px solid var(--border, #E2E8F0)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#0F172A' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} className="text-white" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>AI Grievance Assistant</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                <p style={{ fontSize: 10, color: '#64748B' }}>Online · Usually replies instantly</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ height: 320, overflowY: 'auto', padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg, #F8FAFC)', scrollbarWidth: 'thin' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.sender === 'bot' && (
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 7, flexShrink: 0, marginTop: 2 }}>
                    <Bot size={11} style={{ color: '#2563EB' }} />
                  </div>
                )}
                <div style={{
                  maxWidth: '78%', padding: '9px 12px', borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  fontSize: 12, lineHeight: 1.55,
                  background: msg.sender === 'user' ? '#2563EB' : 'var(--surface, #fff)',
                  color: msg.sender === 'user' ? '#fff' : 'var(--text, #0F172A)',
                  border: msg.sender === 'bot' ? '1px solid var(--border, #E2E8F0)' : 'none',
                  boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={11} style={{ color: '#2563EB' }} />
                </div>
                <div style={{ padding: '8px 12px', borderRadius: '12px 12px 12px 2px', background: 'var(--surface,#fff)', border: '1px solid var(--border,#E2E8F0)', display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(d => (
                    <span key={d} style={{ width: 5, height: 5, borderRadius: '50%', background: '#94A3B8', animation: `bounce 1s ease ${d * 0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: '10px 12px', background: 'var(--surface,#fff)', borderTop: '1px solid var(--border,#E2E8F0)', display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Describe your issue..."
              style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border,#E2E8F0)', borderRadius: 8, fontSize: 12, outline: 'none', fontFamily: 'inherit', background: 'var(--bg,#F8FAFC)', color: 'var(--text,#0F172A)', transition: 'border 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#2563EB'}
              onBlur={e => e.target.style.borderColor = 'var(--border,#E2E8F0)'}
            />
            <button
              type="submit"
              style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 8, background: '#2563EB', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
              onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 48, height: 48, borderRadius: '50%', background: '#2563EB', color: '#fff',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37,99,235,0.35)', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.background = '#1D4ED8'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#2563EB'; }}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default SmartChatbot;
