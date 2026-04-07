import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, productAPI } from '../api/productAPI';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    stats?: {
        productos: number;
        ventas: number;
        compras: number;
    };
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    userStats: {
        productos: number;
        ventas: number;
        compras: number;
    };
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserStats: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userStats, setUserStats] = useState({
        productos: 0,
        ventas: 0,
        compras: 0,
    });

    useEffect(() => {
        loadUser();
    }, []);

    // Calcular estadísticas cuando cambia el usuario
    useEffect(() => {
        if (user) {
            updateUserStats();
        }
    }, [user]);

    const loadUser = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUserStats = async () => {
        try {
            if (!user) return;
            
            // Obtener productos del usuario desde el backend
            const response = await productAPI.getByUser(user.id);
            const userProductos = response.data || [];
            
            setUserStats({
                productos: userProductos.length,
                ventas: 0,
                compras: 0,
            });
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await authAPI.login(email, password);
        const { user: userData, token } = response.data;
        
        // Inicializar estadísticas en 0
        const userWithStats = {
            ...userData,
            stats: {
                productos: 0,
                ventas: 0,
                compras: 0,
            }
        };
        
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(userWithStats));
        setUser(userWithStats);
    };

    const register = async (name: string, username: string, email: string, password: string) => {
        const response = await authAPI.register(name, username, email, password);
        const { user: userData, token } = response.data;
        
        // Inicializar estadísticas en 0
        const userWithStats = {
            ...userData,
            stats: {
                productos: 0,
                ventas: 0,
                compras: 0,
            }
        };
        
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(userWithStats));
        setUser(userWithStats);
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setUser(null);
            setUserStats({ productos: 0, ventas: 0, compras: 0 });
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                userStats,
                login,
                register,
                logout,
                updateUserStats,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
