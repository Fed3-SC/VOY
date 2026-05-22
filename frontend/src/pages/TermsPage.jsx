import { useNavigate } from 'react-router-dom';
import './StaticPage.css';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="static-page">
      <div className="static-hero">
        <span className="static-hero-icon">📋</span>
        <h1 className="static-hero-title">Términos y Condiciones</h1>
        <p className="static-hero-subtitle">Última actualización: Mayo 2026</p>
      </div>

      <div className="container static-content">
        <section className="static-section">
          <h2 className="static-section-title">1. Aceptación de los Términos</h2>
          <p className="static-text">
            Al utilizar la plataforma Voy, aceptás los presentes Términos y Condiciones. Si no estás de acuerdo
            con alguno de estos términos, te pedimos que no utilices nuestros servicios.
          </p>
        </section>

        <section className="static-section">
          <h2 className="static-section-title">2. Descripción del Servicio</h2>
          <p className="static-text">
            Voy es una plataforma digital que permite buscar, comparar y adquirir pasajes de micro en Argentina.
            Actuamos como intermediario entre el pasajero y las empresas de transporte.
          </p>
        </section>

        <section className="static-section">
          <h2 className="static-section-title">3. Registro y Cuenta</h2>
          <p className="static-text">
            Para comprar pasajes debés crear una cuenta con información veraz y actualizada. Sos responsable
            de mantener la confidencialidad de tus credenciales de acceso.
          </p>
        </section>

        <section className="static-section">
          <h2 className="static-section-title">4. Compras y Pagos</h2>
          <p className="static-text">
            Todos los precios se expresan en pesos argentinos e incluyen los cargos por servicio. El pago
            confirma la reserva de forma inmediata y se emite el pasaje digital correspondiente.
          </p>
        </section>

        <section className="static-section">
          <h2 className="static-section-title">5. Cancelaciones y Cambios</h2>
          <p className="static-text">
            Las políticas de cancelación y cambio dependen de cada empresa de transporte. Voy facilita la
            gestión de estos trámites pero no es responsable de las políticas individuales de cada empresa.
          </p>
        </section>

        <section className="static-section">
          <h2 className="static-section-title">6. Limitación de Responsabilidad</h2>
          <p className="static-text">
            Voy no se hace responsable por retrasos, cancelaciones o incumplimientos por parte de las empresas
            de transporte. Nuestra responsabilidad se limita al servicio de intermediación digital.
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
