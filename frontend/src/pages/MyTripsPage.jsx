import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatTime, formatDate, formatPrice, formatServiceType } from '../utils/formatters';
import './MyTripsPage.css';

export default function MyTripsPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // BUG-001 FIX: Solo cargar bookings del usuario autenticado
    // Guard defensivo: si no hay user.id no cargamos nada
    if (!user?.id) return;

    try {
      const stored = JSON.parse(localStorage.getItem('voy_bookings') || '[]');
      // Filtrar por userId para aislar datos por tenant (compatible con Sprint 2)
      // Equivalente a: SELECT * FROM bookings WHERE user_id = $1
      const userBookings = stored.filter(b => b.userId === user.id);
      setBookings(userBookings.reverse());
    } catch {
      // localStorage corrupto — mostrar estado vacío sin crashear
      setBookings([]);
    }
  }, [user?.id]); // Re-ejecutar si cambia el usuario en sesión

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
