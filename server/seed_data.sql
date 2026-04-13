-- Datos de prueba para visualizar gráficas de Laplace
-- Ejecutar en la base de datos de Render (Railway/PostgreSQL)

-- Limpiar datos existentes (opcional)
-- DELETE FROM messages WHERE id > 0;
-- DELETE FROM chats WHERE id > 0;
-- DELETE FROM products WHERE id > 0;

-- Insertar productos con fechas distribuidas (últimos 7 días)
INSERT INTO products (name, description, price, image_url, user_id, user_name, created_at) VALUES
('Laptop HP', 'Laptop en buen estado', 8500, 'https://via.placeholder.com/150', 1, 'Admin', NOW() - INTERVAL '0 days'),
('iPhone 12', 'Celular usado', 12000, 'https://via.placeholder.com/150', 1, 'Admin', NOW() - INTERVAL '1 day'),
('Audífonos Sony', 'Inalámbricos', 2500, 'https://via.placeholder.com/150', 2, 'Usuario1', NOW() - INTERVAL '1 day'),
('Mouse Logitech', 'Gamer', 800, 'https://via.placeholder.com/150', 2, 'Usuario1', NOW() - INTERVAL '2 days'),
('Teclado mecánico', 'RGB', 1500, 'https://via.placeholder.com/150', 1, 'Admin', NOW() - INTERVAL '2 days'),
('Monitor 24"', 'Full HD', 4500, 'https://via.placeholder.com/150', 3, 'Usuario2', NOW() - INTERVAL '3 days'),
('Cámara Canon', 'Fotografía', 15000, 'https://via.placeholder.com/150', 3, 'Usuario2', NOW() - INTERVAL '3 days'),
('Tablet Samsung', 'Para dibujo', 6000, 'https://via.placeholder.com/150', 2, 'Usuario1', NOW() - INTERVAL '4 days'),
('Smartwatch', 'Fitness', 3000, 'https://via.placeholder.com/150', 1, 'Admin', NOW() - INTERVAL '4 days'),
('Router WiFi', 'Dual band', 1200, 'https://via.placeholder.com/150', 3, 'Usuario2', NOW() - INTERVAL '5 days'),
('Disco duro 1TB', 'Externo', 2000, 'https://via.placeholder.com/150', 2, 'Usuario1', NOW() - INTERVAL '5 days'),
('Webcam HD', 'Para streaming', 900, 'https://via.placeholder.com/150', 1, 'Admin', NOW() - INTERVAL '6 days'),
('Micrófono USB', 'Condensador', 1800, 'https://via.placeholder.com/150', 3, 'Usuario2', NOW() - INTERVAL '6 days'),
('Batería portátil', '20000mAh', 700, 'https://via.placeholder.com/150', 2, 'Usuario1', NOW() - INTERVAL '7 days'),
('Hub USB', '7 puertos', 400, 'https://via.placeholder.com/150', 1, 'Admin', NOW() - INTERVAL '7 days');

-- Insertar chats (simulando actividad)
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
(10, 3, 1, NOW() - INTERVAL '5 days', NOW()),
(11, 2, 3, NOW() - INTERVAL '5 days', NOW()),
(12, 1, 2, NOW() - INTERVAL '6 days', NOW()),
(13, 3, 1, NOW() - INTERVAL '6 days', NOW()),
(14, 2, 1, NOW() - INTERVAL '7 days', NOW()),
(15, 1, 3, NOW() - INTERVAL '7 days', NOW());

-- Insertar mensajes en los chats (simulando conversaciones activas)
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
(10, 1, '¿El router es dual band?', NOW() - INTERVAL '5 days'),
(11, 3, '¿El disco es SSD o HDD?', NOW() - INTERVAL '5 days'),
(12, 2, '¿La webcam es 1080p?', NOW() - INTERVAL '6 days'),
(13, 1, '¿El micrófono tiene anti-pop?', NOW() - INTERVAL '6 days'),
(14, 2, '¿La batería es original?', NOW() - INTERVAL '7 days'),
(15, 3, '¿El hub es USB 3.0?', NOW() - INTERVAL '7 days');

-- Actualizar contadores de usuarios
UPDATE users SET productos = 
  CASE 
    WHEN id = 1 THEN 6
    WHEN id = 2 THEN 5
    WHEN id = 3 THEN 4
    ELSE 0
  END;
