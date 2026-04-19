import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, AlertCircle, FileText, Layout, 
  MapPin, HelpCircle, CheckCircle2, ShieldCheck, RefreshCw 
} from 'lucide-react';
import api from '../services/api';

// ── Stitch "Canvas White" Design Tokens ──────────────────────────────────────
const DS = {
  bg:            '#F8FAFC',
  surface:       '#FFFFFF',
  surfaceLow:    '#F1F5F9',
  slate:         '#475569',
  slateDark:     '#1E293B',
  blue:          '#2563EB',
  blueLight:     '#EFF6FF',
  indigo:        '#6366F1',
  indigoLight:   '#F5F3FF',
  emerald:       '#10B981',
  emeraldLight:  '#ECFDF5',
  shadow:        '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
  radius:        '24px',
  radiusSm:      '16px',
};

const CATEGORIES = [
  { id: 'Hostel',     label: 'Hostel & Mess',      icon: <MapPin size={20}/> },
  { id: 'Academic',   label: 'Academic & Exams',   icon: <FileText size={20}/> },
  { id: 'Department', label: 'Departmental Issues',icon: <Layout size={20}/> },
  { id: 'Facilities', label: 'Campus Facilities',  icon: <HelpCircle size={20}/> },
  { id: 'Safety',     label: 'Safety & Security',  icon: <ShieldCheck size={20}/> },
];

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return alert("Please describe your grievance.");
    if (!selectedCategory) return alert("Please select a category to ensure correct routing.");

    setIsSubmitting(true);
    try {
      // Sending category along with description to ensure routing accuracy
      const res = await api.post('/Grievance/create', { 
        description: `[CATEGORY:${selectedCategory}] ${description}`
      });
      setTrackingId(res.data.trackingId);
      setShowSuccess(true);
      setTimeout(() => navigate('/dashboard/student'), 5000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', background: 'transparent' }}>
      <div style={{ background: DS.surface, padding: 48, borderRadius: DS.radius, boxShadow: DS.shadow, textAlign: 'center', maxWidth: 450 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: DS.emeraldLight, color: DS.emerald, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle2 size={48} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: DS.slateDark, margin: '0 0 8px' }}>Submission Successful</h2>
        <p style={{ color: DS.slate, margin: '0 0 24px', lineHeight: 1.6 }}>Your grievance has been safely encrypted and routed to the corresponding authority.</p>
        <div style={{ background: DS.surfaceLow, padding: 16, borderRadius: DS.radiusSm, marginBottom: 32 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DS.slate, textTransform: 'uppercase', margin: '0 0 4px' }}>Your Tracking ID</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: DS.indigo, fontFamily: 'monospace', margin: 0 }}>{trackingId}</p>
        </div>
        <button onClick={() => navigate('/dashboard/student')} style={{ width: '100%', padding: '14px', borderRadius: DS.radiusSm, border: 'none', background: DS.indigo, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
          Return to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, padding: '40px 48px', minHeight: '100vh', background: 'transparent' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: DS.slateDark, margin: '0 0 8px' }}>Submit a Grievance</h1>
          <p style={{ fontSize: 16, color: DS.slate }}>Describe your issue clearly. Our AI will classify and route it, but your manual selection ensures zero-ms delivery.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 32 }}>
          
          {/* Main Input Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: DS.surface, padding: 32, borderRadius: DS.radius, boxShadow: DS.shadow, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={20} color={DS.indigo} />
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Detailed Description</h3>
              </div>
              <textarea 
                placeholder="Please describe the incident, including date, time, and location if applicable. Your identity remains protected by default."
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ width: '100%', height: 350, border: `1px solid ${DS.surfaceLow}`, background: DS.bg, padding: 20, borderRadius: DS.radiusSm, fontSize: 15, lineHeight: 1.6, resize: 'none', outline: 'none', transition: 'all 0.2s' }}
                onFocus={e => e.target.style.borderColor = DS.indigo}
                onBlur={e => e.target.style.borderColor = DS.surfaceLow}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: DS.indigoLight, borderRadius: 12 }}>
                <AlertCircle size={18} color={DS.indigo} />
                <p style={{ fontSize: 13, color: '#4338CA', margin: 0, fontWeight: 600 }}>Zero-Identity Policy: Your name is never sent to the authority.</p>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ padding: '20px', borderRadius: DS.radius, border: 'none', background: `linear-gradient(135deg, ${DS.indigo}, #4338CA)`, color: '#fff', fontSize: 18, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {isSubmitting ? <RefreshCw size={24} className="spin" /> : <><Send size={22} /> File Official Complaint</>}
            </button>
          </div>

          {/* Configuration Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: DS.surface, padding: 32, borderRadius: DS.radius, boxShadow: DS.shadow }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px' }}>Target Category</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat.id} 
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, border: selectedCategory === cat.id ? `2px solid ${DS.indigo}` : `1px solid ${DS.surfaceLow}`, background: selectedCategory === cat.id ? DS.indigoLight : DS.surfaceLow, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' 
                    }}
                  >
                    <div style={{ color: selectedCategory === cat.id ? DS.indigo : DS.slate }}>{cat.icon}</div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: selectedCategory === cat.id ? DS.indigo : DS.slateDark }}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: DS.surface, padding: 32, borderRadius: DS.radius, boxShadow: DS.shadow }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px' }}>Need Help?</h3>
              <p style={{ fontSize: 13, color: DS.slate, lineHeight: 1.6, margin: 0 }}>
                If you are unsure about the category, select **Campus Facilities**. Our AI Engine will perform a secondary check and may reroute your complaint if a more relevant branch is identified.
              </p>
            </div>
          </div>

        </form>
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SubmitComplaint;
