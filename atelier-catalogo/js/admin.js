/**
 * Lógica del panel de administración para gestionar el contenido de Firestore.
 */

// Módulos de Firebase para Firestore y Storage.
import { db, storage } from './firebase.js';
import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// Inicializa los listeners y carga los datos iniciales al cargar el DOM.
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('formVestido').addEventListener('submit', (e) => handleFormSubmit(e, 'vestidos'));
    document.getElementById('formTrabajo').addEventListener('submit', (e) => handleFormSubmit(e, 'trabajos'));
    cargarDatos('vestidos');
    cargarDatos('trabajos');
    setupModalHandlers();
});

/**
 * Sube los archivos de imagen a Firebase Storage.
 * @param {HTMLFormElement} form - Formulario que contiene los inputs de archivo.
 * @param {string} tipo - Colección de Firestore ('vestidos' o 'trabajos').
 * @returns {Promise<Object>} Objeto con las rutas de las imágenes subidas.
 */
async function subirImagenes(form, tipo) {
    const inputs = form.querySelectorAll('input[type=file]');
    const rutas = {};

    for (const input of inputs) {
        const file = input.files[0];
        // Extrae la clave de la foto del ID del input para consistencia.
        const keyMatch = input.id.match(/foto\d+|trabajo-foto\d+|edit-foto\d+|edit-trabajo-foto\d+/);
        if (!keyMatch) continue;
        
        // Normaliza la clave para la base de datos (ej: 'edit-foto1' -> 'foto1').
        const key = keyMatch[0].replace('edit-', '').replace('trabajo-', '');

        if (file && key) {
            const filePath = `images/${tipo}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, filePath);
            await uploadBytes(storageRef, file);
            rutas[key] = filePath;
        }
    }
    return rutas;
}

/**
 * Gestiona el envío de formularios para crear nuevos documentos en Firestore.
 * @param {Event} event - Evento de submit del formulario.
 * @param {string} tipo - Colección de Firestore a la que se agregará el documento.
 */
async function handleFormSubmit(event, tipo) {
    event.preventDefault();
    const form = event.target;
    const botonSubmit = form.querySelector('button[type="submit"]');
    botonSubmit.disabled = true;
    botonSubmit.textContent = 'Guardando...';

    try {
        const fotosRutas = await subirImagenes(form, tipo);
        if (Object.keys(fotosRutas).length === 0 && form.querySelector('input[type=file][required]')) {
            throw new Error('La imagen principal es obligatoria.');
        }

        const data = { createdAt: new Date(), fotos: fotosRutas };
        if (tipo === 'vestidos') {
            data.nombre = form.elements.nombre.value;
            data.descripcion = form.elements.descripcion.value;
            data.precio = form.elements.precio.value;
            data.talles = form.elements.talles.value;
        } else {
            data.titulo = form.elements.titulo.value;
        }

        await addDoc(collection(db, tipo), data);
        alert(`${tipo.slice(0, -1).charAt(0).toUpperCase() + tipo.slice(1, -1)} agregado.` );
        form.reset();
        await cargarDatos(tipo);
    } catch (error) {
        console.error(`Error en handleFormSubmit:`, error);
        alert(`Error: ${error.message}`);
    } finally {
        botonSubmit.disabled = false;
        botonSubmit.textContent = tipo === 'vestidos' ? 'Agregar Vestido' : 'Registrar Trabajo';
    }
}

/**
 * Elimina un documento de Firestore y sus imágenes asociadas de Storage.
 * @param {string} id - ID del documento a eliminar.
 * @param {string} tipo - Colección a la que pertenece el documento.
 * @param {Object} fotos - Objeto con las rutas de las imágenes a eliminar.
 */
async function handleDelete(id, tipo, fotos) {
    const itemType = tipo.slice(0, -1);
    if (!confirm(`¿Confirmas la eliminación de este ${itemType}?`)) return;

    try {
        if (fotos && typeof fotos === 'object') {
            const photoPromises = Object.values(fotos).map(filePath => {
                if (filePath) return deleteObject(ref(storage, filePath)).catch(err => console.warn(err.message));
                return Promise.resolve();
            });
            await Promise.all(photoPromises);
        }

        await deleteDoc(doc(db, tipo, id));
        alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} eliminado.`);
        await cargarDatos(tipo);
    } catch (error) {
        console.error(`Error en handleDelete:`, error);
        alert(`Error al eliminar. Ver la consola.`);
    }
}

