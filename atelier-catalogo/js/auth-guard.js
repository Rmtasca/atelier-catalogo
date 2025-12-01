/**
 * Protege las rutas que requieren autenticación.
 * Redirige a los usuarios no autenticados a la página de login.
 */

// Importa el servicio de autenticación y el observador de estado.
import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/**
 * Observa los cambios en el estado de autenticación del usuario.
 * Si el usuario no está autenticado, lo redirige a 'login.html'.
 * Si el usuario está autenticado, muestra el contenido de la página.
 */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Usuario no autenticado: redirigir a la página de login.
    window.location.href = 'login.html';
  } else {
    // Usuario autenticado: hacer visible el contenido de la página.
    document.body.style.display = 'block';
  }
});
