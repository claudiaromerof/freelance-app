# CRF Freelance — Firebase V1.1

Aplicación privada de gestión freelance de Claudia R.

## Flujo principal

**Cliente → Catálogo → Contratación → Cobro/Pago → Historial**

### Catálogo
Representa lo que Claudia ofrece. “Disponible” significa que puede seleccionarse para nuevas contrataciones. No representa el estado de ningún cliente.

### Contratación
Es el servicio concreto de un cliente. Aquí sí existe estado del servicio, periodo, costo interno, precio al cliente y estado del pago.

### Renovación
Para servicios mensuales, trimestrales, semestrales o anuales se usa **Renovar**. La app propone el siguiente periodo a partir del periodo anterior y permite cambiar costo y precio. Al confirmar:

1. el periodo anterior queda Finalizado;
2. se crea un nuevo registro;
3. el nuevo precio/costo se guardan como valores propios de ese periodo;
4. el pago del nuevo periodo queda Pendiente;
5. el periodo anterior permanece en Historial.

La app no crea renovaciones automáticamente porque necesitaría inventar el costo real y el precio que Claudia cobrará al cliente.

### Guardado
Cada acción guarda solamente el documento afectado en Firestore. Esto evita la espera que producía el guardado masivo de toda la base.

### Privacidad
Los datos reales viven en Firestore. El repositorio contiene código de la interfaz y la configuración pública de Firebase; no contiene datos de clientes. El acceso a Firestore depende de las reglas de seguridad configuradas en Firebase.

### Finanzas V1.3
La sección Finanzas usa el periodo de las contrataciones para permitir revisar ejercicios como 2025-2026 y 2026-2027. Los porcentajes se calculan por moneda. El sistema usa el margen mínimo y objetivo configurados para alertar sobre servicios que requieren revisión y para mostrar un precio mínimo de referencia al crear o renovar una contratación.
