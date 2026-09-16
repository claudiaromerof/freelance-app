# CRF Freelance — Firebase V1

## 1. Firebase
- Authentication → Sign-in method → Google: Enabled.
- Firestore: Standard, regional `southamerica-west1 (Santiago)`, modo producción.
- Firestore Rules: permitir únicamente el correo autorizado.
- Authentication → Settings → Authorized domains: agregar el dominio exacto de GitHub Pages de la aplicación.

## 2. VS Code
Mantén todos los archivos del ZIP. No mezcles módulos de versiones anteriores.

## 3. Prueba local
Desde la raíz:

```bash
python3 -m http.server 8000
```

Abrir `http://localhost:8000/`.

## 4. Migración inicial
Antes de borrar Apps Script/Sheets:
1. Abrir `firebase-migrate.html` desde el servidor local.
2. Iniciar sesión con Google.
3. Introducir la URL del Web App de Apps Script actual y el PIN actual.
4. Ejecutar la migración.
5. Revisar Firestore y la aplicación.
6. Solo cuando todo esté correcto, retirar Apps Script de la operación diaria.

La URL y el PIN de Apps Script se introducen en el navegador y no se guardan en el repositorio.

## 5. GitHub Pages
Publica el contenido de esta carpeta en el repositorio. Agrega el dominio de GitHub Pages en Firebase Authentication → Settings → Authorized domains.
