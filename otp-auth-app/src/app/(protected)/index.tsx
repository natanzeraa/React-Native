import useAuth from '@/hooks/useAuth'
import { Button, View } from 'react-native'

export default function Index() {
    const { logout } = useAuth()
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Button title="Sair" onPress={logout} />
        </View>
    )
}