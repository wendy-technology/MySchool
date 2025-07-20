import api, { handleApiResponse, handleApiError } from './api'
import type { 
  User, 
  CreateUserForm, 
  UpdateUserForm,
  CreateEnseignantForm,
  CreateEleveForm,
  CreateParentForm,
  UserWithDetails,
  UserFilters,
  PaginatedResponse,
  ImportUserData,
  ImportResult,
  Classe,
  Matiere
} from '@/types/api'

export class UserService {
  // Get all users with pagination and filters
  static async getUsers(filters?: UserFilters): Promise<PaginatedResponse<UserWithDetails>> {
    try {
      const params = {
        page: filters?.page || 1,
        limit: filters?.limit || 25,
        role: filters?.role || undefined,
        estActif: filters?.estActif !== '' ? filters?.estActif : undefined,
        search: filters?.search || undefined
      }
      
      const response = await api.get('/utilisateurs', { params })
      const data = handleApiResponse(response)
      
      // Adapter la structure backend { users: [...] } vers frontend { data: [...] }
      return {
        data: data.users || [],
        pagination: data.pagination || { page: 1, limit: 25, total: 0, pages: 0 }
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get user by ID with full details
  static async getUserById(id: string): Promise<UserWithDetails> {
    try {
      const response = await api.get<UserWithDetails>(`/utilisateurs/${id}`)
      return handleApiResponse<UserWithDetails>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Create new user
  static async createUser(userData: CreateUserForm): Promise<User> {
    try {
      const response = await api.post<User>('/utilisateurs', userData)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Update user
  static async updateUser(id: string, userData: UpdateUserForm): Promise<UserWithDetails> {
    try {
      const response = await api.put<UserWithDetails>(`/utilisateurs/${id}`, userData)
      return handleApiResponse<UserWithDetails>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/utilisateurs/${id}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Toggle user status (activate/deactivate)
  static async toggleUserStatus(id: string): Promise<User> {
    try {
      const response = await api.patch<User>(`/utilisateurs/${id}/toggle-status`)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get users by role
  static async getUsersByRole(role: string, etablissementId?: string): Promise<User[]> {
    try {
      const response = await api.get<User[]>('/utilisateurs', {
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
      const response = await api.get<User[]>('/utilisateurs', {
        params: { search: query, role }
      })
      return handleApiResponse<User[]>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Méthodes spécialisées par rôle
  
  // Create teacher (uses generic createUser for now)
  static async createTeacher(teacherData: CreateEnseignantForm): Promise<UserWithDetails> {
    try {
      // Restructurer les données pour correspondre au backend
      const backendData = {
        ...teacherData,
        enseignant: {
          matricule: teacherData.matricule,
          specialite: teacherData.specialite,
          specialiteArabe: teacherData.specialiteArabe
        }
      }
      // Retirer les champs spécifiques du niveau racine
      delete backendData.matricule
      delete backendData.specialite
      delete backendData.specialiteArabe
      delete backendData.matiereIds
      
      console.log('Données restructurées pour enseignant:', backendData)
      const response = await api.post<UserWithDetails>('/utilisateurs', backendData)
      return handleApiResponse<UserWithDetails>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Create student (uses generic createUser for now)
  static async createStudent(studentData: CreateEleveForm): Promise<UserWithDetails> {
    try {
      // Créer d'abord l'utilisateur de base, puis l'élève
      console.log('🔄 Création élève - données reçues:', studentData)
      
      // Si classeId est fourni mais pas valide, on l'enlève
      let validClasseId = studentData.classeId
      if (validClasseId && !validClasseId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.warn('ClasseId non valide, création sans classe:', validClasseId)
        validClasseId = undefined
      }
      
      // Restructurer les données pour correspondre au backend
      const backendData = {
        ...studentData,
        eleve: {
          numeroEleve: studentData.numeroEleve || `EL${Date.now()}`,
          ...(validClasseId && { classeId: validClasseId })
        }
      }
      
      // Retirer les champs spécifiques du niveau racine
      delete backendData.numeroEleve
      delete backendData.classeId
      delete backendData.parentIds
      
      console.log('📤 Données envoyées au backend:', JSON.stringify(backendData, null, 2))
      const response = await api.post<UserWithDetails>('/utilisateurs', backendData)
      const result = handleApiResponse<UserWithDetails>(response)
      console.log('✅ Réponse du backend:', result)
      return result
    } catch (error) {
      console.error('❌ Erreur détaillée création élève:', error)
      if (error.response) {
        console.error('📋 Détails de l\'erreur:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        })
      }
      throw new Error(handleApiError(error))
    }
  }

  // Create parent (uses generic createUser for now)
  static async createParent(parentData: CreateParentForm): Promise<UserWithDetails> {
    try {
      // Structurer les enfants selon le format backend
      const enfants = parentData.enfantIds?.map(eleveId => ({
        eleveId,
        lienParente: parentData.lienParente || 'parent'
      })) || []

      // Restructurer les données pour correspondre au backend
      const backendData = {
        ...parentData,
        parent: {
          profession: parentData.profession,
          professionArabe: parentData.professionArabe,
          enfants: enfants
        }
      }
      
      // Retirer les champs spécifiques du niveau racine
      delete backendData.profession
      delete backendData.professionArabe
      delete backendData.enfantIds
      delete backendData.lienParente
      
      console.log('Données restructurées pour parent:', backendData)
      const response = await api.post<UserWithDetails>('/utilisateurs', backendData)
      return handleApiResponse<UserWithDetails>(response)
    } catch (error) {
      console.error('Erreur détaillée création parent:', error)
      throw new Error(handleApiError(error))
    }
  }

  // Reset user password (mock implementation)
  static async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    try {
      // Pour le moment, simuler la réinitialisation
      const temporaryPassword = 'temp' + Math.random().toString(36).slice(2, 8)
      return { temporaryPassword }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Assign teacher to subjects
  static async assignTeacherToSubjects(teacherId: string, matiereIds: string[]): Promise<void> {
    try {
      await api.post(`/utilisateurs/${teacherId}/matieres`, { matiereIds })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Assign student to class
  static async assignStudentToClass(studentId: string, classeId: string): Promise<void> {
    try {
      await api.post(`/utilisateurs/${studentId}/classe`, { classeId })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Link parent to children
  static async linkParentToChildren(parentId: string, childrenIds: string[]): Promise<void> {
    try {
      await api.post(`/utilisateurs/${parentId}/enfants`, { childrenIds })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get available classes
  static async getClasses(): Promise<Classe[]> {
    try {
      const response = await api.get<Classe[]>('/classes')
      return handleApiResponse<Classe[]>(response)
    } catch (error) {
      console.warn('Endpoint /classes non disponible, retour de données mock')
      // Données mock en attendant l'implémentation
      return [
        {
          id: '1',
          nom: '1ère AS',
          nomArabe: 'السنة الأولى ثانوي',
          niveau: '1ère année',
          cycle: 'Secondaire',
          filiere: 'Sciences',
          effectifMax: 35,
          salleClasse: 'Salle 101',
          etablissementId: 'current',
          anneeScolaireId: 'current',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
  }

  // Get available subjects
  static async getSubjects(): Promise<Matiere[]> {
    try {
      const response = await api.get<Matiere[]>('/matieres')
      return handleApiResponse<Matiere[]>(response)
    } catch (error) {
      console.warn('Endpoint /matieres non disponible, retour de données mock')
      // Données mock en attendant l'implémentation
      return [
        {
          id: '1',
          nom: 'Mathématiques',
          nomArabe: 'الرياضيات',
          code: 'MATH',
          coefficient: 3,
          couleur: '#3b82f6',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          nom: 'Physique',
          nomArabe: 'الفيزياء',
          code: 'PHYS',
          coefficient: 2,
          couleur: '#10b981',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    }
  }

  // Bulk operations
  static async bulkActivate(userIds: string[]): Promise<void> {
    try {
      await api.post('/utilisateurs/bulk/activate', { userIds })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  static async bulkDeactivate(userIds: string[]): Promise<void> {
    try {
      await api.post('/utilisateurs/bulk/deactivate', { userIds })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  static async bulkDelete(userIds: string[]): Promise<void> {
    try {
      await api.post('/utilisateurs/bulk/delete', { userIds })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Import/Export
  static async importUsers(file: File): Promise<ImportResult> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await api.post<ImportResult>('/utilisateurs/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return handleApiResponse<ImportResult>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  static async exportUsers(filters?: UserFilters): Promise<Blob> {
    try {
      const params = {
        role: filters?.role || undefined,
        estActif: filters?.estActif !== '' ? filters?.estActif : undefined,
        search: filters?.search || undefined
      }
      
      const response = await api.get('/utilisateurs/export', {
        params,
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Upload user photo
  static async uploadPhoto(userId: string, file: File): Promise<{ photoUrl: string }> {
    try {
      const formData = new FormData()
      formData.append('photo', file)
      
      const response = await api.post<{ photoUrl: string }>(`/utilisateurs/${userId}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return handleApiResponse<{ photoUrl: string }>(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Statistics
  static async getUserStats(): Promise<{
    total: number
    byRole: Record<string, number>
    byStatus: Record<string, number>
    recentlyCreated: number
  }> {
    try {
      const response = await api.get('/utilisateurs/stats')
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }
}

export default UserService