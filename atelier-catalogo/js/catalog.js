/*
 * ======================================================================
 * SCRIPT DEL CATÁLOGO PÚBLICO (v5.1 - Unificación de Estilos de Tarjeta)
 * ======================================================================
 *
 * Se reemplaza la lógica de renderizado de tarjetas por la misma que usa
 * `admin.js` para asegurar que el diseño sea idéntico en ambas páginas.
 * Se usan las clases CSS `.item-card` en lugar de `.card-publica`.
 */

// --- IMPORTACIÓN DE MÓDULOS DE FIREBASE ---
import { db, storage } from './firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// --- EVENT LISTENER INICIAL ---
document.addEventListener('DOMContentLoaded', () => {
  cargarContenido('vestidos', 'catalogo');
  cargarContenido('trabajos', 'trabajosRealizados');
});

// --- FUNCIÓN GENERAL PARA CARGAR Y RENDERIZAR CONTENIDO (ESTILO UNIFICADO) ---
async function cargarContenido(tipo, contenedorId) {
  const contenedorElement = document.getElementById(contenedorId);
  if (!contenedorElement) {
    console.error(`Error crítico: No se encontró el elemento contenedor #${contenedorId}`);
    return;
  }

  try {
    const collRef = collection(db, tipo);
    const q = query(collRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.log(`No hay ${tipo} para mostrar.`);
        if (tipo === 'trabajos') {
            contenedorElement.innerHTML = `<p class="aviso-vacio">Aún no hay trabajos realizados para mostrar.</p>`;
        } else if (tipo === 'vestidos') {
            const titulo = document.getElementById('tituloCatalogo');
            if(titulo) titulo.style.display = 'none';
        }
        return;
    }

    contenedorElement.innerHTML = '';

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
        const item = { id: doc.id, ...doc.data() }; // Usamos el ID también por consistencia
        let imgSrc = 'img/placeholder.png';

        if (item.fotos && item.fotos.foto1) {
            try {
                const rutaRef = ref(storage, item.fotos.foto1);
                imgSrc = await getDownloadURL(rutaRef);
            } catch (error) {
                console.error(`No se pudo obtener la URL de la imagen para la ruta: ${item.fotos.foto1}`, error);
            }
        }

        // --- INICIO DE CÓDIGO DE TARJETA UNIFICADO (copiado de admin.js v6.1) ---
        const cardDiv = document.createElement('div');
        cardDiv.className = 'item-card'; // Clase unificada

        const imageDiv = document.createElement('div');
        imageDiv.className = 'item-image'; // Clase unificada
        imageDiv.style.backgroundImage = `url('${imgSrc}')`;
        cardDiv.appendChild(imageDiv);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'item-info'; // Clase unificada

        const title = item.nombre || item.titulo;
        const titleElement = document.createElement('h3');
        titleElement.className = 'item-title'; // Clase unificada
        titleElement.textContent = title;
        infoDiv.appendChild(titleElement);

        if (tipo === 'vestidos') {
            const descElement = document.createElement('p');
            descElement.className = 'item-description'; // Clase unificada
            descElement.textContent = item.descripcion || '';
            infoDiv.appendChild(descElement);

            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'item-details'; // Clase unificada
            detailsDiv.innerHTML = `
                <span class="item-price">Precio: $${item.precio || 'N/A'}</span>
                <span class="item-sizes">Talles: ${item.talles || 'N/A'}</span>
            `;
            infoDiv.appendChild(detailsDiv);
        }
        
        // Para los trabajos, solo se muestra el título, lo cual es consistente
        // con el comportamiento de admin.js (v6.1).

        cardDiv.appendChild(infoDiv);

        // No se agrega el div de 'admin-actions' aquí, que es la única diferencia.

        contenedorElement.appendChild(cardDiv);
        // --- FIN DE CÓDIGO DE TARJETA UNIFICADO ---
    }

  } catch (error) {
    console.error(`Error crítico al cargar ${tipo}:`, error);
    contenedorElement.innerHTML = `<p class="aviso-error">Hubo un problema al cargar el contenido. Intente más tarde.</p>`;
  }
}
