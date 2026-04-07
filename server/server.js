const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Hacer pool accesible en las rutas
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Inicializar tablas
const initDB = async () => {
  try {
    // Tabla de usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        productos INTEGER DEFAULT 0,
        ventas INTEGER DEFAULT 0,
        compras INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de productos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL,
        precio INTEGER DEFAULT 0,
        estado VARCHAR(50) DEFAULT 'usado',
        tipo_transaccion VARCHAR(50) NOT NULL,
        imagen TEXT DEFAULT '',
        categoria VARCHAR(100) DEFAULT 'Otros',
        user_id INTEGER REFERENCES users(id),
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de chats
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        product_name VARCHAR(255),
        last_message TEXT,
        last_message_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de participantes de chats
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id),
        user_id INTEGER REFERENCES users(id),
        user_name VARCHAR(255)
      )
    `);

    // Tabla de mensajes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id),
        sender_id INTEGER REFERENCES users(id),
        text TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tablas de PostgreSQL creadas/verificadas');
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
  }
};

initDB();

// Rutas API (antes que todo lo demás)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/upload', require('./routes/upload'));

// Ruta de prueba API
app.get('/api', (req, res) => {
  res.json({ message: 'API JODAXI funcionando con PostgreSQL', status: 'OK' });
});

// Manejo 404 para API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found', path: req.path });
});

// Servir archivos estáticos (sin index.html por defecto)
const path = require('path');
app.use(express.static(path.join(__dirname, '../mobile/dist'), { index: false }));

// SPA fallback - ÚLTIMO (temporalmente deshabilitado para debug)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../mobile/dist/index.html'));
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
