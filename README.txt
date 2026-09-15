CLAUDIA RF V1 — CONECTADA A GOOGLE SHEETS

1. En tu Google Sheet, abre Extensiones > Apps Script.
2. Crea un archivo WebApp.gs y pega backend/WebApp.gs.
3. Implementa > Nueva implementación > Aplicación web. Ejecutar como: tú. Acceso: cualquiera.
4. Copia la URL /exec que te dé Apps Script.
5. Abre js/00-config.js y reemplaza PEGAR_AQUI_URL_WEB_APP por esa URL.
6. Sube esta carpeta a tu repositorio GitHub Pages.

El Sheet sigue privado; el sitio no contiene datos de clientes. La API usa un token de acceso para V1. Como GitHub Pages es público, ese token queda visible en el navegador, por lo que sirve como barrera básica, no como autenticación fuerte. Para una versión posterior realmente privada se recomienda autenticación de Google.

Token generado para esta versión:
CM39nAfl8dCkEZhYUJ9JImhKnIz_Ma_TYqaSlRSFUyQ


PASO BACKEND ACTUALIZADO:
Copia backend/WebApp.gs completo a tu proyecto de Google Apps Script y vuelve a implementar una nueva versión.
SERVICIOS se conserva como catálogo; state.services representa CONTRATACIONES y resuelve el nombre mediante ID_SERVICIO.

COBROS:
Cada servicio conserva su propio periodo. Si todos coinciden, el documento muestra un periodo general; si difieren, muestra "Periodos según cada servicio" y cada fila conserva sus fechas.
