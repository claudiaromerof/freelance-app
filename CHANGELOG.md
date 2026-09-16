# CRF Freelance — cambios V1.1

- Guardado directo por documento en Firestore: ya no se reescribe toda la base al guardar un cliente, servicio, catálogo o pago.
- Feedback visual de guardado con botón bloqueado y spinner; los modales se cierran únicamente después de guardar correctamente.
- Animación sutil de apertura de modales y comportamiento optimizado para celular.
- Eliminación segura de clientes, servicios de catálogo y contrataciones, con confirmación y protecciones de integridad.
- El catálogo ahora usa “Disponible / No disponible”: es una propiedad del servicio que ofreces, no del cliente.
- Renovación de servicios periódicos: crea un nuevo periodo, permite cambiar costo y precio, deja el nuevo pago como Pendiente y conserva el periodo anterior en Historial.
- La renovación usa una escritura atómica en Firestore para cerrar el periodo anterior y crear el nuevo.
- Se preservan precios históricos: nunca se sobrescribe el periodo anterior para cambiar el precio de una renovación.
