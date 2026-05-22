import { useNavigate } from 'react-router-dom';
import './StaticPage.css';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="static-page">
      <div className="static-hero">
        <span className="static-hero-icon">🔒</span>
        <h1 className="static-hero-title">Política de Privacidad</h1>
        <p className="static-hero-subtitle">Última actualización: Mayo 2026</p>
      </div>

      <div className="container static-content">
        <section className="static-section">
          <h2 className="static-section-title">1. Datos que Recopilamos</h2>
          <p className="static-text">
            Recopilamos datos personales necesarios para la prestación del servicio: nombre, apellido, DNI,
            email y teléfono. Estos datos se utilizan exclusivamente para gestionar tus reservas y comunicaciones.
          </p>
        </section>

        <section className="static-section">
          <h2 className="static-section-title">2. Uso de los Datos</h2>
          <p className="static-text">
            Tus datos personales se utilizan para: procesar reservas, emitir pasajes digitales, enviarte
            confirmaciones por email y mejorar la experiencia dentro de la plataforma.
          </p>
          <ul className="static-list">
            <li>✅ Procesamiento de reservas y pagos</li>
            <li>✅ Comunicaciones relacionadas a tu viaje</li>
            <li>✅ Mejora del servicio y análisis interno</li>
            <li>❌ No vendemos ni compartimos tus datos con terceros</li>
          </ul>
        </section>

        <section className="static-section">
          <h2 className="static-section-title">3. Almacenamiento y Seguridad</h2>
          <p className="static-text">
            Tus datos se almacenan de forma segura. Implementamos medidas técnicas y organizativas para
            proteger tu información contra accesos no autorizados.
          </p>
        </section>

        <section className="static-section">
          <h2 className="static-section-title">4. Tus Derechos</h2>
          <p className="static-text">
            Tenés derecho a acceder, rectificar y eliminar tus datos personales en cualquier momento.
            Para ejercer estos derechos, contactanos a través de nuestra página de contacto.
          </p>
        </section>

        <section className="static-section">
          <h2 className="static-section-title">5. Cookies</h2>
          <p className="static-text">
            Utilizamos almacenamiento local del navegador para mantener tu sesión activa y guardar
            preferencias de búsqueda. No utilizamos cookies de rastreo de terceros.
          </p>
        </section>

        <div className="static-actions">
          <button className="static-btn static-btn-secondary" onClick={() => navigate('/')}>
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
