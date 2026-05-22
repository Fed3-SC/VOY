import { useState, useEffect } from 'react';
import { useSearchParams as useRouterSearchParams, useNavigate } from 'react-router-dom';
import TripCard from '../components/trips/TripCard';
import { searchTrips, getCities } from '../services/api';
import { useBooking } from '../context/BookingContext';
import { formatDate } from '../utils/formatters';
import './SearchResultsPage.css';

export default function SearchResultsPage() {
  const [routerParams] = useRouterSearchParams();
  const navigate = useNavigate();
  const { setSelectedTrip } = useBooking();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState([]);
  const [sortBy, setSortBy] = useState('price');

  const origin = parseInt(routerParams.get('origin'));
  const destination = parseInt(routerParams.get('destination'));
  const date = routerParams.get('date') || '';
  const passengers = parseInt(routerParams.get('passengers')) || 1;

  useEffect(() => {
    getCities().then(res => {
      if (res.success) setCities(res.data);
    });
  }, []);

  useEffect(() => {
    if (!origin || !destination) return;
    setLoading(true);
    searchTrips({ origin, destination, date, passengers }).then(res => {
      if (res.success) setTrips(res.data);
      setLoading(false);
    });
  }, [origin, destination, date, passengers]);

  const originCity = cities.find(c => c.id === origin);
  const destCity = cities.find(c => c.id === destination);

  const sortedTrips = [...trips].sort((a, b) => {
    switch (sortBy) {
      case 'price': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'departure': return new Date(a.departureTime) - new Date(b.departureTime);
      case 'duration': return a.durationMinutes - b.durationMinutes;
      default: return 0;
    }
  });

  const handleSelectTrip = (trip) => {
    setSelectedTrip({ ...trip, passengers });
    navigate(`/reserva/${trip.id}`);
  };

  return (
    <div className="results-page">
      <div className="results-header">
        <div className="container">
          <div className="results-header-content">
            <div className="results-route-info">
              <h1 className="results-title">
                {originCity?.name || '...'} → {destCity?.name || '...'}
              </h1>
              <div className="results-meta">
                {date && <span className="results-meta-item">📅 {formatDate(date + 'T00:00:00')}</span>}
                <span className="results-meta-item">👥 {passengers} {passengers === 1 ? 'pasajero' : 'pasajeros'}</span>
                <span className="results-meta-item">🚌 {trips.length} viajes encontrados</span>
              </div>
            </div>
            <button className="results-back-btn" onClick={() => navigate('/')} id="back-to-search">
              ← Nueva búsqueda
            </button>
          </div>
        </div>
      </div>

      <div className="container results-content">
        {/* Sort bar */}
        <div className="results-sort-bar">
          <span className="sort-label">Ordenar por:</span>
          <div className="sort-options">
            {[
              { value: 'price', label: 'Menor precio' },
              { value: 'price-desc', label: 'Mayor precio' },
              { value: 'departure', label: 'Horario' },
              { value: 'duration', label: 'Duración' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`sort-btn ${sortBy === opt.value ? 'active' : ''}`}
                onClick={() => setSortBy(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        ) : sortedTrips.length === 0 ? (
          <div className="results-empty">
            <span className="results-empty-icon">🔍</span>
            <h2>No encontramos viajes</h2>
            <p>Probá con otras fechas o destinos diferentes</p>
            <button className="results-empty-btn" onClick={() => navigate('/')}>
              Volver a buscar
            </button>
          </div>
        ) : (
          <div className="results-list stagger-children">
            {sortedTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} onSelect={handleSelectTrip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
