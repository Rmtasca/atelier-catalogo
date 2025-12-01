/**
 * Inicializa y exporta los servicios de Firebase para la aplicación.
 */

// Importa las funciones de inicialización de los servicios de Firebase.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// Configuración del proyecto de Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyDoZcEzC_vqYtMdYtngzN_f8vTDuAs68Yg",
  authDomain: "atelier-catalogo.firebaseapp.com",
  projectId: "atelier-catalogo",
  storageBucket: "atelier-catalogo.firebasestorage.app",
  messagingSenderId: "112874676163",
  appId: "1:112874676163:web:ad7a7140243d91ee452776",
  measurementId: "G-8FGWHB6N95"
};

// Inicializa la aplicación Firebase.
const app = initializeApp(firebaseConfig);

// Obtiene instancias de los servicios de Firebase.
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Exporta las instancias de los servicios para su uso en otros módulos.
export { app, auth, db, storage };
