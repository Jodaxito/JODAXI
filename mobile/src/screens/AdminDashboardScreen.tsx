import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Image,
    Alert,
    Modal,
    TextInput,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../navigator/BottomTabNavigator';
import { colors } from '../themes/appTheme';
import { useAuth } from '../context/AuthContext';
import { productAPI } from '../api/api';

const { width } = Dimensions.get('window');

const ADMIN_EMAILS = [
    '222410863@gmail.com',
    'al222410881@gmail.com',
    'al222410838@gmail.com'
];

type Props = StackScreenProps<ProfileStackParamList, 'AdminDashboard'>;

interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    estado: string;
    tipo_transaccion: string;
    imagen: string;
    user_name: string;
    user_email: string;
    created_at: string;
}

interface Usuario {
    id: number;
    name: string;
    email: string;
    productos: number;
    created_at: string;
}

interface Notificacion {
    id: number;
    userId: number;
    message: string;
    timestamp: string;
}

// Transformada de Laplace simplificada para estadísticas
const calculateDailyStats = (transactions: any[]) => {
    const dailyData: { [key: string]: number } = {};
    
    transactions.forEach(t => {
        const date = new Date(t.created_at).toISOString().split('T')[0];
        dailyData[date] = (dailyData[date] || 0) + 1;
    });
    
    // Aplicar transformada de Laplace simplificada (acumulación exponencial)
    const dates = Object.keys(dailyData).sort();
    const stats = dates.map((date, index) => {
        const count = dailyData[date];
        // Función de decaimiento exponencial (simplificación de Laplace)
        const decayFactor = Math.exp(-0.1 * (dates.length - index - 1));
        const weightedValue = count * decayFactor;
        
        return {
            date,
            count,
            weightedValue: Math.round(weightedValue * 100) / 100,
            trend: index > 0 ? count - dailyData[dates[index - 1]] : 0
        };
    });
    
    return {
        total: transactions.length,
        daily: stats,
        average: transactions.length / (dates.length || 1),
        trend: stats.length > 1 ? stats[stats.length - 1].count - stats[0].count : 0
    };
};

