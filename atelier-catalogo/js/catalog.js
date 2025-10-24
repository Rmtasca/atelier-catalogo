
//  CARGA DE DATOS DESDE localStorage


const vestidos = JSON.parse(localStorage.getItem("vestidosNuevos")) || [];
const trabajos = JSON.parse(localStorage.getItem("vestidosTerminados")) || [];


//  REFERENCIAS A ELEMENTOS DEL DOM


const contenedorVestidos = document.getElementById("catalogo");
const contenedorTrabajos = document.getElementById("trabajosRealizados");
const tituloCatalogo = document.getElementById("tituloCatalogo");


//  FUNCIÓN PARA MOSTRAR EL TÍTULO


function actualizarTituloCatalogo() {
  if (vestidos.length > 0 && trabajos.length > 0) {
    tituloCatalogo.textContent = "Catálogo del Atelier";
    tituloCatalogo.style.display = "block";
  } else if (vestidos.length > 0) {
    tituloCatalogo.textContent = "Catálogo de Vestidos";
    tituloCatalogo.style.display = "block";
  } else if (trabajos.length > 0) {
    tituloCatalogo.textContent = "Trabajos Realizados";
    tituloCatalogo.style.display = "block";
  } else {
    tituloCatalogo.style.display = "none";
  }
}


//  RENDERIZAR VESTIDOS


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



// 🧵 RENDERIZAR TRABAJOS REALIZADOS


trabajos.forEach((t) => {
  const card = document.createElement("div");
  card.className = "trabajo tarjeta";
  card.innerHTML = `
    <h3>${t.titulo}</h3>
    <p>${t.detalle}</p>
    <p><strong>Fecha:</strong> ${t.fecha}</p>
    <div class="galeria">
      ${t.fotos.map((f, i) => `
        <div class="imagen-con-tooltip">
          <img src="${f}" alt="Foto del trabajo ${t.titulo}">
          <span class="tooltip">Detalle ${i + 1} de ${t.titulo}</span>
        </div>
      `).join("")}
    </div>
    <div class="firma-atelier">Atelier artesanal</div>
  `;
  contenedorTrabajos.appendChild(card);
});


// ACTUALIZAR TÍTULO SEGÚN CONTENIDO


actualizarTituloCatalogo();

