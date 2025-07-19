import api, { handleApiResponse, handleApiError } from './api'
import type { User, CreateUserForm, PaginatedResponse } from '@/types/api'

export class UserService {
  // Get all users with pagination and filters
  static async getUsers(params?: {
    page?: number
    limit?: number
    role?: string
    etablissementId?: string
    search?: string
  }): Promise<PaginatedResponse<User>> {
    try {
      const response = await api.get<PaginatedResponse<User>>('/users', { params })
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get user by ID
  static async getUserById(id: string): Promise<User> {
    try {
      const response = await api.get<User>(`/users/${id}`)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Create new user
  static async createUser(userData: CreateUserForm): Promise<User> {
    try {
      const response = await api.post<User>('/users', userData)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Update user
  static async updateUser(id: string, userData: Partial<CreateUserForm>): Promise<User> {
    try {
      const response = await api.put<User>(`/users/${id}`, userData)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Toggle user status (activate/deactivate)
  static async toggleUserStatus(id: string): Promise<User> {
    try {
      const response = await api.patch<User>(`/users/${id}/toggle-status`)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get users by role
  static async getUsersByRole(role: string, etablissementId?: string): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/users', {
        params: { role, etablissementId, limit: 1000 }
      })
      const data = handleApiResponse(response) as any
      return data.users || data.data || data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get teachers (enseignants)
  static async getTeachers(etablissementId?: string): Promise<User[]> {
    return this.getUsersByRole('ENSEIGNANT', etablissementId)
  }

  // Get students (élèves)
  static async getStudents(etablissementId?: string): Promise<User[]> {
    return this.getUsersByRole('ELEVE', etablissementId)
  }

  // Get parents
  static async getParents(etablissementId?: string): Promise<User[]> {
    return this.getUsersByRole('PARENT', etablissementId)
  }

  // Search users
  static async searchUsers(query: string, role?: string): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/users/search', {
        params: { q: query, role }
      })
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }
}

export default UserService