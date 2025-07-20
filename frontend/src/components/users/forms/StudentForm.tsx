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
  Spin,
  Divider,
  Avatar,
  List
} from 'antd'
import { 
  BookOutlined, 
  UserOutlined,
  TeamOutlined,
  HomeOutlined
} from '@ant-design/icons'
import BaseUserForm from './BaseUserForm'
import { UserService } from '@/services'
import type { 
  UserWithDetails, 
  CreateEleveForm, 
  Classe,
  User 
} from '@/types/api'

const { Option } = Select

interface StudentFormProps {
  form: any
  user?: UserWithDetails
  disabled?: boolean
  showPasswordField?: boolean
}

const StudentForm: React.FC<StudentFormProps> = ({
  form,
  user,
  disabled = false,
  showPasswordField = true
}) => {
  const [classes, setClasses] = useState<Classe[]>([])
  const [parents, setParents] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null)

  useEffect(() => {
    loadClasses()
    loadParents()
  }, [])

  useEffect(() => {
    if (user?.eleve) {
      form.setFieldsValue({
        numeroEleve: user.eleve.numeroEleve,
        classeId: user.eleve.classe?.id,
        parentIds: user.eleve.parents?.map(p => p.userId) || []
      })
      setSelectedClasse(user.eleve.classe || null)
    }
  }, [user, form])

  const loadClasses = async () => {
    try {
      setLoading(true)
      const data = await UserService.getClasses()
      setClasses(data)
    } catch (error) {
      message.error('Erreur lors du chargement des classes')
    } finally {
      setLoading(false)
    }
  }

  const loadParents = async () => {
    try {
      const data = await UserService.getParents()
      setParents(data)
    } catch (error) {
      message.error('Erreur lors du chargement des parents')
    }
  }

  const generateNumeroEleve = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `EL${year}${random}`
  }

  const handleGenerateNumero = () => {
    form.setFieldValue('numeroEleve', generateNumeroEleve())
  }

  const handleClasseChange = (classeId: string) => {
    const classe = classes.find(c => c.id === classeId)
    setSelectedClasse(classe || null)
  }

  const selectedParents = parents.filter(parent => 
    form.getFieldValue('parentIds')?.includes(parent.id)
  )

  return (
    <>
      <BaseUserForm
        form={form}
        user={user}
        disabled={disabled}
        showPasswordField={showPasswordField}
      />

      {/* Informations scolaires */}
      <Card 
        title={
          <span>
            <BookOutlined className="mr-2" />
            Informations scolaires
          </span>
        }
        className="mb-6"
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="numeroEleve"
              label="Numéro d'élève"
              rules={[
                { required: true, message: 'Le numéro d\'élève est requis' }
              ]}
            >
              <Input 
                placeholder="EL20240001"
                disabled={disabled}
                addonAfter={
                  !disabled && (
                    <span 
                      className="cursor-pointer text-blue-600 hover:text-blue-800"
                      onClick={handleGenerateNumero}
                      title="Générer automatiquement"
                    >
                      Auto
                    </span>
                  )
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="classeId"
              label="Classe"
              rules={[
                { required: true, message: 'La classe est requise' }
              ]}
            >
              <Select
                placeholder="Sélectionner une classe"
                disabled={disabled || loading}
                loading={loading}
                onChange={handleClasseChange}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {classes.map(classe => (
                  <Option key={classe.id} value={classe.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{classe.nom}</span>
                      <span className="text-xs text-gray-500">
                        {classe.niveau} - {classe.cycle} - {classe.filiere}
                      </span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Informations sur la classe sélectionnée */}
        {selectedClasse && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h4 className="text-sm font-medium text-green-900 mb-3 flex items-center gap-2">
              <HomeOutlined />
              Informations sur la classe
            </h4>
            <Row gutter={16}>
              <Col xs={12} md={6}>
                <div className="text-xs text-gray-600">Nom</div>
                <div className="font-medium">{selectedClasse.nom}</div>
                {selectedClasse.nomArabe && (
                  <div className="text-sm text-gray-500" dir="rtl">
                    {selectedClasse.nomArabe}
                  </div>
                )}
              </Col>
              <Col xs={12} md={6}>
                <div className="text-xs text-gray-600">Niveau</div>
                <div className="font-medium">{selectedClasse.niveau}</div>
              </Col>
              <Col xs={12} md={6}>
                <div className="text-xs text-gray-600">Filière</div>
                <div className="font-medium">{selectedClasse.filiere}</div>
              </Col>
              <Col xs={12} md={6}>
                <div className="text-xs text-gray-600">Effectif max</div>
                <div className="font-medium">{selectedClasse.effectifMax}</div>
              </Col>
            </Row>
            {selectedClasse.salleClasse && (
              <div className="mt-2">
                <div className="text-xs text-gray-600">Salle de classe</div>
                <div className="font-medium">{selectedClasse.salleClasse}</div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Informations parentales */}
      <Card 
        title={
          <span>
            <TeamOutlined className="mr-2" />
            Informations parentales
          </span>
        }
        className="mb-6"
      >
        <Form.Item
          name="parentIds"
          label="Parents/Tuteurs"
          help="Sélectionnez les parents ou tuteurs de cet élève"
        >
          <Select
            mode="multiple"
            placeholder="Sélectionner les parents"
            disabled={disabled}
            optionFilterProp="children"
            filterOption={(input, option: any) => {
              const parent = parents.find(p => p.id === option.value)
              if (!parent) return false
              const searchText = `${parent.prenom} ${parent.nom} ${parent.email}`.toLowerCase()
              return searchText.includes(input.toLowerCase())
            }}
            tagRender={({ label, value, closable, onClose }) => {
              const parent = parents.find(p => p.id === value)
              return (
                <Tag
                  color="purple"
                  closable={closable && !disabled}
                  onClose={onClose}
                  style={{ marginRight: 3 }}
                >
                  {parent ? `${parent.prenom} ${parent.nom}` : label}
                </Tag>
              )
            }}
          >
            {parents.map(parent => (
              <Option key={parent.id} value={parent.id}>
                <div className="flex items-center gap-2">
                  <Avatar size="small" icon={<UserOutlined />}>
                    {`${parent.prenom[0]}${parent.nom[0]}`}
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">
                      {parent.prenom} {parent.nom}
                    </div>
                    <div className="text-xs text-gray-500">
                      {parent.email}
                    </div>
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Affichage des parents sélectionnés */}
        <Form.Item shouldUpdate={(prevValues, currentValues) => 
          prevValues.parentIds !== currentValues.parentIds
        }>
          {({ getFieldValue }) => {
            const selectedParentIds = getFieldValue('parentIds') || []
            const selectedParents = parents.filter(p => 
              selectedParentIds.includes(p.id)
            )

            if (selectedParents.length === 0) return null

            return (
              <div className="mt-4">
                <Divider orientation="left" className="text-sm">
                  Parents sélectionnés ({selectedParents.length})
                </Divider>
                <List
                  dataSource={selectedParents}
                  renderItem={(parent) => (
                    <List.Item className="border rounded p-3">
                      <List.Item.Meta
                        avatar={
                          <Avatar icon={<UserOutlined />}>
                            {`${parent.prenom[0]}${parent.nom[0]}`}
                          </Avatar>
                        }
                        title={`${parent.prenom} ${parent.nom}`}
                        description={
                          <div>
                            <div>{parent.email}</div>
                            {parent.telephone && (
                              <div className="text-sm text-gray-500">
                                📞 {parent.telephone}
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            )
          }}
        </Form.Item>
      </Card>
    </>
  )
}

export default StudentForm