# Bitácora y Resumen del Proyecto: VOY 🚌

## 1. Información General
- **Nombre del Proyecto:** VOY
- **Descripción:** Plataforma web fullstack para la búsqueda, reserva y compra de pasajes de micro de larga distancia en Argentina.
- **Objetivo Académico:** Desarrollar una aplicación completa aplicando metodologías ágiles, principios SOLID, diseño responsivo, y una arquitectura cliente-servidor robusta con conexión a base de datos relacional.

---

## 2. Stack Tecnológico y Arquitectura
El proyecto sigue una arquitectura separada entre Frontend (Cliente) y Backend (Servidor/API RESTFul), garantizando la separación de responsabilidades (Separation of Concerns).

### Frontend (Cliente)
- **Framework:** React.js (inicializado con Vite para mayor rendimiento).
- **Enrutamiento:** React Router DOM (Single Page Application).
- **Estilos:** Vanilla CSS nativo implementando variables globales (Custom Properties), diseño responsive (Mobile First), flexbox, CSS grid, y estéticas modernas (glassmorphism, animaciones suaves).
- **Gestión de Estado:** React Context API (`BookingContext` para el flujo de compras, `AuthContext` para sesiones).

### Backend (Servidor)
- **Entorno:** Node.js con Express.js.
- **Base de Datos:** PostgreSQL (Relacional) usando el driver `pg` nativo.
- **Arquitectura Interna:** Patrón de capas (Routes -> Controllers -> Services -> Database) para abstraer la lógica de negocio y facilitar el testing y mantenimiento.
- **Seguridad:** JWT (JSON Web Tokens) para autenticación, encriptación de contraseñas con bcrypt (aunque actualmente el login se encuentra bypassado para facilitar las pruebas de flujo del profesor).

---

## 3. Bitácora de Desarrollo (Sprints)

### Sprint 1: MVP Frontend y UI/UX
- Configuración inicial de la aplicación React.
- Diseño y maquetación de la página principal (Home), resultados de búsqueda y flujos de reserva.
- Creación de componentes reutilizables (`Navbar`, `Footer`, `SearchForm`).
- Implementación de un diseño estético de nivel "premium" enfocado en la experiencia de usuario (colores vibrantes, modales, alertas visuales).
- Se usaron datos simulados (Mocks) en LocalStorage para validar los flujos sin depender temporalmente de un backend.

### Sprint 2: Desarrollo del Backend y Base de Datos
- Diseño del esquema relacional en PostgreSQL (`users`, `cities`, `companies`, `trips`, `bookings`).
- Configuración de Node.js + Express.
- Desarrollo de endpoints RESTFul para listar viajes, buscar rutas por origen/destino, y gestionar compras.
- Refactorización del código frontend (servicios `api.js`) para reemplazar los datos simulados por llamadas reales (fetch) a la API en `http://localhost:3001`.

### Sprint 3: Panel de Administración y Funcionalidades Avanzadas
- Creación del Panel de Administración (`/admin`) para la gestión completa (CRUD) del catálogo de viajes (Crear, Editar, Eliminar viajes lógicamente).
- Implementación de seguridad en el backend con JWT, restringiendo el acceso a rutas privadas y panel de gestión a usuarios autorizados mediante contraseñas específicas.
- Lógica transaccional en PostgreSQL: Al confirmar una compra, el sistema utiliza `BEGIN` y `COMMIT` para descontar el asiento del viaje y guardar la reserva de forma atómica.

### Sprint 4: Refinamiento, Filtros y Despliegue Local
- Modificación de la página principal:
  - Agregado de sección de **Recomendaciones Aleatorias** (`ORDER BY RANDOM()` en base de datos) con un máximo de 10 productos.
  - Agregado de sección de **Viajes Disponibles Paginada**, permitiendo navegar por todo el catálogo sin sobrecargar el cliente.
- Desactivación controlada del flujo de login: Por requisitos de prueba y facilidad de uso, se ocultaron los botones de ingreso del Frontend y se programó un "Bypass" en el Middleware del Backend para que cualquier usuario visitante pueda simular una compra de principio a fin, inyectando un usuario por defecto en la base de datos de manera transparente.
- Preparación de documentación (`SETUP.md`) con instrucciones claras para levantar el entorno localmente.

---

## 4. Principios y Buenas Prácticas Aplicadas
- **SOLID:** Alta cohesión y bajo acoplamiento al separar los Controladores HTTP de los Servicios (Lógica de negocio).
- **Atomicidad:** Uso de transacciones SQL al confirmar reservas para evitar "Race conditions" (sobreventa de pasajes).
- **Responsividad:** Interfaces completamente fluidas y adaptables a dispositivos móviles, tablets y escritorio.
- **Experiencia de Usuario (UX):** Uso de loaders (spinners), mensajes de error claros, manejo de estados vacíos (empty states) y un "stepper" visual en el carrito de compras.

---
**Fecha de entrega:** Mayo 2026
**Proyecto:** VOY - Venta de Pasajes
