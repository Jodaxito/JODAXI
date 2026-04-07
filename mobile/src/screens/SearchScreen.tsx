import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Image,
    ScrollView,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { SearchStackParamList } from '../navigator/BottomTabNavigator';
import { colors } from '../themes/appTheme';
import { productAPI } from '../api/api';
import { useFocusEffect } from '@react-navigation/native';

type Props = StackScreenProps<SearchStackParamList, 'Search'>;

interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    estado: string;
    tipo_transaccion: string;
    imagen: string;
    categoria: string;
    user_name: string;
    created_at: string;
}

const CATEGORIAS = [
    { id: 'todos', label: 'Todos', icon: 'apps-outline' },
    { id: 'Electrónica', label: 'Electrónica', icon: 'phone-portrait-outline' },
    { id: 'Ropa', label: 'Ropa', icon: 'shirt-outline' },
    { id: 'Hogar', label: 'Hogar', icon: 'home-outline' },
    { id: 'Deportes', label: 'Deportes', icon: 'basketball-outline' },
    { id: 'Libros', label: 'Libros', icon: 'book-outline' },
    { id: 'Vehículos', label: 'Vehículos', icon: 'car-outline' },
    { id: 'Otros', label: 'Otros', icon: 'pricetag-outline' },
];

const ESTADOS = [
    { id: 'todos', label: 'Todos' },
    { id: 'nuevo', label: 'Nuevo' },
    { id: 'seminuevo', label: 'Seminuevo' },
    { id: 'usado', label: 'Usado' },
];

const TIPO_TRANSACCION = [
    { id: 'todos', label: 'Todos' },
    { id: 'venta', label: 'Venta' },
    { id: 'intercambio', label: 'Intercambio' },
    { id: 'donacion', label: 'Donación' },
];

