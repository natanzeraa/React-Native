import { Button } from '@/components/base/button'
import { Title } from '@/components/base/title'
import useAuth from '@/hooks/useAuth'
import { router } from 'expo-router'
import { Eye, EyeOff } from 'lucide-react-native'
import { useState } from 'react'
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native'

export default function SignUp() {
    const { signup } = useAuth()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    // const [ twoFaEnabled, setTwoFaEnabled ] = useState(false);
    const [password, setPassword] = useState('')
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false)

    const isDisabled = !email.trim() || !password.trim()

    function handlePasswordVisibility() {
        setVisible(prev => !prev)
    }

    async function handleSignUp() {
        try {
            setLoading(true)

            await signup({name, email, password})

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Title style={styles.title}>
                            Crie sua conta
                        </Title>

                        <Text style={styles.subtitle}>
                            Crie sua conta
                        </Text>
                    </View>

                    {/* Card */}
                    <View style={styles.card}>
                        <TextInput
                            placeholder="Nome"
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            placeholderTextColor="#999"
                        />
                        <TextInput
                            placeholder="E-mail"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            placeholderTextColor="#999"
                        />

                        <View style={styles.passwordContainer}>
                            <TextInput
                                placeholder="Senha"
                                value={password}
                                onChangeText={setPassword}
                                style={styles.passwordInput}
                                secureTextEntry={!visible}
                                placeholderTextColor="#999"
                            />

                            <Pressable onPress={
                                handlePasswordVisibility
                            }
                            >
                                {visible ? (
                                    <EyeOff
                                        size={20}
                                        color="#666"
                                    />
                                ) : (
                                    <Eye
                                        size={20}
                                        color="#666"
                                    />
                                )}
                            </Pressable>
                        </View>

                        <Button
                            onPress={handleSignUp}
                            backgroundColor="#7300ff"
                            borderRadius={12}
                            isLoading={loading}
                            loadingText="Entrando..."
                            disabled={isDisabled}
                        >
                            <Text
                                style={
                                    styles.signUpButtonText
                                }
                            >
                                Criar
                            </Text>
                        </Button>
                        <Text style={styles.navText}>
                            Já possui uma conta?
                            <Text style={styles.navTextLink} onPress={() => router.push('/login')}> Entrar</Text>
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}


const styles = StyleSheet.create({
    flex: {
        flex: 1
    },

    safeArea: {
        flex: 1,
        backgroundColor: '#f4f4f6'
    },

    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24
    },

    container: {
        gap: 28
    },

    header: {
        alignItems: 'center',
        gap: 8
    },

    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111'
    },

    subtitle: {
        fontSize: 15,
        color: '#777'
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        gap: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: {
            width: 0,
            height: 6
        },
        elevation: 4
    },

    input: {
        height: 54,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        paddingHorizontal: 16,
        backgroundColor: '#fafafa',
        color: '#111'
    },

    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 54,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        paddingHorizontal: 16,
        backgroundColor: '#fafafa'
    },

    passwordInput: {
        flex: 1,
        color: '#111'
    },

    signUpButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15
    },
    navText: {
        textAlign: 'center'
    },
    navTextLink: {
        fontWeight: 'bold',
        color: '#7300ff'
    }
})