import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../navigator/BottomTabNavigator';
import { colors } from '../themes/appTheme';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productAPI } from '../api/productAPI';

type Props = StackScreenProps<ProfileStackParamList, 'Settings'>;

export const SettingsScreen = ({ navigation }: Props) => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    
    // Estados para editar perfil
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    
    // Estados para cambiar contraseña
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const handleSaveProfile = async () => {
        if (!name.trim() || !username.trim() || !email.trim()) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        setLoading(true);
        try {
            const updatedUser = {
                ...user,
                name: name.trim(),
                username: username.trim(),
                email: email.trim(),
            };
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            Alert.alert('Éxito', 'Perfil actualizado correctamente');
            setEditMode(false);
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            Alert.alert('Error', 'Completa todos los campos');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            // Simulación de cambio de contraseña
            await new Promise(resolve => setTimeout(resolve, 1000));
            Alert.alert('Éxito', 'Contraseña actualizada correctamente');
            setShowPasswordForm(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error) {
            Alert.alert('Error', 'No se pudo cambiar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Eliminar cuenta',
            '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Confirmar eliminación',
                            'Todos tus datos y productos serán eliminados permanentemente. ¿Continuar?',
                            [
                                { text: 'Cancelar', style: 'cancel' },
                                {
                                    text: 'Sí, eliminar',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            await AsyncStorage.clear();
                                            await logout();
                                            Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido eliminada correctamente');
                                        } catch (error) {
                                            Alert.alert('Error', 'No se pudo eliminar la cuenta');
                                        }
                                    },
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const renderEditProfile = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Editar Perfil</Text>
            <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Nombre de usuario"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.buttonDisabled]}
                    onPress={handleSaveProfile}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>Guardar cambios</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setEditMode(false)}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderChangePassword = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>
            <TextInput
                style={styles.input}
                placeholder="Contraseña actual"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Nueva contraseña"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Confirmar nueva contraseña"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry
            />
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.buttonDisabled]}
                    onPress={handleChangePassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>Cambiar contraseña</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowPasswordForm(false)}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.gray} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Configuración</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                {/* Información del perfil */}
                <View style={styles.profileSection}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={40} color={colors.white} />
                    </View>
                    <Text style={styles.profileName}>{user?.name}</Text>
                    <Text style={styles.profileUsername}>@{user?.username}</Text>
                    <Text style={styles.profileEmail}>{user?.email}</Text>
                </View>

                {/* Botones de acción */}
                {!editMode && !showPasswordForm && (
                    <>
                        <View style={styles.menuSection}>
                            <TouchableOpacity 
                                style={styles.menuItem}
                                onPress={() => setEditMode(true)}
                            >
                                <View style={styles.menuIcon}>
                                    <Ionicons name="person-outline" size={22} color={colors.primary} />
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuTitle}>Editar perfil</Text>
                                    <Text style={styles.menuSubtitle}>Cambiar nombre, usuario, email</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.gray} />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.menuItem}
                                onPress={() => setShowPasswordForm(true)}
                            >
                                <View style={styles.menuIcon}>
                                    <Ionicons name="lock-closed-outline" size={22} color={colors.primary} />
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuTitle}>Cambiar contraseña</Text>
                                    <Text style={styles.menuSubtitle}>Actualizar tu contraseña</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.gray} />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.menuItem}
                                onPress={() => navigation.navigate('MyProducts')}
                            >
                                <View style={styles.menuIcon}>
                                    <Ionicons name="cube-outline" size={22} color={colors.primary} />
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuTitle}>Mis productos</Text>
                                    <Text style={styles.menuSubtitle}>Gestionar tus publicaciones</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.gray} />
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.menuItem}
                                onPress={() => navigation.navigate('Favorites')}
                            >
                                <View style={styles.menuIcon}>
                                    <Ionicons name="heart-outline" size={22} color={colors.primary} />
                                </View>
                                <View style={styles.menuContent}>
                                    <Text style={styles.menuTitle}>Mis favoritos</Text>
                                    <Text style={styles.menuSubtitle}>Ver tus productos guardados</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.gray} />
                            </TouchableOpacity>
                        </View>

                        {/* Zona de peligro */}
                        <View style={styles.dangerSection}>
                            <Text style={styles.dangerTitle}>Zona de peligro</Text>
                            <TouchableOpacity 
                                style={styles.deleteButton}
                                onPress={handleDeleteAccount}
                            >
                                <Ionicons name="trash-outline" size={22} color={colors.error} />
                                <Text style={styles.deleteButtonText}>Eliminar cuenta</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {/* Formularios */}
                {editMode && renderEditProfile()}
                {showPasswordForm && renderChangePassword()}
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
    placeholder: {
        width: 24,
    },
    content: {
        flex: 1,
    },
    profileSection: {
        backgroundColor: colors.primary,
        padding: 24,
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 4,
    },
    profileUsername: {
        fontSize: 16,
        color: colors.white,
        opacity: 0.9,
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.7,
    },
    menuSection: {
        backgroundColor: colors.white,
        marginTop: 16,
        paddingHorizontal: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContent: {
        flex: 1,
        marginLeft: 16,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    menuSubtitle: {
        fontSize: 14,
        color: colors.gray,
        marginTop: 2,
    },
    section: {
        backgroundColor: colors.white,
        margin: 16,
        padding: 16,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#374151',
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    saveButton: {
        flex: 1,
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#e5e7eb',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#374151',
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    dangerSection: {
        backgroundColor: colors.white,
        margin: 16,
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
    },
    dangerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.error,
        marginBottom: 12,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.error + '15',
        padding: 16,
        borderRadius: 8,
        gap: 12,
    },
    deleteButtonText: {
        color: colors.error,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default SettingsScreen;
