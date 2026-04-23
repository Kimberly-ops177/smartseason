import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const StatCard = ({ label, value, color, emoji }) => (
  <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
    <span style={styles.statEmoji}>{emoji}</span>
    <div style={{ ...styles.statValue, color }}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
);

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/fields/dashboard').then(res => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome back, {user?.name} 👋</h1>
          <p style={styles.subtitle}>{isAdmin ? 'Admin Overview — All Fields' : 'Your Assigned Fields'}</p>
        </div>
        {isAdmin && (
          <div style={styles.actions}>
            <Link to="/fields/new" style={styles.btnPrimary}>+ New Field</Link>
            <Link to="/agents/new" style={styles.btnSecondary}>+ New Agent</Link>
          </div>
        )}
      </div>

      {stats && (
        <>
          <div style={styles.statsGrid}>
            <StatCard label="Total Fields" value={stats.total} color="#2d5a3d" emoji="🌾" />
            <StatCard label="Active" value={stats.active} color="#388e3c" emoji="✅" />
            <StatCard label="At Risk" value={stats.at_risk} color="#e65100" emoji="⚠️" />
            <StatCard label="Completed" value={stats.completed} color="#1565c0" emoji="🏁" />
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Stage Breakdown</h2>
            <div style={styles.stagesGrid}>
              {Object.entries(stats.by_stage).map(([stage, count]) => (
                <div key={stage} style={styles.stageCard}>
                  <div style={styles.stageCount}>{count}</div>
                  <div style={styles.stageName}>{stage.charAt(0).toUpperCase() + stage.slice(1)}</div>
                </div>
              ))}
            </div>
          </div>

          {stats.at_risk > 0 && (
            <div style={styles.alert}>
              ⚠️ <strong>{stats.at_risk} field{stats.at_risk > 1 ? 's' : ''} at risk</strong> — planted or growing for over 90 days without reaching harvest.
              <Link to="/fields" style={styles.alertLink}> View fields →</Link>
            </div>
          )}
        </>
      )}

      <div style={styles.quickLinks}>
        <Link to="/fields" style={styles.quickLink}>
          <span style={styles.quickIcon}>📋</span>
          <span>{isAdmin ? 'View All Fields' : 'My Fields'}</span>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#4a7c59', fontSize: '1.1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '1.8rem', fontWeight: 700, color: '#1a1a1a' },
  subtitle: { color: '#666', marginTop: '0.3rem' },
  actions: { display: 'flex', gap: '0.75rem' },
  btnPrimary: { background: '#2d5a3d', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' },
  btnSecondary: { background: '#fff', color: '#2d5a3d', padding: '0.6rem 1.2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', border: '1.5px solid #2d5a3d' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' },
  statEmoji: { fontSize: '2rem' },
  statValue: { fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0' },
  statLabel: { color: '#666', fontSize: '0.9rem', fontWeight: 500 },
  section: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#2d5a3d', marginBottom: '1rem' },
  stagesGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  stageCard: { textAlign: 'center', padding: '1rem', background: '#f4f6f4', borderRadius: '10px' },
  stageCount: { fontSize: '2rem', fontWeight: 700, color: '#2d5a3d' },
  stageName: { fontSize: '0.85rem', color: '#555', marginTop: '0.3rem', textTransform: 'capitalize' },
  alert: { background: '#fff3e0', border: '1px solid #ffcc02', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', color: '#5d4037', fontSize: '0.95rem' },
  alertLink: { color: '#e65100', fontWeight: 600 },
  quickLinks: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  quickLink: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: '10px', padding: '0.9rem 1.3rem', textDecoration: 'none', color: '#333', fontWeight: 600, fontSize: '0.95rem' },
  quickIcon: { fontSize: '1.3rem' },
};
