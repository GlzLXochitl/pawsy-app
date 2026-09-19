const mysql = require('mysql2');
require('dotenv').config();

const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || 'MySQLIssy2026',
  database: process.env.DB_NAME
});

conexion.connect((err) => {
  if (err) {
    console.error('Error al conectar con MySQL:', err);
    return;
  }
  console.log('¡Conectado exitosamente a MySQL en el puerto 3306!');
});

module.exports = conexion;