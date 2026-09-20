const express = require('express');
const cors = require('cors');
const conexion = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// ENDPOINT 1: Inicio de sesión (para sign-in.tsx)
app.post('/api/login', (req, res) => {
  // Recibimos 'nombre' y 'contrasena' (sin ñ) enviados desde React Native
  const { nombre, contrasena } = req.body;

  // Debugging en consola de Node.js
  console.log('Body recibido:', req.body);

  // Validamos que ambos campos existan
  if (!nombre || !contrasena) {
    return res.status(400).json({ error: 'Nombre y contraseña incorrectos' });
  }

  // Consulta apuntando a la columna `contraseña` de MySQL pasando la variable `contrasena`
  const sql = 'SELECT * FROM usuario WHERE nombre = ? AND contraseña = ?';

  conexion.query(sql, [nombre, contrasena], (err, resultados) => {
    if (err) {
      console.error('Error en MySQL:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (resultados.length > 0) {
      const usuario = { ...resultados[0] };
      delete usuario.contraseña; // Eliminamos la contraseña del objeto retornado

      res.json({ 
        mensaje: 'Login exitoso', 
        usuario: usuario 
      });
    } else {
      res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
  });
});

// ENDPOINT 2: Registro de usuario (para user_form.tsx)
app.post('/api/usuarios', (req, res) => {
  const { username, password, email } = req.body;
  const sql = 'INSERT INTO usuarios (username, password, email) VALUES (?, ?, ?)';

  conexion.query(sql, [username, password, email], (err, resultado) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al registrar el usuario' });
    }
    res.json({ mensaje: '¡Usuario registrado correctamente!' });
  });
});

// ENDPOINT: Obtener publicaciones
app.get('/api/posts', (req, res) => {
  const sql = 'SELECT * FROM posts ORDER BY id DESC';
  conexion.query(sql, (err, resultados) => {
    if (err) return res.status(500).json({ error: 'Error al consultar posts' });
    
    // Mapeamos los comentarios de string a array para React Native
    const postsFormateados = resultados.map(post => ({
      ...post,
      comments: post.comments ? JSON.parse(post.comments) : []
    }));
    
    res.json(postsFormateados);
  });
});

// ENDPOINT: Crear publicación
app.post('/api/posts', (req, res) => {
  const { user, text, image } = req.body;
  const sql = 'INSERT INTO posts (user, text, image, likes, comments) VALUES (?, ?, ?, 0, "[]")';
  
  conexion.query(sql, [user, text, image], (err, resultado) => {
    if (err) return res.status(500).json({ error: 'Error al guardar publicación' });
    res.json({ mensaje: 'Post publicado exitosamente' });
  });
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});