import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Button, 
  Form, 
  message, 
  Spin,
  Alert,
  Space,
  Modal,
  Typography
} from 'antd'
import { 
  ArrowLeftOutlined, 
  SaveOutlined,
  KeyOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { UserForm } from '@/components/users'
import { UserService } from '@/services'
import type { UserWithDetails, UpdateUserForm, UserRole } from '@/types/api'

const { Text } = Typography
const { confirm } = Modal

const EditUserPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const [user, setUser] = useState<UserWithDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadUser(id)
    }
  }, [id])

  const loadUser = async (userId: string) => {
    try {
      setLoadingUser(true)
      setError(null)
      const userData = await UserService.getUserById(userId)
      setUser(userData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'utilisateur')
    } finally {
      setLoadingUser(false)
    }
  }

  const handleSubmit = async (values: any) => {
    if (!user) return

    try {
      setLoading(true)

      // Préparer les données de mise à jour (exclure les champs non modifiables)
      const { role, ...updateData } = values
      
      const updatedUser = await UserService.updateUser(user.id, updateData as UpdateUserForm)
      
      setUser(updatedUser)
      message.success('Utilisateur mis à jour avec succès!')
      
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = () => {
    if (!user) return

    confirm({
      title: 'Réinitialiser le mot de passe',
      content: `Êtes-vous sûr de vouloir réinitialiser le mot de passe de ${user.prenom} ${user.nom} ?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Réinitialiser',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          const result = await UserService.resetPassword(user.id)
          Modal.info({
            title: 'Mot de passe réinitialisé',
            content: (
              <div>
                <p>Nouveau mot de passe temporaire :</p>
                <p className="font-mono text-lg bg-gray-100 p-2 rounded">
                  {result.temporaryPassword}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  L'utilisateur devra changer ce mot de passe lors de sa prochaine connexion.
                </p>
              </div>
            ),
            width: 500
          })
        } catch (error) {
          message.error('Erreur lors de la réinitialisation du mot de passe')
        }
      }
    })
  }

  const handleBack = () => {
    const backPath = getBackPath(user?.role)
    navigate(backPath)
  }

  const getBackPath = (role?: UserRole) => {
    switch (role) {
      case 'ENSEIGNANT': return '/admin/enseignants'
      case 'ELEVE': return '/admin/eleves'
      case 'PARENT': return '/admin/parents'
      default: return '/admin/utilisateurs'
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

  if (loadingUser) {
    return (
      <div className="p-6">
        <Card>
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </Card>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <Alert
          message="Erreur"
          description={error || 'Utilisateur non trouvé'}
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/admin/utilisateurs')}>
              Retour à la liste
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">
            Modifier {getRoleLabel(user.role)}
          </h1>
          <p className="text-gray-600 mt-1">
            {user.prenom} {user.nom} - {user.email}
          </p>
        </div>
        
        <Space>
          <Button
            icon={<KeyOutlined />}
            onClick={handleResetPassword}
            disabled={loading}
          >
            Réinitialiser mot de passe
          </Button>
          
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            disabled={loading}
          >
            Retour
          </Button>
        </Space>
      </div>

      {/* Informations sur l'utilisateur */}
      <Alert
        message="Modification d'utilisateur existant"
        description={
          <div>
            <Text>
              Vous modifiez les informations de <strong>{user.prenom} {user.nom}</strong>.
            </Text>
            <br />
            <Text type="secondary">
              Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')} • 
              Dernière modification le {new Date(user.updatedAt).toLocaleDateString('fr-FR')}
            </Text>
          </div>
        }
        type="info"
        showIcon
        className="mb-6"
      />

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
            <UserForm
              form={form}
              user={user}
              showRoleSelection={false}
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
                Enregistrer les modifications
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>

      {/* Informations sur les limitations */}
      <Card className="mt-6" title="⚠️ Limitations de modification">
        <div className="text-sm text-gray-600 space-y-2">
          <p>• <strong>Le rôle ne peut pas être modifié</strong> après la création du compte</p>
          <p>• <strong>L'email</strong> peut être modifié mais l'utilisateur devra confirmer le nouveau</p>
          <p>• <strong>Le mot de passe</strong> ne peut être modifié que par réinitialisation</p>
          <p>• Les <strong>informations spécifiques au rôle</strong> (classe, matières, etc.) peuvent être mises à jour</p>
        </div>
      </Card>
    </div>
  )
}

export default EditUserPage