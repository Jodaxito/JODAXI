const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware esenciales PRIMERO
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware para loggear requests (debug)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  next();
});

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
        user_id BIGINT,
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Asegurar que imagen sea TEXT (no VARCHAR) para soportar base64
    try {
      await pool.query(`ALTER TABLE products ALTER COLUMN imagen TYPE TEXT`);
      console.log('Columna imagen actualizada a TEXT');
    } catch (e) {
      // Ignorar error si ya es TEXT
    }

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
        user_id BIGINT,
        user_name VARCHAR(255)
      )
    `);

    // Tabla de mensajes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id),
        sender_id BIGINT,
        text TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tablas de PostgreSQL creadas/verificadas correctamente');
    
    // Migrar columnas user_id a BIGINT si son INTEGER
    try {
      await pool.query(`ALTER TABLE products ALTER COLUMN user_id TYPE BIGINT`);
      console.log('Columna user_id en products cambiada a BIGINT');
    } catch (e) {
      // Ignorar error si ya es BIGINT o no existe
    }
    
    // Eliminar foreign key constraint si existe
    try {
      await pool.query(`ALTER TABLE products DROP CONSTRAINT IF EXISTS products_user_id_fkey`);
      console.log('Foreign key constraint de products eliminada');
    } catch (e) {
      // Ignorar si no existe
    }
    
    try {
      await pool.query(`ALTER TABLE chat_participants DROP CONSTRAINT IF EXISTS chat_participants_user_id_fkey`);
      console.log('Foreign key constraint de chat_participants eliminada');
    } catch (e) {
      // Ignorar si no existe
    }
    
    try {
      await pool.query(`ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey`);
      console.log('Foreign key constraint de messages eliminada');
    } catch (e) {
      // Ignorar si no existe
    }
    
    try {
      await pool.query(`ALTER TABLE chat_participants ALTER COLUMN user_id TYPE BIGINT`);
      console.log('Columna user_id en chat_participants cambiada a BIGINT');
    } catch (e) {
      // Ignorar error si ya es BIGINT o no existe
    }
    
    try {
      await pool.query(`ALTER TABLE messages ALTER COLUMN sender_id TYPE BIGINT`);
      console.log('Columna sender_id en messages cambiada a BIGINT');
    } catch (e) {
      // Ignorar error si ya es BIGINT o no existe
    }
    
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

// GET /api/users - Obtener todos los usuarios (para admin)
app.get('/api/users', async (req, res) => {
  console.log('GET /api/users - Solicitando todos los usuarios');
  try {
    const result = await pool.query(`
      SELECT id, name, email, created_at
      FROM users 
      ORDER BY created_at DESC
    `);
    console.log('Usuarios devueltos:', result.rows.length);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

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
      `INSERT INTO users (name, email, password) 
       VALUES ($1, $2, $3) RETURNING *`,
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
    console.log('Login attempt:', { email, passwordLength: password?.length });
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('User found:', result.rows.length > 0);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    const user = result.rows[0];
    console.log('Stored password:', user.password);
    console.log('Provided password:', password);
    console.log('Password match:', user.password === password);
    
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
  console.log('GET /api/products - Solicitando todos los productos');
  try {
    const result = await pool.query(`
      SELECT id, nombre, descripcion, precio, estado, tipo_transaccion, 
             imagen, categoria, user_id, user_name, user_email, 
             created_at
      FROM products 
      ORDER BY created_at DESC
    `);
    console.log('Productos devueltos:', result.rows.length, '- user_ids:', result.rows.map(p => p.user_id));
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/products/:id - Obtener un producto
app.get('/api/products/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, descripcion, precio, estado, tipo_transaccion, 
             imagen, categoria, user_id, user_name, user_email, created_at 
      FROM products WHERE id = $1
    `, [req.params.id]);
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
  console.log('POST /api/products - Crear producto:', req.body);
  try {
    const { nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria, user_id, user_name, user_email } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !user_id) {
      console.log('Error: Faltan campos requeridos - nombre:', nombre, 'user_id:', user_id);
      return res.status(400).json({ error: 'Faltan campos requeridos: nombre y user_id' });
    }
    
    const result = await pool.query(
      `INSERT INTO products (nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria, user_id, user_name, user_email) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id, nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria, user_id, user_name, user_email, created_at`,
      [nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria, user_id, user_name, user_email]
    );
    console.log('Producto creado exitosamente:', result.rows[0].id);
    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// PUT /api/products/:id - Actualizar producto
