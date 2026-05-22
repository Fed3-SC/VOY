import { useNavigate } from 'react-router-dom';
import './StaticPage.css';

export default function HelpCenterPage() {
  const navigate = useNavigate();

  const faqs = [
    {
      q: '¿Cómo compro un pasaje?',
      a: 'Buscá tu destino en la pantalla principal, seleccioná el viaje que más te convenga, completá tus datos y elegí el método de pago.',
    },
    {
      q: '¿Puedo cancelar mi reserva?',
      a: 'Sí, podés cancelar hasta 48 horas antes del viaje sin cargo. Pasado ese plazo, se aplican las políticas de cada empresa.',
    },
    {
      q: '¿Cómo recibo mi pasaje?',
      a: 'Tu pasaje digital se envía al email registrado y también podés verlo en "Mis Viajes" dentro de tu cuenta.',
    },
    {
      q: '¿Qué pasa si el micro se retrasa?',
      a: 'En caso de retraso significativo, la empresa de transporte te notificará directamente. Desde Voy te mantenemos informado.',
    },
    {
      q: '¿Cómo cambio la fecha de mi viaje?',
      a: 'Los cambios dependen de la política de cada empresa. Contactá a soporte con tu código de reserva.',
    },
  ];

  return (
    <div className="static-page">
      <div className="static-hero">
        <span className="static-hero-icon">🤝</span>
        <h1 className="static-hero-title">Centro de Ayuda</h1>
        <p className="static-hero-subtitle">Encontrá respuestas a las preguntas más frecuentes</p>
      </div>

      <div className="container static-content">
        <section className="static-section">
          <h2 className="static-section-title">Preguntas Frecuentes</h2>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <h3 className="faq-question">❓ {faq.q}</h3>
                <p className="faq-answer">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="static-section static-contact-cta">
          <h2 className="static-section-title">¿No encontraste lo que buscabas?</h2>
          <p className="static-text">Nuestro equipo está disponible de Lunes a Viernes de 9 a 18 hs.</p>
          <div className="static-actions">
            <button className="static-btn static-btn-primary" onClick={() => navigate('/contacto')}>
              📩 Contactarnos
            </button>
            <button className="static-btn static-btn-secondary" onClick={() => navigate('/')}>
              ← Volver al inicio
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
