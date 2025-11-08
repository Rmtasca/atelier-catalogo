console.log('Iniciando el servidor...');

try {
    const express = require('express');
    const admin = require('firebase-admin');
    const fs = require('fs');
    const path = require('path');

    const app = express();
    const port = 3001;

    // --- Configuración de Firebase ---
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    const db = admin.firestore();

    app.use(express.static(__dirname));
    app.use(express.json({ limit: '50mb' }));

    // ===================================
    // --- API PARA VESTIDOS BASE ---
    // ===================================

    app.post('/api/vestidos', async (req, res) => {
        try {
            const { nombre, descripcion, precio, talles, fotos } = req.body;
            if (!nombre || !descripcion || !precio || !talles || !fotos || !fotos.foto1) {
                return res.status(400).json({ message: 'Faltan campos obligatorios para el vestido.' });
            }
            const docRef = await db.collection('vestidos').add({ nombre, descripcion, precio, talles, fotos });
            res.status(201).json({ id: docRef.id });
        } catch (error) {
            console.error('ERROR al agregar vestido:', error);
            res.status(500).json({ message: 'Error en el servidor: ' + error.message });
        }
    });

    app.get('/api/vestidos', async (req, res) => {
        try {
            const snapshot = await db.collection('vestidos').get();
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: 'Error en el servidor: ' + error.message });
        }
    });

    app.delete('/api/vestidos/:id', async (req, res) => {
        try {
            await db.collection('vestidos').doc(req.params.id).delete();
            res.status(200).json({ message: 'Vestido eliminado' });
        } catch (error) {
            res.status(500).json({ message: 'Error en el servidor: ' + error.message });
        }
    });

    // ==========================================
    // --- API PARA TRABAJOS REALIZADOS ---
    // ==========================================

    app.post('/api/trabajos', async (req, res) => {
        try {
            const { titulo, detalle, fecha, fotos } = req.body;
            if (!titulo || !detalle || !fecha || !fotos || !fotos.foto1) {
                return res.status(400).json({ message: 'Faltan campos obligatorios para el trabajo.' });
            }
            const docRef = await db.collection('trabajos').add({ titulo, detalle, fecha, fotos });
            res.status(201).json({ id: docRef.id });
        } catch (error) {
            console.error('ERROR al agregar trabajo:', error);
            res.status(500).json({ message: 'Error en el servidor: ' + error.message });
        }
    });

    app.get('/api/trabajos', async (req, res) => {
        try {
            const snapshot = await db.collection('trabajos').get();
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: 'Error en el servidor: ' + error.message });
        }
    });

    app.delete('/api/trabajos/:id', async (req, res) => {
        try {
            await db.collection('trabajos').doc(req.params.id).delete();
            res.status(200).json({ message: 'Trabajo eliminado' });
        } catch (error) {
            res.status(500).json({ message: 'Error en el servidor: ' + error.message });
        }
    });

    app.listen(port, () => {
      console.log(`\nServidor escuchando en http://localhost:${port}`);
    });

} catch (error) {
    console.error('\n--- ERROR INESPERADO ---', error);
    process.exit(1);
}