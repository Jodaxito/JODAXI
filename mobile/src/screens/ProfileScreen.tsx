import React, { useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../navigator/BottomTabNavigator';
import { colors } from '../themes/appTheme';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAILS = [
    '222410863@gmail.com',
    'al222410881@gmail.com',
    'al222410838@gmail.com'
];

type Props = StackScreenProps<ProfileStackParamList, 'Profile'>;

export const ProfileScreen = ({ navigation }: Props) => {
    const { user, userStats, logout } = useAuth();
    const isAdmin = user && ADMIN_EMAILS.includes(user.email);

    useEffect(() => {
        console.log('ProfileScreen - User data:', user);
    }, [user]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Mi Perfil</Text>
                </View>

                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={40} color={colors.white} />
                    </View>
                    <Text style={styles.userFullName}>{user?.name || 'Sin nombre'}</Text>
                    <Text style={styles.userName}>@{user?.username || 'sin_usuario'}</Text>
                    <Text style={styles.userEmail}>{user?.email || 'sin@email.com'}</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{userStats.productos}</Text>
                        <Text style={styles.statLabel}>Productos</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{userStats.ventas}</Text>
                        <Text style={styles.statLabel}>Ventas</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{userStats.compras}</Text>
                        <Text style={styles.statLabel}>Compras</Text>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    {isAdmin && (
                        <TouchableOpacity 
                            style={[styles.menuItem, { backgroundColor: '#fef3c7' }]}
                            onPress={() => navigation.navigate('AdminDashboard')}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: '#f59e0b' }]}>
                                <Ionicons name="shield-checkmark-outline" size={22} color={colors.white} />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={[styles.menuTitle, { color: '#92400e' }]}>Panel Admin</Text>
                                <Text style={styles.menuSubtitle}>Monitoreo y gestión</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#92400e" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Chats')}
                    >
                        <View style={styles.menuIcon}>
                            <Ionicons name="chatbubbles-outline" size={22} color={colors.primary} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Mis Chats</Text>
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
                            <Text style={styles.menuTitle}>Mis Productos</Text>
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
                            <Text style={styles.menuTitle}>Favoritos</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.gray} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <View style={styles.menuIcon}>
                            <Ionicons name="settings-outline" size={22} color={colors.primary} />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Configuración</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.gray} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={logout}
                >
                    <Ionicons name="log-out-outline" size={22} color={colors.error} />
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>
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
        padding: 16,
        backgroundColor: colors.white,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#374151',
    },
    profileCard: {
        backgroundColor: colors.primary,
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    userFullName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        color: colors.white,
        opacity: 0.9,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.7,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        padding: 20,
        justifyContent: 'space-around',
        marginTop: 16,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary,
    },
    statLabel: {
        fontSize: 14,
        color: colors.gray,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e5e7eb',
    },
    menuContainer: {
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
        fontSize: 12,
        color: colors.gray,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        marginTop: 16,
        padding: 20,
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.error,
    },
});
