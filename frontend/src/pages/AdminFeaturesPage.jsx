import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFeatures, createFeature, updateFeature, deleteFeature } from '../services/api';
import './AdminFeaturesPage.css';

const EMPTY_FORM = { name: '', icon: '' };

// Sugerencias de íconos predefinidas
const ICON_SUGGESTIONS = [
  { icon: '📶', label: 'WiFi' },
  { icon: '❄️', label: 'Aire acond.' },
  { icon: '💺', label: 'Asientos' },
  { icon: '🔌', label: 'USB/Carga' },
  { icon: '🚽', label: 'Baño' },
  { icon: '🛏️', label: 'Cama' },
  { icon: '🍽️', label: 'Comida' },
  { icon: '🎬', label: 'Películas' },
  { icon: '☕', label: 'Café' },
  { icon: '🎵', label: 'Audio' },
  { icon: '🔒', label: 'Seguridad' },
  { icon: '♿', label: 'Accesible' },
];

export default function AdminFeaturesPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadFeatures = useCallback(async () => {
    setLoading(true);
    const res = await getFeatures();
    if (res.success) setFeatures(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    loadFeatures();
  }, [isAuthenticated, isAdmin, loadFeatures]);

  if (!isAuthenticated) {
    return (
      <div className="admin-features-page">
        <div className="container">
          <div className="afp-empty animate-fade-in">
            <span className="afp-empty-icon">🔐</span>
            <h2>Acceso restringido</h2>
            <p>Iniciá sesión para acceder a esta sección</p>
            <button className="afp-btn-primary" onClick={() => navigate('/auth')}>Iniciar Sesión</button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-features-page">
        <div className="container">
          <div className="afp-empty animate-fade-in">
            <span className="afp-empty-icon">🛡️</span>
            <h2>Permisos insuficientes</h2>
            <p>Solo los administradores pueden acceder a esta sección.</p>
            <button className="afp-btn-secondary" onClick={() => navigate('/admin')}>← Volver</button>
          </div>
        </div>
      </div>
    );
  }

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (feature) => {
    setEditingId(feature.id);
    setForm({ name: feature.name, icon: feature.icon });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('El nombre es obligatorio');
      return;
    }
    if (!form.icon.trim()) {
      setFormError('El ícono es obligatorio');
      return;
    }

    setFormLoading(true);
    let res;
    if (editingId) {
      res = await updateFeature(editingId, { name: form.name.trim(), icon: form.icon.trim() });
    } else {
      res = await createFeature({ name: form.name.trim(), icon: form.icon.trim() });
    }
    setFormLoading(false);

    if (res.success) {
      showToast(editingId ? '✅ Característica actualizada' : '✅ Característica creada');
      setShowForm(false);
      loadFeatures();
    } else {
      setFormError(res.error || 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const res = await deleteFeature(deleteTarget.id);
    setDeleteLoading(false);
    setDeleteTarget(null);

    if (res.success) {
      showToast('🗑️ Característica eliminada');
      loadFeatures();
    } else {
      showToast(res.error || 'Error al eliminar', 'error');
    }
  };

  return (
    <div className="admin-features-page">
      <div className="container">
        {/* Header */}
        <div className="afp-header animate-fade-in">
          <div>
            <button className="afp-back-btn" onClick={() => navigate('/admin')}>
              ← Panel Admin
            </button>
            <h1 className="afp-title">✨ Administrar Características</h1>
            <p className="afp-subtitle">{features.length} características disponibles</p>
          </div>
          <button className="afp-btn-primary" onClick={openCreateForm} id="add-feature-btn">
            ＋ Añadir nueva
          </button>
        </div>

        {/* Grid de features */}
        <div className="afp-grid-wrapper animate-fade-in-up">
          {loading ? (
            <div className="spinner-container"><div className="spinner"></div></div>
          ) : features.length === 0 ? (
            <div className="afp-empty">
              <span className="afp-empty-icon">✨</span>
              <h3>No hay características</h3>
              <p>Creá la primera característica usando el botón de arriba.</p>
            </div>
          ) : (
            <div className="afp-grid">
              {features.map(feature => (
                <div key={feature.id} className="afp-card" id={`feature-${feature.id}`}>
                  <div className="afp-card-icon">{feature.icon}</div>
                  <div className="afp-card-name">{feature.name}</div>
                  <div className="afp-card-actions">
                    <button
                      className="afp-btn-icon edit"
                      onClick={() => openEditForm(feature)}
                      title="Editar"
                      id={`edit-feature-${feature.id}`}
                    >
                      ✏️
                    </button>
                    <button
                      className="afp-btn-icon delete"
                      onClick={() => setDeleteTarget(feature)}
                      title="Eliminar"
                      id={`delete-feature-${feature.id}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Crear/Editar */}
        {showForm && (
          <div className="afp-modal-overlay" onClick={() => setShowForm(false)}>
            <div className="afp-modal" onClick={e => e.stopPropagation()}>
              <div className="afp-modal-header">
                <h2>{editingId ? '✏️ Editar Característica' : '＋ Nueva Característica'}</h2>
                <button className="afp-modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="afp-form">
                {formError && <div className="afp-form-error">{formError}</div>}

                <div className="afp-form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormError(''); }}
                    placeholder="Ej: WiFi, Aire acondicionado..."
                    required
                    id="feature-name-input"
                  />
                </div>

                <div className="afp-form-group">
                  <label>Ícono *</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={e => { setForm(f => ({ ...f, icon: e.target.value })); setFormError(''); }}
                    placeholder="Pegá un emoji o símbolo..."
                    required
                    id="feature-icon-input"
                  />
                  <p className="afp-form-hint">Podés copiar cualquier emoji desde tu teclado o de internet</p>
                </div>

                {/* Sugerencias rápidas */}
                <div className="afp-form-group">
                  <label>Sugerencias rápidas</label>
                  <div className="afp-icon-suggestions">
                    {ICON_SUGGESTIONS.map(({ icon, label }) => (
                      <button
                        key={icon}
                        type="button"
                        className={`afp-icon-chip ${form.icon === icon ? 'selected' : ''}`}
                        onClick={() => setForm(f => ({ ...f, icon }))}
                        title={label}
                      >
                        {icon}
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {(form.icon || form.name) && (
                  <div className="afp-preview">
                    <span className="afp-preview-label">Vista previa:</span>
                    <div className="afp-preview-chip">
                      <span>{form.icon}</span>
                      <span>{form.name || '—'}</span>
                    </div>
                  </div>
                )}

                <div className="afp-form-actions">
                  <button type="button" className="afp-btn-secondary" onClick={() => setShowForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="afp-btn-primary" disabled={formLoading}>
                    {formLoading ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Característica'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Eliminar */}
        {deleteTarget && (
          <div className="afp-modal-overlay" onClick={() => setDeleteTarget(null)}>
            <div className="afp-modal afp-modal-sm" onClick={e => e.stopPropagation()}>
              <div className="afp-modal-header">
                <h2>⚠️ Confirmar Eliminación</h2>
                <button className="afp-modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
              </div>
              <div className="afp-modal-body">
                <p>¿Eliminar la característica <strong>{deleteTarget.icon} {deleteTarget.name}</strong>?</p>
                <p className="afp-modal-warning">Esta acción también removerá la característica de todos los viajes asociados.</p>
                <div className="afp-form-actions">
                  <button className="afp-btn-secondary" onClick={() => setDeleteTarget(null)}>
                    Cancelar
                  </button>
                  <button className="afp-btn-danger" onClick={handleDelete} disabled={deleteLoading}>
                    {deleteLoading ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`afp-toast ${toast.type}`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
