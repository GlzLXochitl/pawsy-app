
const mysql = require('mysql2');

const conexion = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '4903', //MYSQLissy2026
  database: process.env.DB_NAME || 'pawsy_db',
  port: process.env.DB_PORT || 3306
});

conexion.connect((err) => {
  if (err) {
    console.error('Error al conectar con MySQL:', err);
    return;
  }
  console.log('¡Conectado a la base de datos MySQL con éxito!');
});

module.exports = conexion;