import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../navigator/BottomTabNavigator';
import { colors } from '../themes/appTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

type Props = StackScreenProps<ProfileStackParamList, 'ChatDetail'>;

interface Message {
    id: number;
    chatId: number;
    senderId: number;
    text: string;
    timestamp: string;
    isRead: boolean;
}

interface Chat {
    id: number;
    userId: number;
    userName: string;
    userUsername: string;
    productId?: number;
    productName?: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
}

export const ChatDetailScreen = ({ route, navigation }: Props) => {
    const { chatId, userName, productId, productName } = route.params as { 
        chatId: number; 
        userName: string; 
        productId?: number;
        productName?: string;
    };
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        loadMessages();
        markMessagesAsRead();
    }, [chatId]);

    const loadMessages = async () => {
        try {
            const messagesJson = await AsyncStorage.getItem(`messages_${chatId}`);
            if (messagesJson) {
                setMessages(JSON.parse(messagesJson));
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const markMessagesAsRead = async () => {
        try {
            const chatsJson = await AsyncStorage.getItem('chats');
            if (chatsJson) {
                const chats: Chat[] = JSON.parse(chatsJson);
                const updatedChats = chats.map(chat => 
                    chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
                );
                await AsyncStorage.setItem('chats', JSON.stringify(updatedChats));
            }
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: Date.now(),
            chatId,
            senderId: user?.id || 0,
            text: inputText.trim(),
            timestamp: new Date().toISOString(),
            isRead: false,
        };

        try {
            const updatedMessages = [...messages, newMessage];
            setMessages(updatedMessages);
            await AsyncStorage.setItem(`messages_${chatId}`, JSON.stringify(updatedMessages));
            
            // Update chat last message
            const chatsJson = await AsyncStorage.getItem('chats');
            if (chatsJson) {
                const chats: Chat[] = JSON.parse(chatsJson);
                const chatIndex = chats.findIndex(c => c.id === chatId);
                if (chatIndex >= 0) {
                    chats[chatIndex].lastMessage = inputText.trim();
                    chats[chatIndex].timestamp = new Date().toISOString();
                    await AsyncStorage.setItem('chats', JSON.stringify(chats));
                }
            }
            
            setInputText('');
            flatListRef.current?.scrollToEnd({ animated: true });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMyMessage = item.senderId === user?.id;
        
        return (
            <View style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
            ]}>
                <View style={[
                    styles.messageBubble,
                    isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isMyMessage ? styles.myMessageText : styles.otherMessageText
                    ]}>
                        {item.text}
                    </Text>
                    <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.gray} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerName}>{userName}</Text>
                    {productName && (
                        <Text style={styles.headerProduct}>Re: {productName}</Text>
                    )}
                </View>
                <View style={styles.placeholder} />
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.messagesList}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                Inicia la conversación enviando un mensaje
                            </Text>
                        </View>
                    }
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Escribe un mensaje..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={sendMessage}
                        disabled={!inputText.trim()}
                    >
                        <Ionicons name="send" size={20} color={colors.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
    },
    headerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
    },
    headerProduct: {
        fontSize: 12,
        color: colors.gray,
        marginTop: 2,
    },
    placeholder: {
        width: 24,
    },
    keyboardView: {
        flex: 1,
    },
    messagesList: {
        padding: 16,
        flexGrow: 1,
    },
    messageContainer: {
        marginBottom: 12,
        flexDirection: 'row',
    },
    myMessageContainer: {
        justifyContent: 'flex-end',
    },
    otherMessageContainer: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 16,
    },
    myMessageBubble: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    otherMessageBubble: {
        backgroundColor: colors.white,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    myMessageText: {
        color: colors.white,
    },
    otherMessageText: {
        color: '#374151',
    },
    messageTime: {
        fontSize: 11,
        marginTop: 4,
        opacity: 0.7,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        color: colors.gray,
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    input: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 16,
        color: '#374151',
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});

export default ChatDetailScreen;
