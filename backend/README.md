# EcclesiaOps Backend - API Multitenant

El backend de EcclesiaOps es una potente API REST construida con el framework **NestJS**, diseñada para manejar múltiples concilios de forma aislada y segura.

## 🏗️ Tecnología y Arquitectura

- **Framework**: NestJS (TypeScript)
- **Base de Datos**: MongoDB (Mongoose)
- **Seguridad**: Passport.js con JWT (JSON Web Tokens)
- **Estrategia de Tenencia**: **DB-per-tenant**. Cada concilio cuenta con su propia base de datos física, aprovisionada automáticamente durante el registro.
- **Validación**: Class-validator y DTOs robustos.
- **Documentación**: Swagger/OpenAPI.

## 📋 Requisitos

- Node.js >= 18.0.0
- MongoDB 6.0+

## ⚙️ Configuración (.env)

Crea un archivo `.env` en el directorio raíz del backend con las siguientes variables:

```env
MONGODB_URI=mongodb://localhost:27017/platform_db
JWT_SECRET=tu_secreto_super_seguro
PORT=3000
```

## 🚀 Ejecución

```bash
# Instalación de dependencias
npm install

# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

## 📂 Estructura de Módulos

- **platform**: Gestión global del SaaS (Concilios, Usuarios SuperAdmin).
- **tenant**: Módulos compartidos por los concilios (Miembros, Finanzas, Iglesias, Actividades).
- **common**: Guards, Decorators, Interceptors y utilidades compartidas.

## 🔐 Seguridad y Permisos

El sistema utiliza un modelo de **RBAC (Role-Based Access Control)** con permisos granulares:
- `VIEW_DASHBOARD`, `MANAGE_USERS`, `MANAGE_CHURCHES`, `MANAGE_ROLES`, `VIEW_FINANCE`, `VIEW_MEMBERS`, etc.

---
© 2026 **JOscarSoft** - Todos los derechos reservados.
