import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    RefreshControl,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../navigator/BottomTabNavigator';
import { colors } from '../themes/appTheme';
import { Producto } from '../interfaces/ProductoInterface';
import { productAPI } from '../api/productAPI';
import { useAuth } from '../context/AuthContext';

type Props = StackScreenProps<ProfileStackParamList, 'MyProducts'>;

const TRANSACTION_TYPES = {
    venta: { label: 'Venta', icon: 'cash-outline', color: colors.primary },
    donacion: { label: 'Donación', icon: 'gift-outline', color: colors.accent },
    intercambio: { label: 'Intercambio', icon: 'swap-horizontal-outline', color: '#3b82f6' },
};

export const MyProductsScreen = ({ navigation }: Props) => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Producto[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMyProducts();
    }, []);

    const loadMyProducts = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getAll();
            // Filtrar solo los productos del usuario actual usando user_id
            const myProducts = response.data.filter((p: Producto) => p.user_id === user?.id);
            setProducts(myProducts);
        } catch (error) {
            console.error('Error loading my products:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMyProducts();
        setRefreshing(false);
    };

    const handleDeleteProduct = (productId: number) => {
        Alert.alert(
            'Eliminar producto',
            '¿Estás seguro de que quieres eliminar este producto?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await productAPI.delete(productId);
                            loadMyProducts();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar el producto');
                        }
                    },
                },
            ]
        );
    };

    const handleEditProduct = (product: Producto) => {
        navigation.navigate('CreateProduct', { product });
    };

    const renderProduct = ({ item }: { item: Producto }) => {
        const typeInfo = TRANSACTION_TYPES[item.tipo_transaccion as keyof typeof TRANSACTION_TYPES];

        return (
            <View style={styles.productCard}>
                <Image
                    source={{ uri: item.imagen || 'https://via.placeholder.com/150' }}
                    style={styles.productImage}
                />
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.nombre}</Text>
                    <Text style={styles.productDescription} numberOfLines={2}>
                        {item.descripcion}
                    </Text>
                    <View style={styles.productFooter}>
                        <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '20' }]}>
                            <Ionicons name={typeInfo.icon as any} size={14} color={typeInfo.color} />
                            <Text style={[styles.typeText, { color: typeInfo.color }]}>
                                {typeInfo.label}
                            </Text>
                        </View>
                        {item.tipo_transaccion === 'venta' && (
                            <Text style={styles.price}>${item.precio}</Text>
                        )}
                    </View>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditProduct(item)}
                    >
                        <Ionicons name="create-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteProduct(item.id)}
                    >
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="cube-outline" size={80} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No tienes productos</Text>
            <Text style={styles.emptySubtitle}>
                ¡Publica tu primer producto y comienza a vender, donar o intercambiar!
            </Text>
            <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateProduct')}
            >
                <Ionicons name="add-circle-outline" size={24} color={colors.white} />
                <Text style={styles.createButtonText}>Crear mi primer producto</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.gray} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mis Productos</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('CreateProduct')}
                >
                    <Ionicons name="add" size={24} color={colors.white} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : products.length === 0 ? (
                <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {renderEmptyState()}
                </ScrollView>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListHeaderComponent={
                        <View style={styles.statsBar}>
                            <Text style={styles.statsText}>
                                {products.length} {products.length === 1 ? 'producto' : 'productos'} publicados
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
    },
    addButton: {
        backgroundColor: colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    statsBar: {
        backgroundColor: colors.primary + '15',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    statsText: {
        color: colors.primary,
        fontWeight: '600',
        textAlign: 'center',
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#e5e7eb',
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 4,
    },
    productDescription: {
        fontSize: 14,
        color: colors.gray,
        marginBottom: 8,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    editButton: {
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    deleteButton: {
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        marginTop: 60,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: colors.gray,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    createButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MyProductsScreen;