export const AdminDashboardScreen = ({ navigation }: Props) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'products' | 'users' | 'stats' | 'notifications'>('products');
    const [products, setProducts] = useState<Producto[]>([]);
    const [users, setUsers] = useState<Usuario[]>([]);
    const [notifications, setNotifications] = useState<Notificacion[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);

    const isAdmin = user && ADMIN_EMAILS.includes(user.email);

    useEffect(() => {
        if (!isAdmin) {
            Alert.alert('Acceso Denegado', 'No tienes permisos de administrador');
            navigation.goBack();
            return;
        }
        loadData();
    }, [isAdmin]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Cargar productos desde el backend
            const productsRes = await productAPI.getAll();
            const apiProducts = productsRes.data || [];
            setProducts(apiProducts);

            // Extraer usuarios únicos de los productos
            const uniqueEmails = [...new Set(apiProducts.map((p: Producto) => p.user_email).filter(Boolean))];
            const usersData: Usuario[] = uniqueEmails.map((email, index) => ({
                id: index + 1,
                name: apiProducts.find((p: Producto) => p.user_email === email)?.user_name || 'Usuario',
                email: email as string,
                productos: apiProducts.filter((p: Producto) => p.user_email === email).length,
                created_at: new Date().toISOString()
            }));
            setUsers(usersData);

            // Calcular estadísticas
            const dailyStats = calculateDailyStats(apiProducts);
            setStats(dailyStats);
        } catch (error) {
            console.error('Error cargando datos:', error);
            Alert.alert('Error', 'No se pudieron cargar los datos del servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = (productId: number) => {
        setProductToDelete(productId);
        setDeleteModalVisible(true);
    };

    const confirmDeleteProduct = async () => {
        if (!productToDelete) return;
        try {
            await productAPI.delete(productToDelete);
            setDeleteModalVisible(false);
            setProductToDelete(null);
            loadData();
        } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el producto');
        }
    };

    const cancelDeleteProduct = () => {
        setDeleteModalVisible(false);
        setProductToDelete(null);
    };

    const handleSendNotification = async () => {
        if (!selectedUser || !notificationMessage.trim()) {
            Alert.alert('Error', 'Selecciona un usuario y escribe un mensaje');
            return;
        }

        const newNotification: Notificacion = {
            id: Date.now(),
            userId: selectedUser.id,
            message: notificationMessage,
            timestamp: new Date().toISOString()
        };

        setNotifications([newNotification, ...notifications]);
        setNotificationMessage('');
        setModalVisible(false);
        setSelectedUser(null);
        Alert.alert('Éxito', 'Notificación enviada');
    };

    const renderProductItem = ({ item }: { item: Producto }) => (
        <View style={styles.productCard}>
            <Image
                source={{ uri: item.imagen || 'https://via.placeholder.com/100' }}
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.nombre}</Text>
                <Text style={styles.productUser}>Por: {item.user_name}</Text>
                <Text style={styles.productDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
                <View style={styles.productBadge}>
                    <Text style={styles.badgeText}>{item.tipo_transaccion}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteProduct(item.id)}
            >
                <Ionicons name="trash-outline" size={24} color={colors.error} />
            </TouchableOpacity>
        </View>
    );

    const renderUserItem = ({ item }: { item: Usuario }) => (
        <View style={styles.userCard}>
            <View style={styles.userIcon}>
                <Ionicons name="person-circle" size={50} color={colors.primary} />
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userStats}>{item.productos} productos</Text>
            </View>
            <TouchableOpacity
                style={styles.notifyButton}
                onPress={() => {
                    setSelectedUser(item);
                    setModalVisible(true);
                }}
            >
                <Ionicons name="notifications-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
        </View>
    );

    const renderStats = () => (
        <ScrollView style={styles.statsContainer}>
            <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Resumen General</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{stats?.total || 0}</Text>
                        <Text style={styles.statLabel}>Total Productos</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{users.length}</Text>
                        <Text style={styles.statLabel}>Total Usuarios</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>
                            {Math.round((stats?.average || 0) * 100) / 100}
                        </Text>
                        <Text style={styles.statLabel}>Promedio/Día</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>
                            {(stats?.trend || 0) > 0 ? '+' : ''}{stats?.trend || 0}
                        </Text>
                        <Text style={styles.statLabel}>Tendencia</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Transacciones Diarias (Laplace)</Text>
                <Text style={styles.statsSubtitle}>
                    Decaimiento exponencial aplicado para análisis de tendencia
                </Text>
                {stats?.daily?.map((day: any, index: number) => (
                    <View key={index} style={styles.dayRow}>
                        <Text style={styles.dayDate}>{day.date}</Text>
                        <View style={styles.dayBar}>
                            <View 
                                style={[
                                    styles.dayBarFill, 
                                    { width: `${Math.min(day.weightedValue * 10, 100)}%` }
                                ]} 
                            />
                        </View>
                        <Text style={styles.dayCount}>{day.count}</Text>
                        <Text style={styles.dayWeight}>({day.weightedValue})</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );

    if (!isAdmin) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Acceso Denegado</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Panel de Administrador</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'products' && styles.tabActive]}
                    onPress={() => setActiveTab('products')}
                >
                    <Ionicons 
                        name="cube-outline" 
                        size={20} 
                        color={activeTab === 'products' ? colors.white : colors.primary} 
                    />
                    <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
                        Productos
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'users' && styles.tabActive]}
                    onPress={() => setActiveTab('users')}
                >
                    <Ionicons 
                        name="people-outline" 
                        size={20} 
                        color={activeTab === 'users' ? colors.white : colors.primary} 
                    />
                    <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
                        Usuarios
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
                    onPress={() => setActiveTab('stats')}
                >
                    <Ionicons 
                        name="stats-chart-outline" 
                        size={20} 
                        color={activeTab === 'stats' ? colors.white : colors.primary} 
                    />
                    <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
                        Estadísticas
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {activeTab === 'products' && (
                <FlatList
                    data={products}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadData} />
                    }
                    contentContainerStyle={styles.listContainer}
                />
            )}

            {activeTab === 'users' && (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadData} />
                    }
                    contentContainerStyle={styles.listContainer}
                />
            )}

            {activeTab === 'stats' && renderStats()}

            {/* Modal de Notificación */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Enviar Notificación a {selectedUser?.name}
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            multiline
                            numberOfLines={4}
                            placeholder="Escribe el mensaje de notificación..."
                            value={notificationMessage}
                            onChangeText={setNotificationMessage}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonSend]}
                                onPress={handleSendNotification}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.white }]}>
                                    Enviar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de confirmación para eliminar producto */}
            {deleteModalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Eliminar producto</Text>
                        <Text style={styles.modalText}>
                            ¿Estás seguro de que quieres eliminar este producto?
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalCancelButton} onPress={cancelDeleteProduct}>
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalDeleteButton} onPress={confirmDeleteProduct}>
                                <Text style={styles.modalDeleteText}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: colors.white,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingHorizontal: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginHorizontal: 5,
        borderRadius: 25,
        backgroundColor: colors.lightBackground,
    },
    tabActive: {
        backgroundColor: colors.primary,
    },
    tabText: {
        marginLeft: 5,
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },
    tabTextActive: {
        color: colors.white,
    },
    listContainer: {
        padding: 15,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    productInfo: {
        flex: 1,
        marginLeft: 15,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.darkText,
    },
    productUser: {
        fontSize: 14,
        color: colors.gray,
        marginTop: 4,
    },
    productDate: {
        fontSize: 12,
        color: colors.lightGray,
        marginTop: 4,
    },
    productBadge: {
        backgroundColor: colors.lightBackground,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    badgeText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    deleteButton: {
        justifyContent: 'center',
        padding: 10,
    },
    userCard: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userIcon: {
        marginRight: 15,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.darkText,
    },
    userEmail: {
        fontSize: 14,
        color: colors.gray,
        marginTop: 2,
    },
    userStats: {
        fontSize: 12,
        color: colors.primary,
        marginTop: 4,
    },
    notifyButton: {
        padding: 10,
    },
    statsContainer: {
        padding: 15,
    },
    statsCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.darkText,
        marginBottom: 15,
    },
    statsSubtitle: {
        fontSize: 12,
        color: colors.gray,
        marginBottom: 15,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statBox: {
        width: (width - 70) / 2,
        backgroundColor: colors.lightBackground,
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    statLabel: {
        fontSize: 12,
        color: colors.gray,
        marginTop: 5,
    },
    dayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGray,
    },
    dayDate: {
        width: 100,
        fontSize: 12,
        color: colors.gray,
    },
    dayBar: {
        flex: 1,
        height: 8,
        backgroundColor: colors.lightGray,
        borderRadius: 4,
        marginHorizontal: 10,
    },
    dayBarFill: {
        height: 8,
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    dayCount: {
        width: 30,
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.darkText,
        textAlign: 'right',
    },
    dayWeight: {
        width: 50,
        fontSize: 10,
        color: colors.gray,
        textAlign: 'right',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.darkText,
        marginBottom: 15,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: colors.lightGray,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: colors.darkText,
        textAlignVertical: 'top',
        minHeight: 100,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    modalButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginLeft: 10,
    },
    modalButtonCancel: {
        backgroundColor: colors.lightGray,
    },
    modalButtonSend: {
        backgroundColor: colors.primary,
    },
    modalButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.darkText,
    },
    errorText: {
        fontSize: 18,
        color: colors.error,
        textAlign: 'center',
        marginTop: 100,
    },
    modalText: {
        fontSize: 14,
        color: colors.gray,
        textAlign: 'center',
        marginBottom: 20,
    },
    modalCancelButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#e5e7eb',
        marginRight: 10,
    },
    modalCancelText: {
        color: colors.black,
        fontWeight: '600',
    },
    modalDeleteButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#ef4444',
    },
    modalDeleteText: {
        color: colors.white,
        fontWeight: '600',
    },
});
