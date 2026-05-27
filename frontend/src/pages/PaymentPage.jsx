import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../services/api';
import { formatTime, formatDate, formatDuration, formatPrice, formatServiceType } from '../utils/formatters';
import './PaymentPage.css';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { selectedTrip, setBooking } = useBooking();
  const user = { id: 1, name: 'Viajero', lastName: 'Invitado', email: 'invitado@voy.com', dni: '12345678', phone: '1122334455' };
  const isAuthenticated = true;
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!selectedTrip) {
    navigate('/');
    return null;
  }



  const totalPrice = selectedTrip.price * (selectedTrip.passengers || 1);

  const handlePayment = async () => {
    if (!paymentMethod) return;
    setProcessing(true);

    const bookingData = {
      tripId: selectedTrip.id,
      userId: user.id,
      passengers: selectedTrip.passengers || 1,
      totalPrice,
      passengerName: `${user.name} ${user.lastName}`,
      passengerEmail: user.email,
      passengerDni: user.dni,
      paymentMethod,
      trip: selectedTrip,
    };

    const res = await createBooking(bookingData);
    if (res.success) {
      setBooking(res.data);
      navigate('/confirmacion');
    }
    setProcessing(false);
  };

  const paymentMethods = [
    { id: 'credit', label: 'Tarjeta de Crédito', icon: '💳', desc: 'Visa, Mastercard, Amex' },
    { id: 'debit', label: 'Tarjeta de Débito', icon: '🏦', desc: 'Todas las tarjetas' },
    { id: 'mercadopago', label: 'Mercado Pago', icon: '📱', desc: 'Con tu cuenta de MP' },
    { id: 'transfer', label: 'Transferencia', icon: '🔄', desc: 'CBU/CVU/Alias' },
  ];

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-header">
          <button className="booking-back" onClick={() => navigate(-1)}>← Volver</button>
          <h1 className="booking-title">Finalizar compra</h1>

          {/* Progress stepper */}
          <div className="payment-stepper">
            <div className="step completed">
              <span className="step-number">✓</span>
              <span className="step-label">Selección</span>
            </div>
            <div className="step-line completed"></div>
            <div className="step completed">
              <span className="step-number">✓</span>
              <span className="step-label">Datos</span>
            </div>
            <div className="step-line active"></div>
            <div className="step active">
              <span className="step-number">3</span>
              <span className="step-label">Pago</span>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <span className="step-number">4</span>
              <span className="step-label">Confirmación</span>
            </div>
          </div>
        </div>

        <div className="booking-grid">
          <div className="booking-main">
            {/* Passenger Info */}
            <div className="booking-card animate-fade-in">
              <h3 className="payment-section-title">👤 Datos del pasajero</h3>
              <div className="passenger-info-grid">
                <div className="passenger-info-item">
                  <span className="passenger-info-label">Nombre</span>
                  <span className="passenger-info-value">{user.name} {user.lastName}</span>
                </div>
                <div className="passenger-info-item">
                  <span className="passenger-info-label">Email</span>
                  <span className="passenger-info-value">{user.email}</span>
                </div>
                <div className="passenger-info-item">
                  <span className="passenger-info-label">DNI</span>
                  <span className="passenger-info-value">{user.dni}</span>
                </div>
                <div className="passenger-info-item">
                  <span className="passenger-info-label">Celular</span>
                  <span className="passenger-info-value">{user.phone}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="booking-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h3 className="payment-section-title">💳 Método de pago</h3>
              <div className="payment-methods">
                {paymentMethods.map(method => (
                  <label
                    key={method.id}
                    className={`payment-method-card ${paymentMethod === method.id ? 'selected' : ''}`}
                    id={`payment-method-${method.id}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="payment-radio"
                    />
                    <span className="payment-method-icon">{method.icon}</span>
                    <div className="payment-method-info">
                      <span className="payment-method-label">{method.label}</span>
                      <span className="payment-method-desc">{method.desc}</span>
                    </div>
                    <span className="payment-check">{paymentMethod === method.id ? '✓' : ''}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="booking-sidebar">
            <div className="booking-price-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <h3 className="booking-price-title">Resumen de compra</h3>

              <div className="payment-trip-summary">
                <div className="payment-trip-route">
                  <strong>{selectedTrip.origin.name}</strong> → <strong>{selectedTrip.destination.name}</strong>
                </div>
                <div className="payment-trip-details">
                  <span>{formatDate(selectedTrip.departureTime)}</span>
                  <span>{formatTime(selectedTrip.departureTime)} - {formatTime(selectedTrip.arrivalTime)}</span>
                  <span>{selectedTrip.company.name} · {formatServiceType(selectedTrip.serviceType)}</span>
                </div>
              </div>

              <div className="booking-price-rows">
                <div className="booking-price-row">
                  <span>Pasaje × {selectedTrip.passengers || 1}</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="booking-price-row">
                  <span>Cargo por servicio</span>
                  <span>{formatPrice(0)}</span>
                </div>
                <div className="booking-price-row total">
                  <span>Total a pagar</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button
                className="booking-continue-btn"
                onClick={handlePayment}
                disabled={!paymentMethod || processing}
                id="confirm-payment-btn"
              >
                {processing ? '⏳ Procesando...' : `Pagar ${formatPrice(totalPrice)}`}
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
