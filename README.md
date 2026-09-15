# Claudia RF — V1 PRO RHE

Versión para operar clientes, catálogo, contrataciones, cotizaciones, pagos y cobros desde la app, usando Google Sheets como base de datos privada y Google Apps Script como API.

## Lógica de cobro
- El comprobante habitual es Recibo por Honorarios.
- La retención RHE se configura **al momento del cobro**, no dentro de cada servicio.
- En Cobro puedes marcar **Aplicar retención RHE**.
- Puedes indicar si el monto ingresado es **Honorario bruto** o **Monto neto que quiero recibir**.
- El PDF muestra honorarios, retención y neto cuando la retención está activa.
- Los servicios del cliente se agrupan en un solo PDF y cada servicio conserva su propio período.
- No se incluyen costos internos, ganancia ni información privada en el PDF del cliente.

## Instalación
1. Copia `backend/WebApp.gs` a tu proyecto de Google Apps Script y publica una nueva versión de la implementación.
2. Mantén la URL `/exec` configurada en `js/00-config.js`.
3. Sube `index.html`, `styles.css` y `js/` a GitHub Pages.
4. `backend/` puede conservarse en el repositorio como copia/versionado, pero el backend ejecutable es el proyecto de Apps Script.


## Lógica de cobro RHE
En Cobro, la retención RHE se configura por cobro y no por servicio. El modo predeterminado es "Monto neto que quiero recibir": si el total de servicios es S/ 2,000 y se aplica 8%, el sistema calcula un honorario bruto de S/ 2,173.91, retención de S/ 173.91 y neto de S/ 2,000. El cálculo no altera costo, precio ni ganancia de las contrataciones.
