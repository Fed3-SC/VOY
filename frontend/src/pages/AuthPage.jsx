import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { forgotPassword } from '../services/api';
import { validateEmail, validatePassword, validateDNI, validatePhone, validateRequired } from '../utils/validators';
import './AuthPage.css';
import './ResetPasswordPage.css';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // login | register | forgot
  const [formData, setFormData] = useState({
    name: '', lastName: '', email: '', phone: '', dni: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validateLogin = () => {
    const errs = {};
    const emailErr = validateEmail(formData.email);
    if (emailErr) errs.email = emailErr;
    if (!formData.password) errs.password = 'La contraseña es obligatoria';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateRegister = () => {
    const errs = {};
    const nameErr = validateRequired(formData.name, 'El nombre');
    if (nameErr) errs.name = nameErr;
    const lastNameErr = validateRequired(formData.lastName, 'El apellido');
    if (lastNameErr) errs.lastName = lastNameErr;
    const emailErr = validateEmail(formData.email);
    if (emailErr) errs.email = emailErr;
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) errs.phone = phoneErr;
    const dniErr = validateDNI(formData.dni);
    if (dniErr) errs.dni = dniErr;
    const passErr = validatePassword(formData.password);
    if (passErr) errs.password = passErr;
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = mode === 'login' ? validateLogin() : validateRegister();
    if (!isValid) return;

    setLoading(true);
    setServerError('');

    try {
      let res;
      if (mode === 'login') {
        res = await login(formData.email, formData.password);
      } else {
        res = await register(formData);
      }
      if (res.success) {
        navigate(redirect);
      } else {
        setServerError(res.error);
      }
    } catch {
      setServerError('Ocurrió un error. Intentá de nuevo.');
    }
    setLoading(false);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(forgotEmail);
    if (emailErr) {
      setForgotError(emailErr);
      return;
    }

    setLoading(true);
    setForgotError('');

    try {
      await forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch {
      setForgotError('Ocurrió un error. Intentá de nuevo.');
    }

    setLoading(false);
  };

  const switchToForgot = () => {
    setMode('forgot');
    setForgotEmail(formData.email || '');
    setForgotSent(false);
    setForgotError('');
    setErrors({});
    setServerError('');
  };

  const switchToLogin = () => {
    setMode('login');
    setErrors({});
    setServerError('');
    setForgotSent(false);
    setForgotError('');
  };

  // ── Modo: Olvidé mi contraseña ──
  if (mode === 'forgot') {
    return (
      <div className="auth-page">
        <div className="auth-container animate-fade-in">
          <div className="auth-header">
            <img src="/voy-logo.png" alt="Voy" className="auth-logo" />
            <h1 className="auth-title">¿Olvidaste tu contraseña?</h1>
            <p className="auth-subtitle">
              Ingresá tu email y te enviaremos un enlace para restablecerla
            </p>
          </div>

          {forgotSent ? (
            <>
              <div className="forgot-success">
                📧 Si el email está registrado, vas a recibir un enlace para restablecer tu contraseña.
                Revisá tu bandeja de entrada y la carpeta de spam.
              </div>
              <button className="forgot-back-btn" onClick={switchToLogin} id="back-to-login-link">
                ← Volver a Iniciar Sesión
              </button>
            </>
          ) : (
            <>
              {forgotError && (
                <div className="auth-error-banner">{forgotError}</div>
              )}

              <form className="auth-form" onSubmit={handleForgotSubmit}>
                <div className="auth-field">
                  <label className="auth-label">Email</label>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="juan@email.com"
                    value={forgotEmail}
                    onChange={(e) => { setForgotEmail(e.target.value); setForgotError(''); }}
                    autoFocus
                    id="forgot-email-input"
                  />
                </div>

                <button type="submit" className="auth-submit" disabled={loading} id="forgot-submit-btn">
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>

              <button className="forgot-back-btn" onClick={switchToLogin} id="forgot-back-btn">
                ← Volver a Iniciar Sesión
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Modo: Login / Register ──
  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in">
        <div className="auth-header">
          <img src="/voy-logo.png" alt="Voy" className="auth-logo" />
          <h1 className="auth-title">{mode === 'login' ? 'Iniciá sesión' : 'Creá tu cuenta'}</h1>
          <p className="auth-subtitle">
            {mode === 'login' ? 'Ingresá a tu cuenta para continuar' : 'Registrate para comprar tus pasajes'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setErrors({}); setServerError(''); }}
          >
            Iniciar Sesión
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setErrors({}); setServerError(''); }}
          >
            Registrarse
          </button>
        </div>

        {serverError && (
          <div className="auth-error-banner">{serverError}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label">Nombre</label>
                <input
                  type="text" name="name" className={`auth-input ${errors.name ? 'error' : ''}`}
                  placeholder="Juan" value={formData.name} onChange={handleChange}
                />
                {errors.name && <span className="auth-field-error">{errors.name}</span>}
              </div>
              <div className="auth-field">
                <label className="auth-label">Apellido</label>
                <input
                  type="text" name="lastName" className={`auth-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="Pérez" value={formData.lastName} onChange={handleChange}
                />
                {errors.lastName && <span className="auth-field-error">{errors.lastName}</span>}
              </div>
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email" name="email" className={`auth-input ${errors.email ? 'error' : ''}`}
              placeholder="juan@email.com" value={formData.email} onChange={handleChange}
            />
            {errors.email && <span className="auth-field-error">{errors.email}</span>}
          </div>

          {mode === 'register' && (
            <>
              <div className="auth-row">
                <div className="auth-field">
                  <label className="auth-label">Celular</label>
                  <input
                    type="tel" name="phone" className={`auth-input ${errors.phone ? 'error' : ''}`}
                    placeholder="1155667788" value={formData.phone} onChange={handleChange}
                  />
                  {errors.phone && <span className="auth-field-error">{errors.phone}</span>}
                </div>
                <div className="auth-field">
                  <label className="auth-label">DNI</label>
                  <input
                    type="text" name="dni" className={`auth-input ${errors.dni ? 'error' : ''}`}
                    placeholder="12345678" value={formData.dni} onChange={handleChange}
                  />
                  {errors.dni && <span className="auth-field-error">{errors.dni}</span>}
                </div>
              </div>
            </>
          )}

          <div className="auth-field">
            <label className="auth-label">Contraseña</label>
            <input
              type="password" name="password" className={`auth-input ${errors.password ? 'error' : ''}`}
              placeholder="••••••" value={formData.password} onChange={handleChange}
            />
            {errors.password && <span className="auth-field-error">{errors.password}</span>}
          </div>

          {mode === 'login' && (
            <div className="auth-forgot-link">
              <button type="button" onClick={switchToForgot} id="forgot-password-link">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {mode === 'register' && (
            <div className="auth-field">
              <label className="auth-label">Confirmar Contraseña</label>
              <input
                type="password" name="confirmPassword" className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••" value={formData.confirmPassword} onChange={handleChange}
              />
              {errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword}</span>}
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading} id="auth-submit-btn">
            {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
