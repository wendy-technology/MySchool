import axios from 'axios'
import { notification } from 'antd'

// Base API configuration
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // Proxy en développement
  : 'http://localhost:3000/api'  // Direct en production

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('myschool_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error

    if (response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('myschool_token')
      localStorage.removeItem('myschool_user')
      window.location.href = '/login'
      notification.error({
        message: 'Session expirée',
        description: 'Veuillez vous reconnecter',
      })
    } else if (response?.status === 403) {
      notification.error({
        message: 'Accès interdit',
        description: 'Vous n\'avez pas les permissions nécessaires',
      })
    } else if (response?.status === 500) {
      notification.error({
        message: 'Erreur serveur',
        description: 'Une erreur interne est survenue',
      })
    } else if (!response) {
      notification.error({
        message: 'Erreur de connexion',
        description: 'Impossible de contacter le serveur',
      })
    }

    return Promise.reject(error)
  }
)

export default api

// Utility function for handling API responses
export const handleApiResponse = <T>(response: any): T => {
  return response.data as T
}

// Utility function for handling API errors
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.response?.data?.errors?.length) {
    return error.response.data.errors[0]
  }
  if (error.message) {
    return error.message
  }
  return 'Une erreur inattendue est survenue'
}