# Claudia RF — Guía de actualización

## 1. Google Apps Script

Abrir el proyecto de Apps Script que ya utiliza la aplicación.

Reemplazar el contenido de `WebApp.gs` por `backend/WebApp.gs`.

Guardar y publicar una **nueva versión** de la implementación Web App.

No crear otro proyecto.

## 2. Google Sheets

La aplicación utiliza estas hojas como fuente de datos:

- CLIENTES
- SERVICIOS
- CONTRATACIONES
- COTIZACIONES

El backend crea la estructura de encabezados si alguna hoja no existe.

La aplicación es la interfaz de edición: no es necesario entrar a Sheets para las operaciones normales.

## 3. GitHub Pages

Subir al repositorio:

- `index.html`
- `styles.css`
- `js/`

La carpeta `backend/` puede conservarse en GitHub como copia/versionado del backend, pero quien ejecuta ese código es Google Apps Script.

## 4. Primera prueba

1. Abrir Clientes.
2. Editar un cliente existente.
3. Guardar.
4. Confirmar que el cambio aparece en Sheets.
5. Abrir Servicios.
6. Editar una contratación.
7. Registrar un pago.
8. Generar Cobro desde el cliente.
9. Verificar que el PDF agrupe únicamente servicios pendientes y conserve el periodo individual de cada servicio.
10. Crear y editar una cotización y generar su PDF.
