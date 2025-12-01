/*
 * ======================================================================
 * ARCHIVO: js/auth.js
 * FUNCIÓN: Gestiona tu inicio de sesión.
 * ======================================================================
 *
 * Este script se encarga de escuchar el formulario de login.html.
 * Cuando pulsas "Ingresar", tomo el email y la contraseña que escribiste
 * y se los envío a Firebase para que me diga si eres tú de verdad.
 */

// 1. Importo las herramientas: el servicio de autenticación y la función para iniciar sesión.
//    El servicio `auth` ya viene inicializado y listo para usar desde firebase.js.
import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// 2. Identifico el formulario y el párrafo de error en el HTML para poder controlarlos.
const loginForm = document.getElementById('loginForm');
const errorMessageElement = document.getElementById('error-message');

// 3. Me quedo esperando a que envíes el formulario (haciendo clic en "Ingresar").
loginForm.addEventListener('submit', async (e) => {
  // 3.1. Primero, evito que el formulario recargue la página, que es lo que haría normalmente.
  e.preventDefault();

  // 3.2. Tomo el texto que escribiste en los campos de email y contraseña.
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // 3.3. Limpio cualquier mensaje de error anterior y desactivo el botón para evitar clics repetidos.
  errorMessageElement.textContent = '';
  loginForm.querySelector('button[type="submit"]').disabled = true;

  try {
    // 4. ¡La parte importante! Envío tu email y contraseña a Firebase.
    //    La función signInWithEmailAndPassword hace todo el trabajo de verificación segura.
    await signInWithEmailAndPassword(auth, email, password);

    // 5. Si Firebase no me devuelve un error, significa que tus credenciales son correctas.
    //    En ese caso, te llevo a la página de administración.
    window.location.href = 'admin.html';

  } catch (error) {
    // 6. Si Firebase me devuelve un error, es porque algo salió mal (contraseña, email, etc.).
    //    Reviso qué tipo de error es y te muestro un mensaje claro.
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessageElement.textContent = 'Ese correo no está registrado.';
        break;
      case 'auth/wrong-password':
        errorMessageElement.textContent = 'Contraseña incorrecta.';
        break;
      default:
        errorMessageElement.textContent = 'Error al intentar ingresar. Revisa tus datos.';
        break;
    }
  } finally {
    // 7. No importa si funcionó o no, vuelvo a activar el botón de "Ingresar" para que puedas intentarlo de nuevo.
    loginForm.querySelector('button[type="submit"]').disabled = false;
  }
});
