# Claudia RF V1 — instalación final

## Frontend
1. Reemplaza el contenido de tu repositorio GitHub por esta carpeta (conserva tu `.git` si trabajas localmente).
2. Publica en GitHub Pages.
3. Al abrir la app, escribe el PIN **5378**. Se guarda solo en la sesión del navegador.

## Backend
En tu proyecto de Apps Script que ya funciona, reemplaza `Config.gs` y `Api.gs` por los archivos de `backend-v2/`. Los demás `.gs` son los mismos de la V2.

El backend usa el PIN 5378 y el Sheet nuevo configurado. Después de reemplazar archivos: **Implementar → Administrar implementaciones → Editar → Implementar** para publicar la nueva versión.

## Importante
El PIN es una protección sencilla para una app personal, no un sistema de autenticación fuerte. No lo uses para información de alta sensibilidad.
