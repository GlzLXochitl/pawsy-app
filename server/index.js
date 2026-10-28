require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const inicioSesionRoutes = require('./routes/inicio-sesion');
const registroUsuarioRoutes = require('./routes/registro-usuario');
const dashboardVistaRoutes = require('./routes/dashboard-vista');
const dashboardPublicacionRoutes = require('./routes/dashboard-publicacion');
const perfilRoutes = require('./routes/perfil');
const comentarioImagenesRoutes = require('./routes/comentario-imagenes');
const configuracionesRoutes = require('./routes/configuraciones');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/profile-images', express.static(path.join(__dirname, 'resources', 'profile-images')));
app.use('/comment-images', express.static(path.join(__dirname, 'resources', 'comment-images')));

app.use('/api/login', inicioSesionRoutes);
app.use('/api/usuarios', registroUsuarioRoutes);
app.use('/api/posts', dashboardVistaRoutes);
app.use('/api/posts', dashboardPublicacionRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/comentarios', comentarioImagenesRoutes);
app.use('/api/configuraciones', configuracionesRoutes);

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, '0.0.0.0', () => {
  console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});
