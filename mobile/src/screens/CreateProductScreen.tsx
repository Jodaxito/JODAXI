import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { HomeStackParamList } from '../navigator/BottomTabNavigator';
import { colors } from '../themes/appTheme';
import { productAPI } from '../api/productAPI';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

type Props = StackScreenProps<HomeStackParamList, 'CreateProduct'>;

const TRANSACTION_TYPES = [
    { id: 'venta', label: 'Venta' },
    { id: 'donacion', label: 'Donación' },
    { id: 'intercambio', label: 'Intercambio' },
];

const CATEGORIES = [
    { id: 'Electrónica', label: 'Electrónica', icon: 'phone-portrait-outline' },
    { id: 'Ropa', label: 'Ropa', icon: 'shirt-outline' },
    { id: 'Hogar', label: 'Hogar', icon: 'home-outline' },
    { id: 'Deportes', label: 'Deportes', icon: 'basketball-outline' },
    { id: 'Libros', label: 'Libros', icon: 'book-outline' },
    { id: 'Vehículos', label: 'Vehículos', icon: 'car-outline' },
    { id: 'Otros', label: 'Otros', icon: 'pricetag-outline' },
];

const CONDITIONS = ['Nuevo', 'Como nuevo', 'Buen estado', 'Usado', 'Para reparar'];

export const CreateProductScreen = ({ navigation, route }: Props) => {
    const editingProduct = route.params?.product;
    const isEditing = !!editingProduct;

    const [name, setName] = useState(editingProduct?.nombre || '');
    const [description, setDescription] = useState(editingProduct?.descripcion || '');
    const [price, setPrice] = useState(editingProduct?.precio?.toString() || '');
    const [selectedType, setSelectedType] = useState(editingProduct?.tipo_transaccion || 'venta');
    const [selectedCategory, setSelectedCategory] = useState(editingProduct?.categoria || 'Otros');
    const [selectedCondition, setSelectedCondition] = useState(editingProduct?.estado || 'Nuevo');
    const [image, setImage] = useState<string | null>(editingProduct?.imagen || null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim() || !description.trim()) {
            Alert.alert('Error', 'Completa todos los campos obligatorios');
            return;
        }

        if (!user?.id) {
            Alert.alert('Error', 'Debes iniciar sesión para publicar un producto');
            return;
        }

        setLoading(true);
        try {
            const productData = {
                nombre: name.trim(),
                descripcion: description.trim(),
                precio: selectedType === 'donacion' ? 0 : parseFloat(price) || 0,
                estado: selectedCondition,
                categoria: selectedCategory,
                tipo_transaccion: selectedType,
                imagen: image || null,
                user_id: user.id,
                user_name: user.name || 'Usuario',
                user_email: user.email || '',
            };

            console.log('Enviando producto:', productData);

            if (isEditing) {
                await productAPI.update(editingProduct.id, productData);
                Alert.alert('Éxito', 'Producto actualizado correctamente');
            } else {
                await productAPI.create(productData);
                Alert.alert('Éxito', 'Producto publicado correctamente');
            }
            navigation.goBack();
        } catch (error: any) {
            console.error('Error publicando producto:', error);
            Alert.alert('Error', error.message || 'No se pudo publicar el producto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color={colors.gray} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</Text>
                <TouchableOpacity
                    style={[styles.publishButton, loading && styles.publishButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <Text style={styles.publishButtonText}>{isEditing ? 'Guardar' : 'Publicar'}</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.selectedImage} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="camera-outline" size={40} color={colors.gray} />
                            <Text style={styles.imagePlaceholderText}>Agregar foto</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.form}>
                    <Text style={styles.label}>Nombre *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre del producto"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Descripción *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe tu producto"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />

                    <Text style={styles.label}>Categoría</Text>
                    <View style={styles.categoriesContainer}>
                        {CATEGORIES.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryChip,
                                    selectedCategory === category.id && styles.categoryChipActive,
                                ]}
                                onPress={() => setSelectedCategory(category.id)}
                            >
                                <Ionicons 
                                    name={category.icon as any} 
                                    size={16} 
                                    color={selectedCategory === category.id ? colors.white : colors.primary} 
                                    style={{ marginRight: 6 }}
                                />
                                <Text
                                    style={[
                                        styles.categoryChipText,
                                        selectedCategory === category.id && styles.categoryChipTextActive,
                                    ]}
                                >
                                    {category.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Tipo de transacción</Text>
                    <View style={styles.typeContainer}>
                        {TRANSACTION_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                style={[
                                    styles.typeButton,
                                    selectedType === type.id && styles.typeButtonActive,
                                ]}
                                onPress={() => setSelectedType(type.id)}
                            >
                                <Text
                                    style={[
                                        styles.typeButtonText,
                                        selectedType === type.id && styles.typeButtonTextActive,
                                    ]}
                                >
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {selectedType === 'venta' && (
                        <>
                            <Text style={styles.label}>Precio</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="decimal-pad"
                            />
                        </>
                    )}

                    <Text style={styles.label}>Estado</Text>
                    <View style={styles.conditionsContainer}>
                        {CONDITIONS.map((condition) => (
                            <TouchableOpacity
                                key={condition}
                                style={[
                                    styles.conditionChip,
                                    selectedCondition === condition && styles.conditionChipActive,
                                ]}
                                onPress={() => setSelectedCondition(condition)}
                            >
                                <Text
                                    style={[
                                        styles.conditionChipText,
                                        selectedCondition === condition && styles.conditionChipTextActive,
                                    ]}
                                >
                                    {condition}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
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
    publishButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    publishButtonDisabled: {
        opacity: 0.7,
    },
    publishButtonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    imagePicker: {
        margin: 16,
        height: 200,
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        marginTop: 8,
        fontSize: 16,
        color: colors.gray,
    },
    form: {
        padding: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#374151',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    typeButton: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingVertical: 12,
        alignItems: 'center',
    },
    typeButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    typeButtonText: {
        fontSize: 14,
        color: colors.gray,
    },
    typeButtonTextActive: {
        color: colors.white,
        fontWeight: '600',
    },
    conditionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    categoryChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryChipText: {
        fontSize: 13,
        color: '#374151',
    },
    categoryChipTextActive: {
        color: colors.white,
        fontWeight: '500',
    },
    conditionChip: {
        backgroundColor: colors.white,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    conditionChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    conditionChipText: {
        fontSize: 14,
        color: '#374151',
    },
    conditionChipTextActive: {
        color: colors.white,
        fontWeight: '500',
    },
});
