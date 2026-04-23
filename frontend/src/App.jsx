import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fields from './pages/Fields';
import FieldDetail from './pages/FieldDetail';
import CreateField from './pages/CreateField';
import CreateAgent from './pages/CreateAgent';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={styles.loading}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return children;
};

export default function App() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/fields" element={<PrivateRoute><Fields /></PrivateRoute>} />
        <Route path="/fields/new" element={<AdminRoute><CreateField /></AdminRoute>} />
        <Route path="/fields/:id" element={<PrivateRoute><FieldDetail /></PrivateRoute>} />
        <Route path="/agents/new" element={<AdminRoute><CreateAgent /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
}

const styles = {
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#4a7c59' }
};
