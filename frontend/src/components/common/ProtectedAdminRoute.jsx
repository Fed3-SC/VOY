import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente guard para rutas de administración.
 * 
 * - Si el usuario no está autenticado → redirige a /auth
 * - Si no es admin → redirige a /
 * - Si está cargando → muestra spinner
 * - Si es admin → renderiza los children
 */
export default function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Mientras se verifica la autenticación, mostrar spinner
  if (loading) {
    return (
      <div className="spinner-container" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Si no es admin, redirigir al inicio
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Es admin, mostrar el contenido protegido
  return children;
}
