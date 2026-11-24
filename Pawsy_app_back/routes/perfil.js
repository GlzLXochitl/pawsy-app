const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const router = express.Router();
const profileImagesDirectory = path.join(__dirname, '..', 'resources', 'profile-images');

fs.mkdirSync(profileImagesDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: profileImagesDirectory,
  filename: (req, file, callback) => {
    const extension = file.mimetype === 'image/jpeg' ? '.jpg' : '.png';
    callback(null, `usuario_${req.params.id}_${Date.now()}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      const error = new Error('Solo se permiten imágenes JPEG o PNG');
      error.code = 'UNSUPPORTED_IMAGE_TYPE';
      callback(error);
      return;
    }

    callback(null, true);
  }
});

router.post('/:id/imagen', (req, res, next) => {
  const usuarioId = Number(req.params.id);
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    return res.status(400).json({ error: 'El id de usuario debe ser un entero positivo' });
  }

  upload.single('imagen')(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError) {
        const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        return res.status(status).json({ error: 'No se pudo subir la imagen', detalle: error.message });
      }

      if (error.code === 'UNSUPPORTED_IMAGE_TYPE') {
        return res.status(400).json({ error: error.message });
      }

      return next(error);
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Debes adjuntar una imagen en el campo "imagen"' });
    }

    return res.status(201).json({
      imagen: `/profile-images/${encodeURIComponent(req.file.filename)}`
    });
  });
});

module.exports = router;
