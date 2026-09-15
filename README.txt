CLAUDIA RF — V1 PRO · RECIBO POR HONORARIOS

Arquitectura
- GitHub Pages: interfaz web.
- Google Apps Script: API.
- Google Sheets: base de datos privada.

Lógica tributaria de la app
- El comprobante habitual es Recibo por Honorarios.
- La cotización NO suma IGV.
- La cotización NO descuenta ni suma la retención.
- La retención se gestiona internamente al emitir/pagar el RHE, cuando corresponda.
- Configuración editable desde la sección Configuración de la app:
  - tasa de retención (por defecto 8%)
  - monto de referencia sin retención (por defecto S/ 1,500)
- El porcentaje y los umbrales deben revisarse según la situación tributaria vigente.

Gestión desde la app
- Clientes: crear y editar.
- Servicios/contrataciones: crear y editar.
- Estado de pago: Pendiente/Pagado, fecha y medio.
- RHE: emitido/no, número, fecha y retención interna estimada.
- Cotizaciones: crear, editar y generar PDF.
- Cobros: un solo PDF por cliente con todos los servicios pendientes/activos, cada uno con su propio periodo.
- Finanzas: costo, precio, ganancia y cobrado/pendiente.

IMPORTANTE — Apps Script
1. Copiar backend/WebApp.gs al proyecto de Google Apps Script.
2. Guardar.
3. Implementar > Administrar implementaciones > Editar > Nueva versión.
4. Ejecutar como: tú.
5. Acceso: cualquiera.
6. Mantener la URL /exec existente.

Al guardar desde la app, el backend crea/actualiza la hoja CONFIGURACION automáticamente.
Las columnas antiguas TIPO_IGV/TASA_IGV se conservan solo para compatibilidad histórica; la aplicación ya no las usa.
