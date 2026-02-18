import { useState, useEffect, useRef } from 'react';
import { ticketsAPI } from '../utils/api';
import { gsap } from 'gsap';

const PRIORITY_COLORS = { low: '#00ff88', medium: '#ffd700', high: '#ff8c00', critical: '#ff3c3c' };
const STATUS_COLORS = { open: '#00d4ff', in_progress: '#ffd700', resolved: '#00ff88', closed: '#555' };
const CATEGORIES = ['', 'billing', 'technical', 'account', 'general'];
const PRIORITIES = ['', 'low', 'medium', 'high', 'critical'];
const STATUSES = ['', 'open', 'in_progress', 'resolved', 'closed'];
const NEXT_STATUS = { open: 'in_progress', in_progress: 'resolved', resolved: 'closed' };

function TicketCard({ ticket, onUpdate }) {
  const ref = useRef(null);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async () => {
    const next = NEXT_STATUS[ticket.status];
    if (!next) return;
    setUpdating(true);
    try {
      const res = await ticketsAPI.update(ticket.id, { status: next });
      onUpdate(res.data);
      gsap.fromTo(ref.current, { scale: 0.98 }, { scale: 1, duration: 0.2 });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const truncate = (str, n) => str?.length > n ? str.slice(0, n) + '…' : str;
  const d = new Date(ticket.createdAt);
  const dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div ref={ref} style={styles.card}>
      <div style={styles.cardTop}>
        <span style={{ ...styles.priorityDot, background: PRIORITY_COLORS[ticket.priority] }} />
        <span style={styles.cardTitle}>{ticket.title}</span>
      </div>
      <p style={styles.cardDesc}>{truncate(ticket.description, 140)}</p>
      <div style={styles.cardMeta}>
        <span style={styles.chip}>{ticket.category}</span>
        <span style={{ ...styles.chip, color: PRIORITY_COLORS[ticket.priority], borderColor: PRIORITY_COLORS[ticket.priority] + '55' }}>
          {ticket.priority}
        </span>
        <span style={{ ...styles.chip, color: STATUS_COLORS[ticket.status], borderColor: STATUS_COLORS[ticket.status] + '55' }}>
          {ticket.status.replace('_', ' ')}
        </span>
        <span style={styles.timestamp}>{dateStr}</span>
        {ticket.author && <span style={styles.author}>@{ticket.author.username}</span>}
      </div>
      {NEXT_STATUS[ticket.status] && (
        <button
          style={{ ...styles.statusBtn, opacity: updating ? 0.6 : 1 }}
          onClick={handleStatusChange}
          disabled={updating}
        >
          → Mark as {NEXT_STATUS[ticket.status].replace('_', ' ')}
        </button>
      )}
    </div>
  );
}

export default function TicketList({ refreshKey }) {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ category: '', priority: '', status: '', search: '' });
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await ticketsAPI.list(params);
      setTickets(res.data);
      gsap.fromTo('.ticket-card', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [filters, refreshKey]); // eslint-disable-line

  const handleUpdate = (updated) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  return (
    <div>
      <h2 style={styles.heading}>🎯 Tickets</h2>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          style={styles.searchInput}
          placeholder="🔍 Search..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        {[['category', CATEGORIES], ['priority', PRIORITIES], ['status', STATUSES]].map(([key, opts]) => (
          <select
            key={key}
            style={styles.filterSelect}
            value={filters[key]}
            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
          >
            {opts.map((o) => (
              <option key={o} value={o}>{o || `All ${key}`}</option>
            ))}
          </select>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#555', textAlign: 'center', padding: '32px' }}>Loading...</p>
      ) : tickets.length === 0 ? (
        <p style={{ color: '#444', textAlign: 'center', padding: '32px' }}>No tickets found.</p>
      ) : (
        <div ref={listRef} style={styles.list}>
          {tickets.map((t) => (
            <div key={t.id} className="ticket-card">
              <TicketCard ticket={t} onUpdate={handleUpdate} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  heading: { color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '14px' },
  filters: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  searchInput: {
    flex: '1',
    minWidth: '160px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '8px 12px',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
  },
  filterSelect: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '8px 10px',
    color: '#aaa',
    fontSize: '13px',
    outline: 'none',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '16px',
    transition: 'border-color 0.2s',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  priorityDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  cardTitle: { color: '#fff', fontWeight: 600, fontSize: '15px' },
  cardDesc: { color: '#666', fontSize: '13px', margin: '0 0 10px', lineHeight: 1.5 },
  cardMeta: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' },
  chip: {
    fontSize: '11px',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px',
    padding: '2px 7px',
    color: '#888',
    textTransform: 'capitalize',
  },
  timestamp: { color: '#444', fontSize: '11px', marginLeft: 'auto' },
  author: { color: '#555', fontSize: '11px' },
  statusBtn: {
    marginTop: '10px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    padding: '5px 12px',
    color: '#00d4ff',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};
