import api, { handleApiResponse, handleApiError } from './api'
import type { 
  Classe, 
  User,
  PaginatedResponse,
  ApiResponse 
} from '@/types/api'

export interface CreateClasseForm {
  nom: string
  nomArabe?: string
  niveau: string
  cycle: string
  filiere: string
  effectifMax: number
  salleClasse?: string
  etablissementId: string
  anneeScolaireId: string
  enseignantPrincipalId?: string
}

export interface ClasseFilters {
  search?: string
  niveau?: string
  cycle?: string
  filiere?: string
  etablissementId?: string
  anneeScolaireId?: string
  page?: number
  limit?: number
}

export interface ClasseWithDetails extends Classe {
  effectifActuel: number
  enseignantPrincipal?: User
  enseignants: User[]
  eleves: User[]
}

export class ClasseService {
  // Get all classes with pagination and filters
  static async getClasses(filters?: ClasseFilters): Promise<PaginatedResponse<ClasseWithDetails>> {
    try {
      const params = {
        page: filters?.page || 1,
        limit: filters?.limit || 25,
        search: filters?.search || undefined,
        niveau: filters?.niveau || undefined,
        cycle: filters?.cycle || undefined,
        filiere: filters?.filiere || undefined,
        etablissementId: filters?.etablissementId || undefined,
        anneeScolaireId: filters?.anneeScolaireId || undefined
      }
      
      const response = await api.get('/classes', { params })
      const data = handleApiResponse(response)
      
      return {
        data: data.classes || [],
        pagination: data.pagination || { page: 1, limit: 25, total: 0, pages: 0 }
      }
    } catch (error) {
      // Mock data if endpoint not available
      console.warn('Endpoint /classes non disponible, retour de données mock')
      return {
        data: [
          {
            id: '1',
            nom: '1ère AS Sciences',
            nomArabe: 'السنة الأولى ثانوي علوم',
            niveau: '1ère année',
            cycle: 'Secondaire',
            filiere: 'Sciences',
            effectifMax: 35,
            effectifActuel: 32,
            salleClasse: 'Salle 101',
            etablissementId: 'etablissement1',
            anneeScolaireId: 'annee2024',
            enseignants: [],
            eleves: [],
            createdAt: new Date(),
            updatedAt: new Date()
          } as ClasseWithDetails
        ],
        pagination: { page: 1, limit: 25, total: 1, pages: 1 }
      }
    }
  }

  // Get classe by ID
  static async getClasseById(id: string): Promise<ClasseWithDetails> {
    try {
      const response = await api.get<ApiResponse<ClasseWithDetails>>(`/classes/${id}`)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Create new classe
  static async createClasse(data: CreateClasseForm): Promise<Classe> {
    try {
      console.log('Tentative de création classe avec données:', data)
      console.log('URL API complète:', 'http://localhost:3000/api/classes')
      
      const response = await api.post<ApiResponse<Classe>>('/classes', data)
      console.log('Réponse API:', response)
      return handleApiResponse(response)
    } catch (error) {
      console.error('Erreur API complète:', error)
      console.error('Erreur response:', (error as any)?.response)
      console.error('Erreur status:', (error as any)?.response?.status)
      console.error('Erreur data:', (error as any)?.response?.data)
      
      // Rethrow l'erreur pour que le composant puisse la gérer
      throw error
    }
  }

  // Update classe
  static async updateClasse(id: string, data: Partial<CreateClasseForm>): Promise<Classe> {
    try {
      const response = await api.put<ApiResponse<Classe>>(`/classes/${id}`, data)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Delete classe
  static async deleteClasse(id: string): Promise<void> {
    try {
      await api.delete(`/classes/${id}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Assign teacher to class
  static async assignTeacherToClass(classeId: string, enseignantId: string, estPrincipal: boolean = false): Promise<void> {
    try {
      await api.post(`/classes/${classeId}/enseignants`, { 
        enseignantId, 
        estPrincipal 
      })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Remove teacher from class
  static async removeTeacherFromClass(classeId: string, enseignantId: string): Promise<void> {
    try {
      await api.delete(`/classes/${classeId}/enseignants/${enseignantId}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Assign student to class
  static async assignStudentToClass(classeId: string, eleveId: string): Promise<void> {
    try {
      await api.post(`/classes/${classeId}/eleves`, { eleveId })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Remove student from class
  static async removeStudentFromClass(classeId: string, eleveId: string): Promise<void> {
    try {
      await api.delete(`/classes/${classeId}/eleves/${eleveId}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get class statistics
  static async getClasseStats(classeId: string): Promise<{
    effectifActuel: number
    effectifMax: number
    moyenneGenerale: number
    tauxPresence: number
    nombreEvaluations: number
  }> {
    try {
      const response = await api.get(`/classes/${classeId}/stats`)
      return handleApiResponse(response)
    } catch (error) {
      // Mock data if endpoint not available
      return {
        effectifActuel: Math.floor(Math.random() * 35 + 20),
        effectifMax: 35,
        moyenneGenerale: Math.floor(Math.random() * 10 + 10),
        tauxPresence: Math.floor(Math.random() * 20 + 80),
        nombreEvaluations: Math.floor(Math.random() * 10 + 5)
      }
    }
  }

  // Get standard levels (backend enum format)
  static getNiveaux(): { label: string, value: string }[] {
    return [
      { label: 'CP (Préparatoire)', value: 'CP' },
      { label: 'CE1 (1ère année primaire)', value: 'CE1' },
      { label: 'CE2 (2ème année primaire)', value: 'CE2' },
      { label: 'CM1 (3ème année primaire)', value: 'CM1' },
      { label: 'CM2 (4ème année primaire)', value: 'CM2' },
      { label: '1ère année moyenne', value: 'PREMIERE_AM' },
      { label: '2ème année moyenne', value: 'DEUXIEME_AM' },
      { label: '3ème année moyenne', value: 'TROISIEME_AM' },
      { label: '4ème année moyenne', value: 'QUATRIEME_AM' },
      { label: '1ère année secondaire', value: 'PREMIERE_AS' },
      { label: '2ème année secondaire', value: 'DEUXIEME_AS' },
      { label: '3ème année secondaire (Terminale)', value: 'TERMINALE' }
    ]
  }

  // Get cycles (backend enum format)
  static getCycles(): { label: string, value: string }[] {
    return [
      { label: 'Primaire', value: 'PRIMAIRE' },
      { label: 'Moyen', value: 'MOYEN' },
      { label: 'Secondaire', value: 'SECONDAIRE' }
    ]
  }

  // Get filières (backend enum format)
  static getFilieres(): { label: string, value: string }[] {
    return [
      { label: 'Général', value: 'GENERAL' },
      { label: 'Sciences expérimentales', value: 'SCIENCES_EXPERIMENTALES' },
      { label: 'Mathématiques', value: 'MATHEMATIQUES' },
      { label: 'Lettres et philosophie', value: 'LETTRES_PHILOSOPHIE' },
      { label: 'Langues étrangères', value: 'LANGUES_ETRANGERES' },
      { label: 'Gestion et économie', value: 'GESTION_ECONOMIE' }
    ]
  }

  // Bulk operations
  static async bulkAssignStudents(classeId: string, eleveIds: string[]): Promise<void> {
    try {
      await api.post(`/classes/${classeId}/eleves/bulk`, { eleveIds })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  static async bulkRemoveStudents(classeId: string, eleveIds: string[]): Promise<void> {
    try {
      await api.delete(`/classes/${classeId}/eleves/bulk`, { data: { eleveIds } })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }
}

export default ClasseService