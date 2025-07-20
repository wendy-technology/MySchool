import React, { useState, useEffect } from 'react'
import { 
  Form, 
  Select, 
  Card, 
  Alert,
  Tag,
  Input,
  Row,
  Col,
  Divider
} from 'antd'
import { 
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  CrownOutlined
} from '@ant-design/icons'
import BaseUserForm from './BaseUserForm'
import { UserService } from '@/services'
import type { UserRole, UserWithDetails, User } from '@/types/api'

const { Option } = Select

interface UserFormProps {
  form: any
  user?: UserWithDetails
  disabled?: boolean
  showRoleSelection?: boolean
  initialRole?: UserRole
}

const UserFormSimple: React.FC<UserFormProps> = ({
  form,
  user,
  disabled = false,
  showRoleSelection = true,
  initialRole
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(
    user?.role || initialRole
  )
  const [students, setStudents] = useState<User[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role)
      form.setFieldValue('role', user.role)
    } else if (initialRole) {
      setSelectedRole(initialRole)
      form.setFieldValue('role', initialRole)
    }
  }, [user, initialRole, form])

  // Charger les élèves quand on sélectionne le rôle PARENT
  useEffect(() => {
    if (selectedRole === 'PARENT') {
      loadStudents()
    }
  }, [selectedRole])

  const loadStudents = async () => {
    try {
      setLoadingStudents(true)
      const data = await UserService.getStudents()
      setStudents(data)
    } catch (error) {
      console.warn('Impossible de charger les élèves, utilisation de données mock')
      // Données mock si l'API n'est pas disponible
      setStudents([
        { id: 'student1', prenom: 'Ahmed', nom: 'Benali', email: 'ahmed.benali@example.com', role: 'ELEVE' },
        { id: 'student2', prenom: 'Fatima', nom: 'Kaddour', email: 'fatima.kaddour@example.com', role: 'ELEVE' },
        { id: 'student3', prenom: 'Mohammed', nom: 'Saidi', email: 'mohammed.saidi@example.com', role: 'ELEVE' },
        { id: 'student4', prenom: 'Aicha', nom: 'Mansouri', email: 'aicha.mansouri@example.com', role: 'ELEVE' }
      ] as User[])
    } finally {
      setLoadingStudents(false)
    }
  }

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
          'Gestion des établissements'
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
          'Génération de bulletins'
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
          'Justification des absences'
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
          'Communication avec les enseignants'
        ]
      }
    }
    return roleConfigs[role]
  }

  const renderRoleSpecificForm = () => {
    switch (selectedRole) {
      case 'ENSEIGNANT':
        return (
          <Card title="Informations Enseignant" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="matricule"
                  label="Matricule"
                  rules={[{ required: true, message: 'Le matricule est requis' }]}
                >
                  <Input placeholder="ENS20240001" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="specialite"
                  label="Spécialité"
                  rules={[{ required: true, message: 'La spécialité est requise' }]}
                >
                  <Select placeholder="Sélectionner une spécialité">
                    <Option value="Mathématiques">Mathématiques</Option>
                    <Option value="Physique">Physique</Option>
                    <Option value="Français">Français</Option>
                    <Option value="Arabe">Arabe</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="specialiteArabe" label="Spécialité (العربية)">
              <Input placeholder="التخصص" dir="rtl" />
            </Form.Item>
          </Card>
        )
      case 'ELEVE':
        return (
          <Card title="Informations Élève" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="numeroEleve"
                  label="Numéro d'élève"
                  rules={[{ required: true, message: 'Le numéro d\'élève est requis' }]}
                >
                  <Input placeholder="EL20240001" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="classeId"
                  label="Classe"
                  help="Optionnel - peut être assigné plus tard"
                >
                  <Select placeholder="Sélectionner une classe">
                    <Option value="550e8400-e29b-41d4-a716-446655440001">1ère AS - Sciences</Option>
                    <Option value="550e8400-e29b-41d4-a716-446655440002">2ème AS - Lettres</Option>
                    <Option value="550e8400-e29b-41d4-a716-446655440003">3ème AS - Maths</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        )
      case 'PARENT':
        return (
          <Card title="Informations Parent" className="mb-6">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="profession" label="Profession">
                  <Select
                    placeholder="Sélectionner une profession"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Option value="Médecin">Médecin</Option>
                    <Option value="Ingénieur">Ingénieur</Option>
                    <Option value="Enseignant">Enseignant</Option>
                    <Option value="Avocat">Avocat</Option>
                    <Option value="Comptable">Comptable</Option>
                    <Option value="Infirmier">Infirmier</Option>
                    <Option value="Pharmacien">Pharmacien</Option>
                    <Option value="Architecte">Architecte</Option>
                    <Option value="Commerçant">Commerçant</Option>
                    <Option value="Fonctionnaire">Fonctionnaire</Option>
                    <Option value="Artisan">Artisan</Option>
                    <Option value="Chauffeur">Chauffeur</Option>
                    <Option value="Agriculteur">Agriculteur</Option>
                    <Option value="Retraité">Retraité</Option>
                    <Option value="Sans emploi">Sans emploi</Option>
                    <Option value="Autre">Autre</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="professionArabe" label="Profession (العربية)">
                  <Select
                    placeholder="اختر المهنة"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Option value="طبيب">طبيب</Option>
                    <Option value="مهندس">مهندس</Option>
                    <Option value="أستاذ">أستاذ</Option>
                    <Option value="محامي">محامي</Option>
                    <Option value="محاسب">محاسب</Option>
                    <Option value="ممرض">ممرض</Option>
                    <Option value="صيدلي">صيدلي</Option>
                    <Option value="معماري">معماري</Option>
                    <Option value="تاجر">تاجر</Option>
                    <Option value="موظف">موظف</Option>
                    <Option value="حرفي">حرفي</Option>
                    <Option value="سائق">سائق</Option>
                    <Option value="فلاح">فلاح</Option>
                    <Option value="متقاعد">متقاعد</Option>
                    <Option value="عاطل">عاطل</Option>
                    <Option value="أخرى">أخرى</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="enfantIds"
              label="Enfants (Élèves)"
              help="Sélectionnez les élèves dont ce parent est responsable"
            >
              <Select
                mode="multiple"
                placeholder="Sélectionner les enfants"
                loading={loadingStudents}
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const student = students.find(s => s.id === option?.value)
                  if (!student) return false
                  const searchText = `${student.prenom} ${student.nom} ${student.email}`.toLowerCase()
                  return searchText.includes(input.toLowerCase())
                }}
              >
                {students.map(student => (
                  <Option key={student.id} value={student.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {student.prenom} {student.nom}
                      </span>
                      <span className="text-xs text-gray-500">
                        {student.email}
                      </span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="lienParente"
              label="Lien de parenté"
              rules={[{ required: true, message: 'Le lien de parenté est requis' }]}
            >
              <Select placeholder="Sélectionner le lien de parenté">
                <Option value="père">Père</Option>
                <Option value="mère">Mère</Option>
                <Option value="tuteur">Tuteur légal</Option>
                <Option value="grand-parent">Grand-parent</Option>
                <Option value="oncle">Oncle</Option>
                <Option value="tante">Tante</Option>
                <Option value="autre">Autre</Option>
              </Select>
            </Form.Item>
          </Card>
        )
      case 'ADMIN':
      default:
        return null
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
            rules={[{ required: true, message: 'Le rôle est requis' }]}
          >
            <Select
              placeholder="Sélectionner un rôle"
              disabled={disabled || !!user}
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

      {/* Formulaire de base - après sélection du rôle */}
      {selectedRole && (
        <BaseUserForm
          form={form}
          user={user}
          disabled={disabled}
          showPasswordField={!user}
        />
      )}

      {/* Formulaire spécialisé selon le rôle */}
      {selectedRole && renderRoleSpecificForm()}
    </>
  )
}

export default UserFormSimple