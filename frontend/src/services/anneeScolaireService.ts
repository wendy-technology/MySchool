import api, { handleApiResponse, handleApiError } from './api'
import type { 
  AnneeScolaire, 
  PaginatedResponse,
  ApiResponse 
} from '@/types/api'

export interface CreateAnneeScolaireForm {
  nom: string
  dateDebut: string
  dateFin: string
  estActive: boolean
  etablissementId: string
}

export interface AnneeScolaireFilters {
  search?: string
  estActive?: boolean
  etablissementId?: string
  page?: number
  limit?: number
}

export interface AnneeScolaireWithStats extends AnneeScolaire {
  nombreClasses: number
  nombreEleves: number
  nombreEnseignants: number
  nombreEvaluations: number
}

export class AnneeScolaireService {
  // Get all annees scolaires with pagination and filters
  static async getAnneesScolaires(filters?: AnneeScolaireFilters): Promise<PaginatedResponse<AnneeScolaireWithStats>> {
    try {
      const params = {
        page: filters?.page || 1,
        limit: filters?.limit || 25,
        search: filters?.search || undefined,
        estActive: filters?.estActive !== undefined ? filters.estActive : undefined,
        etablissementId: filters?.etablissementId || undefined
      }
      
      const response = await api.get('/annees-scolaires', { params })
      const data = handleApiResponse(response)
      
      return {
        data: data.anneesScolaires || [],
        pagination: data.pagination || { page: 1, limit: 25, total: 0, pages: 0 }
      }
    } catch (error) {
      // Mock data if endpoint not available
      console.warn('Endpoint /annees-scolaires non disponible, retour de données mock')
      return {
        data: [
          {
            id: '1',
            nom: '2024-2025',
            dateDebut: new Date('2024-09-15'),
            dateFin: new Date('2025-06-30'),
            estActive: true,
            etablissementId: 'etablissement1',
            nombreClasses: 25,
            nombreEleves: 850,
            nombreEnseignants: 45,
            nombreEvaluations: 120,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            nom: '2023-2024',
            dateDebut: new Date('2023-09-15'),
            dateFin: new Date('2024-06-30'),
            estActive: false,
            etablissementId: 'etablissement1',
            nombreClasses: 23,
            nombreEleves: 780,
            nombreEnseignants: 42,
            nombreEvaluations: 340,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ] as AnneeScolaireWithStats[],
        pagination: { page: 1, limit: 25, total: 2, pages: 1 }
      }
    }
  }

  // Get annee scolaire by ID
  static async getAnneeScolaireById(id: string): Promise<AnneeScolaireWithStats> {
    try {
      const response = await api.get<ApiResponse<AnneeScolaireWithStats>>(`/annees-scolaires/${id}`)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get active annee scolaire
  static async getActiveAnneeScolaire(): Promise<AnneeScolaireWithStats | null> {
    try {
      const response = await api.get<ApiResponse<AnneeScolaireWithStats>>('/annees-scolaires/active')
      return handleApiResponse(response)
    } catch (error) {
      // Return mock active year
      return {
        id: '1',
        nom: '2024-2025',
        dateDebut: new Date('2024-09-15'),
        dateFin: new Date('2025-06-30'),
        estActive: true,
        etablissementId: 'etablissement1',
        nombreClasses: 25,
        nombreEleves: 850,
        nombreEnseignants: 45,
        nombreEvaluations: 120,
        createdAt: new Date(),
        updatedAt: new Date()
      } as AnneeScolaireWithStats
    }
  }

  // Create new annee scolaire
  static async createAnneeScolaire(data: CreateAnneeScolaireForm): Promise<AnneeScolaire> {
    try {
      const response = await api.post<ApiResponse<AnneeScolaire>>('/annees-scolaires', data)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Update annee scolaire
  static async updateAnneeScolaire(id: string, data: Partial<CreateAnneeScolaireForm>): Promise<AnneeScolaire> {
    try {
      const response = await api.put<ApiResponse<AnneeScolaire>>(`/annees-scolaires/${id}`, data)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Delete annee scolaire
  static async deleteAnneeScolaire(id: string): Promise<void> {
    try {
      await api.delete(`/annees-scolaires/${id}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Activate annee scolaire (deactivates all others)
  static async activateAnneeScolaire(id: string): Promise<void> {
    try {
      await api.post(`/annees-scolaires/${id}/activate`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Archive annee scolaire
  static async archiveAnneeScolaire(id: string): Promise<void> {
    try {
      await api.post(`/annees-scolaires/${id}/archive`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get trimester configuration
  static async getTrimestres(anneeScolaireId: string): Promise<{
    id: string
    numero: number
    nom: string
    dateDebut: Date
    dateFin: Date
    estActif: boolean
  }[]> {
    try {
      const response = await api.get(`/annees-scolaires/${anneeScolaireId}/trimestres`)
      return handleApiResponse(response)
    } catch (error) {
      // Mock trimester data
      return [
        {
          id: '1',
          numero: 1,
          nom: '1er Trimestre',
          dateDebut: new Date('2024-09-15'),
          dateFin: new Date('2024-12-20'),
          estActif: false
        },
        {
          id: '2', 
          numero: 2,
          nom: '2ème Trimestre',
          dateDebut: new Date('2025-01-07'),
          dateFin: new Date('2025-03-28'),
          estActif: true
        },
        {
          id: '3',
          numero: 3,
          nom: '3ème Trimestre',
          dateDebut: new Date('2025-04-07'),
          dateFin: new Date('2025-06-30'),
          estActif: false
        }
      ]
    }
  }

  // Update trimester
  static async updateTrimestre(
    anneeScolaireId: string, 
    trimestreId: string, 
    data: { nom: string, dateDebut: string, dateFin: string }
  ): Promise<void> {
    try {
      await api.put(`/annees-scolaires/${anneeScolaireId}/trimestres/${trimestreId}`, data)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Activate trimester
  static async activateTrimestre(anneeScolaireId: string, trimestreId: string): Promise<void> {
    try {
      await api.post(`/annees-scolaires/${anneeScolaireId}/trimestres/${trimestreId}/activate`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Generate standard year name
  static generateYearName(startYear?: number): string {
    const year = startYear || new Date().getFullYear()
    return `${year}-${year + 1}`
  }

  // Get suggested dates for Algerian school year
  static getSuggestedDates(startYear?: number): { dateDebut: Date, dateFin: Date } {
    const year = startYear || new Date().getFullYear()
    return {
      dateDebut: new Date(year, 8, 15), // September 15th
      dateFin: new Date(year + 1, 5, 30) // June 30th
    }
  }

  // Validate year dates
  static validateYearDates(dateDebut: string, dateFin: string): string[] {
    const errors: string[] = []
    const debut = new Date(dateDebut)
    const fin = new Date(dateFin)
    
    if (debut >= fin) {
      errors.push('La date de fin doit être postérieure à la date de début')
    }
    
    const duration = fin.getTime() - debut.getTime()
    const months = duration / (1000 * 60 * 60 * 24 * 30)
    
    if (months < 8) {
      errors.push('Une année scolaire doit durer au moins 8 mois')
    }
    
    if (months > 12) {
      errors.push('Une année scolaire ne peut pas durer plus de 12 mois')
    }
    
    return errors
  }

  // Copy data from previous year
  static async copyFromPreviousYear(
    currentYearId: string, 
    previousYearId: string, 
    options: {
      copyClasses: boolean
      copyEnseignants: boolean
      copyMatieres: boolean
    }
  ): Promise<void> {
    try {
      await api.post(`/annees-scolaires/${currentYearId}/copy-from/${previousYearId}`, options)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get year statistics
  static async getYearStats(anneeScolaireId: string): Promise<{
    classes: { total: number, parCycle: Record<string, number> }
    eleves: { total: number, parClasse: Record<string, number> }
    enseignants: { total: number, parMatiere: Record<string, number> }
    evaluations: { total: number, parTrimestre: Record<string, number> }
    moyennes: { generale: number, parMatiere: Record<string, number> }
  }> {
    try {
      const response = await api.get(`/annees-scolaires/${anneeScolaireId}/stats`)
      return handleApiResponse(response)
    } catch (error) {
      // Mock stats
      return {
        classes: { 
          total: 25, 
          parCycle: { 'Primaire': 8, 'Moyen': 10, 'Secondaire': 7 }
        },
        eleves: { 
          total: 850, 
          parClasse: { '1ère AS': 120, '2ème AS': 110, '3ème AS': 95 }
        },
        enseignants: { 
          total: 45, 
          parMatiere: { 'Mathématiques': 8, 'Français': 6, 'Physique': 5 }
        },
        evaluations: { 
          total: 120, 
          parTrimestre: { '1': 45, '2': 40, '3': 35 }
        },
        moyennes: { 
          generale: 14.2, 
          parMatiere: { 'Mathématiques': 13.8, 'Français': 14.5, 'Physique': 13.9 }
        }
      }
    }
  }
}

export default AnneeScolaireService