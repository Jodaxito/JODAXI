const express = require('express');
const router = express.Router();

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const db = req.db;
    const result = await db.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/products - Crear nuevo producto
router.post('/', async (req, res) => {
  try {
    const db = req.db;
    const { nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria, user_id, user_name, user_email } = req.body;
    
    const result = await db.query(
      `INSERT INTO products (nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria, user_id, user_name, user_email) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria, user_id, user_name, user_email]
    );
    
    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/products/:id - Obtener un producto
router.get('/:id', async (req, res) => {
  try {
    const db = req.db;
    const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/products/:id - Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const db = req.db;
    const { nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria } = req.body;
    
    const result = await db.query(
      `UPDATE products 
       SET nombre = $1, descripcion = $2, precio = $3, estado = $4, tipo_transaccion = $5, imagen = $6, categoria = $7
       WHERE id = $8 
       RETURNING *`,
      [nombre, descripcion, precio, estado, tipo_transaccion, imagen, categoria, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// DELETE /api/products/:id - Eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    const db = req.db;
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({ data: { message: 'Producto eliminado' } });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/products/user/:userId - Productos de un usuario
router.get('/user/:userId', async (req, res) => {
  try {
    const db = req.db;
    const result = await db.query(
      'SELECT * FROM products WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error obteniendo productos del usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
