# EcclesiaOps Frontend - Dashboard Administrativo

Interfaz de usuario moderna y reactiva para la plataforma EcclesiaOps, optimizada para la gestión de iglesias y concilios.

## 🚀 Tecnologías Core

- **React 18**: Librería base para la interfaz.
- **Vite**: Herramienta de compilación ultrarrápida.
- **Material UI (MUI) 9**: Sistema de diseño y componentes premium.
- **React Query (TanStack)**: Gestión eficiente de estado asíncrono y caché de API.
- **Zustand**: Gestión de estado global ligero (Autenticación y UI).
- **React Router 6**: Navegación y enrutamiento.
- **Recharts**: Visualización de datos interactiva.
- **i18next**: Soporte completo para multi-idioma (ES/EN).

## 🛠️ Características Destacadas

- **Dashboard Ejecutivo**: Resumen visual de KPIs con soporte para modo oscuro/claro.
- **Analítica Avanzada**: Gráficos de tendencias, demografía y crecimiento de membresía.
- **Reportes**: Generación de PDF (jsPDF) y exportación a CSV.
- **SEO Dinámico**: Gestión de títulos y meta-etiquetas con `react-helmet-async`.
- **Responsive Design**: Adaptable a dispositivos móviles y escritorio.

## 🏁 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🌍 Internacionalización

Los archivos de traducción se encuentran en `src/locales/`. Para añadir nuevos textos:
1. Actualiza `es.json`
2. Actualiza `en.json`
3. Usa el hook `useTranslation` en tu componente.

## 📂 Estructura de Directorios

- **src/modules**: Contiene la lógica y componentes agrupados por funcionalidad (finance, dashboard, members).
- **src/core**: Configuraciones base (API, Tema, i18n).
- **src/components**: Componentes compartidos y transversales (SEO, Layouts).
- **src/stores**: Estados globales con Zustand.

---
© 2026 **JOscarSoft** - Todos los derechos reservados.
