import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { getTodayStr } from '../../utils/formatters';
import './Footer.css';

// BUG-003 FIX: Footer completamente funcional
// - Soporte: links a rutas reales
// - Destinos: navegan a resultados de búsqueda
// - "Mi Cuenta": routing condicional por auth state
// - Redes sociales: URLs reales con target="_blank"

const POPULAR_FOOTER_DESTS = [
  { name: 'Mar del Plata', cityId: 2 },
  { name: 'Córdoba',       cityId: 3 },
  { name: 'Mendoza',       cityId: 4 },
  { name: 'Bariloche',     cityId: 6 },
];

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const { setSearchParams } = useBooking();
  const navigate = useNavigate();

  const handleDestinationClick = (cityId) => {
    const today = getTodayStr();
    setSearchParams(prev => ({
      ...prev,
      origin: 1, // Buenos Aires por defecto
      destination: cityId,
      date: today,
    }));
    const params = new URLSearchParams({ 
      origin: 1, 
      destination: cityId, 
      date: today,
      passengers: 1 
    });
    navigate(`/resultados?${params.toString()}`);
  };

  return (
    <footer className="footer" id="main-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/voy-logo.png" alt="Voy" className="footer-logo" />
            <p className="footer-description">
              Tu plataforma de confianza para viajar por Argentina. Buscá, compará y comprá tus pasajes de micro.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Navegación</h4>
            <Link to="/" className="footer-link">Inicio</Link>
            <Link to="/mis-viajes" className="footer-link">Mis Viajes</Link>
            {/* BUG-003c FIX: Routing condicional según estado de autenticación */}
            <Link
              to={isAuthenticated ? '/mis-viajes' : '/auth'}
              className="footer-link"
            >
              Mi Cuenta
            </Link>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Destinos Populares</h4>
            {/* BUG-003b FIX: Destinos navegan a resultados de búsqueda reales */}
            {POPULAR_FOOTER_DESTS.map(dest => (
              <button
                key={dest.cityId}
                className="footer-link footer-link-btn"
                onClick={() => handleDestinationClick(dest.cityId)}
                type="button"
              >
                {dest.name}
              </button>
            ))}
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Soporte</h4>
            {/* BUG-003a FIX: Links de soporte con rutas reales */}
            <Link to="/ayuda" className="footer-link">Centro de Ayuda</Link>
            <Link to="/terminos" className="footer-link">Términos y Condiciones</Link>
            <Link to="/privacidad" className="footer-link">Política de Privacidad</Link>
            <Link to="/contacto" className="footer-link">Contacto</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Voy. Todos los derechos reservados.</p>
          <div className="footer-social">
            {/* BUG-003d FIX: URLs reales con target="_blank" y rel="noopener noreferrer" */}
            <a
              href="https://instagram.com/voy.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Instagram"
            >
              📷
            </a>
            <a
              href="https://twitter.com/voy_ar"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Twitter / X"
            >
              🐦
            </a>
            <a
              href="https://facebook.com/voy.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Facebook"
            >
              📘
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
