# EcclesiaOps - Plataforma de Gestión Eclesial Multitenant

EcclesiaOps es una solución SaaS diseñada para la administración eficiente de concilios e iglesias locales. La plataforma ofrece herramientas avanzadas de gestión de miembros, finanzas, analítica y planificación de actividades bajo una arquitectura de multitenencia segura y escalable.

## 🚀 Estructura del Proyecto

La solución está dividida en dos componentes principales:

- **[/backend](./backend)**: API robusta construida con **NestJS** y **MongoDB**. Utiliza una estrategia de base de datos aislada por tenant para garantizar la seguridad de los datos.
- **[/frontend](./frontend)**: Aplicación web moderna construida con **React**, **Vite** y **Material UI (MUI)**. Ofrece una experiencia de usuario fluida, soporte multi-idioma y dashboards interactivos.

## ✨ Características Principales

- **Dashboard Multidimensión**: Vistas especializadas para SuperAdmins (Global), Administradores de Concilio (Consolidado) e Iglesias Locales.
- **Gestión de Miembros**: Seguimiento detallado de membresía, demografía y crecimiento histórico.
- **Control Financiero**: Gestión de ingresos (Diezmos/Ofrendas) y gastos, con desgloses por categoría y reporteo avanzado.
- **Reporteo Profesional**: Exportación de datos a CSV y generación de reportes ejecutivos en PDF.
- **SEO Optimizado**: Implementación de metadatos dinámicos para una mejor visibilidad y accesibilidad.
- **Arquitectura SaaS**: Aprovisionamiento automático de bases de datos para nuevos concilios.

## 🛠️ Requisitos Previos

- **Node.js** (v18 o superior)
- **MongoDB** (Instancia local o Atlas)
- **npm** o **yarn**

## 🏁 Inicio Rápido

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd EcclesiaOps
```

### 2. Configurar el Backend
```bash
cd backend
npm install
# Configurar archivo .env (ver backend/README.md)
npm run start:dev
```

### 3. Configurar el Frontend
```bash
cd ../frontend
npm install
npm run dev
```

## 📄 Licencia

Desarrollado con ❤️ por **JOscarSoft**.
