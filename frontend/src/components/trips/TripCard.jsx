import { formatTime, formatDuration, formatPrice, formatServiceType, getServiceTypeColor } from '../../utils/formatters';
import './TripCard.css';

export default function TripCard({ trip, onSelect }) {
  return (
    <div className="trip-card animate-fade-in" id={`trip-card-${trip.id}`}>
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
  );
}
