import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchForm from '../components/search/SearchForm';
import { getOffers, getPopularDestinations } from '../services/api';
import { useBooking } from '../context/BookingContext';
import { formatPrice, getTodayStr } from '../utils/formatters';
import { destinationImages } from '../utils/imageMap';
import './HomePage.css';

/* Import all images from src/img */
const imageModules = import.meta.glob('../img/*.jpg', { eager: true });

function getDestinationImage(imageKey) {
  const filename = destinationImages[imageKey];
  if (!filename) return null;
  const matchingKey = Object.keys(imageModules).find(key => key.endsWith(`/${filename}`));
  return matchingKey ? imageModules[matchingKey].default : null;
}

export default function HomePage() {
  const [offers, setOffers] = useState([]);
  const [popularDests, setPopularDests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setSearchParams, resetSearch } = useBooking();

  // BUG-002 FIX: Limpiar estado de búsqueda anterior al montar el Home
  useEffect(() => {
    resetSearch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    Promise.all([getOffers(), getPopularDestinations()]).then(([offersRes, destsRes]) => {
      if (offersRes.success) setOffers(offersRes.data);
      if (destsRes.success) setPopularDests(destsRes.data);
      setLoading(false);
    });
  }, []);

  const handleOfferClick = (offer) => {
    setSearchParams(prev => ({
      ...prev,
      origin: offer.originId,
      destination: offer.destinationId,
    }));
    const params = new URLSearchParams({
      origin: offer.originId,
      destination: offer.destinationId,
      passengers: 1,
    });
    navigate(`/resultados?${params.toString()}`);
  };

  const handleDestinationClick = (dest) => {
    const today = getTodayStr();
    setSearchParams(prev => ({
      ...prev,
      origin: 1, // Buenos Aires default
      destination: dest.cityId,
      date: today,
    }));
    const params = new URLSearchParams({
      origin: 1,
      destination: dest.cityId,
      date: today,
      passengers: 1,
    });
    navigate(`/resultados?${params.toString()}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero" id="hero-section">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-text animate-fade-in-up">
            <h1 className="hero-title">
              Viajá por toda<br />
              <span className="hero-highlight">Argentina</span>
            </h1>
            <p className="hero-subtitle">
              Buscá, compará y comprá tus pasajes de micro al mejor precio. 
              Más de 500 destinos disponibles.
            </p>
          </div>
          <div className="hero-search animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <SearchForm variant="hero" />
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,60 C360,120 720,0 1440,60 L1440,120 L0,120 Z" fill="var(--color-bg)" />
          </svg>
        </div>
      </section>

      {/* Offers Section */}
      <section className="section" id="offers-section">
        <div className="container">
          <h2 className="section-title">🔥 Ofertas Destacadas</h2>
          <p className="section-subtitle">Los mejores precios para tus próximas vacaciones</p>

          <div className="offers-grid stagger-children">
            {offers.map(offer => (
              <div
                key={offer.id}
                className="offer-card"
                onClick={() => handleOfferClick(offer)}
                id={`offer-card-${offer.id}`}
              >
                <div className="offer-image">
                  {getDestinationImage(offer.imageQuery) ? (
                    <img
                      src={getDestinationImage(offer.imageQuery)}
                      alt={offer.title}
                      className="offer-img"
                    />
                  ) : (
                    <div className="offer-image-placeholder">
                      <span className="offer-emoji">🌍</span>
                    </div>
                  )}
                  <div className="offer-badge">-{offer.discount}%</div>
                </div>
                <div className="offer-info">
                  <h3 className="offer-title">{offer.title}</h3>
                  <p className="offer-subtitle">{offer.subtitle}</p>
                  <div className="offer-prices">
                    <span className="offer-original">{formatPrice(offer.originalPrice)}</span>
                    <span className="offer-current">{formatPrice(offer.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="section destinations-section" id="destinations-section">
        <div className="container">
          <h2 className="section-title">🗺️ Destinos Populares</h2>
          <p className="section-subtitle">Los lugares más elegidos por nuestros viajeros</p>

          <div className="destinations-grid stagger-children">
            {popularDests.map(dest => (
              <div
                key={dest.id}
                className="destination-card"
                onClick={() => handleDestinationClick(dest)}
                id={`dest-card-${dest.id}`}
              >
                <div className="destination-img-wrapper">
                  {getDestinationImage(dest.imageKey) ? (
                    <img
                      src={getDestinationImage(dest.imageKey)}
                      alt={dest.name}
                      className="destination-img"
                    />
                  ) : (
                    <span className="destination-emoji">📍</span>
                  )}
                </div>
                <span className="destination-name">{dest.name}</span>
                <span className="destination-trips">{dest.tripsCount} viajes</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section" id="features-section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>¿Por qué Voy?</h2>
          <p className="section-subtitle" style={{ textAlign: 'center' }}>
            La forma más simple de viajar en micro
          </p>

          <div className="features-grid stagger-children">
            <div className="feature-card">
              <span className="feature-icon">⚡</span>
              <h3 className="feature-title">Rápido</h3>
              <p className="feature-desc">Encontrá tu viaje en segundos. Sin complicaciones.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🛡️</span>
              <h3 className="feature-title">Seguro</h3>
              <p className="feature-desc">Todas las transacciones protegidas y encriptadas.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💰</span>
              <h3 className="feature-title">Mejor Precio</h3>
              <p className="feature-desc">Compará entre todas las empresas y elegí el mejor precio.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📱</span>
              <h3 className="feature-title">Digital</h3>
              <p className="feature-desc">Tu pasaje en el celular. Sin imprimir nada.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
