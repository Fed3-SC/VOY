import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers, promoteUser, demoteUser } from '../services/api';
import './AdminUsersPage.css';

export default function AdminUsersPage() {
  const { isAuthenticated, isAdmin, user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { user, action: 'promote'|'demote' }
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const res = await getUsers();
    if (res.success) {
      setUsers(res.data);
    } else {
      showToast(res.error || 'Error al cargar usuarios', 'error');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    loadUsers();
  }, [isAuthenticated, isAdmin, loadUsers]);

  if (!isAuthenticated) {
    return (
      <div className="admin-users-page">
        <div className="container">
          <div className="aup-empty animate-fade-in">
            <span className="aup-empty-icon">🔐</span>
            <h2>Acceso restringido</h2>
            <p>Iniciá sesión para acceder al panel de administración</p>
            <button className="aup-btn-primary" onClick={() => navigate('/auth?redirect=/admin/users')}>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-users-page">
        <div className="container">
          <div className="aup-empty animate-fade-in">
            <span className="aup-empty-icon">🛡️</span>
            <h2>Permisos insuficientes</h2>
            <p>Solo los administradores pueden acceder a esta sección.</p>
            <button className="aup-btn-secondary" onClick={() => navigate('/admin')}>
              ← Volver al panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirm = async () => {
    if (!confirmModal) return;
    setActionLoading(true);

    const { user, action } = confirmModal;
    const res = action === 'promote'
      ? await promoteUser(user.id)
      : await demoteUser(user.id);

    setActionLoading(false);
    setConfirmModal(null);

    if (res.success) {
      showToast(
        action === 'promote'
          ? `✅ ${user.name} ${user.lastName} ahora es administrador`
          : `✅ Permisos removidos de ${user.name} ${user.lastName}`
      );
      loadUsers();
    } else {
      showToast(res.error || 'Error al actualizar permisos', 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  return (
    <div className="admin-users-page">
      <div className="container">
        {/* Header */}
        <div className="aup-header animate-fade-in">
          <div>
            <button className="aup-back-btn" onClick={() => navigate('/admin')}>
              ← Panel Admin
            </button>
            <h1 className="aup-title">👥 Administrar Usuarios</h1>
            <p className="aup-subtitle">{users.length} usuarios registrados</p>
          </div>
        </div>

        {/* Tabla */}
        <div className="aup-table-wrapper animate-fade-in-up">
          {loading ? (
            <div className="spinner-container"><div className="spinner"></div></div>
          ) : users.length === 0 ? (
            <div className="aup-empty">
              <span className="aup-empty-icon">👥</span>
              <h3>No hay usuarios</h3>
            </div>
          ) : (
            <div className="aup-table-scroll">
              <table className="aup-table" id="admin-users-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>DNI</th>
                    <th>Registro</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className={u.id === currentUser?.id ? 'aup-row-current' : ''}>
                      <td>
                        <div className="aup-user-cell">
                          <div className="aup-user-avatar">
                            {u.name.charAt(0)}{u.lastName?.charAt(0) || ''}
                          </div>
                          <div>
                            <div className="aup-user-name">{u.name} {u.lastName}</div>
                            {u.id === currentUser?.id && (
                              <span className="aup-badge-you">Tú</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="aup-td-email">{u.email}</td>
                      <td>{u.dni}</td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        {u.isAdmin ? (
                          <span className="aup-badge aup-badge-admin">⭐ Admin</span>
                        ) : (
                          <span className="aup-badge aup-badge-user">👤 Usuario</span>
                        )}
                      </td>
                      <td>
                        <div className="aup-actions">
                          {u.isAdmin ? (
                            <button
                              className="aup-btn-danger-sm"
                              onClick={() => setConfirmModal({ user: u, action: 'demote' })}
                              disabled={u.id === currentUser?.id}
                              title={u.id === currentUser?.id ? 'No podés quitarte los permisos a vos mismo' : 'Quitar permisos'}
                              id={`demote-${u.id}`}
                            >
                              🔽 Quitar admin
                            </button>
                          ) : (
                            <button
                              className="aup-btn-primary-sm"
                              onClick={() => setConfirmModal({ user: u, action: 'promote' })}
                              id={`promote-${u.id}`}
                            >
                              ⭐ Hacer admin
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de confirmación */}
        {confirmModal && (
          <div className="aup-modal-overlay" onClick={() => setConfirmModal(null)}>
            <div className="aup-modal" onClick={e => e.stopPropagation()}>
              <div className="aup-modal-header">
                <h2>
                  {confirmModal.action === 'promote' ? '⭐ Confirmar Promoción' : '⚠️ Confirmar Remoción'}
                </h2>
                <button className="aup-modal-close" onClick={() => setConfirmModal(null)}>✕</button>
              </div>
              <div className="aup-modal-body">
                <p>
                  {confirmModal.action === 'promote'
                    ? `¿Convertir a ${confirmModal.user.name} ${confirmModal.user.lastName} en administrador?`
                    : `¿Quitar los permisos de administrador a ${confirmModal.user.name} ${confirmModal.user.lastName}?`
                  }
                </p>
                <div className="aup-modal-user-info">
                  <strong>{confirmModal.user.name} {confirmModal.user.lastName}</strong>
                  <span>{confirmModal.user.email}</span>
                </div>
                <div className="aup-modal-actions">
                  <button className="aup-btn-secondary" onClick={() => setConfirmModal(null)}>
                    Cancelar
                  </button>
                  <button
                    className={confirmModal.action === 'promote' ? 'aup-btn-primary' : 'aup-btn-danger'}
                    onClick={handleConfirm}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Procesando...' : confirmModal.action === 'promote' ? 'Confirmar' : 'Quitar permisos'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`aup-toast ${toast.type}`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
