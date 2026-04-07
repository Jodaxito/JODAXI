import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.100:8000/api'; // Cambiar por tu URL de Laravel

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/login', { email, password }),
  register: (name, email, password) => api.post('/register', { name, email, password }),
  logout: () => api.post('/logout'),
  me: () => api.get('/user'),
};

export const productAPI = {
  getAll: (params) => api.get('/productos', { params }),
  getById: (id) => api.get(`/productos/${id}`),
  create: (data) => api.post('/productos', data),
  update: (id, data) => api.put(`/productos/${id}`, data),
  delete: (id) => api.delete(`/productos/${id}`),
  getByUser: (userId) => api.get(`/usuarios/${userId}/productos`),
};

export const categoryAPI = {
  getAll: () => api.get('/categorias'),
};

export const transactionAPI = {
  create: (data) => api.post('/transacciones', data),
  getMyTransactions: () => api.get('/mis-transacciones'),
};

export default api;
