const express = require('express');
const conexion = require('../db');

const router = express.Router();

// <<<<<<<< INICIO DE SESIÓN: POST /api/login
router.post('/', (req, res) => {
  const { nombre_usuario, contrasena } = req.body || {};

  if (
    typeof nombre_usuario !== 'string' ||
    !nombre_usuario.trim() ||
    typeof contrasena !== 'string' ||
    !contrasena
  ) {
    return res.status(400).json({ error: 'Nombre de usuario y contraseña son obligatorios' });
  }

  const sql = 'SELECT id, nombre_usuario, contrasena FROM usuario WHERE nombre_usuario = ? AND contrasena = ?';

  conexion.query(sql, [nombre_usuario.trim(), contrasena], (err, resultados) => {
    if (err) {
      console.error('Error en MySQL al iniciar sesión:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (resultados.length === 0) {
      return res.status(401).json({ error: 'Nombre de usuario o contraseña incorrectos' });
    }

    const usuario = { ...resultados[0] };
    delete usuario.contrasena;

    res.json({
      mensaje: 'Login exitoso',
      usuario,
    });
  });
});
// >>>>>>>> FIN DE INICIO DE SESIÓN: POST /api/login

module.exports = router;
