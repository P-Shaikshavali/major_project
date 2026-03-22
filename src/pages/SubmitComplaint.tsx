import { useState, useEffect } from 'react';
import { Sparkles, Send, UploadCloud, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SubmitComplaint = () => {
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [predictedCategory, setPredictedCategory] = useState('');
  const [predictedPriority, setPredictedPriority] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const d = desc.toLowerCase();
    if (d.length > 10) {
      if (d.includes('hostel') || d.includes('food') || d.includes('room') || d.includes('wifi')) {
        setPredictedCategory('Hostel'); setPredictedPriority('Medium');
      } else if (d.includes('exam') || d.includes('mark') || d.includes('result') || d.includes('grade')) {
        setPredictedCategory('Academic'); setPredictedPriority('High');
      } else if (d.includes('fee') || d.includes('portal') || d.includes('admission')) {
        setPredictedCategory('Admin'); setPredictedPriority('Low');
      } else if (d.includes('harass') || d.includes('safe') || d.includes('threat')) {
        setPredictedCategory('Safety'); setPredictedPriority('Critical');
      } else {
        setPredictedCategory('General'); setPredictedPriority('Low');
      }
    } else {
      setPredictedCategory(''); setPredictedPriority('');
    }
  }, [desc]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/grievance/create', { description: desc, category: category || predictedCategory });
      navigate('/dashboard/list');
    } catch { alert('Failed to submit.'); }
    finally { setIsSubmitting(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', border: '1px solid var(--border)',
    borderRadius: 8, background: 'var(--surface)', color: 'var(--text)',
    fontSize: 13, outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s',
  };

  const priorityColor: Record<string, string> = {
    Critical: 'var(--red)', High: 'var(--amber)', Medium: 'var(--blue)', Low: 'var(--green)',
  };

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="mb-7">
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>New Grievance</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Lodge a Complaint</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Describe your issue. AI will route it to the right department.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2">
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '24px' }}>
            <div className="space-y-5">
              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  Detailed Description <span style={{ color: 'var(--red)' }}>*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Describe the issue you are facing in detail..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-mid)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
                <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>{desc.length} characters · Min 10 required</p>
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px var(--blue-mid)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                >
                  <option value="">Select category (or let AI decide)...</option>
                  <option value="Academic">Academic</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Admin">Admin / Administration</option>
                  <option value="Safety">Safety & Conduct</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Upload */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                  Supporting Documents <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-faint)' }}>(Optional)</span>
                </label>
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '24px', border: '1.5px dashed var(--border)', borderRadius: 8, cursor: 'pointer',
                  background: 'var(--bg)', gap: 8, transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.background = 'var(--blue-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)'; }}
                >
                  <UploadCloud size={20} style={{ color: 'var(--text-faint)' }} />
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Click to upload or drag and drop</p>
                  <p style={{ fontSize: 11, color: 'var(--text-faint)' }}>PNG, JPG, PDF — up to 10MB</p>
                  <input type="file" className="sr-only" />
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || desc.length < 10}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--blue)' }}
                onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = '#1D4ED8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--blue)'; }}
              >
                {isSubmitting ? 'Submitting...' : <><Send size={14} /> Submit Securely</>}
              </button>
            </div>
          </div>
        </form>

        {/* AI Suggestion Panel */}
        <div className="space-y-4">
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '20px 22px' }}>
            <div className="flex items-center gap-2 mb-4">
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--purple-light)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={14} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>AI Suggestion Panel</p>
            </div>

            {predictedCategory ? (
              <div className="space-y-3">
                <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--blue-light)', border: '1px solid var(--blue-mid)' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Suggested Category</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--blue)' }}>{predictedCategory}</p>
                </div>
                <div style={{ padding: '12px 14px', borderRadius: 8, background: priorityColor[predictedPriority] ? `${priorityColor[predictedPriority]}1A` : 'var(--blue-light)' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: priorityColor[predictedPriority], textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Predicted Priority</p>
                  <div className="flex items-center gap-2">
                    <Zap size={14} style={{ color: priorityColor[predictedPriority] }} />
                    <p style={{ fontSize: 16, fontWeight: 700, color: priorityColor[predictedPriority] }}>{predictedPriority}</p>
                  </div>
                </div>
                <button
                  onClick={() => setCategory(predictedCategory)}
                  style={{ width: '100%', padding: '8px', borderRadius: 8, background: 'var(--blue)', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--blue)'}
                >
                  Apply AI Suggestion
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-faint)' }}>
                <Sparkles size={28} style={{ margin: '0 auto 8px', opacity: 0.35 }} />
                <p style={{ fontSize: 12 }}>Start typing to get<br/>AI-powered suggestions.</p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '18px 22px' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Filing Tips</p>
            {['Be specific about dates, locations, and people involved.', 'Attach any relevant documents or screenshots.', 'Your identity can be kept anonymous — enable in profile.'].map((t, i) => (
              <div key={i} className="flex gap-2 mb-3">
                <span style={{ width: 18, height: 18, borderRadius: 999, background: 'var(--blue-light)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitComplaint;
