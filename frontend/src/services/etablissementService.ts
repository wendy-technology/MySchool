import api, { handleApiResponse, handleApiError } from './api'
import type { 
  Etablissement, 
  PaginatedResponse,
  ApiResponse 
} from '@/types/api'

export interface CreateEtablissementForm {
  nom: string
  nomArabe?: string
  adresse: string
  adresseArabe?: string
  wilaya: string
  commune: string
  telephone?: string
  email?: string
  directeur?: string
  directeurArabe?: string
}

export interface EtablissementFilters {
  search?: string
  wilaya?: string
  page?: number
  limit?: number
}

export class EtablissementService {
  // Get all etablissements with pagination and filters
  static async getEtablissements(filters?: EtablissementFilters): Promise<PaginatedResponse<Etablissement>> {
    try {
      const params = {
        page: filters?.page || 1,
        limit: filters?.limit || 25,
        search: filters?.search || undefined,
        wilaya: filters?.wilaya || undefined
      }
      
      const response = await api.get('/etablissements', { params })
      const data = handleApiResponse(response)
      
      return {
        data: data.etablissements || [],
        pagination: data.pagination || { page: 1, limit: 25, total: 0, pages: 0 }
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get etablissement by ID
  static async getEtablissementById(id: string): Promise<Etablissement> {
    try {
      const response = await api.get<ApiResponse<Etablissement>>(`/etablissements/${id}`)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Create new etablissement
  static async createEtablissement(data: CreateEtablissementForm): Promise<Etablissement> {
    try {
      const response = await api.post<ApiResponse<Etablissement>>('/etablissements', data)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Update etablissement
  static async updateEtablissement(id: string, data: Partial<CreateEtablissementForm>): Promise<Etablissement> {
    try {
      const response = await api.put<ApiResponse<Etablissement>>(`/etablissements/${id}`, data)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Delete etablissement
  static async deleteEtablissement(id: string): Promise<void> {
    try {
      await api.delete(`/etablissements/${id}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get wilayas list
  static getWilayas(): string[] {
    return [
      'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
      'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou',
      'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba',
      'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla',
      'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf',
      'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza',
      'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane'
    ]
  }

  // Get etablissement statistics
  static async getEtablissementStats(): Promise<{
    total: number
    byWilaya: Record<string, number>
    totalUsers: number
    totalClasses: number
  }> {
    try {
      const response = await api.get('/etablissements/stats')
      return handleApiResponse(response)
    } catch (error) {
      // Mock data if endpoint not available
      return {
        total: 5,
        byWilaya: { 'Alger': 2, 'Oran': 1, 'Constantine': 2 },
        totalUsers: 150,
        totalClasses: 30
      }
    }
  }
}

export default EtablissementService