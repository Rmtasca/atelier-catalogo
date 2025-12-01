/*
 * ======================================================================
 * ARCHIVO: js/auth-guard.js
 * FUNCIÓN: Actúa como un "portero" o "guardia de seguridad" mejorado.
 * ======================================================================
 *
  */

// 1. Importo las herramientas necesarias de Firebase.
import { firebaseApp } from './firebase.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// 2. Preparo el servicio de autenticación.
const auth = getAuth(firebaseApp);

// 3. Vigilo el estado de la sesión.
onAuthStateChanged(auth, (user) => {
  // 4. Compruebo si existe un usuario autenticado.
  if (!user) {
    // 5. Si NO hay usuario, te redirijo a la página de login.
    //    Como el <body> estará oculto por defecto, nunca llegas a ver el contenido de admin.
    window.location.href = 'login.html';
  } else {
    // 6. Si SÍ hay usuario, significa que tienes permiso para estar aquí.
    //    Entonces, hago visible el contenido de la página cambiando el estilo del <body>.
    document.body.style.display = 'block';
  }
});
