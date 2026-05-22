import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" id="navbar-logo">
          <img src="/voy-logo.png" alt="Voy" className="navbar-logo-img" />
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link
            to="/"
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Inicio
          </Link>
          <Link
            to="/mis-viajes"
            className={`navbar-link ${isActive('/mis-viajes') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Mis Viajes
          </Link>

          {isAuthenticated ? (
            <div className="navbar-user">
              <span className="navbar-user-name">
                <span className="navbar-user-icon">👤</span>
                {user.name}
              </span>
              <button className="navbar-logout-btn" onClick={logout} id="logout-btn">
                Salir
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="navbar-cta"
              onClick={() => setMenuOpen(false)}
              id="login-nav-btn"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>

        <button
          className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
          id="hamburger-btn"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
