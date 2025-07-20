import React, { useState, useEffect } from 'react'
import { 
  Form, 
  Select, 
  Card, 
  Alert,
  Tag,
  Divider
} from 'antd'
import { 
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CrownOutlined
} from '@ant-design/icons'
import BaseUserForm from './BaseUserForm'
import TeacherForm from './TeacherForm'
import StudentForm from './StudentForm'
import ParentForm from './ParentForm'
import type { UserRole, UserWithDetails } from '@/types/api'

const { Option } = Select

interface UserFormProps {
  form: any
  user?: UserWithDetails
  disabled?: boolean
  showRoleSelection?: boolean
  initialRole?: UserRole
}

const UserForm: React.FC<UserFormProps> = ({
  form,
  user,
  disabled = false,
  showRoleSelection = true,
  initialRole
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(
    user?.role || initialRole
  )

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role)
      form.setFieldValue('role', user.role)
    } else if (initialRole) {
      setSelectedRole(initialRole)
      form.setFieldValue('role', initialRole)
    }
  }, [user, initialRole, form])

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role)
    // Reset form fields specific to previous role
    form.resetFields([
      'matricule', 'specialite', 'specialiteArabe', 'matiereIds',
      'numeroEleve', 'classeId', 'parentIds',
      'profession', 'professionArabe', 'enfantIds'
    ])
  }

  const getRoleInfo = (role: UserRole) => {
    const roleConfigs = {
      ADMIN: {
        label: 'Administrateur',
        color: 'red',
        icon: <CrownOutlined />,
        description: 'Accès complet au système, gestion de tous les utilisateurs et paramètres',
        permissions: [
          'Gestion complète des utilisateurs',
          'Configuration du système',
          'Accès aux statistiques globales',
          'Gestion des établissements',
          'Sauvegarde et restauration'
        ]
      },
      ENSEIGNANT: {
        label: 'Enseignant',
        color: 'blue',
        icon: <BookOutlined />,
        description: 'Professeur enseignant une ou plusieurs matières',
        permissions: [
          'Saisie des notes et évaluations',
          'Gestion des absences',
          'Consultation des classes assignées',
          'Génération de bulletins',
          'Communication avec les parents'
        ]
      },
      ELEVE: {
        label: 'Élève',
        color: 'green',
        icon: <UserOutlined />,
        description: 'Étudiant inscrit dans une classe',
        permissions: [
          'Consultation des notes',
          'Accès au bulletin scolaire',
          'Consultation de l\'emploi du temps',
          'Justification des absences',
          'Accès aux ressources pédagogiques'
        ]
      },
      PARENT: {
        label: 'Parent/Tuteur',
        color: 'purple',
        icon: <TeamOutlined />,
        description: 'Parent ou tuteur légal d\'un ou plusieurs élèves',
        permissions: [
          'Suivi des notes de ses enfants',
          'Consultation des bulletins',
          'Justification des absences',
          'Communication avec les enseignants',
          'Accès aux informations scolaires'
        ]
      }
    }
    return roleConfigs[role]
  }

  const renderRoleSpecificForm = () => {
    switch (selectedRole) {
      case 'ENSEIGNANT':
        return <TeacherForm form={form} user={user} disabled={disabled} showPasswordField={!user} />
      case 'ELEVE':
        return <StudentForm form={form} user={user} disabled={disabled} showPasswordField={!user} />
      case 'PARENT':
        return <ParentForm form={form} user={user} disabled={disabled} showPasswordField={!user} />
      case 'ADMIN':
        return <BaseUserForm form={form} user={user} disabled={disabled} showPasswordField={!user} />
      default:
        return <BaseUserForm form={form} user={user} disabled={disabled} showPasswordField={!user} />
    }
  }

  return (
    <>
      {/* Sélection du rôle */}
      {showRoleSelection && (
        <Card title="Type d'utilisateur" className="mb-6">
          <Form.Item
            name="role"
            label="Rôle"
            rules={[
              { required: true, message: 'Le rôle est requis' }
            ]}
          >
            <Select
              placeholder="Sélectionner un rôle"
              disabled={disabled || !!user} // Disable role change for existing users
              onChange={handleRoleChange}
              size="large"
            >
              {(['ADMIN', 'ENSEIGNANT', 'ELEVE', 'PARENT'] as UserRole[]).map(role => {
                const roleInfo = getRoleInfo(role)
                return (
                  <Option key={role} value={role}>
                    <div className="flex items-center gap-3 py-2">
                      <span className="text-lg">{roleInfo.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{roleInfo.label}</span>
                          <Tag color={roleInfo.color}>{role}</Tag>
                        </div>
                        <div className="text-sm text-gray-500">
                          {roleInfo.description}
                        </div>
                      </div>
                    </div>
                  </Option>
                )
              })}
            </Select>
          </Form.Item>

          {/* Informations sur le rôle sélectionné */}
          {selectedRole && (
            <div className="mt-4">
              <Alert
                type="info"
                showIcon
                message={`Rôle sélectionné: ${getRoleInfo(selectedRole).label}`}
                description={
                  <div className="mt-2">
                    <p className="mb-2">{getRoleInfo(selectedRole).description}</p>
                    <Divider className="my-3" />
                    <div>
                      <strong>Permissions principales :</strong>
                      <ul className="mt-2 space-y-1">
                        {getRoleInfo(selectedRole).permissions.map((permission, index) => (
                          <li key={index} className="text-sm">
                            • {permission}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                }
              />
            </div>
          )}
        </Card>
      )}

      {/* Formulaire spécialisé selon le rôle */}
      {selectedRole && renderRoleSpecificForm()}

      {/* Message d'aide pour la modification */}
      {user && (
        <Alert
          type="warning"
          showIcon
          message="Modification d'utilisateur"
          description="Le rôle ne peut pas être modifié après la création. Pour changer le rôle, vous devez créer un nouvel utilisateur."
          className="mt-4"
        />
      )}
    </>
  )
}

export default UserForm