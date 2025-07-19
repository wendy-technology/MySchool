import api, { handleApiResponse, handleApiError } from './api'
import type { Note, Evaluation, CreateNoteForm, CreateEvaluationForm, PaginatedResponse } from '@/types/api'

export class NoteService {
  // Get all evaluations with filters
  static async getEvaluations(params?: {
    page?: number
    limit?: number
    classeId?: string
    matiereId?: string
    trimestre?: number
    type?: string
  }): Promise<PaginatedResponse<Evaluation>> {
    try {
      const response = await api.get<PaginatedResponse<Evaluation>>('/evaluations', { params })
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get evaluation by ID
  static async getEvaluationById(id: string): Promise<Evaluation> {
    try {
      const response = await api.get<Evaluation>(`/evaluations/${id}`)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Create new evaluation
  static async createEvaluation(evaluationData: CreateEvaluationForm): Promise<Evaluation> {
    try {
      const response = await api.post<Evaluation>('/evaluations', evaluationData)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Update evaluation
  static async updateEvaluation(id: string, evaluationData: Partial<CreateEvaluationForm>): Promise<Evaluation> {
    try {
      const response = await api.put<Evaluation>(`/evaluations/${id}`, evaluationData)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Delete evaluation
  static async deleteEvaluation(id: string): Promise<void> {
    try {
      await api.delete(`/evaluations/${id}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get notes for a specific student
  static async getStudentNotes(eleveId: string, params?: {
    matiereId?: string
    trimestre?: number
    annee?: string
  }): Promise<Note[]> {
    try {
      const response = await api.get<Note[]>(`/notes/eleve/${eleveId}`, { params })
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get notes for a specific evaluation
  static async getEvaluationNotes(evaluationId: string): Promise<Note[]> {
    try {
      const response = await api.get<Note[]>(`/notes/evaluation/${evaluationId}`)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Create or update note
  static async saveNote(noteData: CreateNoteForm): Promise<Note> {
    try {
      const response = await api.post<Note>('/notes', noteData)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Update note
  static async updateNote(id: string, noteData: Partial<CreateNoteForm>): Promise<Note> {
    try {
      const response = await api.put<Note>(`/notes/${id}`, noteData)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Delete note
  static async deleteNote(id: string): Promise<void> {
    try {
      await api.delete(`/notes/${id}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Batch save notes for an evaluation
  static async saveEvaluationNotes(evaluationId: string, notes: CreateNoteForm[]): Promise<Note[]> {
    try {
      const response = await api.post<Note[]>(`/notes/evaluation/${evaluationId}/batch`, { notes })
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get student's average for a subject
  static async getStudentSubjectAverage(eleveId: string, matiereId: string, trimestre?: number): Promise<{
    moyenne: number
    noteCount: number
  }> {
    try {
      const response = await api.get(`/notes/eleve/${eleveId}/moyenne`, {
        params: { matiereId, trimestre }
      })
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get class statistics for an evaluation
  static async getEvaluationStats(evaluationId: string): Promise<{
    moyenne: number
    min: number
    max: number
    noteCount: number
    distribution: { range: string; count: number }[]
  }> {
    try {
      const response = await api.get(`/evaluations/${evaluationId}/statistics`)
      return handleApiResponse(response)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }
}

export default NoteService