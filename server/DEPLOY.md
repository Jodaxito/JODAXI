# JODAXI API - Backend para Render

## Despliegue en Render

### 1. Preparar archivos
Asegúrate de tener estos archivos en tu repositorio:
- `server/package.json` - Dependencias configuradas
- `server/server.js` - Servidor principal
- `server/routes/` - Rutas de la API
- `server/.env.example` - Variables de entorno de ejemplo

### 2. Crear servicio en Render
1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. Click **"New Web Service"**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name:** jodaxi-api
   - **Root Directory:** `server` (importante!)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### 3. Configurar Variables de Entorno
En el dashboard de Render, agrega estas variables:

```
DATABASE_URL=postgresql://tu-usuario:tu-password@tu-host.render.com:5432/jodaxi?sslmode=require
JWT_SECRET=una-clave-segura-de-al-menos-32-caracteres
NODE_ENV=production
```

**Obtener DATABASE_URL:**
- Ve a tu servicio PostgreSQL en Render
- Busca "External Database URL" o "Internal Database URL"
- Copia la URL completa

### 4. Deploy
- Guarda la configuración
- Render automáticamente hará deploy
- Verifica en los logs que las tablas se crearon correctamente

### 5. Probar API
Una vez desplegado, prueba:
```
https://TU-URL-DE-RENDER.com/
https://TU-URL-DE-RENDER.com/health
```

## Estructura de la API

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `GET /api/products` - Obtener todos los productos
- `POST /api/products` - Crear producto
- `GET /api/products/:id` - Obtener un producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto
- `GET /api/products/user/:userId` - Productos de un usuario
- `GET /api/chats` - Chats de un usuario
- `POST /api/chats` - Crear chat
- `GET /api/chats/:chatId/messages` - Mensajes de un chat
- `POST /api/chats/:chatId/messages` - Enviar mensaje