export const SearchScreen = ({ navigation }: Props) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [productos, setProductos] = useState<Producto[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Filtros
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
    const [estadoSeleccionado, setEstadoSeleccionado] = useState('todos');
    const [tipoSeleccionado, setTipoSeleccionado] = useState('todos');
    const [precioMaximo, setPrecioMaximo] = useState(10000);
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            loadProducts();
        }, [])
    );

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await productAPI.getAll();
            const allProducts = response.data || [];
            setProductos(allProducts);
            setFilteredProducts(allProducts);
        } catch (error) {
            console.error('Error cargando productos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        applyFilters();
    }, [searchQuery, categoriaSeleccionada, estadoSeleccionado, tipoSeleccionado, precioMaximo, productos]);

    const applyFilters = () => {
        let filtered = productos;

        // Filtro por búsqueda de texto
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
                p.nombre?.toLowerCase().includes(query) ||
                p.descripcion?.toLowerCase().includes(query) ||
                p.user_name?.toLowerCase().includes(query)
            );
        }

        // Filtro por categoría
        if (categoriaSeleccionada !== 'todos') {
            filtered = filtered.filter(p => p.categoria === categoriaSeleccionada);
        }

        // Filtro por estado
        if (estadoSeleccionado !== 'todos') {
            filtered = filtered.filter(p => p.estado === estadoSeleccionado);
        }

        // Filtro por tipo de transacción
        if (tipoSeleccionado !== 'todos') {
            filtered = filtered.filter(p => p.tipo_transaccion === tipoSeleccionado);
        }

        // Filtro por precio máximo
        filtered = filtered.filter(p => (p.precio || 0) <= precioMaximo);

        setFilteredProducts(filtered);
    };

    const clearFilters = () => {
        setCategoriaSeleccionada('todos');
        setEstadoSeleccionado('todos');
        setTipoSeleccionado('todos');
        setPrecioMaximo(10000);
        setSearchQuery('');
    };

    const renderProductItem = ({ item }: { item: Producto }) => (
        <TouchableOpacity 
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        >
            <Image
                source={{ uri: item.imagen || 'https://via.placeholder.com/150' }}
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.nombre}</Text>
                <Text style={styles.productPrice}>
                    {item.tipo_transaccion === 'donacion' ? 'Gratis' : `$${item.precio || 0}`}
                </Text>
                <View style={styles.productBadges}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.estado}</Text>
                    </View>
                    <View style={[styles.badge, styles.badgePrimary]}>
                        <Text style={[styles.badgeText, styles.badgeTextPrimary]}>{item.tipo_transaccion}</Text>
                    </View>
                </View>
                <Text style={styles.productUser}>Por: {item.user_name}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Buscar</Text>
            </View>
            
            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color={colors.gray} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={colors.gray} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Botón de filtros */}
            <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setMostrarFiltros(true)}
            >
                <Ionicons name="options-outline" size={20} color={colors.white} />
                <Text style={styles.filterButtonText}>Filtros</Text>
                {(categoriaSeleccionada !== 'todos' || estadoSeleccionado !== 'todos' || tipoSeleccionado !== 'todos') && (
                    <View style={styles.filterBadge}>
                        <Text style={styles.filterBadgeText}>!</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Resultados */}
            {filteredProducts.length > 0 ? (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.productRow}
                    contentContainerStyle={styles.productList}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={64} color={colors.lightGray} />
                    <Text style={styles.emptyText}>
                        {searchQuery || categoriaSeleccionada !== 'todos' 
                            ? 'No se encontraron productos' 
                            : 'Ingresa un término de búsqueda'}
                    </Text>
                    {(searchQuery || categoriaSeleccionada !== 'todos') && (
                        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                            <Text style={styles.clearButtonText}>Limpiar filtros</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Modal de filtros */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={mostrarFiltros}
                onRequestClose={() => setMostrarFiltros(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filtros</Text>
                            <TouchableOpacity onPress={() => setMostrarFiltros(false)}>
                                <Ionicons name="close" size={28} color={colors.darkText} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Categorías */}
                            <Text style={styles.filterSectionTitle}>Categoría</Text>
                            <View style={styles.categoriesGrid}>
                                {CATEGORIAS.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.categoryChip,
                                            categoriaSeleccionada === cat.id && styles.categoryChipActive
                                        ]}
                                        onPress={() => setCategoriaSeleccionada(cat.id)}
                                    >
                                        <Ionicons 
                                            name={cat.icon as any} 
                                            size={18} 
                                            color={categoriaSeleccionada === cat.id ? colors.white : colors.primary} 
                                        />
                                        <Text style={[
                                            styles.categoryChipText,
                                            categoriaSeleccionada === cat.id && styles.categoryChipTextActive
                                        ]}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Estado del producto */}
                            <Text style={styles.filterSectionTitle}>Estado</Text>
                            <View style={styles.optionsRow}>
                                {ESTADOS.map((estado) => (
                                    <TouchableOpacity
                                        key={estado.id}
                                        style={[
                                            styles.optionChip,
                                            estadoSeleccionado === estado.id && styles.optionChipActive
                                        ]}
                                        onPress={() => setEstadoSeleccionado(estado.id)}
                                    >
                                        <Text style={[
                                            styles.optionChipText,
                                            estadoSeleccionado === estado.id && styles.optionChipTextActive
                                        ]}>
                                            {estado.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Tipo de transacción */}
                            <Text style={styles.filterSectionTitle}>Tipo</Text>
                            <View style={styles.optionsRow}>
                                {TIPO_TRANSACCION.map((tipo) => (
                                    <TouchableOpacity
                                        key={tipo.id}
                                        style={[
                                            styles.optionChip,
                                            tipoSeleccionado === tipo.id && styles.optionChipActive
                                        ]}
                                        onPress={() => setTipoSeleccionado(tipo.id)}
                                    >
                                        <Text style={[
                                            styles.optionChipText,
                                            tipoSeleccionado === tipo.id && styles.optionChipTextActive
                                        ]}>
                                            {tipo.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Precio máximo */}
                            <Text style={styles.filterSectionTitle}>Precio máximo: ${precioMaximo}</Text>
                            <View style={styles.priceContainer}>
                                <Text style={styles.priceLabel}>$0</Text>
                                <View style={styles.sliderTrack}>
                                    <View style={[styles.sliderFill, { width: `${(precioMaximo / 10000) * 100}%` }]} />
                                </View>
                                <Text style={styles.priceLabel}>$10k</Text>
                            </View>
                            <View style={styles.priceButtons}>
                                {[100, 500, 1000, 2500, 5000, 10000].map((price) => (
                                    <TouchableOpacity
                                        key={price}
                                        style={[
                                            styles.priceButton,
                                            precioMaximo === price && styles.priceButtonActive
                                        ]}
                                        onPress={() => setPrecioMaximo(price)}
                                    >
                                        <Text style={[
                                            styles.priceButtonText,
                                            precioMaximo === price && styles.priceButtonTextActive
                                        ]}>
                                            ${price >= 1000 ? `${price/1000}k` : price}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Botones de acción */}
                            <View style={styles.modalActions}>
                                <TouchableOpacity 
                                    style={styles.clearFiltersButton}
                                    onPress={clearFilters}
                                >
                                    <Text style={styles.clearFiltersText}>Limpiar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.applyButton}
                                    onPress={() => setMostrarFiltros(false)}
                                >
                                    <Text style={styles.applyButtonText}>Aplicar</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        padding: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        margin: 16,
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        marginHorizontal: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
        gap: 8,
    },
    filterButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    filterBadge: {
        backgroundColor: colors.error,
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },
    filterBadgeText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    productList: {
        padding: 8,
        paddingBottom: 100,
    },
    productRow: {
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    productCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        width: '48%',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.darkText,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },
    productBadges: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 6,
    },
    badge: {
        backgroundColor: colors.lightBackground,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        color: colors.gray,
        textTransform: 'capitalize',
    },
    badgePrimary: {
        backgroundColor: colors.primary + '20',
    },
    badgeTextPrimary: {
        color: colors.primary,
    },
    productUser: {
        fontSize: 12,
        color: colors.gray,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 16,
        color: colors.gray,
        marginTop: 16,
        textAlign: 'center',
    },
    clearButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: colors.lightBackground,
        borderRadius: 8,
    },
    clearButtonText: {
        color: colors.primary,
        fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.darkText,
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.darkText,
        marginTop: 20,
        marginBottom: 12,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.lightBackground,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    categoryChipActive: {
        backgroundColor: colors.primary,
    },
    categoryChipText: {
        fontSize: 13,
        color: colors.darkText,
    },
    categoryChipTextActive: {
        color: colors.white,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionChip: {
        backgroundColor: colors.lightBackground,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    optionChipActive: {
        backgroundColor: colors.primary,
    },
    optionChipText: {
        fontSize: 13,
        color: colors.darkText,
    },
    optionChipTextActive: {
        color: colors.white,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 12,
    },
    priceLabel: {
        fontSize: 14,
        color: colors.gray,
        fontWeight: '600',
    },
    sliderTrack: {
        flex: 1,
        height: 6,
        backgroundColor: colors.lightGray,
        borderRadius: 3,
    },
    sliderFill: {
        height: 6,
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    priceButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    priceButton: {
        backgroundColor: colors.lightBackground,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    priceButtonActive: {
        backgroundColor: colors.primary,
    },
    priceButtonText: {
        fontSize: 12,
        color: colors.darkText,
    },
    priceButtonTextActive: {
        color: colors.white,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
    },
    clearFiltersButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.lightGray,
    },
    clearFiltersText: {
        color: colors.gray,
        fontWeight: '600',
        fontSize: 14,
    },
    applyButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    applyButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
});

export default SearchScreen;
