import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <span style={styles.logo}>🌱</span>
        <span style={styles.brandName}>SmartSeason</span>
      </div>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/fields" style={styles.link}>Fields</Link>
        {isAdmin && <Link to="/fields/new" style={styles.link}>+ New Field</Link>}
        {isAdmin && <Link to="/agents/new" style={styles.link}>+ New Agent</Link>}
      </div>
      <div style={styles.user}>
        <span style={styles.userInfo}>{user?.name} <span style={styles.badge}>{user?.role}</span></span>
        <button onClick={handleLogout} style={styles.logout}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#2d5a3d', color: '#fff', padding: '0.75rem 2rem', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  brand: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  logo: { fontSize: '1.5rem' },
  brandName: { fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.5px' },
  links: { display: 'flex', gap: '1.5rem' },
  link: { color: '#c8e6c9', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, transition: 'color 0.2s' },
  user: { display: 'flex', alignItems: 'center', gap: '1rem' },
  userInfo: { fontSize: '0.9rem', color: '#e8f5e9' },
  badge: { background: '#81c784', color: '#1b5e20', padding: '0.1rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, marginLeft: '0.4rem', textTransform: 'uppercase' },
  logout: { background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem' },
};
