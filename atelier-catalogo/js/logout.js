/**
 * Gestiona el evento de cierre de sesión del usuario.
 */

// Importa el servicio de autenticación y la función de cierre de sesión.
import { auth } from './firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// Obtiene la referencia al botón de cierre de sesión del DOM.
const logoutButton = document.getElementById('logoutBtn');

/**
 * Agrega un listener al botón de cierre de sesión.
 * Al hacer clic, cierra la sesión del usuario en Firebase y redirige al inicio.
 * Muestra un error en caso de que falle el cierre de sesión.
 */
logoutButton.addEventListener('click', async () => {
  try {
    // Cierra la sesión del usuario actual.
    await signOut(auth);
    // Redirige al usuario a la página de inicio tras el cierre de sesión.
    window.location.href = 'index.html';
  } catch (error) {
    // Maneja cualquier error que ocurra durante el cierre de sesión.
    console.error('Error al cerrar sesión:', error);
    alert('No se pudo cerrar la sesión. Por favor, inténtalo de nuevo.');
  }
});