// Asigna los manejadores de eventos para los modales de edición.
function setupModalHandlers() {
    const modals = {
        vestido: document.getElementById('editModalVestido'),
        trabajo: document.getElementById('editModalTrabajo')
    };
    const closeModal = (modal) => { if (modal) modal.style.display = 'none'; };

    document.querySelectorAll('.modal-overlay').forEach(overlay => overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay);
    }));
    document.getElementById('cancelEditVestido').addEventListener('click', () => closeModal(modals.vestido));
    document.getElementById('cancelEditTrabajo').addEventListener('click', () => closeModal(modals.trabajo));

    document.getElementById('formEditarVestido').addEventListener('submit', (e) => handleEditSubmit(e, 'vestidos'));
    document.getElementById('formEditarTrabajo').addEventListener('submit', (e) => handleEditSubmit(e, 'trabajos'));
}

/**
 * Abre el modal de edición y lo puebla con los datos del documento.
 * @param {string} id - ID del documento a editar.
 * @param {string} tipo - Colección a la que pertenece el documento.
 */
async function openEditModal(id, tipo) {
    const modal = document.getElementById(tipo === 'vestidos' ? 'editModalVestido' : 'editModalTrabajo');
    const form = modal.querySelector('form');
    form.reset();

    try {
        const itemSnap = await getDoc(doc(db, tipo, id));
        if (!itemSnap.exists()) throw new Error("El documento no existe.");
        const data = itemSnap.data();

        form.elements.id.value = id;
        if (tipo === 'vestidos') {
            form.elements['edit-nombre'].value = data.nombre || '';
            form.elements['edit-descripcion'].value = data.descripcion || '';
            form.elements['edit-precio'].value = data.precio || '';
            form.elements['edit-talles'].value = data.talles || '';
        } else {
            form.elements['edit-titulo'].value = data.titulo || '';
        }
        
        const imageContainer = form.querySelector(tipo === 'vestidos' ? '#current-images-vestido' : '#current-images-trabajo');
        imageContainer.innerHTML = '';
        if (data.fotos) {
            const imagePromises = Object.keys(data.fotos).map(async key => {
                try {
                    const url = await getDownloadURL(ref(storage, data.fotos[key]));
                    return `<img src="${url}" alt="${key}" style="width: 80px; height: auto; margin-right: 10px; border-radius: 4px;">`;
                } catch (e) {
                    console.warn(e.message);
                    return '';
                }
            });
            imageContainer.innerHTML = (await Promise.all(imagePromises)).join('');
        }
        
        modal.style.display = 'flex';
    } catch (error) {
        console.error(`Error en openEditModal:`, error);
        alert("Error al cargar datos para edición.");
    }
}

/**
 * Gestiona el envío del formulario de edición para actualizar un documento.
 * @param {Event} event - Evento de submit del formulario.
 * @param {string} tipo - Colección a la que pertenece el documento.
 */
async function handleEditSubmit(event, tipo) {
    event.preventDefault();
    const form = event.target;
    const botonSubmit = form.querySelector('button[type="submit"]');
    botonSubmit.disabled = true;
    botonSubmit.textContent = 'Guardando...';
    const id = form.elements.id.value;

    try {
        const oldDocSnap = await getDoc(doc(db, tipo, id));
        const oldData = oldDocSnap.data();

        const nuevasFotosRutas = await subirImagenes(form, tipo);
        
        const updatedData = {};
        if (tipo === 'vestidos') {
            updatedData.nombre = form.elements['edit-nombre'].value;
            updatedData.descripcion = form.elements['edit-descripcion'].value;
            updatedData.precio = form.elements['edit-precio'].value;
            updatedData.talles = form.elements['edit-talles'].value;
        } else {
            updatedData.titulo = form.elements['edit-titulo'].value;
        }

        updatedData.fotos = { ...oldData.fotos };
        const oldPathsToDelete = [];
        for (const key in nuevasFotosRutas) {
            if (oldData.fotos && oldData.fotos[key]) {
                oldPathsToDelete.push(oldData.fotos[key]);
            }
            updatedData.fotos[key] = nuevasFotosRutas[key];
        }

        await updateDoc(doc(db, tipo, id), updatedData);
        
        const deletePromises = oldPathsToDelete.map(path => deleteObject(ref(storage, path)));
        await Promise.all(deletePromises);

        alert(`${tipo.slice(0, -1).charAt(0).toUpperCase() + tipo.slice(1, -1)} actualizado.`);
        document.getElementById(tipo === 'vestidos' ? 'editModalVestido' : 'editModalTrabajo').style.display = 'none';
        await cargarDatos(tipo);
    } catch (error) {
        console.error(`Error en handleEditSubmit:`, error);
        alert(`Error al actualizar. Ver la consola.`);
    } finally {
        botonSubmit.disabled = false;
        botonSubmit.textContent = 'Guardar Cambios';
    }
}

