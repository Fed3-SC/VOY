import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StaticPage.css';

export default function ContactPage() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Sprint 2: reemplazar por POST a /api/contact
    setSent(true);
  };

  return (
    <div className="static-page">
      <div className="static-hero">
        <span className="static-hero-icon">📩</span>
        <h1 className="static-hero-title">Contacto</h1>
        <p className="static-hero-subtitle">Estamos para ayudarte. Respondemos en menos de 24 horas.</p>
      </div>

      <div className="container static-content">
        <div className="contact-grid">
          {/* Info */}
          <div className="contact-info">
            <div className="contact-info-item">
              <span className="contact-info-icon">📧</span>
              <div>
                <strong>Email</strong>
                <p>soporte@voy.ar</p>
              </div>
            </div>
            <div className="contact-info-item">
              <span className="contact-info-icon">📞</span>
              <div>
                <strong>Teléfono</strong>
                <p>0800-555-VOY (869)</p>
              </div>
            </div>
            <div className="contact-info-item">
              <span className="contact-info-icon">🕐</span>
              <div>
                <strong>Horario de atención</strong>
                <p>Lun–Vie: 9:00 a 18:00 hs</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="contact-form-wrapper">
            {sent ? (
              <div className="contact-success">
                <span className="contact-success-icon">✅</span>
                <h2>¡Mensaje enviado!</h2>
                <p>Te respondemos en menos de 24 horas hábiles.</p>
                <button className="static-btn static-btn-primary" onClick={() => navigate('/')}>
                  Volver al inicio
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-field">
                  <label className="contact-label">Nombre completo</label>
                  <input
                    type="text"
                    name="name"
                    className="contact-input"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre y apellido"
                    required
                  />
                </div>
                <div className="contact-field">
                  <label className="contact-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="contact-input"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="contact-field">
                  <label className="contact-label">Asunto</label>
                  <select
                    name="subject"
                    className="contact-input"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccioná un asunto</option>
                    <option value="reserva">Consulta sobre mi reserva</option>
                    <option value="pago">Problema con el pago</option>
                    <option value="cambio">Cambio o cancelación</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="contact-field">
                  <label className="contact-label">Mensaje</label>
                  <textarea
                    name="message"
                    className="contact-input contact-textarea"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Contanos tu consulta..."
                    rows={5}
                    required
                  />
                </div>
                <button type="submit" className="static-btn static-btn-primary contact-submit">
                  📤 Enviar mensaje
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="static-actions" style={{ marginTop: '2rem' }}>
          <button className="static-btn static-btn-secondary" onClick={() => navigate('/')}>
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
