import { api } from '@/lib/axios'
import { AxiosError } from 'axios'

export interface Appointment {
  id: string
  client_name: string
  service: string
  date: string
  time: string
  status: 'confirmed' | 'pending' | 'cancelled'
  price: number
}

export interface AppointmentsResponse {
  success: boolean
  status: number
  data: Appointment[]
  message?: string
}

interface ApiErrorResponse {
  message?: string
}

export const appointmentsService = {
  async findAll(): Promise<Appointment[]> {
    try {
      const response = await api.get<AppointmentsResponse>('/appointments')
      console.log(response.data.data)
      return response.data.data
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>
      const message =
        axiosError.response?.data?.message || 'Erro ao buscar agendamentos'
      throw new Error(message, {
        cause: error
      })
    }
  }
}
