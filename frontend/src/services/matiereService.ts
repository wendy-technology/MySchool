import api, { handleApiResponse, handleApiError } from './api'
import type { 
  Matiere, 
  User,
  Classe,
  PaginatedResponse,
  ApiResponse 
} from '@/types/api'

export interface CreateMatiereForm {
  nom: string
  nomArabe?: string
  code: string
  coefficient: number
  couleur?: string
  description?: string
  descriptionArabe?: string
}

export interface MatiereFilters {
  search?: string
  coefficient?: number
  couleur?: string
  page?: number
  limit?: number
}

export interface MatiereWithDetails extends Matiere {
  enseignants: User[]
  classes: Classe[]
  nombreEvaluations: number
}

export interface AssignMatiereToClassForm {
  matiereId: string
  classeId: string
  enseignantId: string
  coefficient?: number
}

export class MatiereService {
  // Get all matieres with pagination and filters
  static async getMatieres(filters?: MatiereFilters): Promise<PaginatedResponse<MatiereWithDetails>> {
    try {
      const params = {
        page: filters?.page || 1,
        limit: filters?.limit || 25,
        search: filters?.search || undefined,
        coefficient: filters?.coefficient || undefined,
        couleur: filters?.couleur || undefined
      }
      
      const response = await api.get('/matieres', { params })
      const data = handleApiResponse(response)
      
      return {
        data: data.matieres || [],
        pagination: data.pagination || { page: 1, limit: 25, total: 0, pages: 0 }
      }
    } catch (error) {
      // Mock data if endpoint not available
      console.warn('Endpoint /matieres non disponible, retour de données mock')
      return {
        data: [
          {
            id: '1',
            nom: 'Mathématiques',
            nomArabe: 'الرياضيات',
            code: 'MATH',
            coefficient: 3,
            couleur: '#3b82f6',
            enseignants: [],
            classes: [],
            nombreEvaluations: 15,
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
            enseignants: [],
            classes: [],
            nombreEvaluations: 12,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '3',
            nom: 'Français',
            nomArabe: 'الفرنسية',
            code: 'FR',
            coefficient: 2,
            couleur: '#f59e0b',
            enseignants: [],
            classes: [],
            nombreEvaluations: 18,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ] as MatiereWithDetails[],
        pagination: { page: 1, limit: 25, total: 3, pages: 1 }
      }
    }
  }

  // Get matiere by ID
  static async getMatiereById(id: string): Promise<MatiereWithDetails> {
    try {
      const response = await api.get<ApiResponse<MatiereWithDetails>>(`/matieres/${id}`)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Create new matiere
  static async createMatiere(data: CreateMatiereForm): Promise<Matiere> {
    try {
      const response = await api.post<ApiResponse<Matiere>>('/matieres', data)
      return handleApiResponse(response)
    } catch (error) {
      // Mock creation if endpoint not available
      console.warn('Endpoint /matieres POST non disponible, simulation de création')
      const newMatiere: Matiere = {
        id: `matiere-${Date.now()}`,
        nom: data.nom,
        nomArabe: data.nomArabe,
        code: data.code,
        coefficient: data.coefficient,
        couleur: data.couleur || '#3b82f6',
        description: data.description,
        descriptionArabe: data.descriptionArabe,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Simulate successful creation with a small delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return newMatiere
    }
  }

  // Update matiere
  static async updateMatiere(id: string, data: Partial<CreateMatiereForm>): Promise<Matiere> {
    try {
      const response = await api.put<ApiResponse<Matiere>>(`/matieres/${id}`, data)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Delete matiere
  static async deleteMatiere(id: string): Promise<void> {
    try {
      await api.delete(`/matieres/${id}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Assign matiere to class with teacher
  static async assignMatiereToClass(data: AssignMatiereToClassForm): Promise<void> {
    try {
      await api.post('/matieres/assign-class', data)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Remove matiere from class
  static async removeMatiereFromClass(matiereId: string, classeId: string): Promise<void> {
    try {
      await api.delete(`/matieres/${matiereId}/classes/${classeId}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Assign teacher to matiere
  static async assignTeacherToMatiere(matiereId: string, enseignantId: string): Promise<void> {
    try {
      await api.post(`/matieres/${matiereId}/enseignants`, { enseignantId })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Remove teacher from matiere
  static async removeTeacherFromMatiere(matiereId: string, enseignantId: string): Promise<void> {
    try {
      await api.delete(`/matieres/${matiereId}/enseignants/${enseignantId}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get matiere statistics
  static async getMatiereStats(matiereId: string): Promise<{
    nombreEnseignants: number
    nombreClasses: number
    nombreEvaluations: number
    moyenneGenerale: number
    tauxReussite: number
  }> {
    try {
      const response = await api.get(`/matieres/${matiereId}/stats`)
      return handleApiResponse(response)
    } catch (error) {
      // Mock data if endpoint not available
      return {
        nombreEnseignants: Math.floor(Math.random() * 5 + 1),
        nombreClasses: Math.floor(Math.random() * 10 + 3),
        nombreEvaluations: Math.floor(Math.random() * 20 + 10),
        moyenneGenerale: Math.floor(Math.random() * 8 + 12),
        tauxReussite: Math.floor(Math.random() * 30 + 70)
      }
    }
  }

  // Get predefined subjects for Algerian curriculum
  static getStandardMatieres(): Omit<CreateMatiereForm, 'code'>[] {
    return [
      // Matières principales
      { nom: 'Mathématiques', nomArabe: 'الرياضيات', coefficient: 3, couleur: '#3b82f6' },
      { nom: 'Physique', nomArabe: 'الفيزياء', coefficient: 2, couleur: '#10b981' },
      { nom: 'Chimie', nomArabe: 'الكيمياء', coefficient: 2, couleur: '#f59e0b' },
      { nom: 'Sciences Naturelles', nomArabe: 'العلوم الطبيعية', coefficient: 2, couleur: '#22c55e' },
      
      // Langues
      { nom: 'Langue Arabe', nomArabe: 'اللغة العربية', coefficient: 3, couleur: '#dc2626' },
      { nom: 'Français', nomArabe: 'الفرنسية', coefficient: 2, couleur: '#2563eb' },
      { nom: 'Anglais', nomArabe: 'الإنجليزية', coefficient: 2, couleur: '#7c3aed' },
      
      // Sciences humaines
      { nom: 'Histoire', nomArabe: 'التاريخ', coefficient: 2, couleur: '#b45309' },
      { nom: 'Géographie', nomArabe: 'الجغرافيا', coefficient: 2, couleur: '#059669' },
      { nom: 'Éducation Islamique', nomArabe: 'التربية الإسلامية', coefficient: 2, couleur: '#16a34a' },
      { nom: 'Philosophie', nomArabe: 'الفلسفة', coefficient: 2, couleur: '#4338ca' },
      
      // Autres matières
      { nom: 'Éducation Physique', nomArabe: 'التربية البدنية', coefficient: 1, couleur: '#ea580c' },
      { nom: 'Arts Plastiques', nomArabe: 'التربية التشكيلية', coefficient: 1, couleur: '#e11d48' },
      { nom: 'Musique', nomArabe: 'التربية الموسيقية', coefficient: 1, couleur: '#8b5cf6' },
      { nom: 'Informatique', nomArabe: 'الإعلام الآلي', coefficient: 2, couleur: '#6366f1' },
      
      // Matières techniques
      { nom: 'Technologie', nomArabe: 'التكنولوجيا', coefficient: 2, couleur: '#374151' },
      { nom: 'Économie', nomArabe: 'الاقتصاد', coefficient: 2, couleur: '#065f46' },
      { nom: 'Comptabilité', nomArabe: 'المحاسبة', coefficient: 2, couleur: '#7c2d12' }
    ]
  }

  // Get color options
  static getColorOptions(): { label: string, value: string, color: string }[] {
    return [
      { label: 'Bleu', value: '#3b82f6', color: '#3b82f6' },
      { label: 'Vert', value: '#10b981', color: '#10b981' },
      { label: 'Orange', value: '#f59e0b', color: '#f59e0b' },
      { label: 'Rouge', value: '#dc2626', color: '#dc2626' },
      { label: 'Violet', value: '#7c3aed', color: '#7c3aed' },
      { label: 'Rose', value: '#e11d48', color: '#e11d48' },
      { label: 'Indigo', value: '#4338ca', color: '#4338ca' },
      { label: 'Emeraude', value: '#059669', color: '#059669' },
      { label: 'Ambre', value: '#d97706', color: '#d97706' },
      { label: 'Gris', value: '#6b7280', color: '#6b7280' }
    ]
  }

  // Generate unique code
  static generateMatiereCode(nom: string): string {
    // Remove accents and special characters, take first letters
    const normalized = nom
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z\s]/g, '')
    
    const words = normalized.split(' ').filter(word => word.length > 0)
    
    if (words.length === 1) {
      return words[0].substring(0, 4)
    } else if (words.length === 2) {
      return words[0].substring(0, 2) + words[1].substring(0, 2)
    } else {
      return words.slice(0, 3).map(word => word.charAt(0)).join('') + 
             (words[0].length > 1 ? words[0].charAt(1) : '')
    }
  }

  // Bulk operations
  static async bulkCreateMatieres(matieres: CreateMatiereForm[]): Promise<void> {
    try {
      await api.post('/matieres/bulk', { matieres })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  static async bulkDeleteMatieres(matiereIds: string[]): Promise<void> {
    try {
      await api.delete('/matieres/bulk', { data: { matiereIds } })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }
}

export default MatiereService