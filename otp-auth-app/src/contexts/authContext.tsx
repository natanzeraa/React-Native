import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { createContext, PropsWithChildren, useEffect, useState } from 'react'

type AuthState = {
    isLoggedIn: boolean
    isReady: boolean
    login: () => void
    logout: () => void
}

export const AuthContext = createContext<AuthState>({} as AuthState)

export default function AuthProvider({ children }: PropsWithChildren) {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isReady, setIsReady] = useState(false)

    const AUTH_STORAGE_KEY = '@otp-auth-app:auth-state'

    async function storeState(newState: { isLoggedIn: boolean }) {
        try {
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState))

        } catch (error) {
            console.log(error)
        }
    }

    function login() {
        setIsLoggedIn(true)
        storeState({ isLoggedIn: true })
        router.replace('/')
        console.log('Entrou (la ele pro max)')
    }

    function logout() {
        setIsLoggedIn(false)
        storeState({ isLoggedIn: false })
        router.replace('/login')
        console.log('Saiu')
    }

    useEffect(() => {
        async function loadStorageState() {
            try {
                const storedState = await AsyncStorage.getItem(AUTH_STORAGE_KEY)
                const state = storedState ? JSON.parse(storedState) : null
                console.log('STORAGE: ', state)
                setIsLoggedIn(state?.isLoggedIn ?? false)
            } catch (error) {
                console.log(error)
            } finally {
                setIsReady(true)
            }
        }
        loadStorageState()
    }, [])

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, isReady }} >
            {children}
        </AuthContext.Provider>
    )
}