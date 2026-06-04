/**
 * API Service Layer
 * 
 * Capa de abstracción para consumir la API REST del backend.
 */

const API_BASE_URL = '/api';

/**
 * Obtiene los headers de autenticación si existe el token.
 */
function getAuthHeaders() {
  const token = localStorage.getItem('voy_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Función genérica para peticiones HTTP.
 */
async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || 'Error del servidor' };
    }

    return { success: true, data: data.data, meta: data.meta };
  } catch (error) {
    console.error(`Error en request a ${endpoint}:`, error);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
}

/* ──────────────────────────── CITIES ──────────────────────────── */

export async function getCities() {
  return request('/cities');
}

/* ──────────────────────────── COMPANIES ──────────────────────────── */

export async function getCompanies() {
  return request('/companies');
}

/* ──────────────────────────── TRIPS ──────────────────────────── */

export async function searchTrips({ origin, destination, date, passengers = 1 }) {
  const params = new URLSearchParams({ origin, destination });
  if (date) params.append('date', date);
  if (passengers) params.append('passengers', passengers.toString());
  
  return request(`/trips/search?${params.toString()}`);
}

export async function getTripById(id) {
  return request(`/trips/${id}`);
}

export async function getAllTrips(limit = 50, offset = 0) {
  return request(`/trips?limit=${limit}&offset=${offset}`);
}

/* ──────────────────────────── FEATURED & OFFERS ──────────────────────────── */

export async function getFeaturedTrips(count = 10) {
  return request(`/trips/featured?count=${count}`);
}

export async function getOffers() {
  return request('/trips/offers');
}

export async function getPopularDestinations() {
  return request('/trips/popular-destinations');
}

/* ──────────────────────────── ADMIN CRUD ──────────────────────────── */

export async function createTrip(tripData) {
  return request('/trips', {
    method: 'POST',
    body: JSON.stringify(tripData),
  });
}

export async function updateTrip(id, tripData) {
  return request(`/trips/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tripData),
  });
}

export async function deleteTrip(id) {
  return request(`/trips/${id}`, {
    method: 'DELETE',
  });
}

/* ──────────────────────────── BOOKINGS ──────────────────────────── */

export async function createBooking(bookingData) {
  return request('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
}

export async function getMyBookings() {
  return request('/bookings/my-bookings');
}

export async function getBookingById(id) {
  return request(`/bookings/${id}`);
}

/* ──────────────────────────── AUTH ──────────────────────────── */

export async function login(email, password) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (res.success && res.data.token) {
    localStorage.setItem('voy_token', res.data.token);
  }
  
  return res;
}

export async function register(userData) {
  const res = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  
  if (res.success && res.data.token) {
    localStorage.setItem('voy_token', res.data.token);
  }
  
  return res;
}

export async function getCurrentUser() {
  if (!localStorage.getItem('voy_token')) {
    return { success: false, error: 'No user logged in' };
  }
  return request('/auth/me');
}

export async function logout() {
  localStorage.removeItem('voy_token');
  return { success: true };
}

/* ──────────────────────────── USERS (ADMIN) ──────────────────────────── */

export async function getUsers() {
  return request('/users');
}

export async function promoteUser(id) {
  return request(`/users/${id}/promote`, { method: 'PATCH' });
}

export async function demoteUser(id) {
  return request(`/users/${id}/demote`, { method: 'PATCH' });
}

/* ──────────────────────────── FEATURES ──────────────────────────── */

export async function getFeatures() {
  return request('/features');
}

export async function createFeature(data) {
  return request('/features', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateFeature(id, data) {
  return request(`/features/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteFeature(id) {
  return request(`/features/${id}`, {
    method: 'DELETE',
  });
}
