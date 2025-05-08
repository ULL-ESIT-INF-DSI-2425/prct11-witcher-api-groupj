# Posada del Lobo Blanco

> Proyecto desarrollado por:
>
> - Iván Pérez Rodríguez  
> - Óscar Navarro Mesa

---

## Descripción

Este proyecto forma parte de la asignatura de **Desarrollo de Sistemas Informáticos (DSI)** y representa una API basada en el universo de *The Witcher*, con cazadores, mercaderes, bienes y transacciones.

---

## API Desplegada

Puedes acceder a la API en la nube desde el siguiente enlace:

**[https://prct11-witcher-api-groupj.onrender.com](https://prct11-witcher-api-groupj.onrender.com)**

> Esta instancia está conectada a MongoDB Atlas, permitiendo hacer peticiones reales a través de herramientas como Postman.

---

## Integración Continua

### CI Tests  
[![CI Tests](https://github.com/ULL-ESIT-INF-DSI-2425/prct11-witcher-api-groupj/actions/workflows/ci.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2425/prct11-witcher-api-groupj/actions/workflows/ci.yml)

### Coveralls  
[![Coverage Status](https://coveralls.io/repos/github/ULL-ESIT-INF-DSI-2425/prct11-witcher-api-groupj/badge.svg?branch=main)](https://coveralls.io/github/ULL-ESIT-INF-DSI-2425/prct11-witcher-api-groupj?branch=main)

### SonarCloud  
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ULL-ESIT-INF-DSI-2425_prct11-witcher-api-groupj&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ULL-ESIT-INF-DSI-2425_prct11-witcher-api-groupj)

---

## Funcionalidades

- Gestión de **cazadores** (`/hunters`)
- Gestión de **mercaderes** (`/merchants`)
- Control de **bienes** (`/goods`)
- Registro de **transacciones** (`/transactions`)
- Integración con **MongoDB Atlas**
- Validaciones y errores personalizados

---

## Testing y Cobertura

- Framework: **Vitest**
- Cobertura generada con `--coverage`
- CI integrada en GitHub Actions
