const express = require('express');
const conexion = require('../db');

const router = express.Router();

// <<<<<<<< REGISTRO DE USUARIO: POST /api/usuarios
router.post('/', (req, res) => {
  const campos = {
    nombre_usuario: 30,
    nombre: 30,
    apellidos: 50,
    email: 100,
    contrasena: 25,
    celular: 45,
    ciudad: 100,
    colonia: 100,
  };
  const datosUsuario = {};

  for (const [campo, limite] of Object.entries(campos)) {
    const valor = req.body?.[campo];

    if (
      campo === 'calle' &&
      (valor === undefined || valor === null || (typeof valor === 'string' && !valor.trim()))
    ) {
      datosUsuario[campo] = null;
      continue;
    }

    if (campo !== 'calle' && (typeof valor !== 'string' || !valor.trim())) {
      return res.status(400).json({ error: `El campo ${campo} es obligatorio` });
    }

    if (typeof valor !== 'string') {
      return res.status(400).json({ error: `El campo ${campo} debe ser texto` });
    }

    const valorLimpio = campo === 'contrasena' ? valor : valor.trim();
    if (Array.from(valorLimpio).length > limite) {
      return res.status(400).json({ error: `El campo ${campo} no puede superar ${limite} caracteres` });
    }

    datosUsuario[campo] = valorLimpio;
  }

  const calle = req.body?.calle;
  if (calle === undefined || calle === null || (typeof calle === 'string' && !calle.trim())) {
    datosUsuario.calle = null;
  } else if (typeof calle !== 'string') {
    return res.status(400).json({ error: 'El campo calle debe ser texto' });
  } else {
    const calleLimpia = calle.trim();
    if (Array.from(calleLimpia).length > 100) {
      return res.status(400).json({ error: 'El campo calle no puede superar 100 caracteres' });
    }
    datosUsuario.calle = calleLimpia;
  }

  const columnas = [...Object.keys(campos), 'calle'];
  const marcadores = columnas.map(() => '?').join(', ');
  const sql = `INSERT INTO usuario (${columnas.join(', ')}) VALUES (${marcadores})`;
  const valores = columnas.map((campo) => datosUsuario[campo]);

  conexion.query(sql, valores, (err, resultado) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'El nombre de usuario o correo ya está registrado' });
      }
      console.error('Error al registrar usuario en MySQL:', err);
      return res.status(500).json({ error: 'Error al registrar el usuario' });
    }

    res.status(201).json({
      mensaje: '¡Usuario registrado correctamente!',
      id: resultado.insertId,
    });
  });
});
// >>>>>>>> FIN DE REGISTRO DE USUARIO: POST /api/usuarios

module.exports = router;
