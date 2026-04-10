import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { HomeStackParamList } from '../navigator/BottomTabNavigator';
import { colors } from '../themes/appTheme';
import { Producto } from '../interfaces/ProductoInterface';
import { productAPI, chatAPI } from '../api/productAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

type Props = StackScreenProps<HomeStackParamList, 'ProductDetail'>;

export const ProductDetailScreen = ({ route, navigation }: Props) => {
    const { productId } = route.params;
    const { user } = useAuth();
    const [product, setProduct] = useState<Producto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        loadProduct();
        checkFavorite();
    }, [productId]);

    const checkFavorite = async () => {
        try {
            const favoritesJson = await AsyncStorage.getItem('favorites');
            const favorites: number[] = favoritesJson ? JSON.parse(favoritesJson) : [];
            setIsFavorite(favorites.includes(productId));
        } catch (error) {
            console.error('Error checking favorite:', error);
        }
    };

    const toggleFavorite = async () => {
        try {
            const favoritesJson = await AsyncStorage.getItem('favorites');
            let favorites: number[] = favoritesJson ? JSON.parse(favoritesJson) : [];
            
            if (isFavorite) {
                favorites = favorites.filter(id => id !== productId);
                Alert.alert('Favoritos', 'Producto eliminado de favoritos');
            } else {
                favorites.push(productId);
                Alert.alert('Favoritos', 'Producto agregado a favoritos');
            }
            
            await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const loadProduct = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getById(productId);
            setProduct(response.data);
        } catch (error) {
            console.error('Error loading product:', error);
            Alert.alert('Error', 'No se pudo cargar el producto');
        } finally {
            setLoading(false);
        }
    };

    const loadMyProducts = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getAll();
            // Filtrar solo los productos del usuario actual usando user_id
            const myProducts = response.data.filter((p: Producto) => p.user_id === user?.id);
            setProduct(myProducts[0]);
        } catch (error: any) {
            console.error('Error loading my products:', error);
            Alert.alert('Error', 'No se pudieron cargar los productos');
        } finally {
            setLoading(false);
        }
    };

    interface Chat {
        id: number;
        userId: number;
        userName: string;
        userUsername: string;
        lastMessage: string;
        timestamp: string;
        unreadCount: number;
        productId?: number;
        productName?: string;
    }

    const handleContact = async () => {
        if (!product?.user_id || !user?.id) {
            Alert.alert('Error', 'No se puede contactar al vendedor');
            return;
        }

        // No permitir contactarse a uno mismo
        if (product.user_id === user.id) {
            Alert.alert('Error', 'No puedes contactarte a ti mismo');
            return;
        }

        try {
            // Crear chat via API
            const chatData = {
                product_id: productId,
                product_name: product.nombre,
                participants: [
                    { user_id: user.id, user_name: user.name },
                    { user_id: product.user_id, user_name: product.user_name || 'Vendedor' }
                ]
            };
            
            const response = await chatAPI.create(chatData);
            const newChat = response.data;

            // Enviar mensaje inicial
            await chatAPI.sendMessage(newChat.id, {
                sender_id: user.id,
                text: 'Hola, me interesa tu producto'
            });

            // Navegar al chat
            navigation.navigate('ChatDetailScreen', {
                chatId: newChat.id,
                userName: product.user_name || 'Vendedor',
                productId: productId,
                productName: product.nombre
            });
        } catch (error: any) {
            console.error('Error creating chat:', error);
            Alert.alert('Error', 'No se pudo iniciar la conversación');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Producto no encontrado</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.gray} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
                    <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={28}
                        color={isFavorite ? colors.error : colors.gray}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: product.imagen || 'https://via.placeholder.com/300' }}
                        style={styles.productImage}
                    />
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.productName}>{product.nombre}</Text>
                    <Text style={styles.productPrice}>
                        {product.tipo_transaccion === 'donacion'
                            ? 'Gratis'
                            : product.tipo_transaccion === 'intercambio'
                                ? 'Intercambio'
                                : `$${product.precio}`}
                    </Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Descripción</Text>
                        <Text style={styles.description}>{product.descripcion}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Vendedor</Text>
                        <Text style={styles.sellerName}>{product.user_name || 'Usuario'}</Text>
                        <Text style={styles.sellerEmail}>{product.user_email}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.bottomContainer}>
                {product.user_id === user?.id ? (
                    <View style={styles.myProductBanner}>
                        <Text style={styles.myProductBannerText}>Esta es tu publicación</Text>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                        <Text style={styles.contactButtonText}>Contactar</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: colors.white,
    },
    backButton: {
        padding: 8,
    },
    favoriteButton: {
        padding: 8,
    },
    imageContainer: {
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 16,
    },
    productImage: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    infoContainer: {
        padding: 16,
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: colors.gray,
        lineHeight: 24,
    },
    sellerName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
    },
    sellerEmail: {
        fontSize: 14,
        color: colors.gray,
        marginTop: 4,
    },
    bottomContainer: {
        padding: 16,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    contactButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    myProductBanner: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    myProductBannerText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
