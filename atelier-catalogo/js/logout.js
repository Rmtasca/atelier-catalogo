/*
 * ======================================================================
 * ARCHIVO: js/logout.js
 * FUNCIÓN: Gestiona el cierre de tu sesión.
 * ======================================================================
 *
 * Este script tiene una sola tarea: encontrar el botón de "Cerrar Sesión"
 * y decirle a Firebase que cierre tu sesión actual cuando le hagas clic.
 */

// 1. Importo las herramientas: el servicio de autenticación y la función para cerrar sesión.
//    El servicio `auth` ya viene listo para usar desde firebase.js.
import { auth } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// 2. Identifico el botón de "Cerrar Sesión" en el HTML por su ID.
const logoutButton = document.getElementById('logoutBtn');

// 3. Me quedo esperando a que hagas clic en ese botón.
logoutButton.addEventListener('click', async () => {
  try {
    // 4. Cuando haces clic, le digo a Firebase: "Cierra la sesión de esta persona".
    await signOut(auth);

    // 5. Si se cierra correctamente, te envío de vuelta a la página de inicio.
    window.location.href = 'index.html';

  } catch (error) {
    // 6. Si por alguna razón hay un error al cerrar la sesión, lo muestro en la consola del navegador.
    console.error('Error al cerrar sesión:', error);
    alert('No se pudo cerrar la sesión. Inténtalo de nuevo.');
  }
});
