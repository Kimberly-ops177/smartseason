import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logo}>🌱</span>
          <h1 style={styles.title}>SmartSeason</h1>
          <p style={styles.subtitle}>Field Monitoring System</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={styles.input} placeholder="you@example.com" required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={styles.input} placeholder="••••••••" required
            />
          </div>
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={styles.demo}>
          <p style={styles.demoTitle}>Demo Credentials</p>
          <p style={styles.demoText}>Admin: admin@smartseason.com / admin123</p>
          <p style={styles.demoText}>Agent: agent@smartseason.com / agent123</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1b5e20 0%, #4a7c59 100%)' },
  card: { background: '#fff', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  header: { textAlign: 'center', marginBottom: '2rem' },
  logo: { fontSize: '3rem' },
  title: { fontSize: '1.8rem', fontWeight: 700, color: '#2d5a3d', marginTop: '0.5rem' },
  subtitle: { color: '#666', fontSize: '0.95rem', marginTop: '0.3rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.9rem', fontWeight: 600, color: '#333' },
  input: { padding: '0.75rem 1rem', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' },
  btn: { background: '#2d5a3d', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.85rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' },
  error: { background: '#ffebee', color: '#c62828', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' },
  demo: { marginTop: '1.5rem', padding: '1rem', background: '#f9fbe7', borderRadius: '8px', borderLeft: '3px solid #8bc34a' },
  demoTitle: { fontSize: '0.8rem', fontWeight: 700, color: '#558b2f', marginBottom: '0.4rem' },
  demoText: { fontSize: '0.8rem', color: '#555', lineHeight: 1.6 },
};
