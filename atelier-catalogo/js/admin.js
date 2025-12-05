/**
 * Lógica del panel de administración para gestionar el contenido de Firestore.
 */

import { db, storage } from './firebase.js';
import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, updateDoc, getDoc, deleteField } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('formVestido').addEventListener('submit', (e) => handleFormSubmit(e, 'vestidos'));
    document.getElementById('formTrabajo').addEventListener('submit', (e) => handleFormSubmit(e, 'trabajos'));
    cargarDatos('vestidos');
    cargarDatos('trabajos');
    setupModalHandlers();
});

async function subirImagenes(form, tipo) {
    const inputs = form.querySelectorAll('input[type=file]');
    const rutas = {};
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (!input.id) continue;
        const file = input.files[0];
        const key = input.id.includes('edit') ? input.id.split('-').pop().replace(/\d/g, '') + (Array.from(inputs).indexOf(input) + 1) : `foto${i + 1}`;

        if (file) {
            const filePath = `images/${tipo}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, filePath);
            await uploadBytes(storageRef, file);
            rutas[key] = filePath;
        }
    }
    return rutas;
}

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
        } else {
            data.titulo = document.getElementById('titulo').value;
            data.descripcion = document.getElementById('trabajo-descripcion').value;
            data.fecha = document.getElementById('trabajo-fecha').value;
        }

        await addDoc(collection(db, tipo), data);
        alert(`${tipo.slice(0, -1).charAt(0).toUpperCase() + tipo.slice(1, -1)} agregado.`);
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

async function handleDeleteImage(button) {
    const { id, tipo, key, path } = button.dataset;
    if (!confirm(`¿Estás seguro de que quieres eliminar la imagen ${key}?`)) return;

    try {
        await deleteObject(ref(storage, path));
        const docRef = doc(db, tipo, id);
        await updateDoc(docRef, { [`fotos.${key}`]: deleteField() });
        button.parentElement.remove();
        alert(`Imagen ${key} eliminada.`);
        await cargarDatos(tipo);
    } catch (error) {
        console.error("Error al eliminar imagen:", error);
        alert("No se pudo eliminar la imagen. Revisa la consola.");
    }
}

function setupModalHandlers() {
    const modals = { vestido: document.getElementById('editModalVestido'), trabajo: document.getElementById('editModalTrabajo') };
    const closeModal = (modal) => { if (modal) modal.style.display = 'none'; };

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(overlay);
            if (e.target.matches('.btn-delete-img')) {
                handleDeleteImage(e.target);
            }
        });
    });
    
    document.getElementById('cancelEditVestido').addEventListener('click', () => closeModal(modals.vestido));
    document.getElementById('cancelEditTrabajo').addEventListener('click', () => closeModal(modals.trabajo));
    document.getElementById('formEditarVestido').addEventListener('submit', (e) => handleEditSubmit(e, 'vestidos'));
    document.getElementById('formEditarTrabajo').addEventListener('submit', (e) => handleEditSubmit(e, 'trabajos'));
}

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
        } else {
            document.getElementById('edit-titulo').value = data.titulo || '';
            document.getElementById('edit-descripcion-trabajo').value = data.descripcion || '';
            document.getElementById('edit-fecha-trabajo').value = data.fecha || '';
        }
        
        const imageContainer = form.querySelector(tipo === 'vestidos' ? '#current-images-vestido' : '#current-images-trabajo');
        imageContainer.innerHTML = '';
        if (data.fotos) {
            await Promise.all(Object.keys(data.fotos).sort().map(async key => {
                try {
                    const path = data.fotos[key];
                    const url = await getDownloadURL(ref(storage, path));
                    const previewDiv = document.createElement('div');
                    previewDiv.className = 'admin-image-preview';
                    previewDiv.innerHTML = `
                        <img src="${url}" alt="${key}">
                        <button type="button" class="btn-delete-img" 
                                data-id="${id}" 
                                data-tipo="${tipo}" 
                                data-key="${key}" 
                                data-path="${path}">×</button>
                    `;
                    imageContainer.appendChild(previewDiv);
                } catch (e) { console.warn(`No se pudo cargar la imagen ${key}: ${e.message}`); }
            }));
        }
        modal.style.display = 'flex';
    } catch (error) {
        console.error(`Error en openEditModal:`, error);
        alert("Error al cargar datos para edición.");
    }
}

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
            updatedData.nombre = document.getElementById('edit-nombre').value;
            updatedData.descripcion = document.getElementById('edit-descripcion').value;
            updatedData.precio = document.getElementById('edit-precio').value;
        } else {
            updatedData.titulo = document.getElementById('edit-titulo').value;
            updatedData.descripcion = document.getElementById('edit-descripcion-trabajo').value;
            updatedData.fecha = document.getElementById('edit-fecha-trabajo').value;
        }

        updatedData.fotos = { ...oldData.fotos, ...nuevasFotosRutas };
        await updateDoc(doc(db, tipo, id), updatedData);
        
        const oldPathsToDelete = Object.keys(nuevasFotosRutas).map(key => oldData.fotos?.[key]).filter(Boolean);
        await Promise.all(oldPathsToDelete.map(path => deleteObject(ref(storage, path))));

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
            const cardDiv = document.createElement('div');
            cardDiv.className = 'product-card-detailed admin-card-view'; // Reutiliza estilo público con un modificador

            // --- Columna de Información ---
            const infoColumn = document.createElement('div');
            infoColumn.className = 'info-column';

            const contentWrap = document.createElement('div'); // Contenedor para el contenido principal

            const titleElement = document.createElement('h2');
            titleElement.className = 'product-title';
            titleElement.textContent = item.nombre || item.titulo;
            contentWrap.appendChild(titleElement);

            const detailsList = document.createElement('ul');
            detailsList.className = 'details-list';

            if (tipo === 'vestidos') {
                detailsList.innerHTML = `
                    <li><strong>Precio:</strong> $${item.precio ? Number(item.precio).toLocaleString('es-AR') : 'N/A'}</li>
                    <li>${item.descripcion || "Sin descripción."}</li>
                `;
            } else {
                const fecha = item.fecha ? new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
                detailsList.innerHTML = `
                    <li><strong>Fecha:</strong> ${fecha}</li>
                    <li>${item.descripcion || "Sin descripción."}</li>
                `;
            }
            contentWrap.appendChild(detailsList);
            infoColumn.appendChild(contentWrap);

            // --- Acciones de Admin ---
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
            infoColumn.appendChild(actionsDiv); // Se añaden al final de la columna de info

            // --- Columna de Imágenes ---
            const imageColumn = document.createElement('div');
            imageColumn.className = 'image-column';

            if (item.fotos && Object.keys(item.fotos).length > 0) {
                try {
                    const urls = await Promise.all(Object.values(item.fotos).map(path => getDownloadURL(ref(storage, path))));
                    urls.forEach(url => {
                        const img = document.createElement('img');
                        img.src = url;
                        img.className = 'product-image';
                        imageColumn.appendChild(img);
                    });
                } catch (e) { imageColumn.innerHTML = '<p>Error al cargar imágenes.</p>'; }
            } else {
                imageColumn.innerHTML = '<p class="aviso-vacio" style="text-align:center; width:100%;">No hay imágenes</p>';
            }
            
            cardDiv.appendChild(infoColumn);
            cardDiv.appendChild(imageColumn);
            listaElement.appendChild(cardDiv);
        }
    } catch (error) {
        console.error(`Error en cargarDatos:`, error);
        listaElement.innerHTML = `<p class="aviso-error">Error al cargar datos. Ver la consola.</p>`;
    }
}
