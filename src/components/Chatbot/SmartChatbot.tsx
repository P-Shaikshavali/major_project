import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, ShieldCheck } from 'lucide-react';

type Msg = { sender: 'bot' | 'user'; text: string };

const getReply = (text: string): string => {
  const t = text.toLowerCase();
  if (t.includes('hostel')||t.includes('food')||t.includes('room')||t.includes('mess')||t.includes('wifi'))
    return 'That sounds like a Hostel issue. Select "Hostel" to route it to the Warden automatically.';
  if (t.includes('mark')||t.includes('grade')||t.includes('exam')||t.includes('result')||t.includes('class'))
    return 'This appears to be an Academic grievance. Select "Academic" to route it to the Faculty or Dean.';
  if (t.includes('fee')||t.includes('payment')||t.includes('portal')||t.includes('admission'))
    return 'This sounds like an Admin issue. Select "Admin / Administration" to route it to the office.';
  if (t.includes('harass')||t.includes('threat')||t.includes('bully')||t.includes('safe'))
    return '⚠️ Safety concern detected. Select "Safety & Conduct" — it will be escalated immediately as high priority.';
  if (t.includes('status')||t.includes('update')||t.includes('tracking'))
    return 'Check your complaint status under "My Complaints" in the sidebar. Each complaint has a unique Tracking ID.';
  if (t.includes('anon')||t.includes('identity')||t.includes('private')||t.includes('secret'))
    return 'Your identity is protected by default for Faculty/Warden viewers. Only Admins with oversight can access your real ID.';
  return "I can help route your complaint. Try describing your issue — e.g., \"mess food quality\" or \"exam result dispute\".";
};

// ── Stitch "Emerald Sentinel" Glass Tokens ──────────────────────────────────
const DS = {
  emerald:       '#10B981',
  emeraldDark:   '#065F46',
  emeraldLight:  '#ECFDF5',
  glassBlue:     'rgba(26, 115, 232, 0.95)',
  glassDark:     'rgba(17, 24, 39, 0.85)',
  glassSurface:  'rgba(255, 255, 255, 0.75)',
  glassInput:    'rgba(255, 255, 255, 0.9)',
  blur:          'blur(24px)',
  shadowFloating:'0 32px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
};

const SmartChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { sender:'bot', text:"Hi! I'm your AI grievance assistant. Describe your issue and I'll route it to the right department automatically." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (isOpen) endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, isOpen, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setMessages(p => [...p, { sender:'user', text }]);
    setInput(''); setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(p => [...p, { sender:'bot', text: getReply(text) }]);
    }, 900);
  };

  const isStudent = localStorage.getItem('userRole') !== 'Faculty' && localStorage.getItem('userRole') !== 'Dean' && localStorage.getItem('userRole') !== 'HostelDean' && localStorage.getItem('userRole') !== 'Admin';
  // Use blue accent for student, emerald for authority
  const accent = isStudent ? '#1A73E8' : DS.emerald;

  return (
    <div style={{ position:'fixed', bottom: 32, right: 32, zIndex: 9999, fontFamily: "'Inter', sans-serif" }}>
      {/* Chat Window Container */}
      {isOpen && (
        <div className="slide-up" style={{
          position: 'absolute', bottom: 80, right: 0, width: 360,
          background: DS.glassSurface, 
          backdropFilter: DS.blur, WebkitBackdropFilter: DS.blur,
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: DS.shadowFloating,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header - Glass Dark Variant */}
          <div style={{ 
            background: DS.glassDark, backdropFilter: DS.blur, padding: '20px 24px', 
            display: 'flex', alignItems: 'center', gap: 14,
            borderBottom: '1px solid rgba(255,255,255,0.06)' 
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 8px 16px ${accent}40` }}>
              <Bot size={20} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>Volt AI Assistant</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}` }} />
                <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>Online · Specialized Routing</p>
              </div>
            </div>
            
            <button onClick={() => setIsOpen(false)} style={{ 
              width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.06)', 
              border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
              <X size={16} />
            </button>
          </div>

          <div style={{ background: '#111827', padding: '6px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
             <ShieldCheck size={12} style={{ color: accent }} />
             <p style={{ fontSize: 10, color: accent, fontWeight: 800, letterSpacing: '0.08em' }}>ANONYMOUS & ENCRYPTED TEXT</p>
          </div>

          {/* Messages Area */}
          <div style={{ 
            height: 380, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, 
            background: 'rgba(248, 249, 250, 0.6)' 
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 10 }}>
                
                {msg.sender === 'bot' && (
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: accent + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={13} style={{ color: accent }} />
                  </div>
                )}
                
                <div style={{
                  maxWidth: '80%', padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize: 13, lineHeight: 1.6, fontWeight: msg.sender === 'user' ? 400 : 500,
                  background: msg.sender === 'user' ? accent : '#FFFFFF',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#111827',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.8)'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: accent + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={13} style={{ color: accent }} />
                </div>
                <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: '#FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', border: '1px solid rgba(255,255,255,0.8)', display: 'flex', gap: 6, alignItems: 'center' }}>
                  {[0, 1, 2].map(d => (
                    <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: accent, opacity: 0.6, animation: `bounce 1s ease ${d * 0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{ 
            padding: '16px 20px', background: DS.glassSurface, backdropFilter: DS.blur,
            borderTop: '1px solid rgba(0,0,0,0.04)', display: 'flex', gap: 10, alignItems: 'center' 
          }}>
            <input
              type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask anything..."
              style={{ 
                flex: 1, padding: '12px 16px', borderRadius: 12, border: 'none', 
                fontSize: 13, fontWeight: 500, outline: 'none', fontFamily: 'inherit', 
                background: '#FFFFFF', color: '#111827', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                transition: 'box-shadow 0.2s' 
              }}
              onFocus={e => e.target.style.boxShadow = `inset 0 0 0 2px ${accent}40`}
              onBlur={e => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'}
            />
            <button type="submit"
              disabled={!input.trim()}
              style={{ 
                width: 42, height: 42, flexShrink: 0, borderRadius: 12, background: accent, border: 'none', cursor: input.trim() ? 'pointer' : 'default', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                opacity: input.trim() ? 1 : 0.6, boxShadow: input.trim() ? `0 4px 12px ${accent}50` : 'none'
              }}
              onMouseEnter={e => { if (input.trim()) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { if (input.trim()) e.currentTarget.style.transform = 'none' }}>
              <Send size={16} color="#fff" style={{ transform: 'translateX(-1px)' }} />
            </button>
          </form>
        </div>
      )}

      {/* FAB - Glassmorphic floating action button */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)}
          data-chatbot-fab
          style={{ 
            width: 60, height: 60, borderRadius: '50%', 
            background: DS.glassDark, backdropFilter: DS.blur, border: '1px solid rgba(255,255,255,0.1)', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            boxShadow: `0 12px 32px rgba(17,24,39,0.25), 0 0 0 4px ${accent}30`, 
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            animation: 'slideUp 0.4s ease forwards'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08) translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px rgba(17,24,39,0.3), 0 0 0 6px ${accent}40`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(17,24,39,0.25), 0 0 0 4px ${accent}30`; }}>
          <MessageSquare size={24} color={accent} fill={accent} style={{ opacity: 0.9 }} />
        </button>
      )}

      <style>{`
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0) } 40% { transform: translateY(-4px) } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.9) } to { opacity: 1; transform: translateY(0) scale(1) } }
        .slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default SmartChatbot;
