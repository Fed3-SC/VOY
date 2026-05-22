/**
 * API Service Layer
 * 
 * This module provides an abstraction over data fetching.
 * Currently uses mock data, but each function signature matches
 * what a real REST API call would look like.
 * 
 * To switch to a real backend:
 * 1. Set API_BASE_URL to your backend URL
 * 2. Replace mock implementations with fetch() calls
 * 3. Component code stays unchanged
 */

import { mockCities, mockCompanies, mockTrips, mockOffers, mockPopularDestinations } from '../data/mockData';

const API_BASE_URL = '/api'; // Change to real backend URL when ready

// Simulate network delay for realistic UX
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

/* ──────────────────────────── CITIES ──────────────────────────── */

export async function getCities() {
  await delay(200);
  return { success: true, data: mockCities };
  // Real: return fetch(`${API_BASE_URL}/cities`).then(r => r.json());
}

/* ──────────────────────────── TRIPS ──────────────────────────── */

export async function searchTrips({ origin, destination, date, passengers = 1 }) {
  await delay(600);

  let results = mockTrips.filter(trip => {
    const matchOrigin = trip.originCityId === origin;
    const matchDest = trip.destinationCityId === destination;
    return matchOrigin && matchDest;
  });

  // Filter by date if provided
  if (date) {
    results = results.filter(trip => {
      const tripDate = new Date(trip.departureTime).toISOString().split('T')[0];
      return tripDate === date;
    });
  }

  // Enrich with city and company data
  const enriched = results.map(trip => ({
    ...trip,
    origin: mockCities.find(c => c.id === trip.originCityId),
    destination: mockCities.find(c => c.id === trip.destinationCityId),
    company: mockCompanies.find(c => c.id === trip.companyId),
  }));

  return { success: true, data: enriched };
  // Real: return fetch(`${API_BASE_URL}/trips/search?origin=${origin}&destination=${destination}&date=${date}&passengers=${passengers}`).then(r => r.json());
}

export async function getTripById(id) {
  await delay(300);
  const trip = mockTrips.find(t => t.id === id);
  if (!trip) return { success: false, error: 'Trip not found' };

  const enriched = {
    ...trip,
    origin: mockCities.find(c => c.id === trip.originCityId),
    destination: mockCities.find(c => c.id === trip.destinationCityId),
    company: mockCompanies.find(c => c.id === trip.companyId),
  };

  return { success: true, data: enriched };
  // Real: return fetch(`${API_BASE_URL}/trips/${id}`).then(r => r.json());
}

/* ──────────────────────────── COMPANIES ──────────────────────────── */

export async function getCompanies() {
  await delay(200);
  return { success: true, data: mockCompanies };
}

/* ──────────────────────────── OFFERS ──────────────────────────── */

export async function getOffers() {
  await delay(300);
  return { success: true, data: mockOffers };
}

/* ──────────────────────────── POPULAR DESTINATIONS ──────────────────────────── */

export async function getPopularDestinations() {
  await delay(300);
  return { success: true, data: mockPopularDestinations };
}

/* ──────────────────────────── BOOKINGS ──────────────────────────── */

export async function createBooking(bookingData) {
  await delay(800);
  const bookingCode = 'VOY-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const booking = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    bookingCode,
    ...bookingData,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  // Save to localStorage for persistence
  const bookings = JSON.parse(localStorage.getItem('voy_bookings') || '[]');
  bookings.push(booking);
  localStorage.setItem('voy_bookings', JSON.stringify(bookings));

  return { success: true, data: booking };
  // Real: return fetch(`${API_BASE_URL}/bookings`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(bookingData) }).then(r => r.json());
}

export async function getBookingByCode(code) {
  await delay(300);
  const bookings = JSON.parse(localStorage.getItem('voy_bookings') || '[]');
  const booking = bookings.find(b => b.bookingCode === code);
  if (!booking) return { success: false, error: 'Booking not found' };
  return { success: true, data: booking };
}

/* ──────────────────────────── AUTH (Sprint 2 - stub) ──────────────────────────── */

export async function login(email, password) {
  await delay(500);
  const users = JSON.parse(localStorage.getItem('voy_users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return { success: false, error: 'Credenciales inválidas' };
  const { password: _, ...safeUser } = user;
  localStorage.setItem('voy_current_user', JSON.stringify(safeUser));
  return { success: true, data: safeUser };
}

export async function register(userData) {
  await delay(500);
  const users = JSON.parse(localStorage.getItem('voy_users') || '[]');
  if (users.find(u => u.email === userData.email)) {
    return { success: false, error: 'El email ya está registrado' };
  }
  if (users.find(u => u.dni === userData.dni)) {
    return { success: false, error: 'El DNI ya está registrado' };
  }
  const newUser = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    ...userData,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem('voy_users', JSON.stringify(users));
  const { password: _, ...safeUser } = newUser;
  localStorage.setItem('voy_current_user', JSON.stringify(safeUser));
  return { success: true, data: safeUser };
}

export async function getCurrentUser() {
  const user = localStorage.getItem('voy_current_user');
  if (!user) return { success: false, error: 'No user logged in' };
  return { success: true, data: JSON.parse(user) };
}

export async function logout() {
  localStorage.removeItem('voy_current_user');
  return { success: true };
}
