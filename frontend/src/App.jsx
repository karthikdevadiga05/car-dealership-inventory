import { useAuth } from './AuthContext';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="p-10 text-center text-muted">Loading...</p>;
  }
  return user ? <Dashboard /> : <AuthPage />;
}