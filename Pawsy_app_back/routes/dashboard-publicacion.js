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
  const { usuario_id, mascota_id, titulo, descripcion, imagen, estado, ubicacion } = req.body || {};
  const usuarioIdFinal = Number(usuario_id);
  const mascotaIdFinal = mascota_id ? Number(mascota_id) : null;
  const tituloFinal = limpiarTextoOpcional(titulo) || 'Publicación';
  const descripcionFinal = typeof descripcion === 'string' ? descripcion.trim() : '';
  const imagenFinal = limpiarTextoOpcional(imagen);
  const estadoFinal = limpiarTextoOpcional(estado) || 'En búsqueda';
  const latitud = Number(ubicacion?.latitud);
  const longitud = Number(ubicacion?.longitud);
  const ciudad = limpiarTextoOpcional(ubicacion?.ciudad);
  const colonia = limpiarTextoOpcional(ubicacion?.colonia);
  const calle = limpiarTextoOpcional(ubicacion?.calle);
  const referencias = limpiarTextoOpcional(ubicacion?.referencias) || 'Ubicación seleccionada en Pawsy';

  if (!usuarioIdFinal) {
    return res.status(400).json({ error: 'El usuario de la publicación no es válido' });
  }

  if (!['registrada', 'actual', 'personalizada'].includes(ubicacion?.tipo)) {
    return res.status(400).json({ error: 'Selecciona una ubicación para la publicación' });
  }
  if (
    !ubicacion ||
    ubicacion.latitud === null ||
    ubicacion.latitud === undefined ||
    ubicacion.longitud === null ||
    ubicacion.longitud === undefined ||
    !Number.isFinite(latitud) ||
    latitud < -90 ||
    latitud > 90 ||
    !Number.isFinite(longitud) ||
    longitud < -180 ||
    longitud > 180
  ) {
    return res.status(400).json({ error: 'La ubicación seleccionada no tiene coordenadas válidas' });
  }
  if (!ciudad || ciudad.length > 100 || !colonia || colonia.length > 100 || (calle && calle.length > 100)) {
    return res.status(400).json({ error: 'La dirección seleccionada no es válida' });
  }
  if (referencias.length > 255) {
    return res.status(400).json({ error: 'Las referencias de ubicación son demasiado largas' });
  }

  if (!['En Adopción', 'Adoptado', 'En búsqueda', 'Encontrado', 'Cancelado'].includes(estadoFinal)) {
    return res.status(400).json({ error: 'El estado de la publicación no es válido' });
  }

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

    const publicacionId = resultados.insertId;
    const guardarUbicacion = `
      INSERT INTO historial_ubicacion
        (publicacion_id, ciudad, colonia, calle, referencias, latitud, longitud)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    conexion.query(
      guardarUbicacion,
      [publicacionId, ciudad, colonia, calle, referencias, latitud, longitud],
      (errorUbicacion) => {
        if (errorUbicacion) {
          console.error('Error al guardar la ubicación de la publicación:', errorUbicacion);
          return conexion.query('DELETE FROM publicacion WHERE id = ?', [publicacionId], () => {
            return res.status(500).json({ error: 'No se pudo guardar la ubicación de la publicación' });
          });
        }

        return res.status(201).json({
          mensaje: '¡Publicación creada con éxito!',
          id: publicacionId,
          imagen: imagenFinal
        });
      }
    );
  });
});

// Ruta para obtener todas las publicaciones con el nombre de usuario (JOIN)
router.get('/publicaciones', (req, res) => {
  const consulta = `
    SELECT p.*, u.nombre_usuario, u.nombre, u.apellidos,
      COALESCE(h.ciudad, u.ciudad) AS ciudad,
      COALESCE(h.colonia, u.colonia) AS colonia,
      COALESCE(h.calle, u.calle) AS calle,
      (SELECT COUNT(*) FROM publicacion_likes pl WHERE pl.publicacion_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id = p.id) AS comentarios_count
    FROM publicacion p
    JOIN usuario u ON p.usuario_id = u.id
    LEFT JOIN historial_ubicacion h ON h.id = (
      SELECT h2.id
      FROM historial_ubicacion h2
      WHERE h2.publicacion_id = p.id
      ORDER BY h2.fecha_creacion DESC, h2.id DESC
      LIMIT 1
    )
    ORDER BY p.fecha_creacion DESC, p.id DESC
  `;

  conexion.query(consulta, (error, resultados) => {
    if (error) {
      console.error('Error al obtener las publicaciones:', error);
      return res.status(500).json({ error: 'Error al obtener las publicaciones' });
    }

    return res.json(resultados);
  });
});

router.get('/publicaciones/cercanas', (req, res) => {
  const latitud = Number(req.query.latitud);
  const longitud = Number(req.query.longitud);
  const radioKm = Number(req.query.radioKm);

  if (
    !Number.isFinite(latitud) ||
    latitud < -90 ||
    latitud > 90 ||
    !Number.isFinite(longitud) ||
    longitud < -180 ||
    longitud > 180 ||
    !Number.isFinite(radioKm) ||
    radioKm <= 0 ||
    radioKm > 500
  ) {
    return res.status(400).json({ error: 'Las coordenadas o el radio de búsqueda no son válidos' });
  }

  const consulta = `
    SELECT p.*, u.nombre_usuario, u.nombre, u.apellidos,
      COALESCE(h.ciudad, u.ciudad) AS ciudad,
      COALESCE(h.colonia, u.colonia) AS colonia,
      COALESCE(h.calle, u.calle) AS calle,
      (6371 * ACOS(LEAST(1, GREATEST(-1,
        SIN(RADIANS(?)) * SIN(RADIANS(h.latitud)) +
        COS(RADIANS(?)) * COS(RADIANS(h.latitud)) *
        COS(RADIANS(h.longitud) - RADIANS(?))
      )))) AS distancia_km,
      (SELECT COUNT(*) FROM publicacion_likes pl WHERE pl.publicacion_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id = p.id) AS comentarios_count
    FROM publicacion p
    JOIN usuario u ON p.usuario_id = u.id
    JOIN historial_ubicacion h ON h.id = (
      SELECT h2.id
      FROM historial_ubicacion h2
      WHERE h2.publicacion_id = p.id
        AND h2.latitud IS NOT NULL
        AND h2.longitud IS NOT NULL
      ORDER BY h2.fecha_creacion DESC, h2.id DESC
      LIMIT 1
    )
    WHERE p.estado IN ('En búsqueda', 'Encontrado', 'En Adopción')
    HAVING distancia_km <= ?
    ORDER BY distancia_km ASC, p.fecha_creacion DESC, p.id DESC
  `;

  conexion.query(consulta, [latitud, latitud, longitud, radioKm], (error, resultados) => {
    if (error) {
      console.error('Error al buscar publicaciones cercanas:', error);
      return res.status(500).json({ error: 'No se pudieron buscar avisos cercanos' });
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

// Obtener comentarios de una publicación
router.get('/publicaciones/:id/comentarios', (req, res) => {
  const publicacionId = Number(req.params.id);
  if (!publicacionId) {
    return res.status(400).json({ error: 'El id de publicación no es válido' });
  }

  const consulta = `
    SELECT c.id, c.usuario_id, c.descripcion, c.fecha_creacion,
           u.nombre_usuario
    FROM comentarios c
    JOIN usuario u ON c.usuario_id = u.id
    WHERE c.publicacion_id = ?
    ORDER BY c.fecha_creacion ASC, c.id ASC
  `;

  conexion.query(consulta, [publicacionId], (error, filas) => {
    if (error) {
      console.error('Error al obtener comentarios:', error);
      return res.status(500).json({ error: 'Error al obtener comentarios' });
    }
    return res.json(filas);
  });
});

router.put('/publicaciones/:id', (req, res) => {
  const publicacionId = Number(req.params.id);
  const usuarioId = Number(req.body?.usuario_id);
  const { titulo, descripcion, imagen, estado } = req.body || {};

  if (!publicacionId || !usuarioId) {
    return res.status(400).json({ error: 'Datos de publicación inválidos' });
  }

  const consulta = `
    UPDATE publicacion
    SET titulo = COALESCE(?, titulo),
        descripcion = COALESCE(?, descripcion),
        imagen = COALESCE(?, imagen),
        estado = COALESCE(?, estado),
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = ? AND usuario_id = ?
  `;

  conexion.query(
    consulta,
    [
      limpiarTextoOpcional(titulo),
      limpiarTextoOpcional(descripcion),
      limpiarTextoOpcional(imagen),
      limpiarTextoOpcional(estado),
      publicacionId,
      usuarioId,
    ],
    (error, result) => {
      if (error) {
        console.error('Error al actualizar publicación:', error);
        return res.status(500).json({ error: 'Error al actualizar la publicación' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Publicación no encontrada' });
      }
      return res.json({ mensaje: 'Publicación actualizada' });
    }
  );
});

router.delete('/publicaciones/:id', (req, res) => {
  const publicacionId = Number(req.params.id);
  const usuarioId = Number(req.body?.usuario_id);

  if (!publicacionId || !usuarioId) {
    return res.status(400).json({ error: 'Datos de publicación inválidos' });
  }

  conexion.query(
    'DELETE FROM publicacion WHERE id = ? AND usuario_id = ?',
    [publicacionId, usuarioId],
    (error, result) => {
      if (error) {
        console.error('Error al eliminar publicación:', error);
        return res.status(500).json({ error: 'Error al eliminar la publicación' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Publicación no encontrada' });
      }
      return res.json({ mensaje: 'Publicación eliminada' });
    }
  );
});

// Obtener publicaciones de un usuario: GET /api/usuarios/:id/publicaciones
router.get('/usuarios/:id/publicaciones', (req, res) => {
  const usuarioId = Number(req.params.id);
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    return res.status(400).json({ error: 'El id de usuario no es válido' });
  }

  const sql = `
    SELECT p.id, p.usuario_id, p.mascota_id, p.titulo, p.descripcion, p.imagen,
           p.estado, p.fecha_creacion, p.fecha_actualizacion,
           COALESCE(h.ciudad, u.ciudad) AS ciudad,
           COALESCE(h.colonia, u.colonia) AS colonia,
           COALESCE(h.calle, u.calle) AS calle,
           (SELECT COUNT(*) FROM publicacion_likes pl WHERE pl.publicacion_id = p.id) AS likes_count,
           EXISTS (
             SELECT 1 FROM publicacion_likes pl
             WHERE pl.publicacion_id = p.id AND pl.usuario_id = ?
           ) AS liked_by_user,
           (SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id = p.id) AS comentarios_count
    FROM publicacion p
    JOIN usuario u ON p.usuario_id = u.id
    LEFT JOIN historial_ubicacion h ON h.id = (
      SELECT h2.id
      FROM historial_ubicacion h2
      WHERE h2.publicacion_id = p.id
      ORDER BY h2.fecha_creacion DESC, h2.id DESC
      LIMIT 1
    )
    WHERE p.usuario_id = ?
    ORDER BY p.fecha_creacion DESC, p.id DESC
  `;

  conexion.query(sql, [usuarioId, usuarioId], (err, rows) => {
    if (err) {
      console.error('Error en MySQL al obtener publicaciones del usuario:', err);
      return res.status(500).json({ error: 'Error en la base de datos al obtener publicaciones' });
    }

    res.json(rows);
  });
});

module.exports = router;