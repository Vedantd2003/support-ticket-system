import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { gsap } from 'gsap';
import ThreeBackground from '../three/ThreeBackground';

export default function AuthPage({ onSuccess }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
    );
  }, []);

  const switchMode = () => {
    gsap.to(cardRef.current, {
      opacity: 0,
      x: -20,
      duration: 0.2,
      onComplete: () => {
        setMode((m) => (m === 'login' ? 'register' : 'login'));
        setError('');
        gsap.fromTo(cardRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.3 });
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
      gsap.fromTo(cardRef.current, { x: -8 }, { x: 8, repeat: 3, yoyo: true, duration: 0.07 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <ThreeBackground />
      <div ref={cardRef} style={styles.card}>
        <div style={styles.logo}>⚡</div>
        <h1 style={styles.title}>SupportOS</h1>
        <p style={styles.sub}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'register' && (
            <input
              style={styles.input}
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          )}
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={6}
          />
          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={styles.toggle}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span style={styles.link} onClick={switchMode}>
            {mode === 'login' ? 'Register' : 'Sign In'}
          </span>
        </p>

        <div style={styles.guestNote}>
          <span style={styles.link} onClick={onSuccess}>
            Continue as guest →
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Syne', 'Space Grotesk', sans-serif",
  },
  card: {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 0 80px rgba(123,47,247,0.15)',
    textAlign: 'center',
  },
  logo: { fontSize: '48px', marginBottom: '8px' },
  title: { color: '#fff', fontSize: '28px', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-1px' },
  sub: { color: '#888', fontSize: '14px', margin: '0 0 28px' },
  error: {
    background: 'rgba(255,100,100,0.1)',
    border: '1px solid rgba(255,100,100,0.3)',
    color: '#ff6b6b',
    borderRadius: '8px',
    padding: '10px',
    marginBottom: '16px',
    fontSize: '13px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  btn: {
    background: 'linear-gradient(135deg, #7b2ff7, #00d4ff)',
    border: 'none',
    borderRadius: '10px',
    padding: '13px',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    cursor: 'pointer',
    marginTop: '4px',
    transition: 'transform 0.15s',
  },
  toggle: { color: '#666', fontSize: '13px', marginTop: '20px', marginBottom: '8px' },
  link: { color: '#00d4ff', cursor: 'pointer', fontWeight: 600 },
  guestNote: { marginTop: '4px' },
};
