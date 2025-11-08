document.addEventListener('DOMContentLoaded', () => {
  // Iniciar la carga de ambas secciones en paralelo
  cargarContenido('vestidos', 'catalogo');
  cargarContenido('trabajos', 'trabajosRealizados');
});

// --- FUNCIÓN GENERAL PARA CARGAR VESTIDOS O TRABAJOS ---
async function cargarContenido(tipo, contenedorId) { // tipo será 'vestidos' o 'trabajos'
  const endpoint = `/api/${tipo}`;
  const contenedorElement = document.getElementById(contenedorId);
  
  if (!contenedorElement) {
      console.error(`Error crítico: No se encontró el elemento contenedor #${contenedorId}`);
      return;
  }

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw new Error(`Respuesta del servidor no fue OK (${response.status}) para ${tipo}`);
    }
    const datos = await response.json();

    // Opcional: Si no hay datos, podrías mostrar un mensaje
    if (datos.length === 0) {
      if (tipo === 'vestidos') {
         // Si no hay vestidos, no se muestra nada en el main, puede que sea intencional
         console.log('No hay vestidos para mostrar.');
      } else {
         contenedorElement.innerHTML = `<p class="aviso-vacio">Aún no hay trabajos realizados para mostrar.</p>`;
      }
      return;
    }
    
    // Título dinámico para la sección de trabajos
    if (tipo === 'trabajos' && datos.length > 0) {
        const tituloTrabajos = document.createElement('h2');
        tituloTrabajos.textContent = 'Trabajos Realizados';
        contenedorElement.before(tituloTrabajos);
    }

    datos.forEach(item => {
      const div = document.createElement('div');
      div.className = 'vestido-card'; // Reutilizamos la clase para un estilo consistente

      if (tipo === 'vestidos') {
        div.innerHTML = `
          <img src="${item.fotos.foto1}" alt="${item.nombre}">
          <h3>${item.nombre}</h3>
          <p>${item.descripcion}</p>
          <p><strong>Precio:</strong> $${item.precio}</p>
          <p><strong>Talles:</strong> ${item.talles}</p>
        `;
      } else { // trabajos
        div.innerHTML = `
          <img src="${item.fotos.foto1}" alt="${item.titulo}">
          <h3>${item.titulo}</h3>
          <p>${item.detalle}</p>
          <p><strong>Fecha:</strong> ${item.fecha}</p>
        `;
      }
      contenedorElement.appendChild(div);
    });

  } catch (error) {
    console.error(`Error crítico al cargar ${tipo}:`, error);
    contenedorElement.innerHTML = `<p class="aviso-error">Hubo un problema al cargar el contenido. Intente más tarde.</p>`;
  }
}
