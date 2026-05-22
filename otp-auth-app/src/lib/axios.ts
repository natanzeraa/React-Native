import { AUTH_STORAGE_KEY, AUTH_USER_DATA_KEY } from '@/contexts/authContext'
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
  baseURL: 'http://192.168.100.105:3001/api/v1',
  // baseURL: 'http://192.168.100.105:51013/api/v1',
  timeout: 10000
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
  await AsyncStorage.removeItem(AUTH_USER_DATA_KEY)
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
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject
        })
      }).then((token: string) => {
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

      const response = await api.post(
        '/auth/refresh',
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.refreshToken}`
          }
        }
      )

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
