import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFavorites } from '../services/api';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatTime, formatDuration, formatServiceType } from '../utils/formatters';
import { destinationImages, getImageKeyByCityName } from '../utils/imageMap';
import './FavoritesPage.css';

/* Import all images from src/img */
const imageModules = import.meta.glob('../img/*.{jpg,png}', { eager: true });

function getDestImage(cityName) {
  const key = getImageKeyByCityName(cityName);
  if (!key) return null;
  const filename = destinationImages[key];
  if (!filename) return null;
  const matchingKey = Object.keys(imageModules).find(k => k.endsWith(`/${filename}`));
  return matchingKey ? imageModules[matchingKey].default : null;
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth?redirect=/favoritos');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Cargar favoritos completos desde la API
  const loadFavorites = () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    getFavorites().then(res => {
      if (res.success) {
        setFavorites(res.data);
      } else {
        setError('No se pudieron cargar tus favoritos.');
      }
      setLoading(false);
    }).catch(() => {
      setError('Error de conexión. Verificá tu internet e intentá de nuevo.');
      setLoading(false);
    });
  };

  useEffect(() => {
    loadFavorites();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sincronizar con el contexto: eliminar localmente los que ya no son favoritos
  useEffect(() => {
    setFavorites(prev => prev.filter(f => favoriteIds.has(Number(f.id))));
  }, [favoriteIds]);

  const handleRemoveFavorite = async (tripId) => {
    await toggleFavorite(tripId);
    // El useEffect de arriba se encarga de actualizar la lista
  };

  const handleViewTrip = (tripId) => {
    navigate(`/reserva/${tripId}`);
  };

  if (authLoading || (loading && !error)) {
    return (
      <div className="fav-page">
        <div className="container">
          <div className="spinner-container" style={{ minHeight: '60vh' }}>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fav-page">
      <div className="fav-header">
        <div className="container">
          <div className="fav-header-content">
            <div>
              <h1 className="fav-title">❤️ Mis Favoritos</h1>
              <p className="fav-subtitle">
                {favorites.length > 0
                  ? `${favorites.length} viaje${favorites.length !== 1 ? 's' : ''} guardado${favorites.length !== 1 ? 's' : ''}`
                  : 'Guardá tus viajes favoritos para acceder rápido'}
              </p>
            </div>
            <button className="fav-back-btn" onClick={() => navigate('/')}>
              ← Seguir explorando
            </button>
          </div>
        </div>
      </div>

      <div className="container fav-content">
        {error ? (
          <div className="fav-error">
            <span className="fav-error-icon">⚠️</span>
            <h2>No pudimos cargar tus favoritos</h2>
            <p>{error}</p>
            <button className="fav-retry-btn" onClick={loadFavorites}>
              🔄 Reintentar
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="fav-empty">
            <div className="fav-empty-icon">💔</div>
            <h2>Aún no tenés favoritos</h2>
            <p>Explorá viajes y guardá los que más te gusten tocando el corazón ❤️</p>
            <button className="fav-explore-btn" onClick={() => navigate('/')}>
              Explorar viajes
            </button>
          </div>
        ) : (
          <div className="fav-grid">
            {favorites.map(trip => {
              const destImg = getDestImage(trip.destination?.name);
              return (
                <div
                  key={trip.id}
                  className="fav-card animate-fade-in"
                  id={`fav-card-${trip.id}`}
                >
                  {/* Image */}
                  <div className="fav-card-image" onClick={() => handleViewTrip(trip.id)}>
                    {destImg ? (
                      <img src={destImg} alt={trip.destination?.name} className="fav-card-img" loading="lazy" />
                    ) : (
                      <div className="fav-card-img-placeholder">
                        <span>🗺️</span>
                      </div>
                    )}
                    <div className="fav-card-img-overlay">
                      <span className="fav-card-dest">{trip.destination?.name}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="fav-card-body">
                    {/* Route */}
                    <div className="fav-card-route">
                      <span className="fav-route-origin">{trip.origin?.name}</span>
                      <span className="fav-route-arrow">→</span>
                      <span className="fav-route-dest">{trip.destination?.name}</span>
                    </div>

                    {/* Details */}
                    <div className="fav-card-details">
                      <div className="fav-detail">
                        <span className="fav-detail-label">🏢 Empresa</span>
                        <span className="fav-detail-value">{trip.company?.name}</span>
                      </div>
                      <div className="fav-detail">
                        <span className="fav-detail-label">🕐 Horario</span>
                        <span className="fav-detail-value">{formatTime(trip.departureTime)}</span>
                      </div>
                      <div className="fav-detail">
                        <span className="fav-detail-label">⏱️ Duración</span>
                        <span className="fav-detail-value">{formatDuration(trip.durationMinutes)}</span>
                      </div>
                      <div className="fav-detail">
                        <span className="fav-detail-label">💺 Tipo</span>
                        <span className="fav-detail-value">{formatServiceType(trip.serviceType)}</span>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="fav-card-footer">
                      <div className="fav-card-price">
                        <span className="fav-price">{formatPrice(trip.price)}</span>
                        <span className="fav-price-note">por persona</span>
                      </div>
                      <div className="fav-card-actions">
                        <button
                          className="fav-remove-btn"
                          onClick={() => handleRemoveFavorite(trip.id)}
                          id={`remove-fav-${trip.id}`}
                          aria-label="Quitar de favoritos"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" width="18" height="18">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                        <button
                          className="fav-view-btn"
                          onClick={() => handleViewTrip(trip.id)}
                          id={`view-trip-${trip.id}`}
                        >
                          Ver viaje
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
