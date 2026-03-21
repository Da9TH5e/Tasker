import axios from 'axios'
import { getAccessToken, getRefreshToken, setTokens, clearAuth } from './auth'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 
    'Content-Type': 'application/json' ,
    'Cache-Control': 'no-cache',  
    'Pragma': 'no-cache',
  },
})
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      isRefreshing = true

      try {
        const refreshToken = getRefreshToken()
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(
          'http://localhost:5000/auth/refresh',
          { refreshToken }
        )

        setTokens(data.accessToken, data.refreshToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch {
        clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export interface User {
  id: string
  email: string
}

export interface AuthResponse {
  message: string
  accessToken: string
  refreshToken: string
  user: User
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'done'
  timeGoal: number | null
  createdAt: string
  updatedAt: string
  userId: string
}

export interface TasksResponse {
  tasks: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export interface TimerEntry {
  id: string
  taskId: string
  duration: number
  beatGoal: boolean | null
  createdAt: string
  task: {
    title: string
    timeGoal: number | null
  }
}

export interface TimerStats {
  total: number
  avgDuration: number
  fastest: number
  goalsBeaten: number
}

export const authAPI = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', { email, password })
    return data
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },
}

export const tasksAPI = {
  getAll: async (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }): Promise<TasksResponse> => {
    const { data } = await api.get('/tasks', { params })
    return data
  },

  create: async (taskData: {
    title: string
    description?: string
    status?: string
  }): Promise<Task> => {
    const { data } = await api.post('/tasks', taskData)
    return data
  },

  update: async (id: string, taskData: {
    title?: string
    description?: string
    status?: string
  }): Promise<Task> => {
    const { data } = await api.patch(`/tasks/${id}`, taskData)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`)
  },

  toggle: async (id: string): Promise<Task> => {
    const { data } = await api.patch(`/tasks/${id}/toggle`)
    return data
  },
}

export const timerAPI = {
  save: async (taskId: string, duration: number): Promise<TimerEntry> => {
    const { data } = await api.post('/timer', { taskId, duration })
    return data
  },

  getAll: async (): Promise<TimerEntry[]> => {
    const { data } = await api.get('/timer')
    return data
  },

  getStats: async (): Promise<TimerStats> => {
    const { data } = await api.get('/timer/stats')
    return data
  },
}

export default api