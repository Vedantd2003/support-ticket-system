import { useState, useRef, useEffect, useCallback } from 'react';
import { ticketsAPI } from '../utils/api';
import { gsap } from 'gsap';

const CATEGORIES = ['billing', 'technical', 'account', 'general'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const PRIORITY_COLORS = { low: '#00ff88', medium: '#ffd700', high: '#ff8c00', critical: '#ff3c3c' };

export default function TicketForm({ onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'general', priority: 'medium' });
  const [classifying, setClassifying] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(formRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
  }, []);

  const classify = useCallback(async (desc) => {
    if (desc.trim().length < 20) return;
    setClassifying(true);
    try {
      const res = await ticketsAPI.classify(desc);
      setSuggestion(res.data);
      if (res.data.llm_available !== false) {
        setForm((f) => ({ ...f, category: res.data.suggested_category, priority: res.data.suggested_priority }));
        // Animate suggestion badges
        gsap.fromTo('.suggestion-badge', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, stagger: 0.05 });
      }
    } catch {
      // graceful failure — no update
    } finally {
      setClassifying(false);
    }
  }, []);

  const handleDescChange = (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, description: val }));
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => classify(val), 800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const ticket = await ticketsAPI.create(form);
      setSuccess(true);
      setForm({ title: '', description: '', category: 'general', priority: 'medium' });
      setSuggestion(null);
      onCreated?.(ticket.data);
      gsap.fromTo('.success-flash', { opacity: 1 }, { opacity: 0, duration: 1.5, delay: 1 });
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={formRef} style={styles.wrap}>
      <h2 style={styles.heading}>🎫 New Ticket</h2>

      {success && (
        <div className="success-flash" style={styles.success}>
          ✅ Ticket submitted successfully!
        </div>
      )}
      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          style={styles.input}
          placeholder="Title (required, max 200 chars)"
          value={form.title}
          maxLength={200}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <div style={{ position: 'relative' }}>
          <textarea
            style={styles.textarea}
            placeholder="Describe your issue in detail... (AI will auto-classify)"
            value={form.description}
            onChange={handleDescChange}
            required
            rows={5}
          />
          {classifying && <div style={styles.classifyingBadge}>🤖 Analyzing...</div>}
        </div>

        {suggestion?.llm_available && (
          <div style={styles.suggestionRow}>
            <span style={styles.suggestionLabel}>AI Suggested:</span>
            <span className="suggestion-badge" style={{ ...styles.badge, background: '#7b2ff720', border: '1px solid #7b2ff7', color: '#c084fc' }}>
              📂 {suggestion.suggested_category}
            </span>
            <span className="suggestion-badge" style={{ ...styles.badge, background: PRIORITY_COLORS[suggestion.suggested_priority] + '20', border: `1px solid ${PRIORITY_COLORS[suggestion.suggested_priority]}`, color: PRIORITY_COLORS[suggestion.suggested_priority] }}>
              ⚡ {suggestion.suggested_priority}
            </span>
            <span style={styles.overrideHint}>(you can override below)</span>
          </div>
        )}

        <div style={styles.row}>
          <div style={styles.selectWrap}>
            <label style={styles.label}>Category</label>
            <select
              style={styles.select}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div style={styles.selectWrap}>
            <label style={styles.label}>Priority</label>
            <select
              style={{ ...styles.select, color: PRIORITY_COLORS[form.priority] }}
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <button style={{ ...styles.btn, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
          {submitting ? '⏳ Submitting...' : '🚀 Submit Ticket'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrap: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
  },
  heading: { color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '16px' },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '11px 14px',
    color: '#fff',
    fontSize: '14px',
    marginBottom: '12px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '11px 14px',
    color: '#fff',
    fontSize: '14px',
    resize: 'vertical',
    marginBottom: '12px',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
  },
  classifyingBadge: {
    position: 'absolute',
    bottom: '20px',
    right: '12px',
    background: 'rgba(0,212,255,0.15)',
    border: '1px solid rgba(0,212,255,0.3)',
    color: '#00d4ff',
    fontSize: '11px',
    borderRadius: '6px',
    padding: '3px 8px',
  },
  suggestionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  suggestionLabel: { color: '#666', fontSize: '12px' },
  badge: { fontSize: '12px', borderRadius: '6px', padding: '3px 8px', fontWeight: 600 },
  overrideHint: { color: '#444', fontSize: '11px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' },
  selectWrap: {},
  label: { color: '#666', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '5px' },
  select: {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '10px 12px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  },
  btn: {
    width: '100%',
    background: 'linear-gradient(135deg, #7b2ff7, #00d4ff)',
    border: 'none',
    borderRadius: '10px',
    padding: '13px',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    cursor: 'pointer',
  },
  success: {
    background: 'rgba(0,255,136,0.1)',
    border: '1px solid rgba(0,255,136,0.3)',
    color: '#00ff88',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '12px',
    fontSize: '13px',
    textAlign: 'center',
  },
  errorBox: {
    background: 'rgba(255,100,100,0.1)',
    border: '1px solid rgba(255,100,100,0.3)',
    color: '#ff6b6b',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '12px',
    fontSize: '13px',
  },
};
