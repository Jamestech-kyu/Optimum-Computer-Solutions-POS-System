import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute({
  children,
  requireManager = false,
}) {
  const { user, loading, isManager } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireManager && !isManager) {
    return <Navigate to="/sales" replace />;
  }

  return children;
}