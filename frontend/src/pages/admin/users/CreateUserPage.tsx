import React, { useState } from 'react'
import { 
  Card, 
  Button, 
  Form, 
  message, 
  Steps,
  Space,
  Spin
} from 'antd'
import { 
  ArrowLeftOutlined, 
  SaveOutlined,
  UserOutlined,
  CheckOutlined
} from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import UserFormSimple from '@/components/users/forms/UserFormSimple'
import { UserService } from '@/services'
import type { UserRole, CreateUserForm, CreateEnseignantForm, CreateEleveForm, CreateParentForm } from '@/types/api'
import type { RootState } from '@/store'

const { Step } = Steps

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  
  // Récupérer l'utilisateur connecté pour avoir son établissement
  const currentUser = useSelector((state: RootState) => state.auth.user)

  const initialRole = (searchParams.get('role') as UserRole) || undefined

  const getPageTitle = () => {
    switch (initialRole) {
      case 'ENSEIGNANT': return 'Nouvel Enseignant'
      case 'ELEVE': return 'Nouvel Élève'
      case 'PARENT': return 'Nouveau Parent'
      case 'ADMIN': return 'Nouvel Administrateur'
      default: return 'Nouvel Utilisateur'
    }
  }

  const getPageDescription = () => {
    switch (initialRole) {
      case 'ENSEIGNANT': return 'Créer un compte enseignant avec ses spécialités et matières'
      case 'ELEVE': return 'Inscrire un nouvel élève dans une classe'
      case 'PARENT': return 'Créer un compte parent et le lier à ses enfants'
      case 'ADMIN': return 'Créer un compte administrateur avec tous les privilèges'
      default: return 'Créer un nouveau compte utilisateur'
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      
      console.log('Données du formulaire:', values)
      console.log('Utilisateur connecté:', currentUser)

      if (!currentUser?.etablissementId) {
        message.error('Impossible de déterminer l\'établissement. Veuillez vous reconnecter.')
        return
      }

      // Préparer les données selon le rôle
      const userData = {
        ...values,
        etablissementId: currentUser.etablissementId
      }

      let newUser
      
      console.log('Création utilisateur avec role:', values.role)
      console.log('Données complètes à envoyer:', userData)
      
      try {
        switch (values.role) {
          case 'ENSEIGNANT':
            console.log('Appel createTeacher avec:', userData)
            newUser = await UserService.createTeacher(userData as CreateEnseignantForm)
            console.log('✅ Enseignant créé:', newUser)
            break
          case 'ELEVE':
            console.log('Appel createStudent avec:', userData)
            newUser = await UserService.createStudent(userData as CreateEleveForm)
            console.log('✅ Élève créé:', newUser)
            break
          case 'PARENT':
            console.log('Appel createParent avec:', userData)
            newUser = await UserService.createParent(userData as CreateParentForm)
            console.log('✅ Parent créé:', newUser)
            break
          default:
            console.log('Appel createUser avec:', userData)
            newUser = await UserService.createUser(userData as CreateUserForm)
            console.log('✅ Utilisateur créé:', newUser)
            break
        }
        
        console.log('🎉 Création réussie, redirection en cours...')
        message.success(`${getRoleLabel(values.role)} créé(e) avec succès!`)
        
        // Rediriger immédiatement vers la liste des utilisateurs
        const redirectPath = '/admin/utilisateurs'
        console.log('Redirection vers:', redirectPath)
        navigate(redirectPath, { replace: true })
        
      } catch (creationError) {
        console.error('❌ Erreur lors de la création:', creationError)
        throw creationError // Re-throw pour être catchée par le catch principal
      }
      
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      ADMIN: 'Administrateur',
      ENSEIGNANT: 'Enseignant',
      ELEVE: 'Élève',
      PARENT: 'Parent'
    }
    return labels[role] || 'Utilisateur'
  }

  const getRedirectPath = (role: UserRole) => {
    switch (role) {
      case 'ENSEIGNANT': return '/admin/enseignants'
      case 'ELEVE': return '/admin/eleves'
      case 'PARENT': return '/admin/parents'
      default: return '/admin/utilisateurs'
    }
  }

  const handleBack = () => {
    const backPath = initialRole ? getRedirectPath(initialRole) : '/admin/utilisateurs'
    navigate(backPath)
  }

  const validateForm = async () => {
    try {
      await form.validateFields()
      return true
    } catch (error) {
      return false
    }
  }

  const steps = [
    {
      title: 'Type d\'utilisateur',
      description: 'Sélectionner le rôle',
      icon: <UserOutlined />
    },
    {
      title: 'Informations',
      description: 'Saisir les données',
      icon: <UserOutlined />
    },
    {
      title: 'Validation',
      description: 'Vérifier et enregistrer',
      icon: <CheckOutlined />
    }
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">
            {getPageTitle()}
          </h1>
          <p className="text-gray-600 mt-1">
            {getPageDescription()}
          </p>
        </div>
        
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          disabled={loading}
        >
          Retour
        </Button>
      </div>

      {/* Steps (only for complex creation) */}
      {!initialRole && (
        <Card className="mb-6">
          <Steps current={currentStep} items={steps} />
        </Card>
      )}

      {/* Form */}
      <Card>
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            scrollToFirstError
          >
            <UserFormSimple
              form={form}
              showRoleSelection={!initialRole}
              initialRole={initialRole}
            />

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t mt-8">
              <Button
                size="large"
                onClick={handleBack}
                disabled={loading}
              >
                Annuler
              </Button>
              
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                Créer l'utilisateur
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>

      {/* Informations d'aide */}
      <Card className="mt-6" title="💡 Informations utiles">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Mot de passe</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Minimum 6 caractères</li>
              <li>• Sera envoyé par email à l'utilisateur</li>
              <li>• Changement obligatoire à la première connexion</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Activation du compte</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Le compte sera actif par défaut</li>
              <li>• L'utilisateur recevra un email de bienvenue</li>
              <li>• Vous pouvez désactiver le compte plus tard</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default CreateUserPage