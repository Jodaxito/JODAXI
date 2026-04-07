import AsyncStorage from '@react-native-async-storage/async-storage';
import { Producto, Categoria, User } from '../interfaces/ProductoInterface';

// Datos mock iniciales
const MOCK_PRODUCTOS: Producto[] = [
    {
        id: 1,
        nombre: 'Libro de Cálculo',
        descripcion: 'Libro de cálculo diferencial e integral, 3ra edición. En buen estado.',
        precio: 150,
        estado: 'usado',
        tipo_transaccion: 'venta',
        user: { id: 1, name: 'Juan Pérez', email: 'juan@universidad.edu' },
        categoria: { id: 1, nombre: 'Libros', descripcion: '' },
        imagenes: [],
    },
    {
        id: 2,
        nombre: 'Calculadora Científica',
        descripcion: 'Calculadora Casio fx-991. Funciona perfectamente.',
        precio: 200,
        estado: 'nuevo',
        tipo_transaccion: 'venta',
        user: { id: 2, name: 'María García', email: 'maria@universidad.edu' },
        categoria: { id: 2, nombre: 'Electrónica', descripcion: '' },
        imagenes: [],
    },
    {
        id: 3,
        nombre: 'Mochila',
        descripcion: 'Mochila negra, amplia capacidad. Intercambio por cuadernos.',
        precio: 0,
        estado: 'usado',
        tipo_transaccion: 'intercambio',
        user: { id: 1, name: 'Juan Pérez', email: 'juan@universidad.edu' },
        categoria: { id: 3, nombre: 'Accesorios', descripcion: '' },
        imagenes: [],
    },
];

const MOCK_CATEGORIAS: Categoria[] = [
    { id: 1, nombre: 'Libros', descripcion: 'Libros universitarios de todas las materias' },
    { id: 2, nombre: 'Electrónica', descripcion: 'Calculadoras, laptops, tablets, etc.' },
    { id: 3, nombre: 'Accesorios', descripcion: 'Mochilas, estuches, lápices, etc.' },
    { id: 4, nombre: 'Ropa', descripcion: 'Uniformes, chaquetas universitarias' },
    { id: 5, nombre: 'Mobiliario', descripcion: 'Escritorios, sillas, lámparas' },
    { id: 6, nombre: 'Otros', descripcion: 'Otros artículos universitarios' },
];

// Inicializar datos mock
const initializeMockData = async () => {
    const productos = await AsyncStorage.getItem('productos');
    if (!productos) {
        await AsyncStorage.setItem('productos', JSON.stringify(MOCK_PRODUCTOS));
    }
    const categorias = await AsyncStorage.getItem('categorias');
    if (!categorias) {
        await AsyncStorage.setItem('categorias', JSON.stringify(MOCK_CATEGORIAS));
    }
};

// Auth API Local
export const authAPI = {
    login: async (email: string, password: string) => {
        await initializeMockData();
        const user: User = {
            id: Date.now(),
            name: email.split('@')[0],
            username: email.split('@')[0],
            email: email,
        };
        const token = 'mock-token-' + Date.now();
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        return { data: { user, token } };
    },
    
    register: async (name: string, username: string, email: string, password: string) => {
        await initializeMockData();
        const user: User = {
            id: Date.now(),
            name: name,
            username: username,
            email: email,
        };
        const token = 'mock-token-' + Date.now();
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        return { data: { user, token } };
    },
    
    logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        return { data: { message: 'Logout successful' } };
    },
    
    me: async () => {
        const userStr = await AsyncStorage.getItem('user');
        if (!userStr) throw new Error('No user logged in');
        return { data: JSON.parse(userStr) };
    },
};

// Product API Local
export const productAPI = {
    getAll: async () => {
        await initializeMockData();
        const productos = await AsyncStorage.getItem('productos');
        return { data: JSON.parse(productos || '[]') };
    },
    
    getById: async (id: number) => {
        const productos = await AsyncStorage.getItem('productos');
        const list: Producto[] = JSON.parse(productos || '[]');
        const producto = list.find(p => p.id === id);
        if (!producto) throw new Error('Producto no encontrado');
        return { data: producto };
    },
    
    create: async (data: any) => {
        const productos = await AsyncStorage.getItem('productos');
        const list: Producto[] = JSON.parse(productos || '[]');
        const userStr = await AsyncStorage.getItem('user');
        const user: User = JSON.parse(userStr || '{}');
        
        const nuevoProducto: Producto = {
            id: Date.now(),
            ...data,
            user: user,
            categoria: MOCK_CATEGORIAS.find(c => c.id === data.categoria_id) || MOCK_CATEGORIAS[0],
            imagenes: [],
        };
        
        list.unshift(nuevoProducto);
        await AsyncStorage.setItem('productos', JSON.stringify(list));
        return { data: nuevoProducto };
    },
    
    update: async (id: number, data: any) => {
        const productos = await AsyncStorage.getItem('productos');
        const list: Producto[] = JSON.parse(productos || '[]');
        const index = list.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Producto no encontrado');
        
        list[index] = { ...list[index], ...data };
        await AsyncStorage.setItem('productos', JSON.stringify(list));
        return { data: list[index] };
    },
    
    delete: async (id: number) => {
        const productos = await AsyncStorage.getItem('productos');
        const list: Producto[] = JSON.parse(productos || '[]');
        const filtered = list.filter(p => p.id !== id);
        await AsyncStorage.setItem('productos', JSON.stringify(filtered));
        return { data: { message: 'Producto eliminado' } };
    },
    
    deleteAll: async () => {
        await AsyncStorage.removeItem('productos');
        return { data: { message: 'Todos los productos eliminados' } };
    },
    
    deleteMockProducts: async () => {
        const productos = await AsyncStorage.getItem('productos');
        const list: Producto[] = JSON.parse(productos || '[]');
        // Eliminar productos mock con IDs 1, 2 y 3 (Libro de Cálculo, Calculadora, Mochila)
        const filtered = list.filter(p => p.id !== 1 && p.id !== 2 && p.id !== 3);
        await AsyncStorage.setItem('productos', JSON.stringify(filtered));
        return { data: { message: 'Productos eliminados' } };
    },
    
    getByUser: async (userId: number) => {
        const productos = await AsyncStorage.getItem('productos');
        const list: Producto[] = JSON.parse(productos || '[]');
        const filtered = list.filter(p => p.user?.id === userId);
        return { data: filtered };
    },
};

// Category API Local
export const categoryAPI = {
    getAll: async () => {
        await initializeMockData();
        const categorias = await AsyncStorage.getItem('categorias');
        return { data: JSON.parse(categorias || '[]') };
    },
};

export default { authAPI, productAPI, categoryAPI };
