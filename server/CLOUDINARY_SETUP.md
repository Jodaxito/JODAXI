# Configuración Cloudinary para Imágenes

## 1. Crear cuenta en Cloudinary
1. Ve a https://cloudinary.com/users/register_free
2. Regístrate con tu email o cuenta de Google
3. Verifica tu cuenta

## 2. Obtener credenciales
En tu dashboard de Cloudinary, busca:
- **Cloud Name**: Es el nombre de tu cuenta (ej: `jodaxi`)
- **API Key**: Un código alfanumérico
- **API Secret**: Otro código secreto

## 3. Configurar en Render
Ve a tu servicio en Render → Environment Variables y agrega:

```
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

## 4. Cómo funciona
- Usuario selecciona imagen en la app
- Imagen se sube a tu backend en Render
- Backend sube imagen a Cloudinary
- Cloudinary devuelve una URL pública
- Guardas esa URL en PostgreSQL
- Todos los usuarios pueden ver la imagen con esa URL

## 5. Límites gratuitos
- 25 GB de almacenamiento
- 25 GB de transferencia mensual
- 25,000 transformaciones mensuales

## Notas
- Las imágenes se almacenan en la carpeta `jodaxi/products` en Cloudinary
- Las URLs son públicas y persistentes
- Cloudinary optimiza automáticamente las imágenes
