import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { validateResetToken, resetPassword } from '../services/api';
import { validatePassword } from '../utils/validators';
import './ResetPasswordPage.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState('validating'); // validating | valid | invalid | success | error
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Validar token al cargar la página
  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    validateResetToken(token).then(res => {
      if (res.success && res.data.valid) {
        setStatus('valid');
      } else {
        setStatus('invalid');
      }
    }).catch(() => {
      setStatus('invalid');
    });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones del lado del cliente
    const errs = {};
    const passErr = validatePassword(password);
    if (passErr) errs.password = passErr;
    if (password !== confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setServerError('');

    try {
      const res = await resetPassword(token, password);
      if (res.success) {
        setStatus('success');
      } else {
        setServerError(res.error || 'No se pudo restablecer la contraseña.');
        setStatus('error');
      }
    } catch {
      setServerError('Ocurrió un error. Intentá de nuevo.');
      setStatus('error');
    }

    setLoading(false);
  };

  // ── Estado: Validando token ──
  if (status === 'validating') {
    return (
      <div className="reset-page">
        <div className="reset-container animate-fade-in">
          <div className="reset-header">
            <img src="/voy-logo.png" alt="Voy" className="auth-logo" />
            <h1 className="auth-title">Verificando enlace...</h1>
            <p className="auth-subtitle">Estamos validando tu enlace de restablecimiento</p>
          </div>
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  // ── Estado: Token inválido o expirado ──
  if (status === 'invalid') {
    return (
      <div className="reset-page">
        <div className="reset-container animate-fade-in">
          <div className="reset-header">
            <img src="/voy-logo.png" alt="Voy" className="auth-logo" />
            <div className="reset-icon reset-icon-error">✕</div>
            <h1 className="auth-title">Enlace inválido</h1>
            <p className="auth-subtitle">
              Este enlace de restablecimiento ya expiró o ya fue utilizado.
              Solicitá uno nuevo desde la pantalla de inicio de sesión.
            </p>
          </div>
          <button
            className="auth-submit"
            onClick={() => navigate('/auth')}
            id="back-to-login-btn"
          >
            Volver a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // ── Estado: Contraseña restablecida exitosamente ──
  if (status === 'success') {
    return (
      <div className="reset-page">
        <div className="reset-container animate-fade-in">
          <div className="reset-header">
            <img src="/voy-logo.png" alt="Voy" className="auth-logo" />
            <div className="reset-icon reset-icon-success">✓</div>
            <h1 className="auth-title">¡Contraseña restablecida!</h1>
            <p className="auth-subtitle">
              Tu contraseña fue actualizada correctamente.
              Ya podés iniciar sesión con tu nueva contraseña.
            </p>
          </div>
          <button
            className="auth-submit"
            onClick={() => navigate('/auth')}
            id="go-to-login-btn"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // ── Estado: Formulario de nueva contraseña (valid / error) ──
  return (
    <div className="reset-page">
      <div className="reset-container animate-fade-in">
        <div className="reset-header">
          <img src="/voy-logo.png" alt="Voy" className="auth-logo" />
          <h1 className="auth-title">Nueva contraseña</h1>
          <p className="auth-subtitle">Ingresá tu nueva contraseña para restablecer el acceso</p>
        </div>

        {serverError && (
          <div className="auth-error-banner">{serverError}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Nueva contraseña</label>
            <input
              type="password"
              className={`auth-input ${errors.password ? 'error' : ''}`}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                setServerError('');
              }}
              autoFocus
              id="new-password-input"
            />
            {errors.password && <span className="auth-field-error">{errors.password}</span>}
          </div>

          <div className="auth-field">
            <label className="auth-label">Confirmar contraseña</label>
            <input
              type="password"
              className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Repetí tu nueva contraseña"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
              }}
              id="confirm-password-input"
            />
            {errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="auth-submit" disabled={loading} id="reset-submit-btn">
            {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
