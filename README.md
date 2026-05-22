# VOY — Plataforma de Pasajes de Micro 🚌

VOY es una aplicación fullstack profesional para la búsqueda, comparación y reserva de pasajes de micro de larga distancia en Argentina.

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

## Documentación

- 📖 [Guía de Instalación y Configuración (SETUP)](./docs/SETUP.md) - Instrucciones paso a paso para levantar el proyecto localmente.
- 🏗️ [Arquitectura Técnica](./docs/ARCHITECTURE.md) - Diseño del sistema, stack tecnológico y base de datos.
- 📝 [Historial de Cambios](./CHANGELOG.md) - Registro de modificaciones y correcciones.

## Estructura del Proyecto

El repositorio está organizado en un monorepo ligero:

- `/frontend`: Aplicación cliente interactiva (React 19 + Vite).
- `/backend`: API REST (Node.js + Express 5).
- `/database`: Scripts SQL para crear tablas y poblar datos de prueba (PostgreSQL).
- `/docs`: Documentación técnica del proyecto.