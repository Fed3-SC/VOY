import { createContext, useContext, useState, useCallback } from 'react';
import { getTodayStr } from '../utils/formatters';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: getTodayStr(),
    returnDate: '',
    passengers: 1,
  });
  const [passengerData, setPassengerData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
  });
  const [booking, setBooking] = useState(null);

  const clearBooking = useCallback(() => {
    setSelectedTrip(null);
    setPassengerData({ name: '', lastName: '', email: '', phone: '', dni: '' });
    setBooking(null);
  }, []);

  // BUG-002 FIX: Resetear parámetros de búsqueda al volver al Home
  const resetSearch = useCallback(() => {
    setSearchParams({
      origin: '',
      destination: '',
      date: getTodayStr(),
      returnDate: '',
      passengers: 1,
    });
  }, []);

  return (
    <BookingContext.Provider value={{
      selectedTrip, setSelectedTrip,
      searchParams, setSearchParams,
      passengerData, setPassengerData,
      booking, setBooking,
      clearBooking,
      resetSearch,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
