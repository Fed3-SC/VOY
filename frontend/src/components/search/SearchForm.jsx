import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCities } from '../../services/api';
import { useBooking } from '../../context/BookingContext';
import { getTodayStr } from '../../utils/formatters';
import './SearchForm.css';

export default function SearchForm({ variant = 'hero' }) {
  const navigate = useNavigate();
  const { searchParams, setSearchParams } = useBooking();
  const [cities, setCities] = useState([]);
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const originRef = useRef(null);
  const destRef = useRef(null);

  useEffect(() => {
    getCities().then(res => {
      if (res.success) setCities(res.data);
    });
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (originRef.current && !originRef.current.contains(e.target)) setShowOriginDropdown(false);
      if (destRef.current && !destRef.current.contains(e.target)) setShowDestDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredCities = (query, excludeId) => {
    return cities.filter(c =>
      c.active &&
      c.id !== excludeId &&
      c.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  const selectOrigin = (city) => {
    setSearchParams(prev => ({ ...prev, origin: city.id }));
    setOriginSearch(city.name);
    setShowOriginDropdown(false);
  };

  const selectDestination = (city) => {
    setSearchParams(prev => ({ ...prev, destination: city.id }));
    setDestSearch(city.name);
    setShowDestDropdown(false);
  };

  const swapCities = () => {
    const tempOrigin = searchParams.origin;
    const tempOriginSearch = originSearch;
    setSearchParams(prev => ({
      ...prev,
      origin: prev.destination,
      destination: tempOrigin,
    }));
    setOriginSearch(destSearch);
    setDestSearch(tempOriginSearch);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchParams.origin || !searchParams.destination) return;
    const params = new URLSearchParams({
      origin: searchParams.origin,
      destination: searchParams.destination,
      date: searchParams.date || '',
      passengers: searchParams.passengers || 1,
    });
    navigate(`/resultados?${params.toString()}`);
  };

  return (
    <form className={`search-form ${variant}`} onSubmit={handleSearch} id="search-form">
      <div className="search-form-fields">
        {/* Origin */}
        <div className="search-field" ref={originRef}>
          <label className="search-label">
            <span className="search-icon">📍</span>
            Origen
          </label>
          <input
            type="text"
            className="search-input"
            placeholder="¿Desde dónde salís?"
            value={originSearch}
            onChange={(e) => {
              setOriginSearch(e.target.value);
              setShowOriginDropdown(true);
              if (!e.target.value) setSearchParams(prev => ({ ...prev, origin: '' }));
            }}
            onFocus={() => setShowOriginDropdown(true)}
            id="origin-input"
          />
          {showOriginDropdown && originSearch && (
            <div className="search-dropdown">
              {filteredCities(originSearch, searchParams.destination).map(city => (
                <button
                  key={city.id}
                  type="button"
                  className="search-dropdown-item"
                  onClick={() => selectOrigin(city)}
                >
                  <span className="dropdown-city">{city.name}</span>
                  <span className="dropdown-province">{city.province}</span>
                </button>
              ))}
              {filteredCities(originSearch, searchParams.destination).length === 0 && (
                <div className="search-dropdown-empty">No se encontraron ciudades</div>
              )}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <button type="button" className="search-swap" onClick={swapCities} aria-label="Intercambiar" id="swap-cities-btn">
          ⇄
        </button>

        {/* Destination */}
        <div className="search-field" ref={destRef}>
          <label className="search-label">
            <span className="search-icon">📍</span>
            Destino
          </label>
          <input
            type="text"
            className="search-input"
            placeholder="¿A dónde viajás?"
            value={destSearch}
            onChange={(e) => {
              setDestSearch(e.target.value);
              setShowDestDropdown(true);
              if (!e.target.value) setSearchParams(prev => ({ ...prev, destination: '' }));
            }}
            onFocus={() => setShowDestDropdown(true)}
            id="destination-input"
          />
          {showDestDropdown && destSearch && (
            <div className="search-dropdown">
              {filteredCities(destSearch, searchParams.origin).map(city => (
                <button
                  key={city.id}
                  type="button"
                  className="search-dropdown-item"
                  onClick={() => selectDestination(city)}
                >
                  <span className="dropdown-city">{city.name}</span>
                  <span className="dropdown-province">{city.province}</span>
                </button>
              ))}
              {filteredCities(destSearch, searchParams.origin).length === 0 && (
                <div className="search-dropdown-empty">No se encontraron ciudades</div>
              )}
            </div>
          )}
        </div>

        {/* Date */}
        <div className="search-field">
          <label className="search-label">
            <span className="search-icon">📅</span>
            Fecha de Ida
          </label>
          <input
            type="date"
            className="search-input"
            value={searchParams.date}
            min={getTodayStr()}
            onChange={(e) => setSearchParams(prev => ({ ...prev, date: e.target.value }))}
            id="date-input"
          />
        </div>

        {/* Return Date */}
        <div className="search-field">
          <label className="search-label">
            <span className="search-icon">📅</span>
            Fecha de Vuelta
          </label>
          <input
            type="date"
            className="search-input"
            value={searchParams.returnDate}
            min={searchParams.date || getTodayStr()}
            onChange={(e) => setSearchParams(prev => ({ ...prev, returnDate: e.target.value }))}
            id="return-date-input"
          />
        </div>

        {/* Passengers */}
        <div className="search-field search-field-small">
          <label className="search-label">
            <span className="search-icon">👥</span>
            Pasajeros
          </label>
          <select
            className="search-input"
            value={searchParams.passengers}
            onChange={(e) => setSearchParams(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
            id="passengers-input"
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'pasajero' : 'pasajeros'}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="search-submit"
        disabled={!searchParams.origin || !searchParams.destination}
        id="search-submit-btn"
      >
        <span className="search-submit-icon">🔍</span>
        Buscar Viajes
      </button>
    </form>
  );
}
