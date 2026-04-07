const express = require('express');
const router = express.Router();

// GET /api/chats - Chats de un usuario
router.get('/', async (req, res) => {
  try {
    const db = req.db;
    const { userId } = req.query;
    
    const result = await db.query(
      `SELECT c.*, p.user_name as product_user_name 
       FROM chats c
       JOIN chat_participants cp ON c.id = cp.chat_id
       LEFT JOIN products p ON c.product_id = p.id
       WHERE cp.user_id = $1
       ORDER BY c.last_message_time DESC`,
      [userId]
    );
    
    // Obtener participantes para cada chat
    const chats = await Promise.all(result.rows.map(async (chat) => {
      const participantsResult = await db.query(
        'SELECT user_id, user_name FROM chat_participants WHERE chat_id = $1',
        [chat.id]
      );
      return { ...chat, participants: participantsResult.rows };
    }));
    
    res.json({ data: chats });
  } catch (error) {
    console.error('Error obteniendo chats:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/chats - Crear nuevo chat
router.post('/', async (req, res) => {
  try {
    const db = req.db;
    const { participants, productId, productName } = req.body;
    
    // Verificar si ya existe un chat entre estos usuarios para este producto
    const existingResult = await db.query(
      `SELECT c.id FROM chats c
       JOIN chat_participants cp1 ON c.id = cp1.chat_id
       JOIN chat_participants cp2 ON c.id = cp2.chat_id
       WHERE c.product_id = $1 AND cp1.user_id = $2 AND cp2.user_id = $3`,
      [productId, participants[0].userId, participants[1].userId]
    );
    
    if (existingResult.rows.length > 0) {
      const chatId = existingResult.rows[0].id;
      const chatResult = await db.query('SELECT * FROM chats WHERE id = $1', [chatId]);
      const participantsResult = await db.query(
        'SELECT user_id, user_name FROM chat_participants WHERE chat_id = $1',
        [chatId]
      );
      return res.json({ 
        data: { ...chatResult.rows[0], participants: participantsResult.rows } 
      });
    }
    
    // Crear nuevo chat
    const chatResult = await db.query(
      'INSERT INTO chats (product_id, product_name) VALUES ($1, $2) RETURNING *',
      [productId, productName]
    );
    const chat = chatResult.rows[0];
    
    // Agregar participantes
    for (const participant of participants) {
      await db.query(
        'INSERT INTO chat_participants (chat_id, user_id, user_name) VALUES ($1, $2, $3)',
        [chat.id, participant.userId, participant.name]
      );
    }
    
    const participantsResult = await db.query(
      'SELECT user_id, user_name FROM chat_participants WHERE chat_id = $1',
      [chat.id]
    );
    
    res.status(201).json({ 
      data: { ...chat, participants: participantsResult.rows } 
    });
  } catch (error) {
    console.error('Error creando chat:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/chats/:chatId/messages - Mensajes de un chat
router.get('/:chatId/messages', async (req, res) => {
  try {
    const db = req.db;
    const result = await db.query(
      'SELECT * FROM messages WHERE chat_id = $1 ORDER BY timestamp ASC',
      [req.params.chatId]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/chats/:chatId/messages - Enviar mensaje
router.post('/:chatId/messages', async (req, res) => {
  try {
    const db = req.db;
    const { senderId, text } = req.body;
    const chatId = req.params.chatId;
    
    const messageResult = await db.query(
      `INSERT INTO messages (chat_id, sender_id, text, timestamp, is_read) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, false) 
       RETURNING *`,
      [chatId, senderId, text]
    );
    
    // Actualizar último mensaje del chat
    await db.query(
      `UPDATE chats 
       SET last_message = $1, last_message_time = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [text, chatId]
    );
    
    res.status(201).json({ data: messageResult.rows[0] });
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
