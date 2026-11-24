const express = require('express');
const router = express.Router();
const conexion = require('../db');

// Helper para limpiar cadenas opcionales o URLs de imagen
const limpiarTextoOpcional = (valor) => {
  if (typeof valor !== 'string') return null;
  const limpio = valor.trim();
  return limpio.length > 0 ? limpio : null;
};

// Ruta para crear una nueva publicación
router.post('/publicaciones', (req, res) => {
  const { usuario_id, mascota_id, titulo, descripcion, imagen, estado } = req.body || {};

  const usuarioIdFinal = Number(usuario_id) || 1;
  const mascotaIdFinal = mascota_id ? Number(mascota_id) : null;
  const tituloFinal = limpiarTextoOpcional(titulo) || 'Publicación';
  const descripcionFinal = typeof descripcion === 'string' ? descripcion.trim() : '';
  const imagenFinal = limpiarTextoOpcional(imagen);
  const estadoFinal = limpiarTextoOpcional(estado) || 'En búsqueda';

  const consulta = `
    INSERT INTO publicacion (usuario_id, mascota_id, titulo, descripcion, imagen, estado)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    usuarioIdFinal,
    mascotaIdFinal,
    tituloFinal,
    descripcionFinal,
    imagenFinal,
    estadoFinal
  ];

  conexion.query(consulta, values, (error, resultados) => {
    if (error) {
      console.error('Error al crear la publicación:', error);
      return res.status(500).json({
        error: error.sqlMessage || 'Error al crear la publicación en el servidor'
      });
    }

    return res.status(201).json({
      mensaje: '¡Publicación creada con éxito!',
      id: resultados.insertId,
      imagen: imagenFinal
    });
  });
});

// Ruta para obtener todas las publicaciones con el nombre de usuario (JOIN)
router.get('/publicaciones', (req, res) => {
  const consulta = `
    SELECT p.*, u.nombre_usuario
    FROM publicacion p
    JOIN usuario u ON p.usuario_id = u.id
    ORDER BY p.id DESC
  `;

  conexion.query(consulta, (error, resultados) => {
    if (error) {
      console.error('Error al obtener las publicaciones:', error);
      return res.status(500).json({ error: 'Error al obtener las publicaciones' });
    }

    return res.json(resultados);
  });
});

// ==========================================
// Ruta para Dar / Quitar Like (Toggle)
// ==========================================
router.post('/publicaciones/:id/like', (req, res) => {
  const publicacion_id = Number(req.params.id);
  const usuario_id = Number(req.body?.usuario_id);

  if (!publicacion_id || !usuario_id) {
    return res.status(400).json({ error: 'Faltan publicacion_id o usuario_id válidos' });
  }

  const queryCheck = 'SELECT id FROM publicacion_likes WHERE publicacion_id = ? AND usuario_id = ?';

  conexion.query(queryCheck, [publicacion_id, usuario_id], (error, existing) => {
    if (error) {
      console.error('Error al verificar el like:', error);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (existing.length > 0) {
      const queryDelete = 'DELETE FROM publicacion_likes WHERE publicacion_id = ? AND usuario_id = ?';
      conexion.query(queryDelete, [publicacion_id, usuario_id], (err) => {
        if (err) {
          console.error('Error al quitar like:', err);
          return res.status(500).json({ error: 'Error al quitar like' });
        }
        return res.json({ liked: false, message: 'Like eliminado' });
      });
    } else {
      const queryInsert = 'INSERT INTO publicacion_likes (publicacion_id, usuario_id) VALUES (?, ?)';
      conexion.query(queryInsert, [publicacion_id, usuario_id], (err) => {
        if (err) {
          console.error('Error al registrar like:', err);
          return res.status(500).json({ error: 'Error al registrar like' });
        }
        return res.json({ liked: true, message: 'Like registrado' });
      });
    }
  });
});

// ==========================================
// Ruta para Crear Comentario
// ==========================================
router.post('/publicaciones/:id/comentarios', (req, res) => {
  const publicacion_id = Number(req.params.id);
  const { usuario_id, descripcion, imagen } = req.body || {};
  const usuarioIdFinal = Number(usuario_id);

  if (!publicacion_id || !usuarioIdFinal) {
    return res.status(400).json({ error: 'Faltan publicacion_id o usuario_id válidos' });
  }

  if (!descripcion || descripcion.trim() === '') {
    return res.status(400).json({ error: 'El comentario no puede estar vacío' });
  }

  const descripcionFinal = descripcion.trim();
  const imagenFinal = limpiarTextoOpcional(imagen);

  const query = 'INSERT INTO comentarios (usuario_id, publicacion_id, descripcion, imagen) VALUES (?, ?, ?, ?)';

  conexion.query(query, [usuarioIdFinal, publicacion_id, descripcionFinal, imagenFinal], (error, result) => {
    if (error) {
      console.error('Error al guardar el comentario:', error);
      return res.status(500).json({ error: 'Error al guardar el comentario' });
    }

    return res.status(201).json({
      id: result.insertId,
      usuario_id: usuarioIdFinal,
      publicacion_id,
      descripcion: descripcionFinal,
      imagen: imagenFinal,
      mensaje: 'Comentario guardado con éxito'
    });
  });
});

// Obtener publicaciones de un usuario: GET /api/usuarios/:id/publicaciones
router.get('/usuarios/:id/publicaciones', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT id, usuario_id, mascota_id, titulo, descripcion, imagen, estado, fecha_creacion, fecha_actualizacion
    FROM publicacion
    WHERE usuario_id = ?
    ORDER BY fecha_creacion DESC, id DESC
  `;

  conexion.query(sql, [id], (err, rows) => {
    if (err) {
      console.error('Error en MySQL al obtener publicaciones del usuario:', err);
      return res.status(500).json({ error: 'Error en la base de datos al obtener publicaciones' });
    }

    res.json(rows);
  });
});

module.exports = router;