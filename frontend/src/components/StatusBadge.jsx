export default function StatusBadge({ status, stage }) {
  const statusColors = {
    active: { bg: '#e8f5e9', color: '#2e7d32', label: 'Active' },
    at_risk: { bg: '#fff3e0', color: '#e65100', label: 'At Risk' },
    completed: { bg: '#e3f2fd', color: '#1565c0', label: 'Completed' },
  };
  const stageColors = {
    planted: { bg: '#f3e5f5', color: '#6a1b9a', label: 'Planted' },
    growing: { bg: '#e8f5e9', color: '#1b5e20', label: 'Growing' },
    ready: { bg: '#fff9c4', color: '#f57f17', label: 'Ready' },
    harvested: { bg: '#e0f2f1', color: '#00695c', label: 'Harvested' },
  };

  const renderBadge = (config, key) => (
    <span key={key} style={{
      background: config.bg, color: config.color,
      padding: '0.2rem 0.6rem', borderRadius: '999px',
      fontSize: '0.78rem', fontWeight: 600, marginRight: '0.3rem'
    }}>
      {config.label}
    </span>
  );

  return (
    <span>
      {status && statusColors[status] && renderBadge(statusColors[status], 'status')}
      {stage && stageColors[stage] && renderBadge(stageColors[stage], 'stage')}
    </span>
  );
}
