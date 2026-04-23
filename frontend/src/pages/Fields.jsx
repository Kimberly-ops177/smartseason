import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import api from '../api/axios';

export default function Fields() {
  const { isAdmin } = useAuth();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const endpoint = isAdmin ? '/fields' : '/fields/my';
    api.get(endpoint).then(res => {
      setFields(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isAdmin]);

  const filtered = fields.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.crop_type.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!confirm('Delete this field?')) return;
    await api.delete(`/fields/${id}`);
    setFields(fields.filter(f => f.id !== id));
  };

  if (loading) return <div style={styles.loading}>Loading fields...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>{isAdmin ? 'All Fields' : 'My Assigned Fields'}</h1>
        <div style={styles.headerRight}>
          <input
            style={styles.search} placeholder="Search fields..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
          {isAdmin && <Link to="/fields/new" style={styles.btn}>+ New Field</Link>}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <p>🌱 No fields found.</p>
          {isAdmin && <Link to="/fields/new" style={styles.btn}>Create your first field</Link>}
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(field => (
            <div key={field.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.fieldName}>{field.name}</h3>
                <StatusBadge status={field.status} stage={field.stage} />
              </div>
              <div style={styles.cardBody}>
                <div style={styles.info}>🌿 <strong>Crop:</strong> {field.crop_type}</div>
                <div style={styles.info}>📅 <strong>Planted:</strong> {new Date(field.planting_date).toLocaleDateString()}</div>
                {field.agent_name && <div style={styles.info}>👤 <strong>Agent:</strong> {field.agent_name}</div>}
                {field.latest_note && <div style={styles.note}>💬 {field.latest_note}</div>}
              </div>
              <div style={styles.cardFooter}>
                <Link to={`/fields/${field.id}`} style={styles.viewBtn}>View Details</Link>
                {isAdmin && (
                  <button onClick={() => handleDelete(field.id)} style={styles.deleteBtn}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#4a7c59' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '1.7rem', fontWeight: 700, color: '#1a1a1a' },
  headerRight: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  search: { padding: '0.6rem 1rem', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', width: '220px' },
  btn: { background: '#2d5a3d', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '4rem', color: '#666', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' },
  card: { background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' },
  fieldName: { fontSize: '1.1rem', fontWeight: 700, color: '#2d5a3d' },
  cardBody: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  info: { fontSize: '0.88rem', color: '#444' },
  note: { fontSize: '0.85rem', color: '#666', fontStyle: 'italic', background: '#f9fbe7', padding: '0.5rem', borderRadius: '6px', marginTop: '0.3rem' },
  cardFooter: { display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f0f0f0' },
  viewBtn: { background: '#e8f5e9', color: '#2d5a3d', padding: '0.45rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' },
  deleteBtn: { background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', padding: '0.45rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
};
