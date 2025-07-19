// Types compatibles avec le backend Prisma Schema

export type UserRole = 'ADMIN' | 'ENSEIGNANT' | 'ELEVE' | 'PARENT'

export type TypeEvaluation = 'DEVOIR_SURVEILLE' | 'COMPOSITION' | 'CONTROLE_CONTINU' | 'ORAL' | 'PRATIQUE'

export type TypeAbsence = 'ABSENCE' | 'RETARD'

export type Jour = 'LUNDI' | 'MARDI' | 'MERCREDI' | 'JEUDI' | 'VENDREDI' | 'SAMEDI' | 'DIMANCHE'

export interface User {
  id: string
  email: string
  nom: string
  prenom: string
  nomArabe?: string
  prenomArabe?: string
  telephone?: string
  adresse?: string
  dateNaissance?: Date
  lieuNaissance?: string
  role: UserRole
  estActif: boolean
  etablissementId: string
  createdAt: Date
  updatedAt: Date
}

export interface Etablissement {
  id: string
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
  createdAt: Date
  updatedAt: Date
}

export interface AnneeScolaire {
  id: string
  nom: string
  dateDebut: Date
  dateFin: Date
  estActive: boolean
  etablissementId: string
  createdAt: Date
  updatedAt: Date
}

export interface Classe {
  id: string
  nom: string
  nomArabe?: string
  niveau: string
  cycle: string
  filiere: string
  effectifMax: number
  salleClasse?: string
  etablissementId: string
  anneeScolaireId: string
  createdAt: Date
  updatedAt: Date
}

export interface Matiere {
  id: string
  nom: string
  nomArabe?: string
  code: string
  coefficient: number
  couleur?: string
  createdAt: Date
  updatedAt: Date
}

export interface Enseignant {
  id: string
  userId: string
  matricule: string
  specialite: string
  specialiteArabe?: string
  user: User
  createdAt: Date
  updatedAt: Date
}

export interface Eleve {
  id: string
  userId: string
  numeroEleve: string
  classeId: string
  user: User
  classe: Classe
  createdAt: Date
  updatedAt: Date
}

export interface Parent {
  id: string
  userId: string
  profession?: string
  professionArabe?: string
  user: User
  createdAt: Date
  updatedAt: Date
}

export interface Evaluation {
  id: string
  titre: string
  description?: string
  type: TypeEvaluation
  coefficient: number
  date: Date
  noteMax: number
  trimestre: number
  matiereId: string
  classeId: string
  enseignantId: string
  matiere: Matiere
  classe: Classe
  enseignant: User
  notes: Note[]
  createdAt: Date
  updatedAt: Date
}

export interface Note {
  id: string
  valeur: number
  commentaire?: string
  evaluationId: string
  eleveId: string
  evaluation: Evaluation
  eleve: User
  dateCreation: Date
  createdAt: Date
  updatedAt: Date
}

export interface Bulletin {
  id: string
  trimestre: number
  annee: string
  moyenneGenerale: number
  rang: number
  appreciation?: string
  effectifClasse: number
  eleveId: string
  classeId: string
  eleve: User
  classe: Classe
  moyennesMatieres: MoyenneMatiere[]
  createdAt: Date
  updatedAt: Date
}

export interface MoyenneMatiere {
  id: string
  moyenne: number
  coefficient: number
  bulletinId: string
  matiereId: string
  bulletin: Bulletin
  matiere: Matiere
  createdAt: Date
  updatedAt: Date
}

export interface Absence {
  id: string
  date: Date
  type: TypeAbsence
  heureDebut?: string
  heureFin?: string
  justifie: boolean
  motif?: string
  commentaire?: string
  eleveId: string
  enseignantId: string
  matiereId?: string
  eleve: User
  enseignant: User
  matiere?: Matiere
  createdAt: Date
  updatedAt: Date
}

export interface Justificatif {
  id: string
  motif: string
  dateDebut: Date
  dateFin: Date
  valide: boolean
  commentaire?: string
  dateValidation?: Date
  eleveId: string
  validePar?: string
  eleve: User
  validateur?: User
  createdAt: Date
  updatedAt: Date
}

export interface Creneau {
  id: string
  jour: Jour
  heureDebut: string
  heureFin: string
  ordre: number
  etablissementId: string
  etablissement: Etablissement
  cours: Cours[]
  createdAt: Date
  updatedAt: Date
}

export interface Salle {
  id: string
  nom: string
  capacite: number
  type: string
  etablissementId: string
  etablissement: Etablissement
  cours: Cours[]
  createdAt: Date
  updatedAt: Date
}

export interface Cours {
  id: string
  creneauId: string
  matiereId: string
  enseignantId: string
  classeId: string
  salleId: string
  creneau: Creneau
  matiere: Matiere
  enseignant: User
  classe: Classe
  salle: Salle
  createdAt: Date
  updatedAt: Date
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Auth Types
export interface LoginRequest {
  email: string
  motDePasse: string
}

export interface LoginResponse {
  user: User
  token: string
  expiresIn: number
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Dashboard Types
export interface DashboardStats {
  totalEleves: number
  totalEnseignants: number
  totalClasses: number
  totalEvaluations: number
  absencesToday: number
  bulletinsGeneres: number
}

// Form Types
export interface CreateUserForm {
  email: string
  password: string
  nom: string
  prenom: string
  nomArabe?: string
  prenomArabe?: string
  telephone?: string
  role: UserRole
  etablissementId: string
}

export interface CreateEvaluationForm {
  titre: string
  description?: string
  type: TypeEvaluation
  coefficient: number
  date: string
  noteMax: number
  trimestre: number
  matiereId: string
  classeId: string
}

export interface CreateNoteForm {
  valeur: number
  commentaire?: string
  evaluationId: string
  eleveId: string
}

export interface CreateAbsenceForm {
  date: string
  type: TypeAbsence
  heureDebut?: string
  heureFin?: string
  motif?: string
  commentaire?: string
  eleveId: string
  matiereId?: string
}