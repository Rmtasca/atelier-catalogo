/**
 * Carga y renderiza el contenido del catálogo público desde Firestore.
 */

// Importa los módulos necesarios de Firebase.
import { db, storage } from './firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// Carga inicial del contenido al cargar el DOM.
document.addEventListener('DOMContentLoaded', () => {
  cargarContenido('vestidos', 'catalogo');
  cargarContenido('trabajos', 'trabajosRealizados');
  setupImageModal();
});

/**
 * Configura el modal para ampliar imágenes.
 */
function setupImageModal() {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-image');
  const closeBtn = document.querySelector('.modal-close');

  document.addEventListener('click', (event) => {
    // El listener ahora se aplica a todas las imágenes de producto con una sola clase.
    if (event.target.matches('.product-image')) {
      modal.style.display = "flex";
      modalImg.src = event.target.src;
    }
  });

  // Cierra el modal al hacer clic en (x)
  closeBtn.onclick = function() {
    modal.style.display = "none";
  }

  // Cierra el modal al hacer clic fuera de la imagen
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}

/**
 * Obtiene y muestra los documentos de una colección de Firestore.
 * @param {string} tipo - Nombre de la colección ('vestidos' o 'trabajos').
 * @param {string} contenedorId - ID del elemento del DOM donde se renderizará el contenido.
 */
async function cargarContenido(tipo, contenedorId) {
  const contenedorElement = document.getElementById(contenedorId);
  if (!contenedorElement) {
    console.error(`Contenedor #${contenedorId} no encontrado.`);
    return;
  }

  try {
    const collRef = collection(db, tipo);
    const q = query(collRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      const tituloId = (tipo === 'vestidos') ? 'tituloCatalogo' : 'tituloTrabajos';
      const titulo = document.getElementById(tituloId);
      if (titulo) titulo.style.display = 'none';
      return;
    }

    contenedorElement.innerHTML = '';

    for (const doc of querySnapshot.docs) {
      const item = { id: doc.id, ...doc.data() };

      // --- ESTRUCTURA DE TARJETA UNIFICADA ---
      const cardDiv = document.createElement('div');
      cardDiv.className = 'product-card-detailed';

      const infoCol = document.createElement('div');
      infoCol.className = 'info-column';

      const titleElement = document.createElement('h2');
      titleElement.className = 'product-title';
      infoCol.appendChild(titleElement);

      const detailsList = document.createElement('ul');
      detailsList.className = 'details-list';
      infoCol.appendChild(detailsList);
      
      cardDiv.appendChild(infoCol);

      // --- Llenar contenido basado en el tipo ---
      if (tipo === 'vestidos') {
        titleElement.textContent = item.nombre || 'Vestido sin nombre';
        if (item.descripcion) {
            const li = document.createElement('li');
            li.textContent = item.descripcion;
            detailsList.appendChild(li);
        }
        if (item.precio) {
            const li = document.createElement('li');
            li.textContent = `Precio: $${Number(item.precio).toLocaleString('es-AR')}`;
            detailsList.appendChild(li);
        }
      } else if (tipo === 'trabajos') {
        titleElement.textContent = item.titulo || 'Trabajo sin título';
        if (item.descripcion) {
            const li = document.createElement('li');
            li.textContent = item.descripcion;
            detailsList.appendChild(li);
        }
        if (item.fecha) {
            const li = document.createElement('li');
            li.textContent = `Realizado: ${new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`;
            detailsList.appendChild(li);
        }
      }

      const imageCol = document.createElement('div');
      imageCol.className = 'image-column';
      const photoPaths = Object.values(item.fotos || {}).filter(p => p);

      if (photoPaths.length > 0) {
        for (const path of photoPaths) {
          const url = await getDownloadURL(ref(storage, path));
          const imgElement = document.createElement('img');
          imgElement.src = url;
          imgElement.alt = `Foto de ${item.nombre || item.titulo}`;
          imgElement.className = 'product-image'; // Clase unificada
          imageCol.appendChild(imgElement);
        }
      } else {
        const placeholder = document.createElement('img');
        placeholder.src = 'img/placeholder.png';
        placeholder.className = 'product-image';
        imageCol.appendChild(placeholder);
      }
      cardDiv.appendChild(imageCol);
      contenedorElement.appendChild(cardDiv);
    }
  } catch (error) {
    console.error("Error al cargar contenido:", error);
    contenedorElement.innerHTML = `<p>Error al cargar el contenido. Intente de nuevo más tarde.</p>`;
  }
}
