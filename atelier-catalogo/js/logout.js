/*
 * ======================================================================
 * ARCHIVO: js/logout.js
 * FUNCIÓN: Gestiona el cierre de tu sesión.
 * ======================================================================
 *
 * Este script tiene una sola tarea: encontrar el botón de "Cerrar Sesión"
 * y decirle a Firebase que cierre tu sesión actual cuando le hagas clic.
 */

// 1. Importo las herramientas: la app de Firebase y la función específica para cerrar sesión.
import { firebaseApp } from './firebase.js';
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// 2. Preparo el servicio de autenticación.
const auth = getAuth(firebaseApp);

// 3. Identifico el botón de "Cerrar Sesión" en el HTML por su ID.
const logoutButton = document.getElementById('logoutBtn');

// 4. Me quedo esperando a que hagas clic en ese botón.
logoutButton.addEventListener('click', async () => {
  try {
    // 5. Cuando haces clic, le digo a Firebase: "Cierra la sesión de esta persona".
    await signOut(auth);

    // 6. Si se cierra correctamente, te envío de vuelta a la página de inicio.
    window.location.href = 'index.html';

  } catch (error) {
    // 7. Si por alguna razón hay un error al cerrar la sesión, lo muestro en la consola del navegador.
    console.error('Error al cerrar sesión:', error);
    alert('No se pudo cerrar la sesión. Inténtalo de nuevo.');
  }
});
