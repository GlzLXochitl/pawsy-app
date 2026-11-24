const express = require('express');
const conexion = require('../db');

const router = express.Router();

// <<<<<<<< OBTENER TODAS LAS PUBLICACIONES: GET /api/posts
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      p.id, 
      p.titulo, 
      p.descripcion, 
      p.imagen, 
      p.estado, 
      p.fecha_creacion,
      u.id AS usuario_id,
      u.nombre_usuario,
      u.foto_perfil,
      m.id AS mascota_id,
      m.nombre AS mascota_nombre,
      m.especie AS mascota_especie,
      m.raza AS mascota_raza,
      m.sexo AS mascota_sexo,
      m.tamanio AS mascota_tamanio
    FROM publicacion p
    INNER JOIN usuario u ON p.usuario_id = u.id
    INNER JOIN mascota m ON p.mascota_id = m.id
    ORDER BY p.fecha_creacion DESC
  `;

  conexion.query(sql, (err, resultados) => {
    if (err) {
      console.error('Error al obtener publicaciones de MySQL:', err);
      return res.status(500).json({ error: 'Error al obtener las publicaciones' });
    }

    res.status(200).json({
      total: resultados.length,
      publicaciones: resultados
    });
  });
});
// >>>>>>>> FIN DE OBTENER TODAS LAS PUBLICACIONES

module.exports = router;