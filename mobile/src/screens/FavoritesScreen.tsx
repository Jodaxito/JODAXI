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
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../navigator/BottomTabNavigator';
import { colors } from '../themes/appTheme';
import { Producto } from '../interfaces/ProductoInterface';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productAPI } from '../api/productAPI';

type Props = StackScreenProps<ProfileStackParamList, 'Favorites'>;

const TRANSACTION_TYPES = {
    venta: { label: 'Venta', icon: 'cash-outline', color: colors.primary },
    donacion: { label: 'Donación', icon: 'gift-outline', color: colors.accent },
    intercambio: { label: 'Intercambio', icon: 'swap-horizontal-outline', color: '#3b82f6' },
};

export const FavoritesScreen = ({ navigation }: Props) => {
    const [favorites, setFavorites] = useState<Producto[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            setLoading(true);
            // Obtener IDs de favoritos guardados
            const favoritesJson = await AsyncStorage.getItem('favorites');
            const favoriteIds: number[] = favoritesJson ? JSON.parse(favoritesJson) : [];
            
            // Obtener todos los productos y filtrar los favoritos
            const response = await productAPI.getAll();
            const allProducts = response.data;
            const favoriteProducts = allProducts.filter((p: Producto) => 
                favoriteIds.includes(p.id)
            );
            setFavorites(favoriteProducts);
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFavorites();
        setRefreshing(false);
    };

    const removeFromFavorites = async (productId: number) => {
        try {
            const favoritesJson = await AsyncStorage.getItem('favorites');
            const favoriteIds: number[] = favoritesJson ? JSON.parse(favoritesJson) : [];
            const updatedFavorites = favoriteIds.filter(id => id !== productId);
            await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            loadFavorites();
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };

    const renderProduct = ({ item }: { item: Producto }) => {
        const typeInfo = TRANSACTION_TYPES[item.tipo_transaccion as keyof typeof TRANSACTION_TYPES];

        return (
            <TouchableOpacity 
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            >
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
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => removeFromFavorites(item.id)}
                >
                    <Ionicons name="heart" size={24} color={colors.error} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="heart-outline" size={80} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No tienes favoritos</Text>
            <Text style={styles.emptySubtitle}>
                Explora los productos y guarda tus favoritos para verlos aquí
            </Text>
            <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Profile')}
            >
                <Ionicons name="search-outline" size={24} color={colors.white} />
                <Text style={styles.exploreButtonText}>Explorar productos</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.gray} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mis Favoritos</Text>
                <View style={styles.placeholder} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : favorites.length === 0 ? (
                <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {renderEmptyState()}
                </ScrollView>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListHeaderComponent={
                        <View style={styles.statsBar}>
                            <Text style={styles.statsText}>
                                {favorites.length} {favorites.length === 1 ? 'producto' : 'productos'} en favoritos
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
    placeholder: {
        width: 24,
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
    favoriteButton: {
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
    exploreButton: {
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
    exploreButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FavoritesScreen;
