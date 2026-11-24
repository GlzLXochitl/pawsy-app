const express = require('express');
const conexion = require('../db');

const router = express.Router();

// <<<<<<<< REGISTRO DE USUARIO: POST /api/usuarios
router.post('/', (req, res) => {
  const { nombre_usuario, nombre, apellidos, email, contrasena, celular, ciudad, colonia, calle } = req.body || {};

  if (!nombre_usuario || !nombre || !email || !contrasena) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = 'INSERT INTO usuario (nombre_usuario, nombre, apellidos, email, contrasena, celular, ciudad, colonia, calle) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

  conexion.query(
    sql,
    [nombre_usuario.trim(), nombre.trim(), apellidos.trim(), email.trim(), contrasena, celular ? celular.trim() : null, ciudad ? ciudad.trim() : null, colonia ? colonia.trim() : null, calle ? calle.trim() : null],
    (err, resultados) => {
      if (err) {
        console.error('Error en MySQL al registrar usuario:', err);
        return res.status(500).json({ error: 'Error en la base de datos al registrar' });
      }

      res.json({
        mensaje: '¡Usuario registrado con éxito!',
        id: resultados.insertId,
      });
    }
  );
});


// <<<<<<<< OBTENER PERFIL: GET /api/usuarios/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT id, nombre_usuario, foto_perfil, nombre, apellidos, email, celular, ciudad, colonia, calle
    FROM usuario
    WHERE id = ?
  `;

  conexion.query(sql, [id], (err, rows) => {
    if (err) {
      console.error('Error en MySQL al obtener usuario:', err);
      return res.status(500).json({ error: 'Error en la base de datos al obtener el perfil' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(rows[0]);
  });
});
// >>>>>>>> FIN OBTENER PERFIL

// <<<<<<<< ACTUALIZAR PERFIL: PUT /api/usuarios/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    nombre_usuario,
    foto_perfil,
    nombre,
    apellidos,
    email,
    celular,
    ciudad,
    colonia,
    calle,
  } = req.body || {};

  const sqlUpdate = `
    UPDATE usuario
    SET nombre_usuario = COALESCE(?, nombre_usuario),
        foto_perfil = COALESCE(?, foto_perfil),
        nombre = COALESCE(?, nombre),
        apellidos = COALESCE(?, apellidos),
        email = COALESCE(?, email),
        celular = COALESCE(?, celular),
        ciudad = COALESCE(?, ciudad),
        colonia = COALESCE(?, colonia),
        calle = COALESCE(?, calle),
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const valores = [
    nombre_usuario ? nombre_usuario.trim() : null,
    foto_perfil ? foto_perfil.trim() : null,
    nombre ? nombre.trim() : null,
    apellidos ? apellidos.trim() : null,
    email ? email.trim() : null,
    celular ? celular.trim() : null,
    ciudad ? ciudad.trim() : null,
    colonia ? colonia.trim() : null,
    calle ? calle.trim() : null,
    id,
  ];

  conexion.query(sqlUpdate, valores, (err, resultados) => {
    if (err) {
      console.error('Error en MySQL al actualizar usuario:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'El nombre de usuario o correo ya está en uso' });
      }
      return res.status(500).json({ error: 'Error en la base de datos al actualizar el perfil' });
    }

    if (resultados.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const sqlSelect = `
      SELECT id, nombre_usuario, foto_perfil, nombre, apellidos, email, celular, ciudad, colonia, calle, fecha_actualizacion
      FROM usuario
      WHERE id = ?
    `;

    conexion.query(sqlSelect, [id], (errSelect, rowsActualizados) => {
      if (errSelect) {
        console.error('Error al consultar usuario actualizado:', errSelect);
        return res.status(500).json({ error: 'Perfil actualizado, pero error al consultar los datos' });
      }

      res.json({
        mensaje: '¡Perfil actualizado con éxito!',
        usuario: rowsActualizados[0],
      });
    });
  });
});

module.exports = router;