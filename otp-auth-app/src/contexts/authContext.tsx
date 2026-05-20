import { authService, AuthUser, LoginRequest } from '@/service/authService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { createContext, PropsWithChildren, useEffect, useState } from 'react'

type AuthState = {
    isLoggedIn: boolean
    isReady: boolean
    user: AuthUser | null
    login: (payload: LoginRequest) => Promise<void>
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthState>({} as AuthState)

export default function AuthProvider({ children }: PropsWithChildren) {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [user, setUser] = useState<AuthUser | null>(null)

    const AUTH_STORAGE_KEY = '@otp-auth-app:auth-state'

    async function storeState(session: {
        user: AuthUser
        accessToken: string
        refreshToken: string
    }) {
        try {
            await AsyncStorage.setItem(
                AUTH_STORAGE_KEY,
                JSON.stringify(session)
            )
        } catch (error) {
            console.log(error)
        }
    }

    async function login(payload: LoginRequest) {
        try {
            const response = await authService.login(payload)
            console.log('response: ', response)
            const { user, accessToken, refreshToken } = response.data

            await storeState({
                user,
                accessToken,
                refreshToken
            })

            setUser(user)
            setIsLoggedIn(true)

            router.replace('/')
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async function logout() {
        try {
            setUser(null)
            setIsLoggedIn(false)
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY)
            router.replace('/login')
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        async function loadStorageState() {
            try {
                const storedSession = await AsyncStorage.getItem(AUTH_STORAGE_KEY)
                const session = storedSession ? JSON.parse(storedSession) : null

                if (session) {
                    setUser(session.user)
                    setIsLoggedIn(true)
                }
            } catch (error) {
                console.log(error)
            } finally {
                setIsReady(true)
            }
        }
        loadStorageState()
    }, [])

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, isReady, user }} >
            {children}
        </AuthContext.Provider>
    )
}