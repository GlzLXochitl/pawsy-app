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
  const id = Number(req.params.id);
  const cuerpo = req.body || {};
  const columnas = {
    nombre_usuario: 'nombre_usuario',
    foto_perfil: 'foto_perfil',
    nombre: 'nombre',
    apellidos: 'apellidos',
    email: 'email',
    celular: 'celular',
    ciudad: 'ciudad',
    colonia: 'colonia',
    calle: 'calle',
  };
  const opcionales = new Set(['foto_perfil', 'celular', 'calle']);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'El id de usuario no es válido' });
  }

  const cambios = Object.entries(columnas)
    .filter(([campo]) => cuerpo[campo] !== undefined)
    .map(([campo, columna]) => {
      const valor = cuerpo[campo];
      if (valor === null && opcionales.has(campo)) {
        return { columna, valor: null };
      }
      if (typeof valor !== 'string') {
        return { error: `${campo} debe ser texto` };
      }
      const limpio = valor.trim();
      if (!limpio && !opcionales.has(campo)) {
        return { error: `${campo} no puede estar vacío` };
      }
      return { columna, valor: limpio || null };
    });

  const errorValidacion = cambios.find((cambio) => cambio.error);
  if (errorValidacion) {
    return res.status(400).json({ error: errorValidacion.error });
  }
  if (cambios.length === 0) {
    return res.status(400).json({ error: 'No se recibieron cambios para actualizar' });
  }

  const sqlUpdate = `
    UPDATE usuario
    SET ${cambios.map((cambio) => `${cambio.columna} = ?`).join(', ')},
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const valores = [...cambios.map((cambio) => cambio.valor), id];

  conexion.query(sqlUpdate, valores, (err) => {
    if (err) {
      console.error('Error en MySQL al actualizar usuario:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'El nombre de usuario o correo ya está en uso' });
      }
      return res.status(500).json({ error: 'Error en la base de datos al actualizar el perfil' });
    }

    const sqlSelect = `
      SELECT id, nombre_usuario, foto_perfil, nombre, apellidos, email, celular,
             ciudad, colonia, calle, fecha_actualizacion
      FROM usuario
      WHERE id = ?
    `;

    conexion.query(sqlSelect, [id], (errSelect, rowsActualizados) => {
      if (errSelect) {
        console.error('Error al consultar usuario actualizado:', errSelect);
        return res.status(500).json({ error: 'Perfil actualizado, pero error al consultar los datos' });
      }
      if (rowsActualizados.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        mensaje: '¡Perfil actualizado con éxito!',
        usuario: rowsActualizados[0],
      });
    });
  });
});

router.put('/:id/contrasena', (req, res) => {
  const id = Number(req.params.id);
  const { contrasena_actual: contrasenaActual, contrasena_nueva: contrasenaNueva } = req.body || {};

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'El id de usuario no es válido' });
  }
  if (typeof contrasenaActual !== 'string' || !contrasenaActual) {
    return res.status(400).json({ error: 'Escribe tu contraseña actual' });
  }
  if (typeof contrasenaNueva !== 'string' || contrasenaNueva.length < 8 || contrasenaNueva.length > 25) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener entre 8 y 25 caracteres' });
  }
  if (contrasenaActual === contrasenaNueva) {
    return res.status(400).json({ error: 'La nueva contraseña debe ser diferente a la actual' });
  }

  const sql = `
    UPDATE usuario
    SET contrasena = ?, fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = ? AND contrasena = ?
  `;

  conexion.query(sql, [contrasenaNueva, id, contrasenaActual], (err, resultado) => {
    if (err) {
      console.error('Error en MySQL al cambiar contraseña:', err);
      return res.status(500).json({ error: 'No se pudo actualizar la contraseña' });
    }
    if (resultado.affectedRows === 0) {
      return res.status(401).json({ error: 'La contraseña actual no es correcta' });
    }
    return res.json({ mensaje: 'La contraseña se actualizó correctamente' });
  });
});

module.exports = router;