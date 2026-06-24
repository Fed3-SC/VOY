import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getFavoriteIds, addFavorite as apiAdd, removeFavorite as apiRemove } from '../services/api';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { isAuthenticated } = useAuth();
  // Set de tripIds para lookup O(1)
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Cargar IDs de favoritos cuando el usuario se autentica
  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      return;
    }
    setLoading(true);
    getFavoriteIds().then(res => {
      if (res.success && Array.isArray(res.data)) {
        setFavoriteIds(new Set(res.data.map(Number)));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isAuthenticated]);

  /**
   * Verifica si un viaje es favorito del usuario.
   */
  const isFavorite = useCallback((tripId) => {
    return favoriteIds.has(Number(tripId));
  }, [favoriteIds]);

  /**
   * Agrega o elimina un favorito con actualización optimista inmediata.
   * No requiere recargar la página.
   */
  const toggleFavorite = useCallback(async (tripId) => {
    if (!isAuthenticated) return { success: false, error: 'not_authenticated' };

    const id = Number(tripId);
    const isCurrentlyFav = favoriteIds.has(id);

    // Actualización optimista (inmediata)
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyFav) next.delete(id);
      else next.add(id);
      return next;
    });

    // Llamada al backend
    try {
      const res = isCurrentlyFav
        ? await apiRemove(id)
        : await apiAdd(id);

      if (!res.success) {
        // Revertir si falla
        setFavoriteIds(prev => {
          const next = new Set(prev);
          if (isCurrentlyFav) next.add(id);
          else next.delete(id);
          return next;
        });
        return res;
      }
      return { success: true };
    } catch {
      // Revertir si hay error de red
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (isCurrentlyFav) next.add(id);
        else next.delete(id);
        return next;
      });
      return { success: false, error: 'network_error' };
    }
  }, [isAuthenticated, favoriteIds]);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