/**
 * Carga documentos de una colección y los renderiza en el DOM de forma segura.
 * @param {string} tipo - Colección de Firestore para cargar.
 */
async function cargarDatos(tipo) {
    const listaElement = document.getElementById(tipo === 'vestidos' ? 'listaVestidos' : 'listaTrabajos');
    listaElement.innerHTML = '';
    
    try {
        const q = query(collection(db, tipo), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            listaElement.innerHTML = `<p class="aviso-vacio">No hay ${tipo} para mostrar.</p>`;
            return;
        }

        for (const docSnapshot of querySnapshot.docs) {
            const item = { id: docSnapshot.id, ...docSnapshot.data() };
            let imgSrc = 'img/placeholder.png';

            if (item.fotos && item.fotos.foto1) {
                try {
                    imgSrc = await getDownloadURL(ref(storage, item.fotos.foto1));
                } catch (e) {
                    console.error(e.message);
                }
            }

            // Construcción segura de elementos del DOM para prevenir XSS.
            const cardDiv = document.createElement('div');
            cardDiv.className = 'item-card';

            const imageDiv = document.createElement('div');
            imageDiv.className = 'item-image';
            imageDiv.style.backgroundImage = `url('${imgSrc}')`;

            const infoDiv = document.createElement('div');
            infoDiv.className = 'item-info';

            const titleElement = document.createElement('h3');
            titleElement.className = 'item-title';
            titleElement.textContent = item.nombre || item.titulo;
            infoDiv.appendChild(titleElement);

            if (tipo === 'vestidos') {
                const descElement = document.createElement('p');
                descElement.className = 'item-description';
                descElement.textContent = item.descripcion || '';
                infoDiv.appendChild(descElement);

                const detailsDiv = document.createElement('div');
                detailsDiv.className = 'item-details';
                
                const priceSpan = document.createElement('span');
                priceSpan.className = 'item-price';
                priceSpan.textContent = `Precio: $${item.precio || 'N/A'}`;

                const sizesSpan = document.createElement('span');
                sizesSpan.className = 'item-sizes';
                sizesSpan.textContent = `Talles: ${item.talles || 'N/A'}`;

                detailsDiv.appendChild(priceSpan);
                detailsDiv.appendChild(sizesSpan);
                infoDiv.appendChild(detailsDiv);
            }
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'admin-actions';

            const editButton = document.createElement('button');
            editButton.className = 'btn-edit';
            editButton.textContent = 'Editar';
            editButton.onclick = () => openEditModal(item.id, tipo);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn-delete';
            deleteButton.textContent = 'Eliminar';
            deleteButton.onclick = () => handleDelete(item.id, tipo, item.fotos);

            actionsDiv.appendChild(editButton);
            actionsDiv.appendChild(deleteButton);

            cardDiv.appendChild(imageDiv);
            cardDiv.appendChild(infoDiv);
            cardDiv.appendChild(actionsDiv);
            
            listaElement.appendChild(cardDiv);
        }

    } catch (error) {
        console.error(`Error en cargarDatos:`, error);
        listaElement.innerHTML = `<p class="aviso-error">Error al cargar datos. Ver la consola.</p>`;
    }
}
