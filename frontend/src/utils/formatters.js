/**
 * Utility formatters for the Voy platform
 */

export function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function formatServiceType(type) {
  const map = {
    comun: 'Común',
    semicama: 'Semicama',
    cama: 'Cama',
  };
  return map[type] || type;
}

export function getServiceTypeColor(type) {
  const map = {
    comun: '#6b7280',
    semicama: '#2c3268',
    cama: '#ff6b35',
  };
  return map[type] || '#6b7280';
}

export function toDateInputValue(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayStr() {
  return toDateInputValue(new Date());
}
