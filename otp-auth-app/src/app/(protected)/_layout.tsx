import useAuth from '@/hooks/useAuth'
import { Redirect, Stack } from 'expo-router'
import { ActivityIndicator } from 'react-native'

export default function ProtectedLayout() {
    const { isLoggedIn, isReady } = useAuth()

    if (!isReady) {
        return <ActivityIndicator style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
        }} />
    }

    if (!isLoggedIn) {
        return <Redirect href="/login" />
    }

    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{ title: 'Home' }}
            />
        </Stack>
    )
}