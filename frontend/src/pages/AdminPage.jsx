import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAllTrips, createTrip, updateTrip, deleteTrip,
  getCities, getCompanies,
} from '../services/api';
import { formatTime, formatDate, formatPrice, formatServiceType } from '../utils/formatters';
import './AdminPage.css';

const EMPTY_FORM = {
  companyId: '',
  originCityId: '',
  destinationCityId: '',
  departureTime: '',
  arrivalTime: '',
  durationMinutes: '',
  serviceType: 'semicama',
  price: '',
  totalSeats: '',
  availableSeats: '',
};

export default function AdminPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [cities, setCities] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 15;

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadTrips = useCallback(async () => {
    setLoading(true);
    const res = await getAllTrips(PAGE_SIZE, page * PAGE_SIZE);
    if (res.success) {
      setTrips(res.data);
      setTotal(res.meta?.total || res.data.length);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    if (!isAuthenticated) return;

    Promise.all([getCities(), getCompanies()]).then(([citiesRes, companiesRes]) => {
      if (citiesRes.success) setCities(citiesRes.data);
      if (companiesRes.success) setCompanies(companiesRes.data);
    });
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadTrips();
  }, [isAuthenticated, loadTrips]);

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="admin-empty animate-fade-in">
            <span className="admin-empty-icon">🔐</span>
            <h2>Acceso restringido</h2>
            <p>Iniciá sesión para acceder al panel de administración</p>
            <button className="admin-btn-primary" onClick={() => navigate('/auth?redirect=/admin')}>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (trip) => {
    setEditingId(trip.id);
    setForm({
      companyId: trip.companyId,
      originCityId: trip.originCityId,
      destinationCityId: trip.destinationCityId,
      departureTime: trip.departureTime ? new Date(trip.departureTime).toISOString().slice(0, 16) : '',
      arrivalTime: trip.arrivalTime ? new Date(trip.arrivalTime).toISOString().slice(0, 16) : '',
      durationMinutes: trip.durationMinutes,
      serviceType: trip.serviceType,
      price: trip.price,
      totalSeats: trip.totalSeats,
      availableSeats: trip.availableSeats,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Basic validation
    if (!form.companyId || !form.originCityId || !form.destinationCityId) {
      setFormError('Completá empresa, origen y destino.');
      return;
    }
    if (String(form.originCityId) === String(form.destinationCityId)) {
      setFormError('El origen y destino no pueden ser iguales.');
      return;
    }
    if (!form.departureTime || !form.price || !form.totalSeats) {
      setFormError('Completá fecha de salida, precio y asientos.');
      return;
    }

    setFormLoading(true);

    const payload = {
      companyId: parseInt(form.companyId),
      originCityId: parseInt(form.originCityId),
      destinationCityId: parseInt(form.destinationCityId),
      departureTime: form.departureTime,
      arrivalTime: form.arrivalTime || new Date(new Date(form.departureTime).getTime() + (parseInt(form.durationMinutes) || 360) * 60000).toISOString(),
      durationMinutes: parseInt(form.durationMinutes) || 360,
      serviceType: form.serviceType,
      price: parseInt(form.price),
      totalSeats: parseInt(form.totalSeats),
      availableSeats: parseInt(form.availableSeats) || parseInt(form.totalSeats),
    };

    let res;
    if (editingId) {
      res = await updateTrip(editingId, payload);
    } else {
      res = await createTrip(payload);
    }

    setFormLoading(false);

    if (res.success) {
      showToast(editingId ? '✅ Viaje actualizado' : '✅ Viaje creado');
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      loadTrips();
    } else {
      setFormError(res.error || 'Error al guardar el viaje');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteTrip(deleteTarget.id);
    if (res.success) {
      showToast('🗑️ Viaje eliminado');
      setDeleteTarget(null);
      loadTrips();
    } else {
      showToast(res.error || 'Error al eliminar', 'error');
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="admin-page">
      <div className="container">
        {/* Header */}
        <div className="admin-header animate-fade-in">
          <div>
            <h1 className="admin-title">⚙️ Panel de Administración</h1>
            <p className="admin-subtitle">Gestión de viajes — {total} viajes activos</p>
          </div>
          <button className="admin-btn-primary" onClick={openCreateForm} id="admin-add-trip">
            ＋ Nuevo Viaje
          </button>
        </div>

        {/* Trips Table */}
        <div className="admin-table-wrapper animate-fade-in-up">
          {loading ? (
            <div className="spinner-container"><div className="spinner"></div></div>
          ) : trips.length === 0 ? (
            <div className="admin-empty">
              <span className="admin-empty-icon">🚌</span>
              <h3>No hay viajes</h3>
              <p>Creá el primer viaje usando el botón de arriba.</p>
            </div>
          ) : (
            <>
              <div className="admin-table-scroll">
                <table className="admin-table" id="admin-trips-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Ruta</th>
                      <th>Empresa</th>
                      <th>Salida</th>
                      <th>Servicio</th>
                      <th>Precio</th>
                      <th>Asientos</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map(trip => (
                      <tr key={trip.id}>
                        <td className="admin-td-id">{trip.id}</td>
                        <td>
                          <div className="admin-route">
                            <span>{trip.origin?.name}</span>
                            <span className="admin-arrow">→</span>
                            <span>{trip.destination?.name}</span>
                          </div>
                        </td>
                        <td>{trip.company?.name}</td>
                        <td>
                          <div className="admin-datetime">
                            <span>{formatDate(trip.departureTime)}</span>
                            <span className="admin-time">{formatTime(trip.departureTime)}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${trip.serviceType === 'cama' ? 'accent' : trip.serviceType === 'semicama' ? 'primary' : 'success'}`}>
                            {formatServiceType(trip.serviceType)}
                          </span>
                        </td>
                        <td className="admin-td-price">{formatPrice(trip.price)}</td>
                        <td>
                          <span className={trip.availableSeats <= 5 ? 'admin-seats-low' : ''}>
                            {trip.availableSeats}/{trip.totalSeats}
                          </span>
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button
                              className="admin-btn-icon edit"
                              onClick={() => openEditForm(trip)}
                              title="Editar"
                              id={`edit-trip-${trip.id}`}
                            >
                              ✏️
                            </button>
                            <button
                              className="admin-btn-icon delete"
                              onClick={() => setDeleteTarget(trip)}
                              title="Eliminar"
                              id={`delete-trip-${trip.id}`}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="admin-pagination">
                  <button
                    className="admin-btn-page"
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ← Anterior
                  </button>
                  <span className="admin-page-info">
                    Página {page + 1} de {totalPages}
                  </span>
                  <button
                    className="admin-btn-page"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>{editingId ? '✏️ Editar Viaje' : '＋ Nuevo Viaje'}</h2>
                <button className="admin-modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="admin-form">
                {formError && <div className="admin-form-error">{formError}</div>}

                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label>Origen *</label>
                    <select name="originCityId" value={form.originCityId} onChange={handleChange} required>
                      <option value="">Seleccionar...</option>
                      {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Destino *</label>
                    <select name="destinationCityId" value={form.destinationCityId} onChange={handleChange} required>
                      <option value="">Seleccionar...</option>
                      {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Empresa *</label>
                    <select name="companyId" value={form.companyId} onChange={handleChange} required>
                      <option value="">Seleccionar...</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Tipo de Servicio *</label>
                    <select name="serviceType" value={form.serviceType} onChange={handleChange} required>
                      <option value="comun">Común</option>
                      <option value="semicama">Semicama</option>
                      <option value="cama">Cama</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Fecha/Hora Salida *</label>
                    <input
                      type="datetime-local"
                      name="departureTime"
                      value={form.departureTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Fecha/Hora Llegada</label>
                    <input
                      type="datetime-local"
                      name="arrivalTime"
                      value={form.arrivalTime}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Duración (minutos)</label>
                    <input
                      type="number"
                      name="durationMinutes"
                      value={form.durationMinutes}
                      onChange={handleChange}
                      placeholder="360"
                      min="1"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Precio (ARS) *</label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="25000"
                      min="1"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Asientos Totales *</label>
                    <input
                      type="number"
                      name="totalSeats"
                      value={form.totalSeats}
                      onChange={handleChange}
                      placeholder="40"
                      min="1"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Asientos Disponibles</label>
                    <input
                      type="number"
                      name="availableSeats"
                      value={form.availableSeats}
                      onChange={handleChange}
                      placeholder="Igual que totales"
                      min="0"
                    />
                  </div>
                </div>

                <div className="admin-form-actions">
                  <button type="button" className="admin-btn-secondary" onClick={() => setShowForm(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="admin-btn-primary" disabled={formLoading}>
                    {formLoading ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Viaje'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteTarget && (
          <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
            <div className="admin-modal admin-modal-sm" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>⚠️ Confirmar Eliminación</h2>
                <button className="admin-modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
              </div>
              <div className="admin-delete-body">
                <p>¿Estás seguro de que querés eliminar este viaje?</p>
                <div className="admin-delete-info">
                  <strong>{deleteTarget.origin?.name} → {deleteTarget.destination?.name}</strong>
                  <span>{deleteTarget.company?.name} — {formatDate(deleteTarget.departureTime)}</span>
                </div>
                <div className="admin-form-actions">
                  <button className="admin-btn-secondary" onClick={() => setDeleteTarget(null)}>
                    Cancelar
                  </button>
                  <button className="admin-btn-danger" onClick={handleDelete}>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`admin-toast ${toast.type}`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
