import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import './index.css';

function AppInner() {
  const { user, loading } = useAuth();
  const [bypassed, setBypassed] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#7b2ff7', fontSize: '24px' }}>⚡</span>
      </div>
    );
  }

  if (!user && !bypassed) {
    return <AuthPage onSuccess={() => setBypassed(true)} />;
  }

  return <DashboardPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
