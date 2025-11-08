document.addEventListener('DOMContentLoaded', () => {
  // Manejador para el formulario de Vestidos
  const formVestido = document.getElementById('formVestido');
  formVestido.addEventListener('submit', (e) => handleFormSubmit(e, 'vestido'));

  // Manejador para el formulario de Trabajos
  const formTrabajo = document.getElementById('formTrabajo');
  formTrabajo.addEventListener('submit', (e) => handleFormSubmit(e, 'trabajo'));

  // Cargar datos iniciales
  cargarDatos('vestidos');
  cargarDatos('trabajos');
});

// --- FUNCIÓN GENERAL PARA MANEJAR EL ENVÍO DE AMBOS FORMULARIOS ---
async function handleFormSubmit(event, tipo) {
  event.preventDefault();
  const form = event.target;

  let data = {};
  let endpoint = '';

  // 1. Recopilar datos y configurar el endpoint según el tipo
  if (tipo === 'vestido') {
    data = {
      nombre: form.nombre.value,
      descripcion: form.descripcion.value,
      precio: form.precio.value,
      talles: form.talles.value,
    };
    endpoint = '/api/vestidos';
  } else { // tipo === 'trabajo'
    data = {
      titulo: form.tituloTrabajo.value,
      detalle: form.detalleTrabajo.value,
      fecha: form.fechaTrabajo.value,
    };
    endpoint = '/api/trabajos';
  }

  // 2. Recopilar y convertir imágenes a base64
  try {
    const fotos = await procesarImagenes(form, tipo);
    data.fotos = fotos;
  } catch (error) {
    alert('Error al procesar imágenes: ' + error.message);
    return;
  }

  // 3. Enviar datos al servidor
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert(`¡${tipo.charAt(0).toUpperCase() + tipo.slice(1)} agregado con éxito!`);
      form.reset();
      cargarDatos(tipo + 's'); // Recargar la lista correspondiente
    } else {
      const error = await response.json();
      throw new Error(error.message || 'Error del servidor');
    }
  } catch (error) {
    alert(`Error al agregar el ${tipo}: ${error.message}`);
  }
}

// --- FUNCIÓN PARA PROCESAR LAS IMÁGENES DE UN FORMULARIO ---
function procesarImagenes(form, tipo) {
  const prefijo = (tipo === 'vestido') ? 'foto' : 'fotoTrabajo';
  const inputs = [form[prefijo + '1'], form[prefijo + '2'], form[prefijo + '3']];

  const promesas = inputs.map((input, index) => {
    return new Promise((resolve, reject) => {
      if (input.files.length > 0) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({ ['foto' + (index + 1)]: reader.result });
        reader.onerror = (error) => reject(new Error('No se pudo leer el archivo: ' + file.name));
      } else {
        resolve({}); // Resuelve un objeto vacío si no hay archivo
      }
    });
  });

  return Promise.all(promesas).then(resultados => {
    // Combinar los resultados en un solo objeto de fotos
    const fotos = Object.assign({}, ...resultados);
    if (Object.keys(fotos).length === 0) {
        throw new Error('Debes subir al menos la imagen principal.');
    }
    return fotos;
  });
}

// --- FUNCIÓN PARA CARGAR Y MOSTRAR DATOS (VESTIDOS O TRABAJOS) ---
async function cargarDatos(tipo) { // tipo será 'vestidos' o 'trabajos'
  const endpoint = `/api/${tipo}`;
  const listaId = (tipo === 'vestidos') ? 'listaVestidos' : 'listaTrabajos';
  const listaElement = document.getElementById(listaId);

  try {
    const response = await fetch(endpoint);
    const datos = await response.json();

    listaElement.innerHTML = ''; // Limpiar lista

    datos.forEach(item => {
      const div = document.createElement('div');
      div.className = 'item-admin-card'; // Usar una clase común para estilos

      if (tipo === 'vestidos') {
        div.innerHTML = `
          <img src="${item.fotos.foto1}" alt="${item.nombre}">
          <h4>${item.nombre}</h4>
          <p>Precio: $${item.precio}</p>
          <button onclick="eliminarItem('${item.id}', 'vestidos')">Eliminar</button>
        `;
      } else { // trabajos
        div.innerHTML = `
          <img src="${item.fotos.foto1}" alt="${item.titulo}">
          <h4>${item.titulo}</h4>
          <p>Fecha: ${item.fecha}</p>
          <button onclick="eliminarItem('${item.id}', 'trabajos')">Eliminar</button>
        `;
      }
      listaElement.appendChild(div);
    });
  } catch (error) {
    console.error(`Error cargando ${tipo}:`, error);
  }
}

// --- FUNCIÓN PARA ELIMINAR UN ITEM (VESTIDO O TRABAJO) ---
async function eliminarItem(id, tipo) {
  if (!confirm(`¿Estás seguro de que quieres eliminar este ${tipo.slice(0, -1)}?`)) return;

  try {
    const response = await fetch(`/api/${tipo}/${id}`, { method: 'DELETE' });
    if (response.ok) {
      alert('Elemento eliminado con éxito');
      cargarDatos(tipo);
    } else {
      const error = await response.json();
      throw new Error(error.message);
    }
  } catch (error) {
    alert('Error al eliminar: ' + error.message);
  }
}
