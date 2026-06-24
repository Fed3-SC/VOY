import { useNavigate } from 'react-router-dom';
import { formatTime, formatDuration, formatPrice, formatServiceType, getServiceTypeColor } from '../../utils/formatters';
import { destinationImages, getImageKeyByCityName } from '../../utils/imageMap';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import './TripCard.css';

/* Import all images from src/img */
const imageModules = import.meta.glob('../../img/*.{jpg,png}', { eager: true });

function getDestImage(cityName) {
  const key = getImageKeyByCityName(cityName);
  if (!key) return null;
  const filename = destinationImages[key];
  if (!filename) return null;
  const matchingKey = Object.keys(imageModules).find(k => k.endsWith(`/${filename}`));
  return matchingKey ? imageModules[matchingKey].default : null;
}

export default function TripCard({ trip, onSelect }) {
  const destImg = getDestImage(trip.destination?.name);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fav = isFavorite(trip.id);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    await toggleFavorite(trip.id);
  };

  return (
    <div className="trip-card animate-fade-in" id={`trip-card-${trip.id}`}>
      {/* Destination Image */}
      {destImg && (
        <div className="trip-card-image">
          <img src={destImg} alt={trip.destination?.name} className="trip-card-img" loading="lazy" />
          <div className="trip-card-img-overlay" />
        </div>
      )}

      <div className="trip-card-body">
        <div className="trip-card-company">
          <div className="trip-company-logo">
            {trip.company.name.charAt(0)}
          </div>
          <div className="trip-company-info">
            <span className="trip-company-name">{trip.company.name}</span>
            <span className="trip-company-rating">⭐ {trip.company.rating}</span>
          </div>
        </div>

        <div className="trip-card-route">
          <div className="trip-time-block">
            <span className="trip-time">{formatTime(trip.departureTime)}</span>
            <span className="trip-city">{trip.origin.name}</span>
            <span className="trip-terminal">{trip.origin.terminalName}</span>
          </div>

          <div className="trip-duration-block">
            <span className="trip-duration">{formatDuration(trip.durationMinutes)}</span>
            <div className="trip-line">
              <span className="trip-dot"></span>
              <span className="trip-dash"></span>
              <span className="trip-dot"></span>
            </div>
            <span className="trip-service" style={{ color: getServiceTypeColor(trip.serviceType) }}>
              {formatServiceType(trip.serviceType)}
            </span>
          </div>

          <div className="trip-time-block">
            <span className="trip-time">{formatTime(trip.arrivalTime)}</span>
            <span className="trip-city">{trip.destination.name}</span>
            <span className="trip-terminal">{trip.destination.terminalName}</span>
          </div>
        </div>

        <div className="trip-card-right">
          {/* Botón favorito */}
          <button
            className={`trip-favorite-btn ${fav ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            aria-label={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            id={`fav-btn-${trip.id}`}
            title={!isAuthenticated ? 'Iniciá sesión para guardar favoritos' : (fav ? 'Quitar de favoritos' : 'Guardar en favoritos')}
          >
            <svg
              viewBox="0 0 24 24"
              className="trip-favorite-icon"
              fill={fav ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          <div className="trip-price-block">
            <span className="trip-price">{formatPrice(trip.price)}</span>
            <span className="trip-price-note">por persona</span>
          </div>

          <div className="trip-seats">
            <span className={`trip-seats-count ${trip.availableSeats <= 5 ? 'low' : ''}`}>
              {trip.availableSeats <= 5 ? '⚠️' : '✅'} {trip.availableSeats} asientos
            </span>
          </div>

          <button
            className="trip-select-btn"
            onClick={() => onSelect(trip)}
            id={`select-trip-${trip.id}`}
          >
            Seleccionar
          </button>
        </div>
      </div>

      {/* Características del viaje */}
      {trip.features && trip.features.length > 0 && (
        <div className="trip-card-features" id={`trip-features-${trip.id}`}>
          <span className="trip-features-title">Características</span>
          <div className="trip-features-list">
            {trip.features.map(feature => (
              <span key={feature.id} className="trip-feature-chip" title={feature.name}>
                <span className="trip-feature-icon">{feature.icon}</span>
                <span className="trip-feature-name">{feature.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
