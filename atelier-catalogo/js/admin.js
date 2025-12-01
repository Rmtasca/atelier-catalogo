/*
 * ======================================================================
 * ARCHIVO: js/admin.js
 * FUNCIÓN: Controla toda la lógica del panel de administración.
 * ======================================================================
 

// 1. Importo todo lo que necesito de Firebase.
//    - db y storage son mis conexiones a la base de datos y al almacenamiento.
//    - collection, addDoc, getDocs, query, orderBy son funciones para manejar datos.
//    - ref, uploadBytes, getDownloadURL son funciones para manejar archivos.
import { db, storage } from './firebase.js';
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";


// 2. Espero a que toda la página (el HTML) se haya cargado.
document.addEventListener('DOMContentLoaded', () => {
  // 2.1. Identifico el formulario de vestidos y le digo que, cuando lo envíes, ejecute mi función `handleFormSubmit`.
  const formVestido = document.getElementById('formVestido');
  formVestido.addEventListener('submit', (e) => handleFormSubmit(e, 'vestidos'));

  // 2.2. Hago lo mismo para el formulario de trabajos.
  const formTrabajo = document.getElementById('formTrabajo');
  formTrabajo.addEventListener('submit', (e) => handleFormSubmit(e, 'trabajos'));

  // 2.3. Apenas carga la página, le pido que traiga y muestre los datos que ya existen.
  cargarDatos('vestidos');
  cargarDatos('trabajos');
});


// 3. FUNCIÓN PARA SUBIR IMÁGENES
//    Esta función es reutilizable: la uso para ambos formularios.
async function subirImagenes(form, tipo) {
    // 3.1. Busco todos los campos para subir archivos dentro del formulario que me pasaste.
    const inputs = form.querySelectorAll('input[type=file]');
    const rutas = {}; // Aquí guardaré las rutas de las imágenes que suba.

    // 3.2. Reviso cada campo de archivo uno por uno.
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const file = input.files[0]; // Tomo el primer (y único) archivo del campo.
        const key = `foto${i + 1}`; // Le doy un nombre clave, como "foto1", "foto2", etc.

        // 3.3. Si de verdad seleccionaste un archivo...
        if (file) {
            // 3.3.1. Creo una ruta única para el archivo en Firebase Storage para evitar que se sobreescriban.
            const filePath = `images/${tipo}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, filePath);
            // 3.3.2. ¡Subo el archivo! `uploadBytes` hace el trabajo pesado.
            await uploadBytes(storageRef, file);
            // 3.3.3. Guardo la ruta del archivo recién subido en mi objeto de rutas.
            rutas[key] = filePath;
        }
    }
    // 3.4. Al final, devuelvo el objeto con todas las rutas de las imágenes que subí.
    return rutas;
}


// 4. FUNCIÓN PRINCIPAL QUE MANEJA EL ENVÍO DE CUALQUIER FORMULARIO
async function handleFormSubmit(event, tipo) {
    event.preventDefault(); // Evito que la página se recargue.
    const form = event.target;
    const botonSubmit = form.querySelector('button[type="submit"]');
    botonSubmit.disabled = true; // Desactivo el botón para que no hagas clic dos veces.
    botonSubmit.textContent = 'Guardando...';

    try {
        // 4.1. Primero, mando a subir las imágenes usando la función que definí antes.
        const fotosRutas = await subirImagenes(form, tipo);

        // 4.2. Me aseguro de que la foto principal (obligatoria) se haya subido.
        if (Object.keys(fotosRutas).length === 0 && form.querySelector('input[type=file][required]')) {
            throw new Error('Debes subir al menos la imagen principal.');
        }

        // 4.3. Preparo un objeto `data` para guardar en la base de datos Firestore.
        const data = {
            fotos: fotosRutas,       // Guardo el objeto con las rutas de las fotos.
            createdAt: new Date()    // Guardo la fecha y hora actual para poder ordenar después.
        };
        
        // 4.4. Recorro todos los demás campos del formulario (nombre, precio, etc.).
        const formData = new FormData(form);
        formData.forEach((value, key) => {
            if (key !== 'fotos') { // Ignoro los campos de fotos que ya procesé.
                data[key] = value; // Y agrego el resto (nombre, precio, etc.) a mi objeto `data`.
            }
        });
        
        // 4.5. Guardo el objeto `data` completo en la colección correcta de Firestore ('vestidos' o 'trabajos').
        await addDoc(collection(db, tipo), data);

        // 4.6. Si todo salió bien, te aviso, limpio el formulario y recargo la lista.
        alert(`¡${tipo.slice(0, -1)} agregado con éxito!`);
        form.reset();
        await cargarDatos(tipo);

    } catch (error) {
        // 4.7. Si algo falla, te muestro el error.
        console.error(`Error al agregar el ${tipo.slice(0, -1)}:`, error);
        alert(`Error: ${error.message}`);
    } finally {
        // 4.8. Al final, haya funcionado o no, vuelvo a activar el botón y le pongo su texto original.
        botonSubmit.disabled = false;
        if (tipo === 'vestidos') {
            botonSubmit.textContent = 'Agregar Vestido';
        } else {
            botonSubmit.textContent = 'Registrar Trabajo';
        }
    }
}


// 5. FUNCIÓN PARA CARGAR Y MOSTRAR LOS DATOS DE LA BASE DE DATOS
async function cargarDatos(tipo) {
    const listaId = (tipo === 'vestidos') ? 'listaVestidos' : 'listaTrabajos';
    const listaElement = document.getElementById(listaId);
    
    try {
        // 5.1. Preparo una consulta a la base de datos para pedirle los datos, ordenados por fecha de creación (los más nuevos primero).
        const collRef = collection(db, tipo);
        const q = query(collRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q); // Ejecuto la consulta.
        
        listaElement.innerHTML = ''; // Limpio la lista en la página antes de poner los datos nuevos.

        // 5.2. Si la consulta no devuelve nada, muestro un mensaje.
        if (querySnapshot.empty) {
            listaElement.innerHTML = `<p class="aviso-vacio">No hay ${tipo} para mostrar.</p>`;
            return;
        }

        // 5.3. Recorro cada documento que me devolvió la base de datos.
        for (const doc of querySnapshot.docs) {
            const item = { id: doc.id, ...doc.data() };
            let imgSrc = 'img/placeholder.png'; // Una imagen por defecto por si algo falla.

            // 5.4. Busco la URL de la foto principal en Storage.
            if (item.fotos && item.fotos.foto1) {
                try {
                    // Le pido a Firebase Storage la URL pública de la imagen que subí antes.
                    imgSrc = await getDownloadURL(ref(storage, item.fotos.foto1));
                } catch (e) {
                    console.error("No pude obtener la URL de la imagen:", item.fotos.foto1, e);
                }
            }

            // 5.5. Creo la "tarjeta" (el elemento HTML) para mostrar el item.
            const cardDiv = document.createElement('div');
            cardDiv.className = 'item-card';

            const imageDiv = document.createElement('div');
            imageDiv.className = 'item-image';
            imageDiv.style.backgroundImage = `url('${imgSrc}')`;
            cardDiv.appendChild(imageDiv);

            const infoDiv = document.createElement('div');
            infoDiv.className = 'item-info';

            const title = item.nombre || item.titulo;
            const titleElement = document.createElement('h3');
            titleElement.className = 'item-title';
            titleElement.textContent = title;
            infoDiv.appendChild(titleElement);

            // 5.6. Si es un vestido, agrego los detalles de precio y talles.
            if (tipo === 'vestidos') {
                const descElement = document.createElement('p');
                descElement.className = 'item-description';
                descElement.textContent = item.descripcion || '';
                infoDiv.appendChild(descElement);

                const detailsDiv = document.createElement('div');
                detailsDiv.className = 'item-details';
                detailsDiv.innerHTML = `
                    <span class="item-price">Precio: $${item.precio || 'N/A'}</span>
                    <span class="item-sizes">Talles: ${item.talles || 'N/A'}</span>
                `;
                infoDiv.appendChild(detailsDiv);
            }
            cardDiv.appendChild(infoDiv);

            // 5.7. Añado la tarjeta recién creada a la sección de la lista en la página.
            listaElement.appendChild(cardDiv);
        }

    } catch (error) {
        // 5.8. Si hay un error grave al cargar los datos, lo muestro en la página y en la consola.
        console.error(`Error crítico al cargar ${tipo}:`, error);
        listaElement.innerHTML = `<p class="aviso-error">Error fatal al cargar los datos. Revisa la consola.</p>`;
    }
}
