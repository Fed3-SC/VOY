import { useEffect, useState } from 'react';
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
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!selectedTrip) {
      setLoadError(false);
      getTripById(parseInt(id)).then(res => {
        if (res.success) {
          setSelectedTrip({ ...res.data, passengers: 1 });
        } else {
          setLoadError(true);
        }
      }).catch(() => setLoadError(true));
    }
  }, [id, selectedTrip, setSelectedTrip, navigate]);

  if (loadError) {
    return (
      <div className="booking-error-state" style={{ minHeight: '80vh', paddingTop: 'var(--navbar-height)' }}>
        <div className="booking-error-content">
          <span className="booking-error-icon">⚠️</span>
          <h2>No pudimos cargar el viaje</h2>
          <p>El viaje no existe o hubo un error de conexión.</p>
          <div className="booking-error-actions">
            <button className="booking-retry-btn" onClick={() => { setLoadError(false); setSelectedTrip(null); }}>
              🔄 Reintentar
            </button>
            <button className="booking-back-alt" onClick={() => navigate(-1)}>
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                  <span className="booking-detail-label">👥 Pasajeros</span>
                  <span className="booking-detail-value">{selectedTrip.passengers || 1}</span>
                </div>
                <div className="booking-detail">
                  <span className="booking-detail-label">🏢 Empresa</span>
                  <span className="booking-detail-value">{selectedTrip.company?.name}</span>
                </div>
              </div>

              {/* Sección de Disponibilidad */}
              <div className="booking-availability">
                <h3 className="booking-availability-title">Disponibilidad</h3>
                {selectedTrip.availableSeats === 0 ? (
                  <div className="availability-status sold-out">
                    <span className="availability-icon">🚫</span>
                    <div>
                      <span className="availability-label">Sin asientos disponibles</span>
                      <span className="availability-desc">Este viaje está completo</span>
                    </div>
                  </div>
                ) : selectedTrip.availableSeats <= 5 ? (
                  <div className="availability-status low">
                    <span className="availability-icon">⚠️</span>
                    <div>
                      <span className="availability-label">¡Últimos {selectedTrip.availableSeats} asientos!</span>
                      <span className="availability-desc">Reservá rápido antes de que se agoten</span>
                    </div>
                  </div>
                ) : (
                  <div className="availability-status available">
                    <span className="availability-icon">✅</span>
                    <div>
                      <span className="availability-label">{selectedTrip.availableSeats} asientos disponibles</span>
                      <span className="availability-desc">de {selectedTrip.totalSeats} totales</span>
                    </div>
                  </div>
                )}
                {/* Barra visual de ocupación */}
                {selectedTrip.totalSeats > 0 && (
                  <div className="availability-bar-wrapper">
                    <div
                      className="availability-bar-fill"
                      style={{
                        width: `${Math.round(((selectedTrip.totalSeats - selectedTrip.availableSeats) / selectedTrip.totalSeats) * 100)}%`,
                        background: selectedTrip.availableSeats === 0
                          ? 'var(--color-error)'
                          : selectedTrip.availableSeats <= 5
                          ? 'var(--color-warning)'
                          : 'var(--color-success)',
                      }}
                    />
                    <span className="availability-bar-label">
                      {Math.round(((selectedTrip.totalSeats - selectedTrip.availableSeats) / selectedTrip.totalSeats) * 100)}% ocupado
                    </span>
                  </div>
                )}
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
