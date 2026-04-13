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
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../navigator/BottomTabNavigator';
import { colors } from '../themes/appTheme';
import { useAuth } from '../context/AuthContext';
import { productAPI, adminAPI } from '../api/productAPI';

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

// Transformada de Laplace para análisis de sistemas dinámicos de actividad
// Modelo: Sistema de primer orden con constante de tiempo tau
// L{decaimiento exponencial} = 1/(s + a) donde a = 1/tau
// L{crecimiento exponencial} = 1/(s - a)

interface ActivityData {
    daily: {
        products: { date: string; count: number }[];
        chats: { date: string; count: number }[];
        messages: { date: string; count: number }[];
    };
    totals: {
        products: number;
        chats: number;
        messages: number;
        users: number;
    };
}

const calculateLaplaceStats = (activityData: ActivityData) => {
    // Combinar todas las actividades (productos + chats + mensajes)
    const allActivities = [
        ...(activityData.daily?.products || []),
        ...(activityData.daily?.chats || []),
        ...(activityData.daily?.messages || [])
    ];
    
    // Agrupar por fecha
    const dailyData: { [key: string]: number } = {};
    allActivities.forEach(item => {
        const date = item.date;
        dailyData[date] = (dailyData[date] || 0) + item.count;
    });
    
    const dates = Object.keys(dailyData).sort();
    if (dates.length === 0) {
        return {
            total: 0,
            daily: [],
            average: 0,
            trend: 0,
            tau: 0,
            stability: 'estable',
            prediction: 0,
            growthRate: 0
        };
    }
    
    // Calcular tasa de crecimiento/decaimiento (modelo exponencial)
    // f(t) = A * e^(kt) donde k es la tasa
    // L{f(t)} = A/(s - k) para crecimiento, A/(s + |k|) para decaimiento
    
    const counts = dates.map(d => dailyData[d]);
    const totalCount = counts.reduce((a, b) => a + b, 0);
    const average = totalCount / dates.length;
    
    // Calcular tasa de crecimiento usando regresión logarítmica
    // ln(f(t)) = ln(A) + kt -> lineal en el tiempo
    let sumT = 0, sumLnF = 0, sumT2 = 0, sumTLnF = 0;
    let n = 0;
    
    counts.forEach((count, index) => {
        if (count > 0) {
            const t = index;
            const lnF = Math.log(count);
            sumT += t;
            sumLnF += lnF;
            sumT2 += t * t;
            sumTLnF += t * lnF;
            n++;
        }
    });
    
    // Pendiente k = (n*sum(T*lnF) - sumT*sumLnF) / (n*sumT2 - sumT^2)
    const growthRate = n > 1 ? 
        (n * sumTLnF - sumT * sumLnF) / (n * sumT2 - sumT * sumT) : 0;
    
    // Constante de tiempo tau para sistema de primer orden
    // Si k > 0 (crecimiento): tau representa tiempo para duplicar
    // Si k < 0 (decaimiento): tau = -1/k representa tiempo de vida media
    const tau = growthRate !== 0 ? Math.abs(1 / growthRate) : Infinity;
    
    // Determinar estabilidad del sistema
    // k ≈ 0: estable, k > 0: crecimiento inestable, k < 0: decaimiento
    let stability = 'estable';
    if (growthRate > 0.05) stability = 'crecimiento acelerado';
    else if (growthRate > 0.01) stability = 'crecimiento moderado';
    else if (growthRate < -0.05) stability = 'decaimiento rápido';
    else if (growthRate < -0.01) stability = 'decaimiento lento';
    
    // Predicción para el siguiente día usando transformada inversa
    // f(t+1) ≈ f(t) * e^k (modelo exponencial)
    const lastCount = counts[counts.length - 1] || average;
    const prediction = lastCount * Math.exp(growthRate);
    
    // Aplicar factor de ponderación de Laplace (decaimiento exponencial ponderado)
    // Cada día tiene peso e^(-t/tau) en el pasado
    const stats = dates.map((date, index) => {
        const count = dailyData[date];
        const t = dates.length - index - 1; // tiempo hacia atrás
        
        // Factor de Laplace: peso decreciente para datos antiguos
        // w(t) = e^(-t/tau) si tau es finito, si no w(t) = 1
        const laplaceWeight = tau !== Infinity ? Math.exp(-t / tau) : 1;
        const weightedValue = count * laplaceWeight;
        
        // Tendencia local (delta respecto al día anterior)
        const trend = index > 0 ? count - dailyData[dates[index - 1]] : 0;
        
        return {
            date,
            count,
            weightedValue: Math.round(weightedValue * 100) / 100,
            trend,
            laplaceWeight: Math.round(laplaceWeight * 100) / 100
        };
    });
    
    // Calcular tendencia global
    const trend = counts.length > 1 ? counts[counts.length - 1] - counts[0] : 0;
    
    return {
        total: totalCount,
        daily: stats,
        average: Math.round(average * 100) / 100,
        trend,
        tau: tau !== Infinity ? Math.round(tau * 10) / 10 : 0,
        stability,
        prediction: Math.round(prediction * 100) / 100,
        growthRate: Math.round(growthRate * 1000) / 1000
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

            // Cargar estadísticas de actividad del backend
            const activityRes = await adminAPI.getActivity();
            const activityData = activityRes.data || activityRes;
            
            // Calcular estadísticas con transformada de Laplace
            const laplaceStats = calculateLaplaceStats(activityData);
            setStats(laplaceStats);
        } catch (error) {
            console.error('Error cargando datos:', error);
            Alert.alert('Error', 'No se pudieron cargar los datos del servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = (productId: number) => {
        console.log('handleDeleteProduct llamado con ID:', productId);
        setProductToDelete(productId);
        setDeleteModalVisible(true);
    };

    const confirmDeleteProduct = async () => {
        console.log('confirmDeleteProduct llamado', productToDelete);
        if (!productToDelete) {
            console.log('No hay producto para eliminar');
            return;
        }
        try {
            console.log('Llamando a productAPI.delete con ID:', productToDelete);
            const result = await productAPI.delete(productToDelete);
            console.log('Resultado de delete:', result);
            setDeleteModalVisible(false);
            setProductToDelete(null);
            loadData();
        } catch (error) {
            console.error('Error al eliminar producto:', error);
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
            {/* Análisis de Laplace - Sistema Dinámico */}
            <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Análisis de Laplace - Sistema Dinámico</Text>
                <Text style={styles.statsSubtitle}>
                    Modelo: f(t) = A·e^(kt) | L = A/(s-k)
                </Text>
                <View style={styles.laplaceGrid}>
                    <View style={styles.laplaceBox}>
                        <Text style={styles.laplaceValue}>{stats?.growthRate || 0}</Text>
                        <Text style={styles.laplaceLabel}>Tasa k (1/día)</Text>
                    </View>
                    <View style={styles.laplaceBox}>
                        <Text style={styles.laplaceValue}>{stats?.tau || 0}d</Text>
                        <Text style={styles.laplaceLabel}>τ (Constante tiempo)</Text>
                    </View>
                    <View style={[styles.laplaceBox, { backgroundColor: stats?.growthRate > 0 ? '#d1fae5' : stats?.growthRate < 0 ? '#fee2e2' : '#f3f4f6' }]}>
                        <Text style={[styles.laplaceValue, { fontSize: 12 }]}>{stats?.stability || 'estable'}</Text>
                        <Text style={styles.laplaceLabel}>Estado del sistema</Text>
                    </View>
                    <View style={styles.laplaceBox}>
                        <Text style={styles.laplaceValue}>{stats?.prediction || 0}</Text>
                        <Text style={styles.laplaceLabel}>Predicción mañana</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Resumen General</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{stats?.total || 0}</Text>
                        <Text style={styles.statLabel}>Total Interacciones</Text>
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

            {/* Gráfico de actividad */}
            <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Gráfico de Actividad (Laplace)</Text>
                <Text style={styles.statsSubtitle}>
                    Evolución temporal de interacciones en la plataforma
                </Text>
                {stats?.daily && stats.daily.length > 0 && (
                    <LineChart
                        data={{
                            labels: stats.daily.map((day: any) => {
                                const dateObj = new Date(day.date);
                                return `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
                            }),
                            datasets: [{
                                data: stats.daily.map((day: any) => day.count)
                            }]
                        }}
                        width={width - 60}
                        height={220}
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: {
                                borderRadius: 16
                            },
                            propsForDots: {
                                r: '4',
                                strokeWidth: '2',
                                stroke: '#4CAF50'
                            }
                        }}
                        bezier
                        style={{
                            marginVertical: 8,
                            borderRadius: 16
                        }}
                    />
                )}
            </View>

            <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Actividad Diaria con Ponderación Laplace</Text>
                <Text style={styles.statsSubtitle}>
                    w(t) = e^(-t/τ) - Factor de decaimiento exponencial
                </Text>
                {stats?.daily?.map((day: any, index: number) => {
                    // Formatear fecha
                    const dateObj = new Date(day.date);
                    const formattedDate = dateObj.toLocaleDateString('es-ES', { 
                        month: 'short', 
                        day: 'numeric' 
                    });
                    return (
                    <View key={index} style={styles.dayRow}>
                        <Text style={styles.dayDate}>{formattedDate}</Text>
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
                    );
                })}
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
            <Modal
                animationType="fade"
                transparent={true}
                visible={deleteModalVisible}
                onRequestClose={cancelDeleteProduct}
            >
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
            </Modal>
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
        borderBottomColor: '#e5e7eb',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginHorizontal: 5,
        borderRadius: 25,
        backgroundColor: '#f3f4f6',
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
        color: '#111827',
    },
    productUser: {
        fontSize: 14,
        color: colors.gray,
        marginTop: 4,
    },
    productDate: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 4,
    },
    productBadge: {
        backgroundColor: '#f3f4f6',
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
        color: '#111827',
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
        color: '#111827',
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
    laplaceGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    laplaceBox: {
        width: (width - 70) / 2,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        alignItems: 'center',
    },
    laplaceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    laplaceLabel: {
        fontSize: 12,
        color: colors.gray,
        marginTop: 4,
        textAlign: 'center',
    },
    statBox: {
        width: (width - 70) / 2,
        backgroundColor: '#f3f4f6',
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
        borderBottomColor: '#e5e7eb',
    },
    dayDate: {
        width: 100,
        fontSize: 12,
        color: colors.gray,
    },
    dayBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#e5e7eb',
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
        color: '#111827',
        textAlign: 'right',
    },
    dayWeight: {
        width: 50,
        fontSize: 10,
        color: colors.gray,
        textAlign: 'right',
    },
    chartContainer: {
        flexDirection: 'row',
        height: 280,
        marginTop: 10,
    },
    yAxis: {
        width: 40,
        height: 250,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingRight: 5,
    },
    yAxisLabel: {
        fontSize: 10,
        color: colors.gray,
    },
    chartArea: {
        flex: 1,
        height: 250,
        position: 'relative',
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#e5e7eb',
    },
    lineChart: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 30,
    },
    lineSegment: {
        position: 'absolute',
        height: 2,
        backgroundColor: colors.primary,
        transformOrigin: 'left',
    },
    dataPoint: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        borderWidth: 2,
        borderColor: colors.white,
    },
    xAxis: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    xAxisLabel: {
        fontSize: 10,
        color: colors.gray,
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
        color: '#111827',
        marginBottom: 15,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: colors.lightGray,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#111827',
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
        backgroundColor: '#e5e7eb',
    },
    modalButtonSend: {
        backgroundColor: colors.primary,
    },
    modalButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
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
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
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
