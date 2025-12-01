/*
 * ======================================================================
 * ARCHIVO: js/firebase.js
 * FUNCIÓN: Conecta tu página web con tu proyecto de Firebase.
 * ======================================================================
 *
 * Este es el archivo de configuración central. Aquí es donde pones las
 * "llaves" (credenciales) que Firebase te da y desde donde se distribuyen
 * los servicios de Firebase al resto de la aplicación.
 */

// 1. Importo las funciones para inicializar la conexión y los servicios que voy a usar.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// 2. Pego la configuración que me proporcionaste desde tu consola de Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyDoZcEzC_vqYtMdYtngzN_f8vTDuAs68Yg",
  authDomain: "atelier-catalogo.firebaseapp.com",
  projectId: "atelier-catalogo",
  storageBucket: "atelier-catalogo.appspot.com", // Corregido: el bucket no debe tener ".firebasestorage" en la config.
  messagingSenderId: "112874676163",
  appId: "1:112874676163:web:ad7a7140243d91ee452776",
  measurementId: "G-8FGWHB6N95"
};

// 3. Inicializo la aplicación de Firebase con la configuración.
const app = initializeApp(firebaseConfig);

// 4. Obtengo las referencias a los servicios que necesito y los preparo para ser usados.
const auth = getAuth(app);         // Servicio de Autenticación
const db = getFirestore(app);      // Base de datos (Firestore)
const storage = getStorage(app);   // Almacenamiento de archivos (Storage)

// 5. ¡MUY IMPORTANTE! Exporto los servicios inicializados.
//    Esto permite que otros archivos (como auth.js, admin.js, etc.)
//    puedan simplemente importarlos y usarlos directamente.
export { app, auth, db, storage };
