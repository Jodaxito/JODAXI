// API Configuration
const API_URL = 'https://jodaxi-api.onrender.com'; // Cambiar por tu URL de Render

// Helper para hacer peticiones
const fetchAPI = async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};

// Product API
export const productAPI = {
    getAll: async () => {
        return fetchAPI('/api/products');
    },
    
    getById: async (id: number) => {
        return fetchAPI(`/api/products/${id}`);
    },
    
    create: async (producto: any) => {
        return fetchAPI('/api/products', {
            method: 'POST',
            body: JSON.stringify(producto),
        });
    },
    
    update: async (id: number, producto: any) => {
        return fetchAPI(`/api/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(producto),
        });
    },
    
    delete: async (id: number) => {
        return fetchAPI(`/api/products/${id}`, {
            method: 'DELETE',
        });
    },
    
    getByUser: async (userId: number) => {
        return fetchAPI(`/api/products/user/${userId}`);
    },
};

// Auth API
export const authAPI = {
    login: async (email: string, password: string) => {
        return fetchAPI('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },
    
    register: async (name: string, email: string, password: string) => {
        return fetchAPI('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
    },
};

// Chat API
export const chatAPI = {
    getChats: async (userId: number) => {
        return fetchAPI(`/api/chats?userId=${userId}`);
    },
    
    createChat: async (participants: any[], productId: number, productName: string) => {
        return fetchAPI('/api/chats', {
            method: 'POST',
            body: JSON.stringify({ participants, productId, productName }),
        });
    },
    
    getMessages: async (chatId: number) => {
        return fetchAPI(`/api/chats/${chatId}/messages`);
    },
    
    sendMessage: async (chatId: number, senderId: number, text: string) => {
        return fetchAPI(`/api/chats/${chatId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ senderId, text }),
        });
    },
};

// Upload API
export const uploadAPI = {
    uploadImage: async (imageUri: string) => {
        const formData = new FormData();
        
        // Convertir URI a blob para React Native
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        formData.append('image', blob, 'image.jpg');
        
        const uploadResponse = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status}`);
        }
        
        return uploadResponse.json();
    },
};

export default { productAPI, authAPI, chatAPI, uploadAPI };
