const express = require('express');
const conexion = require('../db');

const router = express.Router();

// <<<<<<<< CONSULTAR PUBLICACIONES: GET /api/publicasiones
router.get('/', (_req, res) => {
  const sql = 'SELECT * FROM publicacion';

  conexion.query(sql, (err, resultados) => {
    if (err) {
      console.error('Error al consultar publicaciones en MySQL:', err);
      return res.status(500).json({ error: 'Error al consultar publicaciones' });
    }

    res.json(resultados);
  });
});
// >>>>>>>> FIN DE CONSULTAR PUBLICACIONES: GET /api/publicasiones

module.exports = router;
