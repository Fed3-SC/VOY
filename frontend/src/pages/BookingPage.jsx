import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { getTripById } from '../services/api';
import { formatTime, formatDate, formatDuration, formatPrice, formatServiceType } from '../utils/formatters';
import './BookingPage.css';

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedTrip, setSelectedTrip } = useBooking();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!selectedTrip) {
      getTripById(parseInt(id)).then(res => {
        if (res.success) {
          setSelectedTrip({ ...res.data, passengers: 1 });
        } else {
          navigate('/');
        }
      });
    }
  }, [id, selectedTrip, setSelectedTrip, navigate]);

  if (!selectedTrip) {
    return (
      <div className="spinner-container" style={{ minHeight: '80vh', paddingTop: 'var(--navbar-height)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const handleContinue = () => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/pago');
    } else {
      navigate('/pago');
    }
  };

  const totalPrice = selectedTrip.price * (selectedTrip.passengers || 1);

  return (
    <div className="booking-page">
      <div className="container">
        <div className="booking-header">
          <button className="booking-back" onClick={() => navigate(-1)}>← Volver a resultados</button>
          <h1 className="booking-title">Resumen de tu viaje</h1>
        </div>

        <div className="booking-grid">
          {/* Main content */}
          <div className="booking-main">
            {/* Trip details card */}
            <div className="booking-card animate-fade-in">
              <div className="booking-card-header">
                <div className="booking-company">
                  <div className="booking-company-logo">{selectedTrip.company.name.charAt(0)}</div>
                  <div>
                    <span className="booking-company-name">{selectedTrip.company.name}</span>
                    <span className="booking-company-rating">⭐ {selectedTrip.company.rating}</span>
                  </div>
                </div>
                <span className="badge badge-primary">{formatServiceType(selectedTrip.serviceType)}</span>
              </div>

              <div className="booking-route">
                <div className="booking-stop">
                  <span className="booking-stop-time">{formatTime(selectedTrip.departureTime)}</span>
                  <div className="booking-stop-dot origin"></div>
                  <div className="booking-stop-info">
                    <span className="booking-stop-city">{selectedTrip.origin.name}</span>
                    <span className="booking-stop-terminal">{selectedTrip.origin.terminalName}</span>
                  </div>
                </div>

                <div className="booking-route-line">
                  <span className="booking-route-duration">{formatDuration(selectedTrip.durationMinutes)}</span>
                </div>

                <div className="booking-stop">
                  <span className="booking-stop-time">{formatTime(selectedTrip.arrivalTime)}</span>
                  <div className="booking-stop-dot destination"></div>
                  <div className="booking-stop-info">
                    <span className="booking-stop-city">{selectedTrip.destination.name}</span>
                    <span className="booking-stop-terminal">{selectedTrip.destination.terminalName}</span>
                  </div>
                </div>
              </div>

              <div className="booking-details-grid">
                <div className="booking-detail">
                  <span className="booking-detail-label">📅 Fecha</span>
                  <span className="booking-detail-value">{formatDate(selectedTrip.departureTime)}</span>
                </div>
                <div className="booking-detail">
                  <span className="booking-detail-label">⏱️ Duración</span>
                  <span className="booking-detail-value">{formatDuration(selectedTrip.durationMinutes)}</span>
                </div>
                <div className="booking-detail">
                  <span className="booking-detail-label">💺 Asientos disponibles</span>
                  <span className="booking-detail-value">{selectedTrip.availableSeats}</span>
                </div>
                <div className="booking-detail">
                  <span className="booking-detail-label">👥 Pasajeros</span>
                  <span className="booking-detail-value">{selectedTrip.passengers || 1}</span>
                </div>
              </div>

              {/* Características del viaje */}
              {selectedTrip.features && selectedTrip.features.length > 0 && (
                <div className="booking-features-section">
                  <h3 className="booking-features-title">Características</h3>
                  <div className="booking-features-grid">
                    {selectedTrip.features.map(feat => (
                      <div key={feat.id} className="booking-feature-badge" title={feat.name}>
                        <span className="booking-feature-icon">{feat.icon}</span>
                        <span className="booking-feature-name">{feat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Price summary */}
          <div className="booking-sidebar">
            <div className="booking-price-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <h3 className="booking-price-title">Resumen de precio</h3>

              <div className="booking-price-rows">
                <div className="booking-price-row">
                  <span>Precio por persona</span>
                  <span>{formatPrice(selectedTrip.price)}</span>
                </div>
                <div className="booking-price-row">
                  <span>Pasajeros</span>
                  <span>× {selectedTrip.passengers || 1}</span>
                </div>
                <div className="booking-price-row total">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button
                className="booking-continue-btn"
                onClick={handleContinue}
                id="continue-to-payment"
              >
                {isAuthenticated ? 'Continuar al pago' : 'Iniciar sesión para comprar'}
              </button>

              <p className="booking-secure-note">
                🔒 Pago 100% seguro y encriptado
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
