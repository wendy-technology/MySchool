// Export all services
export { default as AuthService } from './authService'
export { default as UserService } from './userService'
export { default as NoteService } from './noteService'
export { default as EtablissementService } from './etablissementService'
export { ClasseService } from './classeService'
export { MatiereService } from './matiereService'
export { default as api } from './api'

// Export API utilities
export { handleApiResponse, handleApiError } from './api'