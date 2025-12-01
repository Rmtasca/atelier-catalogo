/*
 * ======================================================================
 * ARCHIVO: js/auth-guard.js
 * FUNCIÓN: Actúa como un "portero" o "guardia de seguridad" mejorado.
 * ======================================================================
 */

// 1. Importo las herramientas necesarias: el servicio `auth` y el vigilante `onAuthStateChanged`.
import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// 2. Vigilo el estado de la sesión.
//    `onAuthStateChanged` es un "oyente" que se activa automáticamente
//    cuando se carga la página y cada vez que el estado de autenticación cambia.
onAuthStateChanged(auth, (user) => {
  // 3. Compruebo si existe un objeto `user`.
  if (!user) {
    // 4. Si NO hay usuario, te redirijo a la página de login.
    //    Como el <body> de admin.html está oculto por defecto, el usuario nunca ve el contenido protegido.
    window.location.href = 'login.html';
  } else {
    // 5. Si SÍ hay usuario, significa que tienes permiso para estar aquí.
    //    Entonces, hago visible el contenido de la página cambiando el estilo del <body>.
    document.body.style.display = 'block';
  }
});
