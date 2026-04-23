import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const STAGES = ['planted', 'growing', 'ready', 'harvested'];

export default function CreateField() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', crop_type: '', planting_date: '', stage: 'planted', assigned_agent_id: '' });
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/agents').then(res => setAgents(res.data));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/fields', form);
      navigate('/fields');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create field');
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Link to="/fields" style={styles.back}>← Back to Fields</Link>
      <div style={styles.card}>
        <h1 style={styles.title}>Create New Field</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          {[
            { label: 'Field Name', name: 'name', type: 'text', placeholder: 'e.g. North Farm Block A' },
            { label: 'Crop Type', name: 'crop_type', type: 'text', placeholder: 'e.g. Maize, Wheat, Tomatoes' },
            { label: 'Planting Date', name: 'planting_date', type: 'date' },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input name={name} type={type} value={form[name]} onChange={handleChange}
                style={styles.input} placeholder={placeholder} required />
            </div>
          ))}
          <div style={styles.field}>
            <label style={styles.label}>Initial Stage</label>
            <select name="stage" value={form.stage} onChange={handleChange} style={styles.input}>
              {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Assign to Agent (optional)</label>
            <select name="assigned_agent_id" value={form.assigned_agent_id} onChange={handleChange} style={styles.input}>
              <option value="">-- Unassigned --</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.email})</option>)}
            </select>
          </div>
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Creating...' : 'Create Field'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: '600px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  back: { color: '#2d5a3d', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' },
  card: { background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#2d5a3d', marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.9rem', fontWeight: 600, color: '#333' },
  input: { padding: '0.7rem 1rem', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' },
  btn: { background: '#2d5a3d', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.85rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' },
  error: { background: '#ffebee', color: '#c62828', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' },
};
