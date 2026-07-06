import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCities } from '../services/api';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getCities().then(res => {
      if (res.success) setCities(res.data);
    });
  }, []);

  const handleResidenceChange = async (e) => {
    const cityId = e.target.value ? parseInt(e.target.value) : null;
    setIsUpdating(true);
    setMessage('');
    const res = await updateProfile({ residenceCityId: cityId });
    if (res.success) {
      setMessage('Ciudad guardada. ¡Mejoramos tus recomendaciones!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Error al guardar la ciudad.');
    }
    setIsUpdating(false);
  };

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
            
            <div className="profile-field residence-field" style={{ gridColumn: '1 / -1', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <span className="profile-field-label">📍 Ciudad de Residencia</span>
              <div className="residence-select-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <select
                  className="profile-input"
                  value={user.residenceCityId || ''}
                  onChange={handleResidenceChange}
                  disabled={isUpdating}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '1rem' }}
                >
                  <option value="">Seleccioná tu ciudad...</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}, {city.province}</option>
                  ))}
                </select>
                {isUpdating && <span className="residence-spinner">⏳</span>}
              </div>
              <p className="residence-help" style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '0.5rem' }}>
                Usamos tu ciudad para recomendarte los mejores viajes desde tu ubicación.
              </p>
              {message && <div className="residence-message" style={{ color: message.includes('Error') ? 'var(--color-error)' : 'var(--color-success)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 500 }}>{message}</div>}
            </div>
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
