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

// ============ RUTAS API COMPLETAS ============

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============ AUTH ROUTES ============

// POST /api/auth/register - Registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    
    // Verificar si el email ya existe
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    // Crear usuario
    const result = await pool.query(
      `INSERT INTO users (name, email, password, productos, ventas, compras) 
       VALUES ($1, $2, $3, 0, 0, 0) RETURNING *`,
      [name, email, password]
    );
    
    const user = result.rows[0];
    const token = 'jwt-token-' + user.id + '-' + Date.now();
    
    res.status(201).json({ 
      data: { 
        user: { id: user.id, name: user.name, email: user.email }, 
        token 
      } 
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/auth/login - Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    const user = result.rows[0];
    
    // Verificar contraseña
    if (user.password !== password) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
    
    const token = 'jwt-token-' + user.id + '-' + Date.now();
    
    res.json({ 
      data: { 
        user: { id: user.id, name: user.name, email: user.email }, 
        token 
      } 
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/auth/me - Obtener usuario actual
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    // Extraer userId del token simple
    const tokenParts = authHeader.split(' ');
    const token = tokenParts[1] || authHeader;
    const userId = token.split('-')[2];
    
    const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ============ PRODUCTS ROUTES ============

// GET /api/products - Obtener todos los productos
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/products/:id - Obtener un producto
app.get('/api/products/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/products - Crear producto
app.post('/api/products', async (req, res) => {
  try {
    const { nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria, user_id, user_name, user_email } = req.body;
    const result = await pool.query(
      `INSERT INTO products (nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria, user_id, user_name, user_email) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria, user_id, user_name, user_email]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/products/:id - Actualizar producto
app.put('/api/products/:id', async (req, res) => {
  try {
    const { nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria } = req.body;
    const result = await pool.query(
      `UPDATE products SET nombre=$1, descripcion=$2, precio=$3, estado=$4, tipo_transaccion=$5, imagen=$6, categoria=$7 
       WHERE id=$8 RETURNING *`,
      [nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// DELETE /api/products/:id - Eliminar producto
app.delete('/api/products/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ data: { message: 'Producto eliminado' } });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/products/user/:userId - Productos de un usuario
app.get('/api/products/user/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ============ CHATS ROUTES ============

// GET /api/chats - Obtener chats del usuario
app.get('/api/chats', async (req, res) => {
  try {
    const userId = req.query.userId;
    const result = await pool.query(
      `SELECT c.*, p.nombre as product_name 
       FROM chats c 
       JOIN chat_participants cp ON c.id = cp.chat_id 
       LEFT JOIN products p ON c.product_id = p.id
       WHERE cp.user_id = $1 ORDER BY c.last_message_time DESC`,
      [userId]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/chats - Crear chat
app.post('/api/chats', async (req, res) => {
  try {
    const { product_id, product_name, participants } = req.body;
    
    // Crear chat
    const chatResult = await pool.query(
      `INSERT INTO chats (product_id, product_name, created_at) VALUES ($1, $2, NOW()) RETURNING *`,
      [product_id, product_name]
    );
    const chat = chatResult.rows[0];
    
    // Agregar participantes
    for (const participant of participants) {
      await pool.query(
        `INSERT INTO chat_participants (chat_id, user_id, user_name) VALUES ($1, $2, $3)`,
        [chat.id, participant.user_id, participant.user_name]
      );
    }
    
    res.status(201).json({ data: chat });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/chats/:chatId/messages - Obtener mensajes
app.get('/api/chats/:chatId/messages', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.name as sender_name 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.chat_id = $1 ORDER BY m.timestamp ASC`,
      [req.params.chatId]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/chats/:chatId/messages - Enviar mensaje
app.post('/api/chats/:chatId/messages', async (req, res) => {
  try {
    const { sender_id, text } = req.body;
    
    // Insertar mensaje
    const result = await pool.query(
      `INSERT INTO messages (chat_id, sender_id, text, timestamp) VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [req.params.chatId, sender_id, text]
    );
    
    // Actualizar último mensaje del chat
    await pool.query(
      `UPDATE chats SET last_message = $1, last_message_time = NOW() WHERE id = $2`,
      [text, req.params.chatId]
    );
    
    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta de prueba API
app.get('/api', (req, res) => {
  res.json({ message: 'API JODAXI funcionando', status: 'OK' });
});

// Manejo 404 para API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found', path: req.path });
});

// ============ WEB APP ============

// Servir archivos estáticos
const path = require('path');
app.use(express.static(path.join(__dirname, '../mobile/dist')));

// SPA fallback - redirigir todo al index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../mobile/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
