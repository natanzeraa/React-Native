import { api } from '@/lib/axios'

export interface LoginRequest {
  email: string
  password: string
  token: string
}

export interface AuthUser {
  _id: string
  id: string
  name: string
  email: string
  twoFaEnabled: boolean
}

export interface AuthResponse {
  success: boolean
  status: number
  user: AuthUser
  accessToken: string
  refreshToken: string
  message: string
}

export const authService = {
  login: (payload: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', payload)
}
