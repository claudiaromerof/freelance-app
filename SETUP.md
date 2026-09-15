# Claudia RF V1 — conexión backend V2

1. Reemplaza en GitHub los archivos de esta carpeta por los del ZIP.
2. No pongas ningún token en `js/00-config.js`.
3. Abre la aplicación. La primera vez te pedirá el token de Apps Script.
4. Pega tu token nuevo. Se guarda solo en la sesión del navegador (`sessionStorage`).
5. La aplicación se conecta a la URL V2 configurada en `js/00-config.js`.
6. Los datos maestros (clientes, catálogo y contrataciones) se leen desde Google Sheets.
7. Clientes, catálogo y contrataciones se guardan mediante las acciones V2 del Apps Script.
8. El flujo Cobro crea el registro de `COBROS` y `COBRO_DETALLE` en Sheets y genera el documento comercial.

No publiques tokens ni datos de clientes en GitHub.
