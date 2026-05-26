/**
 * Mapeo de imágenes estáticas de destinos para el frontend.
 * Las imágenes reales viven en frontend/src/img/
 */
export const destinationImages = {
  'mar-del-plata': 'mar del plata.jpg',
  'bariloche': 'bariloche.jpg',
  'cordoba': 'cordoba.jpg',
  'mendoza': 'mendoza.jpg',
  'rosario': 'rosario.jpg',
  'salta': 'salta.jpg',
  'santiago': 'santiago de chile.jpg',
  'tucuman': 'tucuman.jpg',
  'neuquen': 'neuquen.jpg',
};

/**
 * Mapeo de city ID a imageKey para uso programático.
 */
export const cityIdToImageKey = {
  2: 'mar-del-plata',
  3: 'cordoba',
  4: 'mendoza',
  5: 'rosario',
  6: 'bariloche',
  7: 'salta',
  8: 'neuquen',
  9: 'tucuman',
  10: 'santiago',
};

/**
 * Obtiene el imageKey para un nombre de ciudad (case-insensitive).
 */
export function getImageKeyByCityName(cityName) {
  if (!cityName) return null;
  const normalized = cityName.toLowerCase().trim();
  const nameMap = {
    'mar del plata': 'mar-del-plata',
    'bariloche': 'bariloche',
    'córdoba': 'cordoba',
    'cordoba': 'cordoba',
    'mendoza': 'mendoza',
    'rosario': 'rosario',
    'salta': 'salta',
    'santiago (chile)': 'santiago',
    'santiago': 'santiago',
    'tucumán': 'tucuman',
    'tucuman': 'tucuman',
    'neuquén': 'neuquen',
    'neuquen': 'neuquen',
  };
  return nameMap[normalized] || null;
}
