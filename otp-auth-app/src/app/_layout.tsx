import AuthProvider from '@/contexts/authContext'
import { Stack } from 'expo-router'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function Layout() {
    return (
        <AuthProvider>
            <SafeAreaProvider style={{
                backgroundColor: '#7300ff',
            }}>
                <SafeAreaView style={{ flex: 1 }} edges={['top']}>

                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen
                            name="(protected)"
                            options={{ animation: 'none' }}
                        />
                        <Stack.Screen
                            name="login"
                            options={{ animation: 'none' }}
                        />
                    </Stack>
                </SafeAreaView>
            </SafeAreaProvider>
        </AuthProvider>
    )
}