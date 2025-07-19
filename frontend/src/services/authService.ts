import api, { handleApiResponse, handleApiError } from './api'
import type { LoginRequest, LoginResponse, User } from '@/types/api'

export class AuthService {
  // Login user
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials)
      const data = handleApiResponse<LoginResponse>(response)
      
      // Store token and user in localStorage
      localStorage.setItem('myschool_token', data.token)
      localStorage.setItem('myschool_user', JSON.stringify(data.user))
      
      return data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get current user profile
  static async getProfile(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/profile')
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Logout user
  static logout(): void {
    localStorage.removeItem('myschool_token')
    localStorage.removeItem('myschool_user')
    window.location.href = '/login'
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('myschool_token')
    const user = localStorage.getItem('myschool_user')
    return !!(token && user)
  }

  // Get stored user
  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem('myschool_user')
    if (userStr) {
      try {
        return JSON.parse(userStr) as User
      } catch {
        return null
      }
    }
    return null
  }

  // Get stored token
  static getToken(): string | null {
    return localStorage.getItem('myschool_token')
  }

  // Check if user has specific role
  static hasRole(role: string): boolean {
    const user = this.getCurrentUser()
    return user?.role === role
  }

  // Check if user has any of the specified roles
  static hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser()
    return user ? roles.includes(user.role) : false
  }
}

export default AuthService