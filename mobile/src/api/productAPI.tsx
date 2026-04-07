import AsyncStorage from '@react-native-async-storage/async-storage';
import { Producto, Categoria, User } from '../interfaces/ProductoInterface';

// API Configuration
const API_URL = 'https://jodaxi.onrender.com';

// Helper para hacer peticiones
const fetchAPI = async (endpoint: string, options?: RequestInit) => {
    console.log('API CALL:', endpoint, options?.method || 'GET');
    const token = await AsyncStorage.getItem('token');
    console.log('Token:', token ? 'exists' : 'none');
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options?.headers,
        },
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};

// Datos mock iniciales (solo para primer uso)
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

// Auth API - Backend
export const authAPI = {
    login: async (email: string, password: string) => {
        try {
            const response = await fetchAPI('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            const { user, token } = response.data;
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            return response;
        } catch (error) {
            alert('Error en login: ' + (error as Error).message);
            throw error;
        }
    },
    
    register: async (name: string, username: string, email: string, password: string) => {
        try {
            const response = await fetchAPI('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, username, email, password }),
            });
            const { user, token } = response.data;
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            return response;
        } catch (error) {
            alert('Error en registro: ' + (error as Error).message);
            throw error;
        }
    },
    
    logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        return { data: { message: 'Logout successful' } };
    },
    
    me: async () => {
        return fetchAPI('/api/auth/me');
    },
};

// Product API - Backend
export const productAPI = {
    getAll: async () => {
        return fetchAPI('/api/products');
    },
    
    getById: async (id: number) => {
        return fetchAPI(`/api/products/${id}`);
    },
    
    create: async (data: any) => {
        alert('Iniciando creación de producto...');
        const userStr = await AsyncStorage.getItem('user');
        alert('Usuario: ' + (userStr ? 'encontrado' : 'NO encontrado'));
        const user: User = JSON.parse(userStr || '{}');
        
        const productData = {
            ...data,
            user_id: user.id,
            user_name: user.name,
            user_email: user.email,
        };
        
        alert('Enviando a: ' + API_URL + '/api/products');
        
        try {
            const result = await fetchAPI('/api/products', {
                method: 'POST',
                body: JSON.stringify(productData),
            });
            alert('Producto creado exitosamente!');
            return result;
        } catch (error) {
            alert('Error al crear: ' + (error as Error).message);
            throw error;
        }
    },
    
    update: async (id: number, data: any) => {
        return fetchAPI(`/api/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    
    delete: async (id: number) => {
        return fetchAPI(`/api/products/${id}`, {
            method: 'DELETE',
        });
    },
    
    deleteAll: async () => {
        return { data: { message: 'Not implemented with backend' } };
    },
    
    deleteMockProducts: async () => {
        return { data: { message: 'Not needed with backend' } };
    },
    
    getByUser: async (userId: number) => {
        return fetchAPI(`/api/products/user/${userId}`);
    },
};

// Chat API - Backend
export const chatAPI = {
    getAll: async (userId: number) => {
        return fetchAPI(`/api/chats?userId=${userId}`);
    },
    
    create: async (data: any) => {
        return fetchAPI('/api/chats', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    
    getMessages: async (chatId: number) => {
        return fetchAPI(`/api/chats/${chatId}/messages`);
    },
    
    sendMessage: async (chatId: number, data: any) => {
        return fetchAPI(`/api/chats/${chatId}/messages`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

// Category API
export const categoryAPI = {
    getAll: async () => {
        // For now return mock categories
        return { data: MOCK_CATEGORIAS };
    },
};

export default { authAPI, productAPI, categoryAPI, chatAPI };
