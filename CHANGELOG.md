# Historial de Modificaciones y Cambios - Proyecto VOY

Este documento contiene un registro detallado de todas las modificaciones, correcciones de errores (bugs) y adiciones estructurales realizadas en la plataforma **VOY** (aplicación web para búsqueda y reserva de pasajes de micro en Argentina).

---

## 📁 1. Estructura General del Proyecto
El proyecto se divide en dos áreas principales:
*   **`frontend/`**: Contiene la aplicación cliente interactiva, construida con **React 19**, **Vite**, **TypeScript/JavaScript** y **React Router 7**.
*   **`backend/`**: Carpeta destinada para el servidor de backend (actualmente inicializada y limpia para el Sprint 2).

---

## 🛠️ 2. Registro de Commits (Historial de Cambios)
El historial de commits del repositorio refleja el proceso de desarrollo y reestructuración:
1.  **`8055c99` - Initial commit**: Creación inicial del repositorio y archivo `README.md`.
2.  **`80dd263` - Primer commit**: Creación e integración de la estructura base del directorio `frontend`.
3.  **`1dbd15e` - Merge branch 'main'**: Fusión de ramas para consolidar el repositorio.
4.  **`140d8a4` - Fix frontend files**: Reestructuración y refactorización masiva del frontend. Se definieron las páginas principales, componentes reutilizables, hoja de estilos global, contexto de estado, datos simulados y el enrutador principal de la aplicación.

---

## 🐛 3. Detalle de Errores Corregidos (Bugs Fixed)

Durante las fases de integración y pruebas se identificaron y solucionaron los siguientes errores específicos en el frontend:

