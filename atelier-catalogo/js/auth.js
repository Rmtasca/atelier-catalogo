/**
 * Gestiona la autenticación de usuarios mediante Firebase Authentication.
 */

// Importa los módulos necesarios de Firebase.
import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// Referencias a los elementos del DOM.
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessageElement = document.getElementById('error-message');

// Listener para el evento 'submit' del formulario de login.
loginForm.addEventListener('submit', async (event) => {
  // Previene el comportamiento por defecto del formulario.
  event.preventDefault();

  // Obtiene las credenciales del usuario.
  const email = emailInput.value;
  const password = passwordInput.value;

  // Limpia mensajes de error previos.
  errorMessageElement.textContent = '';

  try {
    // Intenta iniciar sesión con las credenciales proporcionadas.
    await signInWithEmailAndPassword(auth, email, password);
    // Si la autenticación es exitosa, redirige al panel de administración.
    window.location.href = 'admin.html';
  } catch (error) {
    // En caso de error, lo registra en la consola.
    console.error("Error de autenticación:", error.code, error.message);
    // Muestra un mensaje de error genérico al usuario.
    errorMessageElement.textContent = 'Credenciales incorrectas. Verifique e intente de nuevo.';
  }
});
