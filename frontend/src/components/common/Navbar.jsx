import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  const handleSwitchAccount = async () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    await logout();
    navigate('/auth');
  };

  const getUserInitials = () => {
    if (!user?.name) return '?';
    // Nombre principal: primera palabra del nombre
    const nameParts = user.name.trim().split(/\s+/);
    const firstInitial = nameParts[0].charAt(0).toUpperCase();
    
    // Apellido principal: última palabra del apellido (ej. "Pérez Gómez" -> "Gómez" -> "G")
    let lastInitial = '';
    if (user.lastName) {
      const lastNameParts = user.lastName.trim().split(/\s+/);
      lastInitial = lastNameParts[lastNameParts.length - 1].charAt(0).toUpperCase();
    }
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" id="navbar-logo">
          <img src="/voy-logo.png" alt="Voy" className="navbar-logo-img" />
          <span className="navbar-slogan">Viajá cómodo y seguro</span>
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
              <button
                ref={triggerRef}
                className={`navbar-user-trigger ${dropdownOpen ? 'open' : ''}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Menú de usuario"
                id="user-menu-trigger"
              >
                <span className="navbar-user-avatar">{getUserInitials()}</span>
                <span className="navbar-user-name">{user.name}</span>
                <span className="navbar-user-chevron">▼</span>
              </button>

              <div
                ref={dropdownRef}
                className={`user-dropdown ${dropdownOpen ? 'visible' : ''}`}
                id="user-dropdown"
              >
                <div className="user-dropdown-header">
                  <div className="user-dropdown-name">{user.name} {user.lastName || ''}</div>
                  <div className="user-dropdown-email">{user.email}</div>
                </div>

                <div className="user-dropdown-items">
                  <Link
                    to="/perfil"
                    className="user-dropdown-item"
                    onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}
                    id="dropdown-profile"
                  >
                    <span className="user-dropdown-item-icon">👤</span>
                    Ver cuenta
                  </Link>
                  <Link
                    to="/mis-viajes"
                    className="user-dropdown-item"
                    onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}
                    id="dropdown-trips"
                  >
                    <span className="user-dropdown-item-icon">🎫</span>
                    Mis viajes
                  </Link>
                  <Link
                    to="/favoritos"
                    className="user-dropdown-item"
                    onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}
                    id="dropdown-favorites"
                  >
                    <span className="user-dropdown-item-icon">❤️</span>
                    Mis favoritos
                  </Link>

                  <div className="user-dropdown-divider" />

                  <button
                    className="user-dropdown-item"
                    onClick={handleSwitchAccount}
                    id="dropdown-switch"
                  >
                    <span className="user-dropdown-item-icon">🔄</span>
                    Cambiar cuenta
                  </button>
                  <button
                    className="user-dropdown-item logout"
                    onClick={handleLogout}
                    id="dropdown-logout"
                  >
                    <span className="user-dropdown-item-icon">🚪</span>
                    Salir
                  </button>
                </div>
              </div>
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