### 🎫 BUG-001: Aislamiento de Reservas por Usuario
*   **Archivo modificado:** [`MyTripsPage.jsx`](file:///c:/Users/feder/Desktop/PROYECTO%20UP/PAGINA%20WEB/frontend/src/pages/MyTripsPage.jsx)
*   **Descripción del problema:** La página de "Mis Viajes" cargaba de forma general las reservas guardadas en el navegador, sin discriminar a qué usuario pertenecían.
*   **Solución implementada:** 
    *   Se añadió un filtro que compara el `userId` de las reservas con el `user.id` de la sesión activa en `AuthContext`.
    *   Se implementó una cláusula de guardia defensiva (`if (!user?.id) return;`) para evitar fallos de lectura si no hay sesión iniciada.
    *   Los datos se obtienen de forma segura de `localStorage` y se aíslan correctamente (compatible con el multi-tenant que se usará en el Sprint 2).

### 🔍 BUG-002: Persistencia Indeseada de Búsquedas Previas
*   **Archivos modificados:** [`HomePage.jsx`](file:///c:/Users/feder/Desktop/PROYECTO%20UP/PAGINA%20WEB/frontend/src/pages/HomePage.jsx) y [`BookingContext.jsx`](file:///c:/Users/feder/Desktop/PROYECTO%20UP/PAGINA%20WEB/frontend/src/context/BookingContext.jsx)
*   **Descripción del problema:** Al volver a la pantalla de Inicio (Home) desde los resultados o el proceso de pago, los campos del formulario de búsqueda mantenían los valores de la búsqueda anterior en lugar de reiniciarse.
*   **Solución implementada:**
    *   Se creó la función `resetSearch` en `BookingContext` para restablecer los parámetros a sus valores predeterminados (origen/destino vacíos, fecha actual, 1 pasajero).
    *   Se invocó `resetSearch` mediante un efecto (`useEffect`) al montar el componente `HomePage`.

### ⚓ BUG-003: Funcionalidad Integral del Footer (Pie de Página)
*   **Archivos modificados:** [`Footer.jsx`](file:///c:/Users/feder/Desktop/PROYECTO%20UP/PAGINA%20WEB/frontend/src/components/common/Footer.jsx), [`Footer.css`](file:///c:/Users/feder/Desktop/PROYECTO%20UP/PAGINA%20WEB/frontend/src/components/common/Footer.css) y [`App.jsx`](file:///c:/Users/feder/Desktop/PROYECTO%20UP/PAGINA%20WEB/frontend/src/App.jsx)
*   **Descripción del problema:** Varios links del footer estaban inactivos, redirigían a rutas inexistentes, o no respondían de manera interactiva.
*   **Solución implementada:**
    *   **BUG-003a (Páginas de Soporte):** Se crearon páginas estáticas y funcionales para el soporte y se registraron en el router (`App.jsx`):
        *   [`HelpCenterPage.jsx`](file:///c:/Users/feder/Desktop/PROYECTO%20UP/PAGINA%20WEB/frontend/src/pages/HelpCenterPage.jsx) (Centro de Ayuda con acordeón de FAQs).
        *   [`TermsPage.jsx`](file:///c:/Users/feder/Desktop/PROYECTO%20UP/PAGINA%20WEB/frontend/src/pages/TermsPage.jsx) (Términos y Condiciones).
        *   [`PrivacyPage.jsx`](file:///c:/Users/feder/Desktop/PROYECTO%20UP/PAGINA%20WEB/frontend/src/pages/PrivacyPage.jsx) (Política de Privacidad).
        *   [`ContactPage.jsx`](file:///c:/Users/feder/Desktop/PROYECTO%20UP/PAGINA%20WEB/frontend/src/pages/ContactPage.jsx) (Formulario de Contacto interactivo).
    *   **BUG-003b (Destinos Populares):** Se configuraron los botones de destinos populares para que redirijan a búsquedas reales en tiempo real (por ejemplo, saliendo desde Buenos Aires hacia el destino seleccionado con la fecha de hoy). Se les dio estilo de enlaces en CSS.
    *   **BUG-003c (Routing en "Mi Cuenta"):** Se configuró navegación condicional. Si el usuario está autenticado, el enlace "Mi Cuenta" redirige a `/mis-viajes`; si no lo está, redirige a `/auth` (pantalla de login).
    *   **BUG-003d (Redes Sociales):** Se añadieron enlaces externos válidos con los atributos de seguridad `target="_blank"` y `rel="noopener noreferrer"`.

### 🚌 BUG-004: Consistencia de Rutas y Disponibilidad de Viajes
*   **Archivo modificado:** [`mockData.js`](file:///c:/Users/feder/Desktop/PROYECTO%20UP/PAGINA%20WEB/frontend/src/data/mockData.js)
*   **Descripción del problema:**
    *   Faltaban rutas directas de micros desde Buenos Aires a dos destinos principales del buscador (Tucumán y Santiago de Chile), lo que generaba búsquedas vacías.
    *   El contador de viajes disponibles en las tarjetas de la página de inicio acumulaba los viajes de los próximos 30 días, mostrando números inflados y poco realistas.
*   **Solución implementada:**
    *   Se agregaron las combinaciones de rutas de ida y vuelta para Buenos Aires ↔ Tucumán y Buenos Aires ↔ Santiago (Chile) con sus respectivas duraciones y precios base.
    *   Se programó la función `getTripsCountForDestination` para filtrar y contar únicamente los viajes programados para el **día de hoy** (mostrando valores reales de disponibilidad diaria, típicamente entre 4 y 7 servicios).

---

## 🏛️ 4. Arquitectura y Tecnologías Clave Aplicadas

1.  **React Context API (`AuthContext` y `BookingContext`)**:
    *   Gestiona de manera global y limpia la sesión del usuario (registro, login, logout) y la información del flujo de compra (viaje seleccionado, pasajeros, código de reserva).
2.  **Capa de Servicios de API (`api.js`)**:
    *   Actúa como una capa intermedia de abstracción. Actualmente interactúa con los datos en memoria y `localStorage` con retardos artificiales (`delay`) para simular latencia de red.
    *   *Ventaja:* En el Sprint 2, la migración a un backend de producción real no requerirá tocar los componentes visuales de React; solo se cambiarán las llamadas a `fetch()` en este archivo.
3.  **UI/UX Premium (CSS Vanilla + Animaciones)**:
    *   Se diseñó una interfaz con efectos visuales avanzados: gradientes modernos, sombras fluidas, transiciones dinámicas (hover), efectos de desvanecimiento (`stagger-children`, `animate-fade-in`), modo tarjeta y un layout completamente adaptativo para móviles.
