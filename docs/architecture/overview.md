# Architecture overview

```text
Expo Router / React Native Web
  ├─ feature screens and shared design system
  ├─ TanStack Query (server state)
  └─ cookie session + CSRF → /api/v1
                              │
Spring Boot modular monolith  ├─ iam
  (no HTML templates)         ├─ curriculum
                              ├─ progress/dashboard
                              └─ future feature boundaries
                                      │
                                  PostgreSQL

Mosquitto (internal dev infrastructure; not connected until M5)
Compiler worker (disabled profile marker; actual sandbox belongs to M3)
```

Route files only compose feature screens. UI does not contain curriculum records; they come from Flyway-seeded PostgreSQL through the API. Server state uses TanStack Query and auth state uses a small Zustand store.

The Java service is a package-by-feature modular monolith. Controllers validate transport input; SQL and domain rules remain scoped to their feature. Session authentication is stored server-side via the servlet container, the cookie is HttpOnly/SameSite, and unsafe authenticated requests require the CSRF header.

See ADRs for platform and milestone choices.
