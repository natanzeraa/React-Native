import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { router } from 'expo-router'

const AUTH_STORAGE_KEY = '@otp-auth-app:auth-state'

export const api = axios.create({
  baseURL: 'http://192.168.100.105:3001/api/v1'
})

api.interceptors.request.use(
  async (config) => {
    const publicRoutes = ['/auth/login', '/auth/signup', '/auth/refresh']

    if (publicRoutes.includes(config.url ?? '')) {
      return config
    }

    const storage = await AsyncStorage.getItem(AUTH_STORAGE_KEY)
    console.log(storage)
    const data = storage ? JSON.parse(storage) : null

    if (data.accessToken) {
      config.headers.Authorization = `Bearer ${data.accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if ([401, 403].includes(error.response?.status)) {
      await AsyncStorage.removeItem('@otp-auth-app:auth-state')
      router.replace('/login')
    }

    return Promise.reject(error)
  }
)
