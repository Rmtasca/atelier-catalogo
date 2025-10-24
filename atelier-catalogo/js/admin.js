
//  VERIFICACIÓN DE SESIÓN

// Redirige al login si el usuario no está logueado
if (sessionStorage.getItem("logueado") !== "true") {
  window.location.href = "login.html";
}


//  GESTIÓN DE VESTIDOS


// Recupera vestidos y trabajos desde localStorage
let vestidos = JSON.parse(localStorage.getItem("vestidosNuevos")) || [];
let trabajos = JSON.parse(localStorage.getItem("vestidosTerminados")) || [];

// Referencias a formularios y contenedores
const formVestido = document.getElementById("formVestido");
const formTrabajo = document.getElementById("formTrabajo");
const listaVestidos = document.getElementById("listaVestidos");
const listaTrabajos = document.getElementById("listaTrabajos");

// Renderiza los datos existentes al cargar
vestidos.forEach(mostrarVestido);
trabajos.forEach(mostrarTrabajo);


//  ENVÍO DE FORMULARIO DE VESTIDOS


formVestido.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Captura datos del formulario
  const nuevoVestido = {
    nombre: formVestido.elements["nombre"].value,
    descripcion: formVestido.elements["descripcion"].value,
    precio: formVestido.elements["precio"].value,
    talles: formVestido.elements["talles"].value.split(",").map(t => t.trim()),
    fotos: await obtenerImagenes([
      formVestido.elements["foto1"],
      formVestido.elements["foto2"],
      formVestido.elements["foto3"]
    ])
  };

  // Guarda y muestra
  guardarVestido(nuevoVestido);
  formVestido.reset();
});


//  ENVÍO DE FORMULARIO DE TRABAJOS


formTrabajo.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Captura datos del formulario
  const nuevoTrabajo = {
    titulo: formTrabajo.elements["tituloTrabajo"].value,
    detalle: formTrabajo.elements["detalleTrabajo"].value,
    fecha: formTrabajo.elements["fechaTrabajo"].value,
    fotos: await obtenerImagenes([
      formTrabajo.elements["fotoTrabajo1"],
      formTrabajo.elements["fotoTrabajo2"],
      formTrabajo.elements["fotoTrabajo3"]
    ])
  };

  // Guarda y muestra
  guardarTrabajo(nuevoTrabajo);
  formTrabajo.reset();
});


//  FUNCIONES DE GUARDADO Y RENDERIZADO


function guardarVestido(vestido) {
  vestidos.push(vestido);
  localStorage.setItem("vestidosNuevos", JSON.stringify(vestidos));
  mostrarVestido(vestido);
  descargarJSON("vestidosNuevos.json", vestidos); // Exporta archivo
}

function guardarTrabajo(trabajo) {
  trabajos.push(trabajo);
  localStorage.setItem("vestidosTerminados", JSON.stringify(trabajos));
  mostrarTrabajo(trabajo);
  descargarJSON("vestidosTerminados.json", trabajos); // Exporta archivo
}

function mostrarVestido(v) {
  const card = document.createElement("div");
  card.className = "vestido tarjeta";
  card.innerHTML = `
    <h3>${v.nombre}</h3>
    <p>${v.descripcion}</p>
    <p><strong>Precio:</strong> $${v.precio}</p>
    <p><strong>Talles:</strong> ${v.talles.join(", ")}</p>
    <div class="galeria">
      ${v.fotos.map(f => `<img src="${f}" alt="Foto de vestido">`).join("")}
    </div>
  `;
  listaVestidos.appendChild(card);
}

function mostrarTrabajo(t) {
  const card = document.createElement("div");
  card.className = "trabajo tarjeta";
  card.innerHTML = `
    <h3>${t.titulo}</h3>
    <p>${t.detalle}</p>
    <p><strong>Fecha:</strong> ${t.fecha}</p>
    <div class="galeria">
      ${t.fotos.map(f => `<img src="${f}" alt="Foto del trabajo">`).join("")}
    </div>
    <div class="firma-atelier">Atelier artesanal</div>
  `;
  listaTrabajos.appendChild(card);
}


//  FUNCIONES PARA IMÁGENES


async function obtenerImagenes(campos) {
  const resultados = [];

  for (const campo of campos) {
    const archivo = campo.files[0];
    if (archivo) {
      const base64 = await leerArchivo(archivo);
      resultados.push(base64);
    }
  }

  return resultados;
}

function leerArchivo(archivo) {
  return new Promise((resolve) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.readAsDataURL(archivo);
  });
}


//  DESCARGA DE ARCHIVOS JSON


function descargarJSON(nombreArchivo, datos) {
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombreArchivo;
  enlace.click();
}