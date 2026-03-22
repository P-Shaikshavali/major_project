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

const SmartChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { sender:'bot', text:"Hi! I'm your AI grievance assistant. Describe your issue and I'll route it to the right department automatically." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (isOpen) endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, isOpen]);

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

  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:1000, fontFamily:'Inter, system-ui, sans-serif' }}>
      {/* Chat Window */}
      {isOpen && (
        <div className="slide-up" style={{
          position:'absolute', bottom:60, right:0, width:340,
          background:'#fff', borderRadius:18,
          boxShadow:'0 20px 60px rgba(17,24,39,0.16), 0 4px 16px rgba(17,24,39,0.08)',
          display:'flex', flexDirection:'column', overflow:'hidden',
        }}>
          {/* Header */}
          <div style={{ background:'#111827', padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'#10B981', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Bot size={16} color="#fff"/>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#fff', lineHeight:1.1 }}>AI Grievance Assistant</p>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:3 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#10B981' }}/>
                <p style={{ fontSize:10, color:'#6B7280' }}>Online · Instant response</p>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <ShieldCheck size={12} style={{ color:'#10B981' }}/>
              <p style={{ fontSize:9, color:'#10B981', fontWeight:600, letterSpacing:'0.05em' }}>SECURE</p>
            </div>
            <button onClick={()=>setIsOpen(false)} style={{ width:26, height:26, borderRadius:6, background:'rgba(255,255,255,0.08)', border:'none', cursor:'pointer', color:'#9CA3AF', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <X size={14}/>
            </button>
          </div>

          {/* Messages */}
          <div style={{ height:300, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:10, background:'#F9FAFB' }}>
            {messages.map((msg,i) => (
              <div key={i} style={{ display:'flex', justifyContent: msg.sender==='user'?'flex-end':'flex-start', alignItems:'flex-end', gap:7 }}>
                {msg.sender==='bot' && (
                  <div style={{ width:22, height:22, borderRadius:6, background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Bot size={11} style={{ color:'#10B981' }}/>
                  </div>
                )}
                <div style={{
                  maxWidth:'78%', padding:'9px 12px',
                  borderRadius: msg.sender==='user'?'12px 12px 2px 12px':'12px 12px 12px 2px',
                  fontSize:12.5, lineHeight:1.55,
                  background: msg.sender==='user'?'#111827':'#fff',
                  color: msg.sender==='user'?'#fff':'#111827',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display:'flex', alignItems:'flex-end', gap:7 }}>
                <div style={{ width:22, height:22, borderRadius:6, background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Bot size={11} style={{ color:'#10B981' }}/>
                </div>
                <div style={{ padding:'9px 14px', borderRadius:'12px 12px 12px 2px', background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,0.07)', display:'flex', gap:4, alignItems:'center' }}>
                  {[0,1,2].map(d => (
                    <span key={d} style={{ width:5, height:5, borderRadius:'50%', background:'#10B981', opacity:0.7, animation:`bounce 1s ease ${d*0.15}s infinite` }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding:'10px 12px', background:'#fff', borderTop:'1px solid #F3F4F6', display:'flex', gap:8, alignItems:'center' }}>
            <input
              type="text" value={input} onChange={e=>setInput(e.target.value)}
              placeholder="Describe your issue..."
              style={{ flex:1, padding:'8px 12px', border:'1.5px solid #E5E7EB', borderRadius:8, fontSize:12.5, outline:'none', fontFamily:'inherit', background:'#F9FAFB', color:'#111827', transition:'border 0.18s' }}
              onFocus={e=>e.target.style.borderColor='#10B981'}
              onBlur={e=>e.target.style.borderColor='#E5E7EB'}
            />
            <button type="submit"
              style={{ width:34, height:34, flexShrink:0, borderRadius:9, background:'#10B981', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#059669'}
              onMouseLeave={e=>e.currentTarget.style.background='#10B981'}>
              <Send size={14} color="#fff"/>
            </button>
          </form>
        </div>
      )}

      {/* FAB */}
      <button onClick={()=>setIsOpen(!isOpen)}
        style={{ width:50, height:50, borderRadius:'50%', background:'#111827', border:'2px solid #10B981', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(17,24,39,0.25)', transition:'all 0.2s' }}
        onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.08)'; e.currentTarget.style.background='#10B981'; }}
        onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.background='#111827'; }}>
        {isOpen ? <X size={20} color="#10B981" opacity={isOpen?1:1}/> : <MessageSquare size={20} color="#10B981"/>}
      </button>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-4px)} }
      `}</style>
    </div>
  );
};

export default SmartChatbot;
