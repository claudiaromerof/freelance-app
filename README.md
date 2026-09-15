# Claudia RF — V1 PRO RHE

Aplicación web personal para gestionar clientes, servicios, cotizaciones, cobros y finanzas.

## Lógica de negocio
- Servicios: cliente, servicio, periodo, costo para Claudia y precio al cliente.
- El pago y los datos del RHE se gestionan fuera del formulario de servicio.
- Cobro: agrupa todos los servicios pendientes de un cliente en un solo PDF.
- Cada servicio conserva su propio periodo.
- Retención RHE: opcional al cobrar. Si se activa, la app hace gross-up: `neto / (1 - tasa/100)` para proteger el monto neto deseado.
- El comprobante habitual es Recibo por Honorarios.
- Costos, ganancia y margen son internos y no aparecen en el PDF del cliente.
- Google Sheets es la base de datos; GitHub Pages sirve el frontend.

## Estructura
- `index.html`, `styles.css`: frontend.
- `js/`: módulos de la aplicación.
- `backend/WebApp.gs`: backend para Google Apps Script.

## Instalación
1. Actualiza `backend/WebApp.gs` en tu proyecto de Apps Script y publica una nueva versión solo si el backend cambia.
2. Publica `index.html`, `styles.css` y `js/` en GitHub Pages.
3. La URL de Apps Script se configura en `js/00-config.js`.
