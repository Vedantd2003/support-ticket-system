import { useEffect, useRef, useState } from 'react';
import { ticketsAPI } from '../utils/api';
import { gsap } from 'gsap';

const PRIORITY_COLORS = { low: '#00ff88', medium: '#ffd700', high: '#ff8c00', critical: '#ff3c3c' };
const CATEGORY_COLORS = { billing: '#00d4ff', technical: '#7b2ff7', account: '#ff6b6b', general: '#00ff88' };

function StatCard({ label, value, color = '#00d4ff', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay });
  }, [delay]);
  return (
    <div ref={ref} style={{ ...styles.statCard, borderColor: color + '44' }}>
      <div style={{ ...styles.statValue, color }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function BreakdownBar({ data, colors }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  return (
    <div style={styles.barWrap}>
      {Object.entries(data).map(([key, val]) => (
        <div key={key} style={{ ...styles.barItem }}>
          <div style={styles.barLabelRow}>
            <span style={{ color: colors[key], fontWeight: 600 }}>{key}</span>
            <span style={{ color: '#aaa' }}>{val}</span>
          </div>
          <div style={styles.barTrack}>
            <div
              style={{
                ...styles.barFill,
                width: `${(val / total) * 100}%`,
                background: colors[key],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StatsDashboard({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    ticketsAPI
      .stats()
      .then((r) => setStats(r.data))
      .catch(() => setErr('Failed to load stats'));
  }, [refreshKey]);

  if (err) return <p style={{ color: '#ff6b6b' }}>{err}</p>;
  if (!stats) return <p style={{ color: '#555' }}>Loading stats...</p>;

  return (
    <div style={styles.wrap}>
      <h2 style={styles.heading}>📊 Dashboard</h2>
      <div style={styles.cards}>
        <StatCard label="Total Tickets" value={stats.total_tickets} delay={0} />
        <StatCard label="Open" value={stats.open_tickets} color="#ffd700" delay={0.05} />
        <StatCard label="Avg / Day" value={stats.avg_tickets_per_day} color="#00ff88" delay={0.1} />
      </div>
      <div style={styles.breakdowns}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Priority</h3>
          <BreakdownBar data={stats.priority_breakdown} colors={PRIORITY_COLORS} />
        </div>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Category</h3>
          <BreakdownBar data={stats.category_breakdown} colors={CATEGORY_COLORS} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { marginBottom: '32px' },
  heading: { color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '16px' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' },
  statCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  },
  statValue: { fontSize: '28px', fontWeight: 800 },
  statLabel: { color: '#666', fontSize: '12px', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' },
  breakdowns: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  section: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '16px',
  },
  sectionTitle: { color: '#aaa', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 600 },
  barWrap: { display: 'flex', flexDirection: 'column', gap: '10px' },
  barItem: {},
  barLabelRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' },
  barTrack: { height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '3px', transition: 'width 0.8s ease' },
};
