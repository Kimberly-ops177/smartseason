import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

const STAGES = ['planted', 'growing', 'ready', 'harvested'];

export default function FieldDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchField = () => {
    api.get(`/fields/${id}`).then(res => {
      setField(res.data);
      setStage(res.data.stage);
      setLoading(false);
    }).catch(() => { navigate('/fields'); });
  };

  useEffect(() => { fetchField(); }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post(`/fields/${id}/updates`, { stage, notes });
      setSuccess('Field updated successfully!');
      setNotes('');
      fetchField();
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading field...</div>;
  if (!field) return null;

  return (
    <div style={styles.page}>
      <Link to="/fields" style={styles.back}>← Back to Fields</Link>

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{field.name}</h1>
          <div style={{ marginTop: '0.5rem' }}>
            <StatusBadge status={field.status} stage={field.stage} />
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Field Info */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Field Information</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Crop Type</span><span style={styles.infoValue}>{field.crop_type}</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Planting Date</span><span style={styles.infoValue}>{new Date(field.planting_date).toLocaleDateString()}</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Current Stage</span><span style={styles.infoValue} style={{ textTransform: 'capitalize' }}>{field.stage}</span></div>
            <div style={styles.infoItem}><span style={styles.infoLabel}>Assigned Agent</span><span style={styles.infoValue}>{field.agent_name || 'Unassigned'}</span></div>
          </div>
        </div>

        {/* Update Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Log an Update</h2>
          <form onSubmit={handleUpdate} style={styles.form}>
            {success && <div style={styles.success}>{success}</div>}
            {error && <div style={styles.error}>{error}</div>}
            <div style={styles.formField}>
              <label style={styles.label}>Update Stage</label>
              <select value={stage} onChange={e => setStage(e.target.value)} style={styles.select}>
                {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div style={styles.formField}>
              <label style={styles.label}>Notes / Observations</label>
              <textarea
                value={notes} onChange={e => setNotes(e.target.value)}
                style={styles.textarea} placeholder="Add any observations about the field..."
                rows={4}
              />
            </div>
            <button type="submit" style={styles.btn} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Update'}
            </button>
          </form>
        </div>
      </div>

      {/* Update History */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Update History</h2>
        {field.updates?.length === 0 ? (
          <p style={styles.empty}>No updates logged yet.</p>
        ) : (
          <div style={styles.timeline}>
            {field.updates?.map(update => (
              <div key={update.id} style={styles.timelineItem}>
                <div style={styles.timelineDot} />
                <div style={styles.timelineContent}>
                  <div style={styles.timelineHeader}>
                    <span style={styles.timelineAgent}>{update.agent_name}</span>
                    <span style={styles.timelineDate}>{new Date(update.created_at).toLocaleString()}</span>
                  </div>
                  <div style={styles.timelineStage}>Stage: <strong style={{ textTransform: 'capitalize' }}>{update.stage}</strong></div>
                  {update.notes && <div style={styles.timelineNotes}>{update.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#4a7c59' },
  back: { color: '#2d5a3d', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: '1.8rem', fontWeight: 700, color: '#1a1a1a' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' },
  card: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: '1rem', fontWeight: 700, color: '#2d5a3d', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e8f5e9' },
  infoGrid: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  infoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: '0.88rem', color: '#666', fontWeight: 500 },
  infoValue: { fontSize: '0.9rem', color: '#1a1a1a', fontWeight: 600 },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formField: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.88rem', fontWeight: 600, color: '#333' },
  select: { padding: '0.65rem', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' },
  textarea: { padding: '0.65rem', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  btn: { background: '#2d5a3d', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' },
  success: { background: '#e8f5e9', color: '#2e7d32', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' },
  error: { background: '#ffebee', color: '#c62828', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' },
  empty: { color: '#999', fontStyle: 'italic', fontSize: '0.9rem' },
  timeline: { display: 'flex', flexDirection: 'column', gap: '0' },
  timelineItem: { display: 'flex', gap: '1rem', paddingBottom: '1rem', position: 'relative' },
  timelineDot: { width: '12px', height: '12px', borderRadius: '50%', background: '#2d5a3d', marginTop: '4px', flexShrink: 0 },
  timelineContent: { flex: 1, background: '#f9fbe7', borderRadius: '8px', padding: '0.75rem', borderLeft: '3px solid #c5e1a5' },
  timelineHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' },
  timelineAgent: { fontWeight: 700, fontSize: '0.88rem', color: '#2d5a3d' },
  timelineDate: { fontSize: '0.8rem', color: '#999' },
  timelineStage: { fontSize: '0.85rem', color: '#555', marginBottom: '0.3rem' },
  timelineNotes: { fontSize: '0.88rem', color: '#333', fontStyle: 'italic' },
};
