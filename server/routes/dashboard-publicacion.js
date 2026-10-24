const express = require('express');
const conexion = require('../db');

const router = express.Router();

// <<<<<<<< PUBLICAR EN EL DASHBOARD: POST /api/posts
router.post('/', (req, res) => {
  const { usuario_id, mascota_id, titulo, descripcion, imagen, estado } = req.body || {};

  if (!Number.isInteger(usuario_id) || usuario_id <= 0) {
    return res.status(400).json({ error: 'usuario_id debe ser un entero positivo' });
  }
  if (!Number.isInteger(mascota_id) || mascota_id <= 0) {
    return res.status(400).json({ error: 'mascota_id debe ser un entero positivo' });
  }

  const camposTexto = {
    titulo: { valor: titulo, limite: 100 },
    descripcion: { valor: descripcion, limite: 255 },
    estado: { valor: estado, limite: 50 },
  };

  for (const [campo, { valor, limite }] of Object.entries(camposTexto)) {
    if (typeof valor !== 'string' || !valor.trim()) {
      return res.status(400).json({ error: `El campo ${campo} es obligatorio` });
    }
    if (Array.from(valor.trim()).length > limite) {
      return res.status(400).json({ error: `El campo ${campo} no puede superar ${limite} caracteres` });
    }
  }

  if (imagen != null && (typeof imagen !== 'string' || Array.from(imagen.trim()).length > 255)) {
    return res.status(400).json({ error: 'imagen debe ser texto de hasta 255 caracteres' });
  }

  const sql = `
    INSERT INTO publicacion (usuario_id, mascota_id, titulo, descripcion, imagen, estado)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const valores = [
    usuario_id,
    mascota_id,
    titulo.trim(),
    descripcion.trim(),
    imagen?.trim() || null,
    estado.trim(),
  ];

  conexion.query(sql, valores, (err, resultado) => {
    if (err) {
      console.error('Error al guardar publicación en MySQL:', err);
      if (err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' || err.code === 'WARN_DATA_TRUNCATED') {
        return res.status(400).json({ error: 'El estado no es válido para la tabla de publicaciones' });
      }
      return res.status(500).json({ error: 'Error al guardar publicación' });
    }

    res.status(201).json({
      mensaje: 'Publicación guardada exitosamente',
      id: resultado.insertId,
    });
  });
});
// >>>>>>>> FIN DE PUBLICAR EN EL DASHBOARD: POST /api/posts

module.exports = router;
