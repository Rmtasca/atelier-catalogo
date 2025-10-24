// auth.js

document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Captura de datos del formulario
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  // Validación simple (Hasta que se desarrolle el backend)
  if (user === "admin" && pass === "atelier123") {
    sessionStorage.setItem("logueado", "true"); // Guarda sesión
    window.location.href = "admin.html";        // Redirige al panel
  } else {
    alert("Credenciales incorrectas");
  }
});