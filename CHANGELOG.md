# CRF Freelance — cambios V1.1

- Guardado directo por documento en Firestore: ya no se reescribe toda la base al guardar un cliente, servicio, catálogo o pago.
- Feedback visual de guardado con botón bloqueado y spinner; los modales se cierran únicamente después de guardar correctamente.
- Animación sutil de apertura de modales y comportamiento optimizado para celular.
- Eliminación segura de clientes, servicios de catálogo y contrataciones, con confirmación y protecciones de integridad.
- El catálogo ahora usa “Disponible / No disponible”: es una propiedad del servicio que ofreces, no del cliente.
- Renovación de servicios periódicos: crea un nuevo periodo, permite cambiar costo y precio, deja el nuevo pago como Pendiente y conserva el periodo anterior en Historial.
- La renovación usa una escritura atómica en Firestore para cerrar el periodo anterior y crear el nuevo.
- Se preservan precios históricos: nunca se sobrescribe el periodo anterior para cambiar el precio de una renovación.

## V1.3 — Finanzas y pricing
- Finanzas ahora permite seleccionar ejercicio/periodo (por ejemplo 2026-2027) sin mezclar periodos.
- Porcentajes financieros se calculan por moneda para evitar mezclar USD y PEN.
- Nuevo bloque de rentabilidad: margen, costos reales, costo sobre ventas, porcentaje cobrado y ganancia recurrente anual.
- Nueva sección “Servicios a revisar” para detectar márgenes por debajo del mínimo configurado, incluyendo precio mínimo y precio objetivo.
- Configuración: margen mínimo y margen objetivo.
- Nuevo servicio y renovación muestran ganancia, margen y precio mínimo recomendado en tiempo real.
- La retención RHE se mantiene separada del resultado comercial; no se trata como costo del servicio.
