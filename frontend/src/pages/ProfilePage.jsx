import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-empty animate-fade-in">
            <span className="profile-empty-icon">🔐</span>
            <h2>Iniciá sesión para ver tu perfil</h2>
            <p>Accedé a tu información personal</p>
            <button
              className="profile-btn"
              onClick={() => navigate('/auth?redirect=/perfil')}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="profile-title animate-fade-in">👤 Mi Cuenta</h1>

        <div className="profile-card animate-fade-in-up">
          <div className="profile-avatar-section">
            <div className="profile-avatar-lg">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-avatar-info">
              <h2 className="profile-fullname">
                {user.name} {user.lastName || ''}
              </h2>
              <p className="profile-member-since">
                Miembro de VOY
              </p>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-field">
              <span className="profile-field-label">📧 Email</span>
              <span className="profile-field-value">{user.email}</span>
            </div>
            {user.phone && (
              <div className="profile-field">
                <span className="profile-field-label">📱 Teléfono</span>
                <span className="profile-field-value">{user.phone}</span>
              </div>
            )}
            {user.dni && (
              <div className="profile-field">
                <span className="profile-field-label">🪪 DNI</span>
                <span className="profile-field-value">{user.dni}</span>
              </div>
            )}
          </div>
        </div>

        <div className="profile-actions animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <button className="profile-action-btn" onClick={() => navigate('/mis-viajes')}>
            🎫 Ver mis viajes
          </button>
          <button className="profile-action-btn secondary" onClick={() => navigate('/')}>
            🔍 Buscar viajes
          </button>
        </div>
      </div>
    </div>
  );
}
