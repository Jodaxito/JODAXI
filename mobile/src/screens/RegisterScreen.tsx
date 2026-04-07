import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { colors } from '../themes/appTheme';
import { useAuth } from '../context/AuthContext';

type Props = StackScreenProps<any, 'RegisterScreen'>;

export const RegisterScreen = ({ navigation }: Props) => {
    const { register } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState<{[key: string]: string}>({});

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateUsername = (username: string) => {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!firstName.trim()) {
            newErrors.firstName = 'El nombre es requerido';
        } else if (firstName.trim().length < 2) {
            newErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
        }

        if (!lastName.trim()) {
            newErrors.lastName = 'Los apellidos son requeridos';
        } else if (lastName.trim().length < 2) {
            newErrors.lastName = 'Los apellidos deben tener al menos 2 caracteres';
        }

        if (!username.trim()) {
            newErrors.username = 'El nombre de usuario es requerido';
        } else if (!validateUsername(username)) {
            newErrors.username = 'El usuario debe tener 3-20 caracteres (letras, números y guiones bajos)';
        }

        if (!email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Ingresa un email válido (ej: usuario@dominio.com)';
        }

        if (!password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        } else if (password.length > 20) {
            newErrors.password = 'La contraseña no puede tener más de 20 caracteres';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        const fullName = `${firstName.trim()} ${lastName.trim()}`;

        setLoading(true);
        try {
            await register(fullName, username, email, password);
            // La navegación se maneja automáticamente en App.tsx
        } catch (error) {
            Alert.alert('Error', 'No se pudo crear la cuenta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Crear Cuenta</Text>
                        <Text style={styles.subtitle}>Únete a la comunidad universitaria</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Nombre(s)</Text>
                        <View style={[styles.inputContainer, errors.firstName && styles.inputError]}>
                            <Ionicons name="person-outline" size={20} color={errors.firstName ? colors.error : colors.gray} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Tu nombre"
                                value={firstName}
                                onChangeText={(text) => {
                                    setFirstName(text);
                                    if (errors.firstName) {
                                        setErrors({...errors, firstName: ''});
                                    }
                                }}
                            />
                        </View>
                        {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}

                        <Text style={styles.label}>Apellidos</Text>
                        <View style={[styles.inputContainer, errors.lastName && styles.inputError]}>
                            <Ionicons name="people-outline" size={20} color={errors.lastName ? colors.error : colors.gray} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Tus apellidos"
                                value={lastName}
                                onChangeText={(text) => {
                                    setLastName(text);
                                    if (errors.lastName) {
                                        setErrors({...errors, lastName: ''});
                                    }
                                }}
                            />
                        </View>
                        {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}

                        <Text style={styles.label}>Nombre de usuario</Text>
                        <View style={[styles.inputContainer, errors.username && styles.inputError]}>
                            <Ionicons name="at-outline" size={20} color={errors.username ? colors.error : colors.gray} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="tu_usuario"
                                value={username}
                                onChangeText={(text) => {
                                    setUsername(text);
                                    if (errors.username) {
                                        setErrors({...errors, username: ''});
                                    }
                                }}
                                autoCapitalize="none"
                            />
                        </View>
                        {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}

                        <Text style={styles.label}>Email universitario</Text>
                        <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                            <Ionicons name="mail-outline" size={20} color={errors.email ? colors.error : colors.gray} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="tu@universidad.edu"
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                    if (errors.email) {
                                        setErrors({...errors, email: ''});
                                    }
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

                        <Text style={styles.label}>Contraseña</Text>
                        <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                            <Ionicons name="lock-closed-outline" size={20} color={errors.password ? colors.error : colors.gray} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="********"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (errors.password) {
                                        setErrors({...errors, password: ''});
                                    }
                                }}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={colors.gray}
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

                        <Text style={styles.label}>Confirmar contraseña</Text>
                        <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                            <Ionicons name="lock-closed-outline" size={20} color={errors.confirmPassword ? colors.error : colors.gray} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="********"
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    if (errors.confirmPassword) {
                                        setErrors({...errors, confirmPassword: ''});
                                    }
                                }}
                                secureTextEntry={!showPassword}
                            />
                        </View>
                        {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

                        <TouchableOpacity
                            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    header: {
        marginBottom: 24,
    },
    backButton: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.gray,
    },
    form: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        marginTop: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 16,
        height: 50,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
    },
    inputError: {
        borderColor: colors.error,
        borderWidth: 2,
    },
    errorText: {
        color: colors.error,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    registerButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    registerButtonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
