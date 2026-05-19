import useAuth from '@/hooks/useAuth'
import { Button, View } from 'react-native'

export default function Login() {
    const { login } = useAuth()

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Button title="Entrar" onPress={login} />
        </View>
    )
}