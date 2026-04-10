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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { HomeStackParamList } from '../navigator/BottomTabNavigator';
import { colors } from '../themes/appTheme';
import { Producto } from '../interfaces/ProductoInterface';
import { productAPI } from '../api/productAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

type Props = StackScreenProps<HomeStackParamList, 'Home'>;

const TRANSACTION_TYPES = {
    venta: { label: 'Venta', icon: 'cash-outline', color: colors.primary },
    donacion: { label: 'Donación', icon: 'gift-outline', color: colors.accent },
    intercambio: { label: 'Intercambio', icon: 'swap-horizontal-outline', color: '#3b82f6' },
};

export const HomeScreen = ({ navigation }: Props) => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Producto[]>([]);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
        loadFavorites();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadProducts();
            loadFavorites();
        }, [])
    );

    const loadFavorites = async () => {
        try {
            const favoritesJson = await AsyncStorage.getItem('favorites');
            if (favoritesJson) {
                setFavorites(JSON.parse(favoritesJson));
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    const toggleFavorite = async (productId: number) => {
        try {
            let newFavorites;
            if (favorites.includes(productId)) {
                newFavorites = favorites.filter(id => id !== productId);
                Alert.alert('Favoritos', 'Producto eliminado de favoritos');
            } else {
                newFavorites = [...favorites, productId];
                Alert.alert('Favoritos', 'Producto agregado a favoritos');
            }
            setFavorites(newFavorites);
            await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const loadProducts = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getAll();
            console.log('Productos cargados:', response.data.length);
            console.log('Productos:', JSON.stringify(response.data, null, 2));
            setProducts(response.data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadProducts();
        await loadFavorites();
        setRefreshing(false);
    };

    const renderProductCard = ({ item }: { item: Producto }) => {
        const typeInfo = TRANSACTION_TYPES[item.tipo_transaccion as keyof typeof TRANSACTION_TYPES] || TRANSACTION_TYPES.venta;
        const isFavorite = favorites.includes(item.id);
        const isMyProduct = item.user_id === user?.id;

        return (
            <View style={styles.productCard}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                    activeOpacity={0.9}
                >
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: item.imagen || 'https://via.placeholder.com/150' }}
                            style={styles.productImage}
                        />
                        <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '20' }]}>
                            <Text style={[styles.typeText, { color: typeInfo.color }]}>
                                {typeInfo.label}
                            </Text>
                        </View>
                        {isMyProduct && (
                            <View style={styles.myProductBadge}>
                                <Text style={styles.myProductText}>Mi publicación</Text>
                            </View>
                        )}
                        <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={() => toggleFavorite(item.id)}
                        >
                            <Ionicons
                                name={isFavorite ? 'heart' : 'heart-outline'}
                                size={24}
                                color={isFavorite ? colors.error : colors.white}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                            {item.nombre}
                        </Text>
                        <Text style={styles.productPrice}>
                            {item.tipo_transaccion === 'donacion'
                                ? 'Gratis'
                                : item.tipo_transaccion === 'intercambio'
                                    ? 'Intercambio'
                                    : `$${item.precio}`}
                        </Text>
                        <Text style={styles.productCondition}>{item.estado}</Text>
                        {!isMyProduct && (
                            <Text style={styles.sellerName}>@{item.user_name || 'usuario'}</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>JODAXI</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProductCard}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.productRow}
                    contentContainerStyle={styles.productsList}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={48} color={colors.gray} />
                            <Text style={styles.emptyText}>No hay productos disponibles</Text>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productsList: {
        padding: 8,
    },
    productRow: {
        justifyContent: 'space-between',
    },
    productCard: {
        width: '48%',
        backgroundColor: colors.white,
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    imageContainer: {
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    typeBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    myProductBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    myProductText: {
        fontSize: 10,
        fontWeight: '600',
        color: colors.white,
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 6,
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },
    productCondition: {
        fontSize: 12,
        color: colors.gray,
    },
    sellerName: {
        fontSize: 12,
        color: colors.primary,
        marginTop: 4,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 14,
        color: colors.gray,
        marginTop: 12,
    },
});
