import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchForm from '../components/search/SearchForm';
import { getPopularDestinations, getAllTrips, getFeaturedTrips } from '../services/api';
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
  const [featuredTrips, setFeaturedTrips] = useState([]);
  const [popularDests, setPopularDests] = useState([]);
  const [trips, setTrips] = useState([]);
  const [totalTrips, setTotalTrips] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tripsLoading, setTripsLoading] = useState(false);
  const navigate = useNavigate();
  const { setSearchParams, resetSearch } = useBooking();

  const destsRef = useRef(null);
  const destsSlider = useSlider(destsRef);

  // BUG-002 FIX: Limpiar estado de búsqueda anterior al montar el Home
  useEffect(() => {
    resetSearch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    Promise.all([
      getFeaturedTrips(10),
      getPopularDestinations()
    ]).then(([featuredRes, destsRes]) => {
      if (featuredRes.success) setFeaturedTrips(featuredRes.data);
      if (destsRes.success) setPopularDests(destsRes.data);
      setLoading(false);
      setTimeout(() => {
        destsSlider.checkScroll();
      }, 100);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setTripsLoading(true);
    getAllTrips(10, (page - 1) * 10).then(res => {
      if (res.success) {
        setTrips(res.data);
        setTotalTrips(res.meta?.total || 0);
      }
      setTripsLoading(false);
    });
  }, [page]);


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


      {/* Featured Trips — Random */}
      {featuredTrips.length > 0 && (
        <section className="section featured-section" id="featured-section" style={{ paddingBottom: 0 }}>
          <div className="container">
            <h2 className="section-title">✨ Recomendaciones para vos</h2>
            <p className="section-subtitle">Descubrí opciones increíbles de forma aleatoria</p>

            <div className="featured-grid">
              {featuredTrips.map(trip => (
                <div
                  key={trip.id}
                  className="featured-card"
                  onClick={() => handleFeaturedClick(trip)}
                  id={`random-card-${trip.id}`}
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
          </div>
        </section>
      )}

      {/* Trips Section — Paginated */}
      <section className="section featured-section" id="trips-section">
        <div className="container">
          <h2 className="section-title">🚌 Viajes Disponibles</h2>
          <p className="section-subtitle">Explorá todos nuestros viajes de forma ordenada</p>

          {tripsLoading ? (
            <div className="spinner-container"><div className="spinner"></div></div>
          ) : trips.length > 0 ? (
            <>
              <div className="featured-grid">
                {trips.map(trip => (
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
              
              <div className="home-pagination">
                <button 
                  className="home-page-btn" 
                  onClick={() => setPage(1)} 
                  disabled={page === 1}
                >
                  ⏮️ Inicio
                </button>
                <button 
                  className="home-page-btn" 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                >
                  ◀ Anterior
                </button>
                <span className="home-page-info">
                  Página {page} de {Math.max(1, Math.ceil(totalTrips / 10))}
                </span>
                <button 
                  className="home-page-btn" 
                  onClick={() => setPage(p => Math.min(Math.ceil(totalTrips / 10), p + 1))} 
                  disabled={page >= Math.ceil(totalTrips / 10)}
                >
                  Siguiente ▶
                </button>
              </div>
            </>
          ) : (
            <div className="admin-empty">
              <span className="admin-empty-icon">🚌</span>
              <h3>No hay viajes disponibles por ahora</h3>
            </div>
          )}
        </div>
      </section>

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