app.put('/api/products/:id', async (req, res) => {
  try {
    const { nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria } = req.body;
    const result = await pool.query(
      `UPDATE products SET nombre=$1, descripcion=$2, precio=$3, estado=$4, tipo_transaccion=$5, imagen=$6, categoria=$7 
       WHERE id=$8 
       RETURNING id, nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria, user_id, user_name, user_email, created_at`,
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
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
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
      `SELECT id, nombre, descripcion, precio, estado, tipo_transaccion, 
              imagen, categoria, user_id, user_name, user_email, created_at 
       FROM products WHERE user_id = $1 ORDER BY created_at DESC`,
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
      `SELECT c.*, p.nombre as product_name,
        (SELECT cp2.user_name 
         FROM chat_participants cp2 
         WHERE cp2.chat_id = c.id AND cp2.user_id != $1 
         LIMIT 1) as other_user_name
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
  console.log('POST /api/chats - Crear chat:', req.body);
  try {
    const { product_id, product_name, participants } = req.body;
    
    if (!participants || participants.length < 2) {
      console.log('Error: Se necesitan al menos 2 participantes');
      return res.status(400).json({ error: 'Se necesitan al menos 2 participantes' });
    }
    
    // Crear chat
    const chatResult = await pool.query(
      `INSERT INTO chats (product_id, product_name, created_at) VALUES ($1, $2, NOW()) RETURNING *`,
      [product_id, product_name]
    );
    const chat = chatResult.rows[0];
    console.log('Chat creado:', chat.id);
    
    // Agregar participantes
    for (const participant of participants) {
      await pool.query(
        `INSERT INTO chat_participants (chat_id, user_id, user_name) VALUES ($1, $2, $3)`,
        [chat.id, participant.user_id, participant.user_name]
      );
    }
    console.log('Participantes agregados:', participants.length);
    
    res.status(201).json({ data: chat });
  } catch (error) {
    console.error('Error creando chat:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// GET /api/chats/:chatId/messages - Obtener mensajes
app.get('/api/chats/:chatId/messages', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE chat_id = $1 ORDER BY timestamp ASC`,
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
  console.log('POST /api/chats/:chatId/messages - Chat:', req.params.chatId, 'Body:', req.body);
  try {
    const { sender_id, text } = req.body;
    
    if (!sender_id || !text) {
      console.log('Error: Faltan campos requeridos');
      return res.status(400).json({ error: 'Faltan campos requeridos: sender_id y text' });
    }
    
    // Insertar mensaje
    const result = await pool.query(
      `INSERT INTO messages (chat_id, sender_id, text, timestamp) VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [req.params.chatId, sender_id, text]
    );
    console.log('Mensaje creado:', result.rows[0].id);
    
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

// GET /api/admin/activity - Estadísticas de actividad con Laplace
app.get('/api/admin/activity', async (req, res) => {
  try {
    // Obtener productos por día (últimos 30 días)
    const productsResult = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM products 
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at) 
       ORDER BY date`
    );
    
    // Obtener chats por día (últimos 30 días)
    const chatsResult = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM chats 
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at) 
       ORDER BY date`
    );
    
    // Obtener mensajes por día (últimos 30 días)
    const messagesResult = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM messages 
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at) 
       ORDER BY date`
    );
    
    // Calcular totales
    const totalProducts = await pool.query('SELECT COUNT(*) FROM products');
    const totalChats = await pool.query('SELECT COUNT(*) FROM chats');
    const totalMessages = await pool.query('SELECT COUNT(*) FROM messages');
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    
    res.json({
      daily: {
        products: productsResult.rows,
        chats: chatsResult.rows,
        messages: messagesResult.rows
      },
      totals: {
        products: parseInt(totalProducts.rows[0].count),
        chats: parseInt(totalChats.rows[0].count),
        messages: parseInt(totalMessages.rows[0].count),
        users: parseInt(totalUsers.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// DELETE /api/chats/:chatId - Eliminar chat
app.delete('/api/chats/:chatId', async (req, res) => {
  try {
    const chatId = req.params.chatId;
    
    // Eliminar mensajes del chat primero
    await pool.query('DELETE FROM messages WHERE chat_id = $1', [chatId]);
    
    // Eliminar participantes del chat
    await pool.query('DELETE FROM chat_participants WHERE chat_id = $1', [chatId]);
    
    // Eliminar el chat
    await pool.query('DELETE FROM chats WHERE id = $1', [chatId]);
    
    res.json({ message: 'Chat eliminado correctamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta de prueba API
app.get('/api', (req, res) => {
  res.json({ message: 'API JODAXI funcionando', status: 'OK' });
});

// DEBUG endpoint
app.get('/api/debug', (req, res) => {
  res.json({ 
    timestamp: new Date().toISOString(),
    apiVersion: '1.0',
    environment: process.env.NODE_ENV || 'development',
    database: 'PostgreSQL'
  });
});

// Endpoint para seed de datos (solo para desarrollo/pruebas)
app.post('/api/seed', async (req, res) => {
  try {
    // Eliminar tabla si existe (para recrear con esquema correcto)
    await req.db.query(`DROP TABLE IF EXISTS products CASCADE`);
    
    // Crear tabla con esquema correcto
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL,
        precio INTEGER DEFAULT 0,
        estado VARCHAR(50) DEFAULT 'usado',
        tipo_transaccion VARCHAR(50) DEFAULT 'venta',
        imagen VARCHAR(500),
        categoria VARCHAR(100),
        user_id INTEGER NOT NULL,
        user_name VARCHAR(255),
        user_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Tabla products recreada correctamente');
    
    // Insertar productos con fechas distribuidas
    const seedSQL = `
      INSERT INTO products (nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria, user_id, user_name, created_at) VALUES
      ('Laptop HP', 'Laptop en buen estado', 8500, 'usado', 'venta', 'https://via.placeholder.com/150', 'Electrónica', 1, 'Admin', NOW()),
      ('iPhone 12', 'Celular usado', 12000, 'usado', 'venta', 'https://via.placeholder.com/150', 'Celulares', 1, 'Admin', NOW() - INTERVAL '1 day'),
      ('Audífonos Sony', 'Inalámbricos', 2500, 'nuevo', 'venta', 'https://via.placeholder.com/150', 'Audio', 2, 'Usuario1', NOW() - INTERVAL '1 day'),
      ('Mouse Logitech', 'Gamer', 800, 'usado', 'venta', 'https://via.placeholder.com/150', 'Computadoras', 2, 'Usuario1', NOW() - INTERVAL '2 days'),
      ('Teclado mecánico', 'RGB', 1500, 'nuevo', 'venta', 'https://via.placeholder.com/150', 'Computadoras', 1, 'Admin', NOW() - INTERVAL '2 days'),
      ('Monitor 24 pulgadas', 'Full HD', 4500, 'usado', 'venta', 'https://via.placeholder.com/150', 'Electrónica', 3, 'Usuario2', NOW() - INTERVAL '3 days'),
      ('Cámara Canon', 'Fotografía', 15000, 'usado', 'venta', 'https://via.placeholder.com/150', 'Cámaras', 3, 'Usuario2', NOW() - INTERVAL '3 days'),
      ('Tablet Samsung', 'Para dibujo', 6000, 'nuevo', 'venta', 'https://via.placeholder.com/150', 'Tablets', 2, 'Usuario1', NOW() - INTERVAL '4 days'),
      ('Smartwatch', 'Fitness', 3000, 'usado', 'venta', 'https://via.placeholder.com/150', 'Wearables', 1, 'Admin', NOW() - INTERVAL '4 days'),
      ('Router WiFi', 'Dual band', 1200, 'nuevo', 'venta', 'https://via.placeholder.com/150', 'Redes', 3, 'Usuario2', NOW() - INTERVAL '5 days'),
      ('Disco duro 1TB', 'Externo', 2000, 'usado', 'venta', 'https://via.placeholder.com/150', 'Almacenamiento', 2, 'Usuario1', NOW() - INTERVAL '5 days'),
      ('Webcam HD', 'Para streaming', 900, 'nuevo', 'venta', 'https://via.placeholder.com/150', 'Video', 1, 'Admin', NOW() - INTERVAL '6 days'),
      ('Micrófono USB', 'Condensador', 1800, 'usado', 'venta', 'https://via.placeholder.com/150', 'Audio', 3, 'Usuario2', NOW() - INTERVAL '6 days'),
      ('Batería portátil', '20000mAh', 700, 'nuevo', 'venta', 'https://via.placeholder.com/150', 'Accesorios', 2, 'Usuario1', NOW() - INTERVAL '7 days'),
      ('Hub USB', '7 puertos', 400, 'usado', 'venta', 'https://via.placeholder.com/150', 'Accesorios', 1, 'Admin', NOW() - INTERVAL '7 days')
    `;
    
    await req.db.query(seedSQL);
    console.log('15 productos insertados');
    
    // Eliminar y recrear tabla chats con esquema correcto
    await req.db.query(`DROP TABLE IF EXISTS chats CASCADE`);
    await req.db.query(`
      CREATE TABLE chats (
        id SERIAL PRIMARY KEY,
        product_id INTEGER,
        seller_id INTEGER,
        buyer_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Eliminar y recrear tabla messages con esquema correcto
    await req.db.query(`DROP TABLE IF EXISTS messages CASCADE`);
    await req.db.query(`
      CREATE TABLE messages (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER,
        sender_id INTEGER,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insertar chats (simulando actividad)
    const chatsSQL = `
      INSERT INTO chats (product_id, seller_id, buyer_id, created_at, updated_at) VALUES
      (1, 1, 2, NOW() - INTERVAL '0 days', NOW()),
      (2, 1, 3, NOW() - INTERVAL '1 day', NOW()),
      (3, 2, 1, NOW() - INTERVAL '1 day', NOW()),
      (4, 2, 3, NOW() - INTERVAL '2 days', NOW()),
      (5, 1, 2, NOW() - INTERVAL '2 days', NOW()),
      (6, 3, 1, NOW() - INTERVAL '3 days', NOW()),
      (7, 3, 2, NOW() - INTERVAL '3 days', NOW()),
      (8, 2, 1, NOW() - INTERVAL '4 days', NOW()),
      (9, 1, 3, NOW() - INTERVAL '4 days', NOW()),
      (10, 3, 1, NOW() - INTERVAL '5 days', NOW())
    `;
    await req.db.query(chatsSQL);
    console.log('10 chats insertados');
    
    // Insertar mensajes en los chats
    const messagesSQL = `
      INSERT INTO messages (chat_id, sender_id, content, created_at) VALUES
      (1, 1, 'Hola, ¿está disponible?', NOW() - INTERVAL '0 days'),
      (1, 2, 'Sí, aún está disponible', NOW() - INTERVAL '0 days' + INTERVAL '5 minutes'),
      (1, 1, '¿Me lo puedes dejar en $8000?', NOW() - INTERVAL '0 days' + INTERVAL '10 minutes'),
      (2, 3, 'Me interesa el iPhone', NOW() - INTERVAL '1 day'),
      (2, 1, 'Perfecto, ¿cuándo lo recoges?', NOW() - INTERVAL '1 day' + INTERVAL '15 minutes'),
      (3, 1, '¿Tienes factura de los audífonos?', NOW() - INTERVAL '1 day'),
      (3, 2, 'Sí, tengo factura', NOW() - INTERVAL '1 day' + INTERVAL '20 minutes'),
      (4, 3, '¿El mouse tiene garantía?', NOW() - INTERVAL '2 days'),
      (5, 2, 'Me gusta el teclado', NOW() - INTERVAL '2 days'),
      (6, 1, '¿El monitor tiene HDMI?', NOW() - INTERVAL '3 days'),
      (7, 2, '¿Aceptas cambios por la cámara?', NOW() - INTERVAL '3 days'),
      (8, 1, 'La tablet tiene pencil?', NOW() - INTERVAL '4 days'),
      (9, 3, '¿El smartwatch es resistente al agua?', NOW() - INTERVAL '4 days'),
      (10, 1, '¿El router es dual band?', NOW() - INTERVAL '5 days')
    `;
    await req.db.query(messagesSQL);
    console.log('14 mensajes insertados');
    
    res.json({ 
      success: true, 
      message: 'Datos de prueba insertados correctamente',
      products: 15,
      chats: 10,
      messages: 14
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    });
  }
});

// Manejo 404 para API - DEBE ir antes de static pero después de las rutas API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found', path: req.path });
});

// ============ WEB APP ============

// Servir archivos estáticos al final, DESPUÉS de todas las rutas API
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback - redirigir todo al index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor JODAXI corriendo en puerto ${PORT}`);
});
