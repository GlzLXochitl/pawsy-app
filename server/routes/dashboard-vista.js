const express = require('express');
const conexion = require('../db');

const router = express.Router();

// <<<<<<<< VISTA DEL DASHBOARD: GET /api/posts
router.get('/', (_req, res) => {
  const sql = 'SELECT * FROM publicacion ORDER BY id DESC';

  conexion.query(sql, (err, resultados) => {
    if (err) {
      console.error('Error al consultar publicaciones en MySQL:', err);
      return res.status(500).json({ error: 'Error al consultar publicaciones' });
    }

    res.json(resultados);
  });
});
// >>>>>>>> FIN DE VISTA DEL DASHBOARD: GET /api/posts

module.exports = router;
