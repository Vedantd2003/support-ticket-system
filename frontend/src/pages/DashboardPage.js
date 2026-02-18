import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import TicketForm from '../components/TicketForm';
import TicketList from '../components/TicketList';
import StatsDashboard from '../components/StatsDashboard';
import ThreeBackground from '../three/ThreeBackground';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [tab, setTab] = useState('tickets'); // 'tickets' | 'stats'

  const handleCreated = () => setRefreshKey((k) => k + 1);

  return (
    <div style={styles.page}>
      <ThreeBackground />
      <div style={styles.layout}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.logo}>⚡ SupportOS</div>
          <nav style={styles.nav}>
            <button style={{ ...styles.tab, ...(tab === 'tickets' ? styles.activeTab : {}) }} onClick={() => setTab('tickets')}>
              🎫 Tickets
            </button>
            <button style={{ ...styles.tab, ...(tab === 'stats' ? styles.activeTab : {}) }} onClick={() => setTab('stats')}>
              📊 Stats
            </button>
          </nav>
          <div style={styles.userArea}>
            {user ? (
              <>
                <span style={styles.username}>@{user.username}</span>
                <button style={styles.logoutBtn} onClick={logout}>Sign Out</button>
              </>
            ) : (
              <span style={styles.guestLabel}>Guest</span>
            )}
          </div>
        </header>

        {/* Content */}
        <main style={styles.main}>
          {tab === 'tickets' ? (
            <>
              <TicketForm onCreated={handleCreated} />
              <TicketList refreshKey={refreshKey} />
            </>
          ) : (
            <StatsDashboard refreshKey={refreshKey} />
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)',
    fontFamily: "'Syne', 'Space Mono', monospace",
    color: '#fff',
  },
  layout: { position: 'relative', zIndex: 1, maxWidth: '960px', margin: '0 auto', padding: '0 20px' },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '18px 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    marginBottom: '28px',
  },
  logo: { color: '#fff', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px', marginRight: 'auto' },
  nav: { display: 'flex', gap: '4px' },
  tab: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '7px 14px',
    color: '#666',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  activeTab: {
    background: 'rgba(123,47,247,0.2)',
    borderColor: '#7b2ff7',
    color: '#c084fc',
  },
  userArea: { display: 'flex', alignItems: 'center', gap: '10px' },
  username: { color: '#555', fontSize: '13px' },
  guestLabel: { color: '#444', fontSize: '13px' },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    padding: '5px 10px',
    color: '#555',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  main: { paddingBottom: '60px' },
};
