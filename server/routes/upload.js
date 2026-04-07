const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const router = express.Router();

// Configurar multer para almacenar archivos en memoria
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload - Subir imagen a Cloudinary
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
        }

        // Convertir buffer a base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'jodaxi/products',
            resource_type: 'image',
        });

        res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (error) {
        console.error('Error subiendo imagen a Cloudinary:', error);
        res.status(500).json({ error: 'Error al subir la imagen' });
    }
});

// DELETE /api/upload/:public_id - Eliminar imagen de Cloudinary
router.delete('/:public_id', async (req, res) => {
    try {
        const { public_id } = req.params;
        await cloudinary.uploader.destroy(public_id);
        res.json({ success: true, message: 'Imagen eliminada' });
    } catch (error) {
        console.error('Error eliminando imagen:', error);
        res.status(500).json({ error: 'Error al eliminar la imagen' });
    }
});

module.exports = router;
