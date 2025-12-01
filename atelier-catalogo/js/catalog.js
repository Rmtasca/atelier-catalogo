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
});

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

    // Oculta el título del catálogo si no hay vestidos.
    if (querySnapshot.empty) {
        if (tipo === 'trabajos') {
            contenedorElement.innerHTML = `<p class="aviso-vacio"></p>`;
        } else if (tipo === 'vestidos') {
            const titulo = document.getElementById('tituloCatalogo');
            if(titulo) titulo.style.display = 'none';
        }
        return;
    }

    contenedorElement.innerHTML = '';

    // Muestra el título de "Trabajos Realizados" solo si hay documentos.
    if (tipo === 'trabajos' && querySnapshot.size > 0) {
        const tituloTrabajos = document.getElementById('tituloTrabajos');
        if (tituloTrabajos) {
            tituloTrabajos.style.display = 'block'; 
        } else {
            const nuevoTitulo = document.createElement('h2');
            nuevoTitulo.id = 'tituloTrabajos';
            nuevoTitulo.textContent = 'Trabajos Realizados';
            contenedorElement.before(nuevoTitulo);
        }
    }

    for (const doc of querySnapshot.docs) {
      const item = { id: doc.id, ...doc.data() };

      // Renderiza la tarjeta de producto detallada para la colección 'vestidos'.
      if (tipo === 'vestidos') {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'product-card-detailed';

        const infoCol = document.createElement('div');
        infoCol.className = 'info-column';

        const titleElement = document.createElement('h2');
        titleElement.className = 'product-title';
        titleElement.textContent = item.nombre || 'Vestido sin nombre';
        infoCol.appendChild(titleElement);

        const detailsList = document.createElement('ul');
        detailsList.className = 'details-list';
        
        const details = [];
        if (item.descripcion) details.push(item.descripcion);
        if (item.talles) details.push(`Talles: ${item.talles}`);
        if (item.precio) details.push(`Precio: $${item.precio.toLocaleString('es-AR')}`);

        details.forEach(detailText => {
            const listItem = document.createElement('li');
            listItem.textContent = detailText;
            detailsList.appendChild(listItem);
        });
        
        infoCol.appendChild(detailsList);
        cardDiv.appendChild(infoCol);

        const imageCol = document.createElement('div');
        imageCol.className = 'image-column';
        
        const photoPaths = [];
        if (item.fotos && item.fotos.foto1) photoPaths.push(item.fotos.foto1);
        if (item.fotos && item.fotos.foto2) photoPaths.push(item.fotos.foto2);

        if (photoPaths.length > 0) {
          for (const path of photoPaths) {
            try {
              const url = await getDownloadURL(ref(storage, path));
              const imgElement = document.createElement('img');
              imgElement.src = url;
              imgElement.alt = `Foto de ${item.nombre}`;
              imgElement.className = 'product-image';
              imageCol.appendChild(imgElement);
            } catch (error) {
              console.error(`No se pudo cargar la imagen: ${path}`, error);
            }
          }
        } else {
          const placeholder = document.createElement('img');
          placeholder.src = 'img/placeholder.png';
          placeholder.alt = 'Imagen no disponible';
          placeholder.className = 'product-image';
          imageCol.appendChild(placeholder);
        }
        
        cardDiv.appendChild(imageCol);
        contenedorElement.appendChild(cardDiv);

      } else { // Renderiza una tarjeta simple para la colección 'trabajos'.
        let imgSrc = 'img/placeholder.png';
        if (item.fotos && item.fotos.foto1) {
          try {
            imgSrc = await getDownloadURL(ref(storage, item.fotos.foto1));
          } catch (error) {
            console.error(`Error al cargar imagen de trabajo: ${item.fotos.foto1}`, error);
          }
        }
        
        const cardDiv = document.createElement('div');
        cardDiv.className = 'item-card';
        cardDiv.innerHTML = `
          <div class="item-image" style="background-image: url('${imgSrc}')"></div>
          <div class="item-info">
            <h3 class="item-title">${item.titulo || 'Trabajo sin título'}</h3>
          </div>
        `;
        contenedorElement.appendChild(cardDiv);
      }
    }
  } catch (error) {
    console.error(`Error en cargarContenido:`, error);
    contenedorElement.innerHTML = `<p class="aviso-error">Error al cargar el contenido.</p>`;
  }
}
