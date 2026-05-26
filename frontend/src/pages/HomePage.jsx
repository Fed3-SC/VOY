import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchForm from '../components/search/SearchForm';
import { getOffers, getPopularDestinations, getFeaturedTrips } from '../services/api';
import { useBooking } from '../context/BookingContext';
import { formatPrice, formatTime, formatDuration, formatServiceType, getTodayStr } from '../utils/formatters';
import { destinationImages, getImageKeyByCityName } from '../utils/imageMap';
import './HomePage.css';

/* Import all images from src/img */
const imageModules = import.meta.glob('../img/*.{jpg,png}', { eager: true });

function getDestinationImage(imageKey) {
  const filename = destinationImages[imageKey];
  if (!filename) return null;
  const matchingKey = Object.keys(imageModules).find(key => key.endsWith(`/${filename}`));
  return matchingKey ? imageModules[matchingKey].default : null;
}

function getImageByCityName(cityName) {
  const key = getImageKeyByCityName(cityName);
  return key ? getDestinationImage(key) : null;
}

/* ─── Slider Hook ─── */
function useSlider(ref) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [ref, checkScroll]);

  const scroll = (direction) => {
    if (!ref.current) return;
    const cardWidth = ref.current.querySelector(':first-child')?.offsetWidth || 300;
    ref.current.scrollBy({ left: direction * (cardWidth + 24), behavior: 'smooth' });
  };

  return { canScrollLeft, canScrollRight, scroll, checkScroll };
}

export default function HomePage() {
  const [offers, setOffers] = useState([]);
  const [popularDests, setPopularDests] = useState([]);
  const [featuredTrips, setFeaturedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setSearchParams, resetSearch } = useBooking();

  const offersRef = useRef(null);
  const destsRef = useRef(null);
  const featuredRef = useRef(null);

  const offersSlider = useSlider(offersRef);
  const destsSlider = useSlider(destsRef);
  const featuredSlider = useSlider(featuredRef);

  // BUG-002 FIX: Limpiar estado de búsqueda anterior al montar el Home
  useEffect(() => {
    resetSearch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    Promise.all([
      getOffers(),
      getPopularDestinations(),
      getFeaturedTrips(8),
    ]).then(([offersRes, destsRes, featuredRes]) => {
      if (offersRes.success) setOffers(offersRes.data);
      if (destsRes.success) setPopularDests(destsRes.data);
      if (featuredRes.success) setFeaturedTrips(featuredRes.data);
      setLoading(false);
      // Re-check slider after data loads
      setTimeout(() => {
        offersSlider.checkScroll();
        destsSlider.checkScroll();
        featuredSlider.checkScroll();
      }, 100);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleFeaturedClick = (trip) => {
    navigate(`/reserva/${trip.id}`);
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

      {/* Offers Section with Slider */}
      <section className="section" id="offers-section">
        <div className="container">
          <h2 className="section-title">🔥 Ofertas Destacadas</h2>
          <p className="section-subtitle">Los mejores precios para tus próximas vacaciones</p>

          <div className="slider-wrapper">
            {offersSlider.canScrollLeft && (
              <button className="slider-btn slider-btn-left" onClick={() => offersSlider.scroll(-1)} aria-label="Anterior">
                ‹
              </button>
            )}
            <div className="slider-track" ref={offersRef}>
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
                        loading="lazy"
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
            {offersSlider.canScrollRight && (
              <button className="slider-btn slider-btn-right" onClick={() => offersSlider.scroll(1)} aria-label="Siguiente">
                ›
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Featured Trips — Random */}
      {featuredTrips.length > 0 && (
        <section className="section featured-section" id="featured-section">
          <div className="container">
            <h2 className="section-title">🚌 Viajes Disponibles</h2>
            <p className="section-subtitle">Descubrí opciones para tu próximo destino</p>

            <div className="slider-wrapper">
              {featuredSlider.canScrollLeft && (
                <button className="slider-btn slider-btn-left" onClick={() => featuredSlider.scroll(-1)} aria-label="Anterior">
                  ‹
                </button>
              )}
              <div className="slider-track" ref={featuredRef}>
                {featuredTrips.map(trip => (
                  <div
                    key={trip.id}
                    className="featured-card"
                    onClick={() => handleFeaturedClick(trip)}
                    id={`featured-card-${trip.id}`}
                  >
                    <div className="featured-image">
                      {getImageByCityName(trip.destination?.name) ? (
                        <img
                          src={getImageByCityName(trip.destination?.name)}
                          alt={trip.destination?.name}
                          className="featured-img"
                          loading="lazy"
                        />
                      ) : (
                        <div className="featured-image-placeholder">
                          <span>🗺️</span>
                        </div>
                      )}
                      <div className="featured-overlay">
                        <span className="featured-dest">{trip.destination?.name}</span>
                      </div>
                    </div>
                    <div className="featured-info">
                      <div className="featured-route">
                        <span className="featured-origin">{trip.origin?.name}</span>
                        <span className="featured-arrow">→</span>
                        <span className="featured-dest-name">{trip.destination?.name}</span>
                      </div>
                      <div className="featured-meta">
                        <span>🕐 {formatTime(trip.departureTime)}</span>
                        <span>⏱️ {formatDuration(trip.durationMinutes)}</span>
                        <span className={`badge badge-${trip.serviceType === 'cama' ? 'accent' : 'primary'}`}>
                          {formatServiceType(trip.serviceType)}
                        </span>
                      </div>
                      <div className="featured-bottom">
                        <span className="featured-company">{trip.company?.name}</span>
                        <span className="featured-price">{formatPrice(trip.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {featuredSlider.canScrollRight && (
                <button className="slider-btn slider-btn-right" onClick={() => featuredSlider.scroll(1)} aria-label="Siguiente">
                  ›
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Popular Destinations */}
      <section className="section destinations-section" id="destinations-section">
        <div className="container">
          <h2 className="section-title">🗺️ Destinos Populares</h2>
          <p className="section-subtitle">Los lugares más elegidos por nuestros viajeros</p>

          <div className="slider-wrapper">
            {destsSlider.canScrollLeft && (
              <button className="slider-btn slider-btn-left" onClick={() => destsSlider.scroll(-1)} aria-label="Anterior">
                ‹
              </button>
            )}
            <div className="slider-track destinations-track" ref={destsRef}>
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
                        loading="lazy"
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
            {destsSlider.canScrollRight && (
              <button className="slider-btn slider-btn-right" onClick={() => destsSlider.scroll(1)} aria-label="Siguiente">
                ›
              </button>
            )}
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
