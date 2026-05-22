import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatTime, formatDate, formatPrice, formatServiceType } from '../utils/formatters';
import { getMyBookings } from '../services/api';
import './MyTripsPage.css';

export default function MyTripsPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);
    getMyBookings().then(res => {
      if (res.success) {
        setBookings(res.data);
      } else {
        setBookings([]);
      }
      setLoading(false);
    });
  }, [user?.id]);

  if (!isAuthenticated) {
    return (
      <div className="mytrips-page">
        <div className="container">
          <div className="mytrips-empty animate-fade-in">
            <span className="mytrips-empty-icon">🔐</span>
            <h2>Iniciá sesión para ver tus viajes</h2>
            <p>Accedé a tu historial de reservas</p>
            <button className="mytrips-btn" onClick={() => navigate('/auth?redirect=/mis-viajes')}>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mytrips-page">
      <div className="container">
        <h1 className="mytrips-title">🎫 Mis Viajes</h1>

        {bookings.length === 0 ? (
          <div className="mytrips-empty animate-fade-in">
            <span className="mytrips-empty-icon">🗺️</span>
            <h2>No tenés viajes todavía</h2>
            <p>¡Empezá a planear tu próxima aventura!</p>
            <button className="mytrips-btn" onClick={() => navigate('/')}>
              Buscar viajes
            </button>
          </div>
        ) : (
          <div className="mytrips-list stagger-children">
            {bookings.map(booking => (
              <div key={booking.id} className="mytrips-card">
                <div className="mytrips-card-header">
                  <span className="mytrips-code">{booking.bookingCode}</span>
                  <span className={`badge ${booking.status === 'confirmed' ? 'badge-success' : 'badge-primary'}`}>
                    {booking.status === 'confirmed' ? '✅ Confirmado' : booking.status}
                  </span>
                </div>
                {booking.trip && (
                  <div className="mytrips-card-body">
                    <div className="mytrips-route">
                      <strong>{booking.trip.origin?.name}</strong>
                      <span className="mytrips-arrow">→</span>
                      <strong>{booking.trip.destination?.name}</strong>
                    </div>
                    <div className="mytrips-info">
                      <span>📅 {formatDate(booking.trip.departureTime)}</span>
                      <span>🕐 {formatTime(booking.trip.departureTime)}</span>
                      <span>🚌 {booking.trip.company?.name}</span>
                      <span>💺 {formatServiceType(booking.trip.serviceType)}</span>
                    </div>
                    <div className="mytrips-price">
                      {formatPrice(booking.totalPrice)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
