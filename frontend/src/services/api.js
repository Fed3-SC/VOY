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

    return { success: true, data: data.data };
  } catch (error) {
    console.error(`Error en request a ${endpoint}:`, error);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
}

/* ──────────────────────────── CITIES ──────────────────────────── */

export async function getCities() {
  return request('/cities');
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

/* ──────────────────────────── OFFERS & POPULAR DESTINATIONS ──────────────────────────── */

export async function getOffers() {
  return request('/trips/offers');
}

export async function getPopularDestinations() {
  return request('/trips/popular-destinations');
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
