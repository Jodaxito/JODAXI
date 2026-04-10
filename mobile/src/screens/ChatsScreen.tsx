import React, { useState, useEffect } from 'react';
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
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../navigator/BottomTabNavigator';
import { colors } from '../themes/appTheme';
import { chatAPI } from '../api/productAPI';
import { useAuth } from '../context/AuthContext';

type Props = StackScreenProps<ProfileStackParamList, 'Chats'>;

interface Chat {
    id: number;
    userId: number;
    userName: string;
    userUsername: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    avatar?: string;
    productId?: number;
    productName?: string;
}

export const ChatsScreen = ({ navigation }: Props) => {
    const { user } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<number | null>(null);

    useEffect(() => {
        loadChats();
    }, []);

    const loadChats = async () => {
        try {
            setLoading(true);
            if (!user?.id) {
                setChats([]);
                return;
            }
            const response = await chatAPI.getAll(user.id);
            setChats(response.data.map((c: any) => ({
                id: c.id,
                userId: c.user_id,
                userName: c.other_user_name || c.user_name || 'Usuario',
                userUsername: c.user_username || 'usuario',
                lastMessage: c.last_message || '',
                timestamp: c.last_message_time || c.created_at,
                unreadCount: c.unread_count || 0,
                productId: c.product_id,
                productName: c.product_name
            })));
        } catch (error) {
            console.error('Error loading chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadChats();
        setRefreshing(false);
    };

    const handleDeleteChat = (chatId: number) => {
        setChatToDelete(chatId);
        setDeleteModalVisible(true);
    };

    const confirmDeleteChat = async () => {
        if (!chatToDelete) return;
        try {
            await chatAPI.deleteChat(chatToDelete);
            setDeleteModalVisible(false);
            setChatToDelete(null);
            loadChats();
        } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el chat');
        }
    };

    const cancelDeleteChat = () => {
        setDeleteModalVisible(false);
        setChatToDelete(null);
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Ayer';
        } else if (days < 7) {
            return date.toLocaleDateString('es-ES', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        }
    };

    const renderChatItem = ({ item }: { item: Chat }) => (
        <TouchableOpacity 
            style={styles.chatItem}
            onPress={() => navigation.navigate('ChatDetail', { 
                chatId: item.id, 
                userName: item.userName,
                productId: item.productId,
                productName: item.productName
            })}
        >
            <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={28} color={colors.white} />
                </View>
                {item.unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.unreadCount}</Text>
                    </View>
                )}
            </View>
            
            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={styles.userName}>{item.userName}</Text>
                    <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
                </View>
                
                {item.productName && (
                    <Text style={styles.productName} numberOfLines={1}>
                        {item.productName}
                    </Text>
                )}
                
                <Text 
                    style={[styles.lastMessage, item.unreadCount > 0 && styles.unreadMessage]} 
                    numberOfLines={1}
                >
                    {item.lastMessage}
                </Text>
            </View>
            
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteChat(item.id)}
            >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Ionicons name="chatbubbles-outline" size={80} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No tienes chats</Text>
            <Text style={styles.emptySubtitle}>
                Cuando contactes a un vendedor o comprador, tus conversaciones aparecerán aquí
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
                <Text style={styles.headerTitle}>Mis Chats</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="search-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : chats.length === 0 ? (
                <ScrollView
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {renderEmptyState()}
                </ScrollView>
            ) : (
                <FlatList
                    data={chats}
                    renderItem={renderChatItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListHeaderComponent={
                        <View style={styles.statsBar}>
                            <Text style={styles.statsText}>
                                {chats.length} {chats.length === 1 ? 'conversación' : 'conversaciones'}
                            </Text>
                        </View>
                    }
                    ListEmptyComponent={renderEmptyState}
                />
            )}

            {/* Modal de confirmación para eliminar chat */}
            {deleteModalVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Eliminar chat</Text>
                        <Text style={styles.modalText}>
                            ¿Estás seguro de que quieres eliminar esta conversación?
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalCancelButton} onPress={cancelDeleteChat}>
                                <Text style={styles.modalCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalDeleteButton} onPress={confirmDeleteChat}>
                                <Text style={styles.modalDeleteText}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: colors.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: colors.white,
    },
    badgeText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    chatInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
    },
    timestamp: {
        fontSize: 12,
        color: colors.gray,
    },
    productName: {
        fontSize: 12,
        color: colors.primary,
        marginBottom: 4,
    },
    lastMessage: {
        fontSize: 14,
        color: colors.gray,
    },
    unreadMessage: {
        color: '#374151',
        fontWeight: '600',
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
    deleteButton: {
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 24,
        width: '80%',
        maxWidth: 320,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 12,
    },
    modalText: {
        fontSize: 14,
        color: colors.gray,
        textAlign: 'center',
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalCancelButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#e5e7eb',
    },
    modalCancelText: {
        color: '#374151',
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

export default ChatsScreen;
