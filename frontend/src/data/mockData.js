/**
 * Mock Data — Simulates the database
 * 
 * This file contains all the seed data that would normally live
 * in PostgreSQL tables. Structured to match the DB schema exactly
 * so migration to a real backend is trivial.
 */

/* ──────────────── CITIES ──────────────── */
export const mockCities = [
  { id: 1, name: 'Buenos Aires', province: 'CABA', terminalName: 'Terminal Retiro', active: true },
  { id: 2, name: 'Mar del Plata', province: 'Buenos Aires', terminalName: 'Terminal de Ómnibus MDQ', active: true },
  { id: 3, name: 'Córdoba', province: 'Córdoba', terminalName: 'Terminal de Ómnibus Córdoba', active: true },
  { id: 4, name: 'Mendoza', province: 'Mendoza', terminalName: 'Terminal de Ómnibus Mendoza', active: true },
  { id: 5, name: 'Rosario', province: 'Santa Fe', terminalName: 'Terminal Mariano Moreno', active: true },
  { id: 6, name: 'Bariloche', province: 'Río Negro', terminalName: 'Terminal de Ómnibus Bariloche', active: true },
  { id: 7, name: 'Salta', province: 'Salta', terminalName: 'Terminal de Ómnibus Salta', active: true },
  { id: 8, name: 'Neuquén', province: 'Neuquén', terminalName: 'Terminal ETON', active: true },
  { id: 9, name: 'Tucumán', province: 'Tucumán', terminalName: 'Terminal de Ómnibus Tucumán', active: true },
  { id: 10, name: 'Santiago (Chile)', province: 'Internacional', terminalName: 'Terminal San Borja', active: true },
];

/* ──────────────── COMPANIES ──────────────── */
export const mockCompanies = [
  { id: 1, name: 'Chevallier', logoUrl: null, rating: 4.5, active: true },
  { id: 2, name: 'Vía Bariloche', logoUrl: null, rating: 4.3, active: true },
  { id: 3, name: 'Andesmar', logoUrl: null, rating: 4.6, active: true },
  { id: 4, name: 'Flecha Bus', logoUrl: null, rating: 4.2, active: true },
  { id: 5, name: 'CATA Internacional', logoUrl: null, rating: 4.4, active: true },
  { id: 6, name: 'Plusmar', logoUrl: null, rating: 4.1, active: true },
  { id: 7, name: 'El Rápido', logoUrl: null, rating: 4.0, active: true },
];

/* ──────────────── TRIPS ──────────────── */
// Generate trips for the next 30 days
function generateTrips() {
  const routes = [
    { origin: 1, dest: 2, duration: 330, basePrices: { comun: 18500, semicama: 25500, cama: 35000 } },
    { origin: 2, dest: 1, duration: 330, basePrices: { comun: 18500, semicama: 25500, cama: 35000 } },
    { origin: 1, dest: 3, duration: 600, basePrices: { comun: 32000, semicama: 42000, cama: 58000 } },
    { origin: 3, dest: 1, duration: 600, basePrices: { comun: 32000, semicama: 42000, cama: 58000 } },
    { origin: 1, dest: 4, duration: 780, basePrices: { comun: 38000, semicama: 48000, cama: 65000 } },
    { origin: 4, dest: 1, duration: 780, basePrices: { comun: 38000, semicama: 48000, cama: 65000 } },
    { origin: 1, dest: 5, duration: 240, basePrices: { comun: 15000, semicama: 21000, cama: 29000 } },
    { origin: 5, dest: 1, duration: 240, basePrices: { comun: 15000, semicama: 21000, cama: 29000 } },
    { origin: 1, dest: 6, duration: 1260, basePrices: { comun: 52000, semicama: 68000, cama: 89000 } },
    { origin: 6, dest: 1, duration: 1260, basePrices: { comun: 52000, semicama: 68000, cama: 89000 } },
    { origin: 1, dest: 7, duration: 1140, basePrices: { comun: 45000, semicama: 58000, cama: 76000 } },
    { origin: 7, dest: 1, duration: 1140, basePrices: { comun: 45000, semicama: 58000, cama: 76000 } },
    { origin: 3, dest: 4, duration: 540, basePrices: { comun: 28000, semicama: 36000, cama: 48000 } },
    { origin: 4, dest: 3, duration: 540, basePrices: { comun: 28000, semicama: 36000, cama: 48000 } },
    { origin: 1, dest: 8, duration: 720, basePrices: { comun: 35000, semicama: 45000, cama: 62000 } },
    { origin: 8, dest: 1, duration: 720, basePrices: { comun: 35000, semicama: 45000, cama: 62000 } },
    { origin: 4, dest: 10, duration: 420, basePrices: { comun: 42000, semicama: 55000, cama: 72000 } },
    { origin: 10, dest: 4, duration: 420, basePrices: { comun: 42000, semicama: 55000, cama: 72000 } },
    // BUG-004 FIX: Agregar rutas faltantes para Tucumán y Santiago desde Buenos Aires
    { origin: 1, dest: 9, duration: 1080, basePrices: { comun: 42000, semicama: 55000, cama: 72000 } },
    { origin: 9, dest: 1, duration: 1080, basePrices: { comun: 42000, semicama: 55000, cama: 72000 } },
    { origin: 1, dest: 10, duration: 1320, basePrices: { comun: 55000, semicama: 72000, cama: 95000 } },
    { origin: 10, dest: 1, duration: 1320, basePrices: { comun: 55000, semicama: 72000, cama: 95000 } },
  ];

  const departureTimes = ['06:00', '08:30', '10:00', '14:00', '18:00', '21:00', '23:30'];
  const serviceTypes = ['comun', 'semicama', 'cama'];
  const companyAssignments = [1, 2, 3, 4, 5, 6, 7];
  const trips = [];
  let id = 1;

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const dateStr = date.toISOString().split('T')[0];

    for (const route of routes) {
      // 4-7 trips per route per day
      const numTrips = 4 + Math.floor(Math.random() * 4);
      const selectedTimes = departureTimes
        .sort(() => Math.random() - 0.5)
        .slice(0, numTrips);

      for (const time of selectedTimes) {
        const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
        const companyId = companyAssignments[Math.floor(Math.random() * companyAssignments.length)];
        const [hours, minutes] = time.split(':').map(Number);
        
        const departure = new Date(`${dateStr}T${time}:00`);
        const arrival = new Date(departure.getTime() + route.duration * 60000);
        
        // Vary price slightly
        const priceVariation = 0.9 + Math.random() * 0.2;
        const price = Math.round(route.basePrices[serviceType] * priceVariation);

        trips.push({
          id: id++,
          companyId,
          originCityId: route.origin,
          destinationCityId: route.dest,
          departureTime: departure.toISOString(),
          arrivalTime: arrival.toISOString(),
          durationMinutes: route.duration,
          serviceType,
          price,
          totalSeats: serviceType === 'cama' ? 24 : serviceType === 'semicama' ? 40 : 52,
          availableSeats: Math.floor(Math.random() * 30) + 5,
          active: true,
        });
      }
    }
  }

  return trips;
}

