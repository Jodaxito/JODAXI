import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../themes/appTheme';
import { useAuth } from '../context/AuthContext';

export const DrawerMenu = ({ navigation }: DrawerContentComponentProps) => {
    const { user, isAuthenticated, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigation.navigate('Auth');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={40} color={colors.white} />
                </View>
                <Text style={styles.username}>
                    {isAuthenticated ? user?.name : 'Invitado'}
                </Text>
                <Text style={styles.email}>
                    {isAuthenticated ? user?.email : 'Inicia sesión para continuar'}
                </Text>
            </View>

            <View style={styles.menuContainer}>
                <TouchableOpacity
                    style={styles.menuBtn}
                    onPress={() => navigation.navigate('Home')}
                >
                    <View style={styles.menuItem}>
                        <Ionicons name="home-outline" size={24} color={colors.primary} />
                        <Text style={styles.textBtn}>Inicio</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuBtn}
                    onPress={() => navigation.navigate('CreateProduct')}
                >
                    <View style={styles.menuItem}>
                        <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                        <Text style={styles.textBtn}>Publicar</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuBtn}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <View style={styles.menuItem}>
                        <Ionicons name="person-outline" size={24} color={colors.primary} />
                        <Text style={styles.textBtn}>Perfil</Text>
                    </View>
                </TouchableOpacity>

                {isAuthenticated ? (
                    <TouchableOpacity
                        style={styles.menuBtn}
                        onPress={handleLogout}
                    >
                        <View style={styles.menuItem}>
                            <Ionicons name="log-out-outline" size={24} color={colors.primary} />
                            <Text style={styles.textBtn}>Cerrar Sesión</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.menuBtn}
                        onPress={() => navigation.navigate('Auth')}
                    >
                        <View style={styles.menuItem}>
                            <Ionicons name="log-in-outline" size={24} color={colors.primary} />
                            <Text style={styles.textBtn}>Iniciar Sesión</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        backgroundColor: colors.primary,
        padding: 20,
        alignItems: 'center',
        paddingTop: 50,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.white,
    },
    email: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.8,
    },
    menuContainer: {
        padding: 20,
    },
    menuBtn: {
        marginVertical: 5,
        borderWidth: 2,
        borderRadius: 10,
        borderColor: colors.primary,
        backgroundColor: colors.background,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        gap: 10,
    },
    textBtn: {
        fontSize: 16,
        color: colors.primaryDark,
        fontWeight: 'bold',
    },
});
