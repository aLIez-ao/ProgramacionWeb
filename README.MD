# 📺 MiTubo - Clon de YouTube con JavaScript y Firebase

Este proyecto es un clon de la interfaz de YouTube construido desde cero, enfocado en crear una **Single Page Application (SPA)** moderna utilizando JavaScript puro (ESM), Vite y un backend completo de Firebase.

La aplicación simula la experiencia de navegación de YouTube, permitiendo a los usuarios registrarse, iniciar sesión, ver videos, dar "like", "dislike", suscribirse y participar en un sistema de comentarios en tiempo real.

## ✨ Características Principales

* **Autenticación Completa:** Registro de nuevos usuarios, inicio de sesión, cierre de sesión y restablecimiento de contraseña (manejado por Firebase Auth).
* **Single Page Application (SPA):** Navegación instantánea entre la página de inicio y las páginas de video sin recargar la página, gracias a un router personalizado en `main.js`.
* **Base de Datos en Tiempo Real:** Todos los videos, comentarios, likes y suscripciones se leen y escriben en **Cloud Firestore**, permitiendo una experiencia dinámica.
* **Barra Lateral Dinámica:**
  * En la página de inicio, la barra lateral se minimiza (modo "mini").
  * En la página de video, la barra lateral se oculta y se muestra como una superposición (modo "overlay").
* **Funcionalidad Social (con DB):**
  * **Like / Dislike:** Los botones son mutuamente excluyentes y su estado se guarda en Firestore por usuario.
  * **Suscripciones:** Botón dinámico que guarda el estado de suscripción en Firestore.
* **Sistema de Comentarios Completo:**
  * Publicar nuevos comentarios.
  * Comentar otros comentarios (respuestas anidadas).
  * Cargar comentarios desde la base de datos.
  * Ordenar comentarios por "Más recientes" o "Más relevantes" (likes).
  * Botones "Leer más" / "Mostrar menos" para comentarios largos.
  * Respeto por los saltos de línea (`\n`) en el texto.
* **Interfaz Pulida:**
  * Fuente "Roboto" de Google.
  * Efectos `hover` y transiciones suaves en toda la aplicación.
  * Menú desplegable para el perfil de usuario.

---

## 🛠️ Tecnologías Utilizadas

* **Vite:** Como empaquetador (bundler) y servidor de desarrollo ultrarrápido.
* **JavaScript (Vanilla JS - ESM):** Toda la lógica de la aplicación, componentes y el router están escritos con JavaScript moderno (ES Modules) sin ningún framework (como React o Vue).
* **Firebase (BaaS):**
  * **Firebase Authentication:** Para el manejo de usuarios.
  * **Cloud Firestore:** Como base de datos NoSQL en tiempo real.
* **HTML5:** Estructura semántica.
* **CSS3:** Estilos modernos, incluyendo CSS Grid, Flexbox y animaciones.
* **Font Awesome:** Para los iconos.

---

## 🚀 Instalación y Puesta en Marcha

Para ejecutar este proyecto en tu máquina local, sigue estos pasos:

### 1. Prerrequisitos

* [Node.js](https://nodejs.org/) (versión 16 o superior)
* Una cuenta gratuita de [Firebase](https://console.firebase.google.com/)

### 2. Configuración Local

1. **Instala las dependencias:**

    ```bash
    npm install
    ```

2. **Configura Firebase:**
    * Ve a la consola de Firebase y crea un nuevo proyecto.
    * Activa **Authentication** (en la sección "Build") y habilita el proveedor **"Correo electrónico/Contraseña"**.
    * Activa **Firestore Database** (en "Build") y créala en **modo de prueba**.
    * Ve a la Configuración del Proyecto (`Project Settings`) y en la sección "Tus apps", haz clic en el ícono web (`</>`) para registrar una nueva app web.
    * Copia el objeto `firebaseConfig` que te proporciona.

3. **Crea el archivo de configuración:**
    * En la carpeta `src/services/`, crea un archivo llamado `firebaseConfig.js`.
    * Pega el siguiente código, reemplazando el objeto `firebaseConfig` con el tuyo:

    ```javascript
    // src/services/firebaseConfig.js
    import { initializeApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
    import { getFirestore } from "firebase/firestore";

    const firebaseConfig = {
      // Pega tu configuración de Firebase aquí
      apiKey: "TU_API_KEY",
      authDomain: "TU_AUTH_DOMAIN",
      projectId: "TU_PROJECT_ID",
      storageBucket: "TU_STORAGE_BUCKET",
      messagingSenderId: "TU_SENDER_ID",
      appId: "TU_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    
    export const auth = getAuth(app);
    export const db = getFirestore(app);
    ```

4. **Crea los Índices de Firestore:**
    * ¡Este paso es crucial! La app no mostrará comentarios sin esto.
    * Inicia la app: `npm run dev`.
    * Intenta abrir una página de video (tras registrarte y subir los datos del paso 6).
    * Abre la consola del navegador (F12). Verás un error de Firebase con un **enlace largo**.
    * **Haz clic en ese enlace**. Te llevará a Firebase para crear el índice (`comments`, `videoId`, `createdAt`). Acepta.
    * En la app, haz clic en "Más relevantes". Verás un **segundo error** con otro enlace.
    * **Haz clic en ese nuevo enlace** para crear el índice (`comments`, `videoId`, `likeCount`).
    * Espera 2-3 minutos a que los índices se "habiliten" en la consola de Firebase.

### 3. Sube los Datos de Video (Ejecutar solo una vez)

Este proyecto lee los videos de Firestore. Necesitas subirlos primero.

1. En el archivo `src/main.js`, añade estas dos líneas en la parte superior:

    ```javascript
    import { uploadVideos } from "./utils/uploadData.js"; // Asegúrate de que la ruta sea correcta
    uploadVideos();
    ```

2. Ejecuta la aplicación:

    ```bash
    npm run dev
    ```

3. Revisa la consola del navegador (F12) y la consola de Firestore. Verás los videos aparecer en una nueva colección llamada `videos`.
4. Una vez subidos, **elimina o comenta** esas dos líneas de `src/main.js` para no volver a subirlos.

### 4. Ejecuta la Aplicación

```bash
npm run dev
```
