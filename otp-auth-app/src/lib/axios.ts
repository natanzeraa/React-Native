import { AUTH_STORAGE_KEY } from '@/constants/storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { router } from 'expo-router'

type AuthStorage = {
  accessToken: string
  refreshToken: string
}

type FailedRequest = {
  resolve: (token: string) => void
  reject: (error: AxiosError) => void
}

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000 // Esse tempo curto é apenas para praticidade dos testes
})

let isRefreshing = false
let failedQueue: FailedRequest[] = []

function processQueue(error: AxiosError | null, token: string | null = null) {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error)
      return
    }

    if (token) {
      request.resolve(token)
    }
  })

  failedQueue = []
}

async function getAuthStorage() {
  const storage = await AsyncStorage.getItem(AUTH_STORAGE_KEY)

  if (!storage) {
    return null
  }

  return JSON.parse(storage) as AuthStorage
}

async function clearSession() {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY)
  router.replace('/login')
}

api.interceptors.request.use(
  async (config) => {
    const publicRoutes = ['/auth/login', '/auth/signup', '/auth/refresh']

    if (publicRoutes.includes(config.url ?? '')) {
      return config
    }

    const auth = await getAuthStorage()

    if (auth?.accessToken) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig
    const status = error.response?.status

    if (status !== 401 || !originalRequest) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      await clearSession()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => resolve(token),
          reject
        })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const auth = await getAuthStorage()

      if (!auth?.refreshToken) {
        await clearSession()
        return Promise.reject(error)
      }

      console.log('Refresh Token: ', auth?.refreshToken)
      console.log('Enviando refresh token')
      
      const response = await api.post(
        '/auth/refresh',
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.refreshToken}`
          }
        }
      )

      if(response.status === 200) {
        console.log('Token renovado')
      }

      const { accessToken, refreshToken } = response.data

      await AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          accessToken,
          refreshToken
        })
      )

      processQueue(null, accessToken)

      originalRequest.headers.Authorization = `Bearer ${accessToken}`

      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError as AxiosError, null)

      await clearSession()

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
