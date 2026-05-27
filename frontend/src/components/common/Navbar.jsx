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

  const getUserInitial = () => {
    if (!user?.name) return '?';
    return user.name.charAt(0).toUpperCase();
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

          <div className="navbar-actions">
            <button className="navbar-btn-outline" onClick={() => {}}>
              Iniciar Sesión
            </button>
            <button className="navbar-cta" onClick={() => {}}>
              Crear cuenta
            </button>
          </div>

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