export const mockTrips = generateTrips();

/* ──────────────── OFFERS ──────────────── */
export const mockOffers = [
  {
    id: 1,
    title: 'Mar del Plata',
    subtitle: 'Desde Buenos Aires',
    price: 18500,
    originalPrice: 25500,
    discount: 27,
    imageQuery: 'mar-del-plata',
    originId: 1,
    destinationId: 2,
  },
  {
    id: 2,
    title: 'Bariloche',
    subtitle: 'Desde Buenos Aires',
    price: 52000,
    originalPrice: 68000,
    discount: 23,
    imageQuery: 'bariloche',
    originId: 1,
    destinationId: 6,
  },
  {
    id: 3,
    title: 'Córdoba',
    subtitle: 'Desde Buenos Aires',
    price: 32000,
    originalPrice: 42000,
    discount: 24,
    imageQuery: 'cordoba',
    originId: 1,
    destinationId: 3,
  },
];

/* Image map for destinations */
export const destinationImages = {
  'mar-del-plata': 'mar del plata.jpg',
  'bariloche': 'bariloche.jpg',
  'cordoba': 'cordoba.jpg',
  'mendoza': 'mendoza.jpg',
  'rosario': 'rosario.jpg',
  'salta': 'salta.jpg',
  'santiago': 'santiago de chile.jpg',
  'tucuman': 'tucuman.jpg',
};

/* ──────────────── POPULAR DESTINATIONS ──────────────── */

/**
 * BUG-004 FIX: Cuenta los viajes disponibles HOY hacia un destino desde un origen dado.
 * Muestra disponibilidad diaria real (rango 4-7) en lugar de sumar 30 días.
 * Sprint 2: reemplazar por query a la API con filtro de fecha.
 */
export function getTripsCountForDestination(cityId, originId = 1) {
  const todayStr = new Date().toISOString().split('T')[0];
  return mockTrips.filter(t =>
    t.destinationCityId === cityId &&
    t.originCityId === originId &&
    t.departureTime.startsWith(todayStr)
  ).length;
}

export const mockPopularDestinations = [
  { id: 1, cityId: 2, name: 'Mar del Plata', imageKey: 'mar-del-plata', tripsCount: getTripsCountForDestination(2) },
  { id: 2, cityId: 3, name: 'Córdoba',        imageKey: 'cordoba',       tripsCount: getTripsCountForDestination(3) },
  { id: 3, cityId: 4, name: 'Mendoza',         imageKey: 'mendoza',       tripsCount: getTripsCountForDestination(4) },
  { id: 4, cityId: 6, name: 'Bariloche',       imageKey: 'bariloche',     tripsCount: getTripsCountForDestination(6) },
  { id: 5, cityId: 5, name: 'Rosario',         imageKey: 'rosario',       tripsCount: getTripsCountForDestination(5) },
  { id: 6, cityId: 7, name: 'Salta',           imageKey: 'salta',         tripsCount: getTripsCountForDestination(7) },
  { id: 7, cityId: 10, name: 'Santiago',       imageKey: 'santiago',      tripsCount: getTripsCountForDestination(10) },
  { id: 8, cityId: 9, name: 'Tucumán',         imageKey: 'tucuman',       tripsCount: getTripsCountForDestination(9) },
];
