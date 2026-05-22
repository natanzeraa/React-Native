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

type AuthStorage = {
    accessToken: string
    refreshToken: string
}

type StoredData = {
    parsedAuth: AuthStorage | null
    parsedUser: AuthUser | null
}

export const AuthContext = createContext<AuthState>({} as AuthState)
export const AUTH_STORAGE_KEY = '@otp-auth-app:auth-state'
export const AUTH_USER_DATA_KEY = '@otp-auth-app:user-state'

export default function AuthProvider({ children }: PropsWithChildren) {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [user, setUser] = useState<AuthUser | null>(null)

    async function storeState(session: {
        user: AuthUser
        accessToken: string
        refreshToken: string
    }) {
        try {
            await AsyncStorage.setItem(
                AUTH_STORAGE_KEY,
                JSON.stringify({
                    accessToken: session.accessToken,
                    refreshToken: session.refreshToken
                })
            )
            await AsyncStorage.setItem(AUTH_USER_DATA_KEY, JSON.stringify(session.user))
        } catch (error) {
            console.log(error)
        }
    }

    async function getStoredData(): Promise<StoredData | null> {
        try {
            const authState = await AsyncStorage.getItem(AUTH_STORAGE_KEY)
            const userState = await AsyncStorage.getItem(AUTH_USER_DATA_KEY)

            const parsedAuth = authState ? JSON.parse(authState) : null
            const parsedUser = userState ? JSON.parse(userState) : null

            return { parsedAuth, parsedUser }
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async function login(payload: LoginRequest) {
        try {
            const response = await authService.login(payload)
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
            await AsyncStorage.removeItem(AUTH_USER_DATA_KEY)
            router.replace('/login')
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        async function loadStorageState() {
            try {
                const storage = await getStoredData()

                const hasSession = Boolean(
                    storage?.parsedAuth?.accessToken && storage?.parsedUser
                )

                if (hasSession) {
                    setUser(storage.parsedUser)
                    setIsLoggedIn(true)
                    return
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
