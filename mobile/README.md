# JODAXI Mobile App

Aplicación móvil para el sistema de compra, venta, donación e intercambio de bienes de segunda mano para universidades.

## Características

- **Autenticación**: Login y registro de usuarios
- **Feed de productos**: Explorar todos los productos disponibles
- **Búsqueda avanzada**: Buscar productos por nombre, categoría o tipo de transacción
- **Detalle de producto**: Ver información completa del producto y contactar al vendedor
- **Publicar producto**: Crear nuevos anuncios de venta, donación o intercambio
- **Mis productos**: Gestionar tus productos publicados
- **Favoritos**: Guardar productos de interés
- **Chat**: Comunicación directa entre compradores y vendedores
- **Perfil de usuario**: Ver estadísticas y gestionar configuración

## Paleta de colores (Verdes)

- **Primario**: `#16a34a` (green-600)
- **Primario Oscuro**: `#15803d` (green-700)
- **Primario Claro**: `#22c55e` (green-500)
- **Acento**: `#84cc16` (lime-500)

## Estructura del proyecto

```
mobile/
├── App.js                      # Punto de entrada
├── package.json                # Dependencias
├── babel.config.js             # Configuración de Babel
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js     # Configuración de navegación
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   └── main/
│   │       ├── HomeScreen.js
│   │       ├── ProductDetailScreen.js
│   │       ├── CreateProductScreen.js
│   │       ├── SearchScreen.js
│   │       ├── FavoritesScreen.js
│   │       ├── ProfileScreen.js
│   │       ├── MyProductsScreen.js
│   │       └── ChatScreen.js
│   ├── constants/
│   │   └── theme.js            # Colores, tamaños, fuentes
│   └── services/
│       └── api.js              # Servicios de API
```

## Instalación

1. **Instalar dependencias**:
```bash
cd mobile
npm install
```

2. **Configurar API**:
Edita `src/services/api.js` y actualiza la URL de tu backend Laravel:
```javascript
const API_URL = 'http://TU_IP:8000/api';
```

3. **Iniciar la app**:
```bash
npx expo start
```

4. **Escanear el código QR** con la app Expo Go en tu dispositivo móvil

## Requisitos

- Node.js 18+
- Expo CLI
- Expo Go app en tu dispositivo móvil
- Backend Laravel corriendo (API)

## Navegación

La app utiliza navegación por tabs en la parte inferior:

- **Home**: Feed de productos con filtrado por categorías
- **Search**: Búsqueda de productos
- **Create**: Publicar nuevo producto (botón central)
- **Favorites**: Productos guardados
- **Profile**: Perfil del usuario y menú de opciones

## Tipos de transacción

1. **Venta**: Productos con precio definido
2. **Donación**: Productos gratuitos
3. **Intercambio**: Trueque de productos

## Próximos pasos

- [ ] Implementar autenticación con token JWT
- [ ] Agregar notificaciones push
- [ ] Implementar sistema de calificaciones
- [ ] Agregar geolocalización para búsqueda local
- [ ] Implementar pasarela de pagos
- [ ] Agregar compartir en redes sociales

## Licencia

MIT
