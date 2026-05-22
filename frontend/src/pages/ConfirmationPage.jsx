import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { formatTime, formatDate, formatDuration, formatPrice, formatServiceType } from '../utils/formatters';
import './ConfirmationPage.css';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { booking, clearBooking } = useBooking();

  if (!booking) {
    return (
      <div className="confirmation-page">
        <div className="container">
          <div className="confirmation-empty animate-fade-in">
            <span className="confirmation-empty-icon">🎫</span>
            <h2>No hay reserva activa</h2>
            <p>Buscá tu próximo viaje</p>
            <button className="confirmation-btn" onClick={() => navigate('/')}>Ir al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  const trip = booking.trip;

  const handleNewSearch = () => {
    clearBooking();
    navigate('/');
  };

  return (
    <div className="confirmation-page">
      <div className="container">
        <div className="confirmation-card animate-fade-in">
          {/* Success header */}
          <div className="confirmation-success">
            <div className="confirmation-check">✓</div>
            <h1 className="confirmation-title">¡Compra exitosa!</h1>
            <p className="confirmation-subtitle">Tu pasaje fue confirmado correctamente</p>
          </div>

          {/* Ticket */}
          <div className="ticket">
            <div className="ticket-header">
              <img src="/voy-logo.png" alt="Voy" className="ticket-logo" />
              <div className="ticket-code-block">
                <span className="ticket-code-label">Código de reserva</span>
                <span className="ticket-code">{booking.bookingCode}</span>
              </div>
            </div>

            <div className="ticket-divider">
              <div className="ticket-notch left"></div>
              <div className="ticket-dash"></div>
              <div className="ticket-notch right"></div>
            </div>

            <div className="ticket-body">
              <div className="ticket-route">
                <div className="ticket-stop">
                  <span className="ticket-stop-time">{formatTime(trip.departureTime)}</span>
                  <span className="ticket-stop-city">{trip.origin.name}</span>
                </div>
                <div className="ticket-arrow">→</div>
                <div className="ticket-stop">
                  <span className="ticket-stop-time">{formatTime(trip.arrivalTime)}</span>
                  <span className="ticket-stop-city">{trip.destination.name}</span>
                </div>
              </div>

              <div className="ticket-details">
                <div className="ticket-detail">
                  <span className="ticket-detail-label">Fecha</span>
                  <span className="ticket-detail-value">{formatDate(trip.departureTime)}</span>
                </div>
                <div className="ticket-detail">
                  <span className="ticket-detail-label">Empresa</span>
                  <span className="ticket-detail-value">{trip.company.name}</span>
                </div>
                <div className="ticket-detail">
                  <span className="ticket-detail-label">Servicio</span>
                  <span className="ticket-detail-value">{formatServiceType(trip.serviceType)}</span>
                </div>
                <div className="ticket-detail">
                  <span className="ticket-detail-label">Duración</span>
                  <span className="ticket-detail-value">{formatDuration(trip.durationMinutes)}</span>
                </div>
                <div className="ticket-detail">
                  <span className="ticket-detail-label">Pasajero</span>
                  <span className="ticket-detail-value">{booking.passengerName}</span>
                </div>
                <div className="ticket-detail">
                  <span className="ticket-detail-label">DNI</span>
                  <span className="ticket-detail-value">{booking.passengerDni}</span>
                </div>
              </div>

              <div className="ticket-total">
                <span>Total pagado</span>
                <span className="ticket-total-price">{formatPrice(booking.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="confirmation-actions">
            <button className="confirmation-btn primary" onClick={handleNewSearch} id="new-search-btn">
              🔍 Buscar otro viaje
            </button>
            <button
              className="confirmation-btn secondary"
              onClick={() => window.print()}
              id="print-ticket-btn"
            >
              🖨️ Imprimir comprobante
            </button>
          </div>

          <p className="confirmation-email-note">
            📧 Enviamos una copia del comprobante a <strong>{booking.passengerEmail}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
