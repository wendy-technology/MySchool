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
  Spin
} from 'antd'
import { BookOutlined } from '@ant-design/icons'
import BaseUserForm from './BaseUserForm'
import { UserService } from '@/services'
import type { 
  UserWithDetails, 
  CreateEnseignantForm, 
  Matiere 
} from '@/types/api'

const { Option } = Select

interface TeacherFormProps {
  form: any
  user?: UserWithDetails
  disabled?: boolean
  showPasswordField?: boolean
}

const TeacherForm: React.FC<TeacherFormProps> = ({
  form,
  user,
  disabled = false,
  showPasswordField = true
}) => {
  const [matieres, setMatieres] = useState<Matiere[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMatieres()
  }, [])

  useEffect(() => {
    if (user?.enseignant) {
      form.setFieldsValue({
        matricule: user.enseignant.matricule,
        specialite: user.enseignant.specialite,
        specialiteArabe: user.enseignant.specialiteArabe,
        matiereIds: user.enseignant.matieres?.map(m => m.id) || []
      })
    }
  }, [user, form])

  const loadMatieres = async () => {
    try {
      setLoading(true)
      const data = await UserService.getSubjects()
      setMatieres(data)
    } catch (error) {
      message.error('Erreur lors du chargement des matières')
    } finally {
      setLoading(false)
    }
  }

  const generateMatricule = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `ENS${year}${random}`
  }

  const handleGenerateMatricule = () => {
    form.setFieldValue('matricule', generateMatricule())
  }

  const specialites = [
    'Mathématiques',
    'Physique',
    'Chimie',
    'Sciences Naturelles',
    'Français',
    'Anglais',
    'Arabe',
    'Histoire-Géographie',
    'Éducation Islamique',
    'Éducation Physique',
    'Musique',
    'Arts Plastiques',
    'Informatique',
    'Philosophie'
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
            <BookOutlined className="mr-2" />
            Informations professionnelles
          </span>
        }
        className="mb-6"
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="matricule"
              label="Matricule"
              rules={[
                { required: true, message: 'Le matricule est requis' }
              ]}
            >
              <Input 
                placeholder="ENS20240001"
                disabled={disabled}
                addonAfter={
                  !disabled && (
                    <span 
                      className="cursor-pointer text-blue-600 hover:text-blue-800"
                      onClick={handleGenerateMatricule}
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
              name="specialite"
              label="Spécialité"
              rules={[
                { required: true, message: 'La spécialité est requise' }
              ]}
            >
              <Select
                placeholder="Sélectionner une spécialité"
                disabled={disabled}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {specialites.map(specialite => (
                  <Option key={specialite} value={specialite}>
                    {specialite}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="specialiteArabe"
          label="Spécialité (العربية)"
        >
          <Input 
            placeholder="التخصص"
            disabled={disabled}
            dir="rtl"
          />
        </Form.Item>

        <Form.Item
          name="matiereIds"
          label="Matières enseignées"
          help="Sélectionnez les matières que cet enseignant peut enseigner"
        >
          <Select
            mode="multiple"
            placeholder="Sélectionner les matières"
            disabled={disabled || loading}
            loading={loading}
            optionFilterProp="children"
            filterOption={(input, option) =>
              String(option?.children || '').toLowerCase().includes(input.toLowerCase())
            }
            tagRender={({ label, value, closable, onClose }) => (
              <Tag
                color="blue"
                closable={closable && !disabled}
                onClose={onClose}
                style={{ marginRight: 3 }}
              >
                {label}
              </Tag>
            )}
          >
            {matieres.map(matiere => (
              <Option key={matiere.id} value={matiere.id}>
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: matiere.couleur }}
                  />
                  {matiere.nom}
                  {matiere.nomArabe && (
                    <span className="text-gray-500" dir="rtl">
                      ({matiere.nomArabe})
                    </span>
                  )}
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Informations affichées pour les matières sélectionnées */}
        <Form.Item shouldUpdate={(prevValues, currentValues) => 
          prevValues.matiereIds !== currentValues.matiereIds
        }>
          {({ getFieldValue }) => {
            const selectedMatiereIds = getFieldValue('matiereIds') || []
            const selectedMatieres = matieres.filter(m => 
              selectedMatiereIds.includes(m.id)
            )

            if (selectedMatieres.length === 0) return null

            return (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-3">
                  Matières sélectionnées ({selectedMatieres.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedMatieres.map(matiere => (
                    <div
                      key={matiere.id}
                      className="flex items-center gap-2 p-2 bg-white rounded border"
                    >
                      <span
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: matiere.couleur }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {matiere.nom}
                        </div>
                        <div className="text-xs text-gray-500">
                          Coeff: {matiere.coefficient}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }}
        </Form.Item>
      </Card>
    </>
  )
}

export default TeacherForm