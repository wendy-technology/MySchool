import React, { useState, useEffect } from 'react'
import { 
  Form, 
  Input, 
  Select, 
  Card, 
  Row, 
  Col, 
  Tag,
  message,
  Divider,
  Avatar,
  List
} from 'antd'
import { 
  TeamOutlined, 
  UserOutlined,
  BankOutlined,
  BookOutlined
} from '@ant-design/icons'
import BaseUserForm from './BaseUserForm'
import { UserService } from '@/services'
import type { 
  UserWithDetails, 
  CreateParentForm, 
  User 
} from '@/types/api'

const { Option } = Select

interface ParentFormProps {
  form: any
  user?: UserWithDetails
  disabled?: boolean
  showPasswordField?: boolean
}

const ParentForm: React.FC<ParentFormProps> = ({
  form,
  user,
  disabled = false,
  showPasswordField = true
}) => {
  const [students, setStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    if (user?.parent) {
      form.setFieldsValue({
        profession: user.parent.profession,
        professionArabe: user.parent.professionArabe,
        enfantIds: user.parent.enfants?.map(e => e.userId) || []
      })
    }
  }, [user, form])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const data = await UserService.getStudents()
      setStudents(data)
    } catch (error) {
      message.error('Erreur lors du chargement des élèves')
    } finally {
      setLoading(false)
    }
  }

  const professions = [
    'Médecin',
    'Ingénieur',
    'Enseignant',
    'Avocat',
    'Infirmier',
    'Architecte',
    'Comptable',
    'Pharmacien',
    'Dentiste',
    'Vétérinaire',
    'Agriculteur',
    'Commerçant',
    'Artisan',
    'Employé de bureau',
    'Ouvrier',
    'Chauffeur',
    'Policier',
    'Militaire',
    'Retraité',
    'Sans profession',
    'Autre'
  ]

  return (
    <>
      <BaseUserForm
        form={form}
        user={user}
        disabled={disabled}
        showPasswordField={showPasswordField}
      />

      {/* Informations professionnelles */}
      <Card 
        title={
          <span>
            <BankOutlined className="mr-2" />
            Informations professionnelles
          </span>
        }
        className="mb-6"
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="profession"
              label="Profession"
              rules={[
                { required: true, message: 'La profession est requise' }
              ]}
            >
              <Select
                placeholder="Sélectionner une profession"
                disabled={disabled}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {professions.map(profession => (
                  <Option key={profession} value={profession}>
                    {profession}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="professionArabe"
              label="Profession (العربية)"
            >
              <Input 
                placeholder="المهنة"
                disabled={disabled}
                dir="rtl"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Enfants/Élèves */}
      <Card 
        title={
          <span>
            <TeamOutlined className="mr-2" />
            Enfants scolarisés
          </span>
        }
        className="mb-6"
      >
        <Form.Item
          name="enfantIds"
          label="Enfants"
          help="Sélectionnez les élèves dont ce parent est responsable"
          rules={[
            { required: true, message: 'Au moins un enfant doit être sélectionné' }
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Sélectionner les enfants"
            disabled={disabled || loading}
            loading={loading}
            optionFilterProp="children"
            filterOption={(input, option: any) => {
              const student = students.find(s => s.id === option.value)
              if (!student) return false
              const searchText = `${student.prenom} ${student.nom}`.toLowerCase()
              return searchText.includes(input.toLowerCase())
            }}
            tagRender={({ label, value, closable, onClose }) => {
              const student = students.find(s => s.id === value)
              return (
                <Tag
                  color="green"
                  closable={closable && !disabled}
                  onClose={onClose}
                  style={{ marginRight: 3 }}
                >
                  {student ? `${student.prenom} ${student.nom}` : label}
                </Tag>
              )
            }}
          >
            {students.map(student => {
              // Récupérer les informations de l'élève avec sa classe
              const studentWithDetails = student as any // Type casting temporaire
              return (
                <Option key={student.id} value={student.id}>
                  <div className="flex items-center gap-2">
                    <Avatar size="small" icon={<UserOutlined />}>
                      {`${student.prenom[0]}${student.nom[0]}`}
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">
                        {student.prenom} {student.nom}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.email}
                        {studentWithDetails.eleve?.classe && (
                          <span className="ml-2">
                            • {studentWithDetails.eleve.classe.nom}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Option>
              )
            })}
          </Select>
        </Form.Item>

        {/* Affichage des enfants sélectionnés */}
        <Form.Item shouldUpdate={(prevValues, currentValues) => 
          prevValues.enfantIds !== currentValues.enfantIds
        }>
          {({ getFieldValue }) => {
            const selectedEnfantIds = getFieldValue('enfantIds') || []
            const selectedEnfants = students.filter(s => 
              selectedEnfantIds.includes(s.id)
            )

            if (selectedEnfants.length === 0) return null

            return (
              <div className="mt-4">
                <Divider orientation="left" className="text-sm">
                  Enfants sélectionnés ({selectedEnfants.length})
                </Divider>
                <List
                  dataSource={selectedEnfants}
                  renderItem={(student) => {
                    const studentWithDetails = student as any
                    return (
                      <List.Item className="border rounded p-3">
                        <List.Item.Meta
                          avatar={
                            <Avatar icon={<UserOutlined />}>
                              {`${student.prenom[0]}${student.nom[0]}`}
                            </Avatar>
                          }
                          title={
                            <div className="flex items-center gap-2">
                              <span>{`${student.prenom} ${student.nom}`}</span>
                              {studentWithDetails.eleve?.classe && (
                                <Tag color="blue" icon={<BookOutlined />}>
                                  {studentWithDetails.eleve.classe.nom}
                                </Tag>
                              )}
                            </div>
                          }
                          description={
                            <div>
                              <div>{student.email}</div>
                              {studentWithDetails.eleve?.numeroEleve && (
                                <div className="text-sm text-gray-500">
                                  N° élève: {studentWithDetails.eleve.numeroEleve}
                                </div>
                              )}
                              {student.dateNaissance && (
                                <div className="text-sm text-gray-500">
                                  Né(e) le: {new Date(student.dateNaissance).toLocaleDateString('fr-FR')}
                                </div>
                              )}
                            </div>
                          }
                        />
                      </List.Item>
                    )
                  }}
                />
              </div>
            )
          }}
        </Form.Item>

        {/* Informations supplémentaires */}
        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900 mb-2">
            📋 Informations importantes
          </h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Ce parent aura accès aux informations scolaires de ses enfants</li>
            <li>• Il pourra consulter les notes, bulletins et absences</li>
            <li>• Il recevra les notifications concernant ses enfants</li>
            <li>• Il pourra justifier les absences de ses enfants</li>
          </ul>
        </div>
      </Card>
    </>
  )
}

export default ParentForm