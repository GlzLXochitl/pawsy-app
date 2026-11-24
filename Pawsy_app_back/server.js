const express = require('express');
const cors = require('cors');
const pool = require('./db'); 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// IMPORTACIÓN DE RUTAS MODULARIZADAS
const inicioSesionRoutes = require('./routes/inicio-sesion');
const registroUsuarioRoutes = require('./routes/registro-usuario');
const dashboardPublicacionRoutes = require('./routes/dashboard-publicacion');

// Montaje de las rutas en el prefijo /api
app.use('/api/login', inicioSesionRoutes);
app.use('/api/usuarios', registroUsuarioRoutes);
app.use('/api', dashboardPublicacionRoutes);

// 1. MANEJO DE LIKES (Dar / Quitar Like)
app.post('/api/publicaciones/:id/like', async (req, res) => {
  const publicacion_id = req.params.id;
  const { usuario_id } = req.body;

  try {
    const [existing] = await pool.query(
      'SELECT * FROM publicacion_likes WHERE publicacion_id = ? AND usuario_id = ?',
      [publicacion_id, usuario_id]
    );

    if (existing.length > 0) {
      await pool.query(
        'DELETE FROM publicacion_likes WHERE publicacion_id = ? AND usuario_id = ?',
        [publicacion_id, usuario_id]
      );
      return res.json({ liked: false, message: 'Like eliminado' });
    } else {
      await pool.query(
        'INSERT INTO publicacion_likes (publicacion_id, usuario_id) VALUES (?, ?)',
        [publicacion_id, usuario_id]
      );
      return res.json({ liked: true, message: 'Like registrado' });
    }
  } catch (error) {
    console.error('Error al procesar el like:', error);
    res.status(500).json({ error: 'Error en el servidor al procesar el like' });
  }
});

// 2. CREAR COMENTARIO
app.post('/api/publicaciones/:id/comentarios', async (req, res) => {
  const publicacion_id = req.params.id;
  const { usuario_id, descripcion, imagen } = req.body;

  if (!descripcion || descripcion.trim() === '') {
    return res.status(400).json({ error: 'El comentario no puede estar vacío' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO comentarios (usuario_id, publicacion_id, descripcion, imagen) VALUES (?, ?, ?, ?)',
      [usuario_id, publicacion_id, descripcion, imagen || null]
    );

    res.status(201).json({
      id: result.insertId,
      usuario_id,
      publicacion_id,
      descripcion,
      imagen: imagen || null,
      mensaje: 'Comentario guardado con éxito',
    });
  } catch (error) {
    console.error('Error al guardar el comentario:', error);
    res.status(500).json({ error: 'Error en el servidor al guardar el comentario' });
  }
});

// INICIO DEL SERVIDOR (Siempre al final)
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});