# Claudia RF V1 — Corrección de conexión

- Se eliminó el uso de fetch/CORS para las llamadas a Apps Script desde GitHub Pages.
- La app usa JSONP para GET y también para operaciones de escritura, evitando el preflight OPTIONS que provoca “Failed to fetch”.
- El backend acepta las operaciones V2 por doGet cuando se envía `callback` y `payload`.
- El PIN sigue validándose en Apps Script y no se guarda en el código del frontend.
- Se corrigió el doble `quotes` del adaptador de estado.
