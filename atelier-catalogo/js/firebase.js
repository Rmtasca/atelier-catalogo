/*
 * ======================================================================
 * ARCHIVO: js/firebase.js
 * FUNCIÓN: Conecta tu página web con tu proyecto de Firebase.
 * ======================================================================
 *
 * Este es el archivo de configuración central. Aquí es donde pones las
 * "llaves" (credenciales) que Firebase te da.
 * Una vez configurado, otros scripts pueden importar la conexión desde aquí
 * sin tener que repetir la configuración en todos lados.
 */

// 1. Importo la función para inicializar la conexión desde la librería de Firebase.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

// 2. Aquí pego la configuración que me dio Firebase al crear el proyecto.
//    Contiene las claves únicas (API Key, etc.) que identifican mi app.
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// 3. Inicializo la aplicación de Firebase con mi configuración.
//    Esto crea la conexión principal que usarán todos los demás servicios (autenticación, base de datos, etc.).
const app = initializeApp(firebaseConfig);

// 4. ¡MUY IMPORTANTE! Exporto la conexión inicializada.
//    Esto permite que otros archivos (como auth.js, auth-guard.js, etc.)
//    puedan simplemente importarla y usarla directamente, asegurando que todos
//    usen la misma y única conexión a Firebase.
export const firebaseApp = app;
