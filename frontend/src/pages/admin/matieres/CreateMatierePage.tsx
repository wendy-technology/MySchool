import React, { useState } from 'react'
import { 
  Card, 
  Button, 
  Form, 
  Input, 
  Select,
  InputNumber,
  message,
  Row,
  Col,
  Divider,
  ColorPicker,
  List,
  Typography
} from 'antd'
import { 
  ArrowLeftOutlined, 
  SaveOutlined,
  BookOutlined,
  BulbOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { MatiereService } from '@/services'
import type { CreateMatiereForm } from '@/services/matiereService'

const { Option } = Select
const { TextArea } = Input
const { Title } = Typography

const CreateMatierePage: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#3b82f6')

  const handleSubmit = async (values: CreateMatiereForm) => {
    try {
      setLoading(true)
      
      const matiereData = {
        ...values,
        couleur: selectedColor,
        code: values.code || MatiereService.generateMatiereCode(values.nom)
      }
      
      console.log('Création matière:', matiereData)
      await MatiereService.createMatiere(matiereData)
      message.success('Matière créée avec succès!')
      
      navigate('/admin/matieres', { replace: true })
      
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/admin/matieres')
  }

  const handleNomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nom = e.target.value
    if (nom && !form.getFieldValue('code')) {
      const generatedCode = MatiereService.generateMatiereCode(nom)
      form.setFieldValue('code', generatedCode)
    }
  }

  const handleQuickSelect = (matiere: any) => {
    form.setFieldsValue({
      nom: matiere.nom,
      nomArabe: matiere.nomArabe,
      coefficient: matiere.coefficient,
      code: MatiereService.generateMatiereCode(matiere.nom)
    })
    setSelectedColor(matiere.couleur)
  }

  const colorOptions = MatiereService.getColorOptions()
  const standardMatieres = MatiereService.getStandardMatieres()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">
            Nouvelle Matière
          </h1>
          <p className="text-gray-600 mt-1">
            Créer une nouvelle matière d'enseignement
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

      <Row gutter={24}>
        {/* Form */}
        <Col xs={24} lg={16}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              size="large"
              scrollToFirstError
            >
              {/* Informations générales */}
              <div className="mb-6">
                <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                  <BookOutlined className="text-blue-600" />
                  Informations de la matière
                </h3>
                
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="nom"
                      label="Nom de la matière"
                      rules={[
                        { required: true, message: 'Le nom est requis' },
                        { min: 2, message: 'Le nom doit contenir au moins 2 caractères' }
                      ]}
                    >
                      <Input 
                        placeholder="Ex: Mathématiques" 
                        onChange={handleNomChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="nomArabe"
                      label="Nom en arabe"
                    >
                      <Input 
                        placeholder="اسم المادة"
                        dir="rtl"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="code"
                      label="Code matière"
                      rules={[
                        { required: true, message: 'Le code est requis' },
                        { min: 2, max: 6, message: 'Le code doit contenir 2-6 caractères' },
                        { pattern: /^[A-Z0-9]+$/, message: 'Le code doit contenir uniquement des lettres majuscules et chiffres' }
                      ]}
                    >
                      <Input 
                        placeholder="MATH" 
                        style={{ textTransform: 'uppercase' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="coefficient"
                      label="Coefficient"
                      rules={[
                        { required: true, message: 'Le coefficient est requis' },
                        { type: 'number', min: 1, max: 5, message: 'Le coefficient doit être entre 1 et 5' }
                      ]}
                      initialValue={2}
                    >
                      <InputNumber 
                        min={1} 
                        max={5} 
                        style={{ width: '100%' }}
                        placeholder="2"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Couleur"
                      help="Couleur d'identification de la matière"
                    >
                      <div className="flex gap-2 flex-wrap">
                        {colorOptions.map(option => (
                          <Button
                            key={option.value}
                            size="small"
                            style={{
                              backgroundColor: option.color,
                              borderColor: selectedColor === option.value ? '#000' : option.color,
                              borderWidth: selectedColor === option.value ? 2 : 1
                            }}
                            onClick={() => setSelectedColor(option.value)}
                          >
                            {selectedColor === option.value && '✓'}
                          </Button>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: selectedColor }}
                        />
                        <span className="text-sm text-gray-500">{selectedColor}</span>
                      </div>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="description"
                  label="Description (optionnel)"
                >
                  <TextArea 
                    rows={3}
                    placeholder="Description de la matière, objectifs, etc."
                  />
                </Form.Item>

                <Form.Item
                  name="descriptionArabe"
                  label="Description en arabe (optionnel)"
                >
                  <TextArea 
                    rows={3}
                    placeholder="وصف المادة والأهداف"
                    dir="rtl"
                  />
                </Form.Item>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t">
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
                  Créer la matière
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        {/* Quick Selection */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <span>
                <BulbOutlined className="mr-2" />
                Sélection rapide
              </span>
            }
            size="small"
          >
            <p className="text-sm text-gray-600 mb-4">
              Cliquez sur une matière pour remplir automatiquement le formulaire :
            </p>
            
            <List
              size="small"
              dataSource={standardMatieres.slice(0, 10)}
              renderItem={(matiere) => (
                <List.Item
                  className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => handleQuickSelect(matiere)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: matiere.couleur }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{matiere.nom}</div>
                      <div className="text-xs text-gray-500" dir="rtl">
                        {matiere.nomArabe}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Coeff. {matiere.coefficient}
                    </div>
                  </div>
                </List.Item>
              )}
            />
            
            <div className="mt-4 text-center">
              <Button 
                type="link" 
                size="small"
                onClick={() => {
                  navigate('/admin/matieres')
                  // Could open a modal to create all standard subjects
                }}
              >
                Voir toutes les matières standard ({standardMatieres.length})
              </Button>
            </div>
          </Card>

          {/* Help Information */}
          <Card className="mt-4" title="💡 Conseils" size="small">
            <div className="text-sm space-y-2">
              <div>
                <strong>Code matière :</strong>
                <div className="text-gray-600">
                  • Auto-généré à partir du nom
                  • Utilisé dans les bulletins et exports
                  • Doit être unique
                </div>
              </div>
              <div>
                <strong>Coefficient :</strong>
                <div className="text-gray-600">
                  • Poids de la matière dans la moyenne
                  • Suit les directives ministérielles
                  • Peut varier selon les filières
                </div>
              </div>
              <div>
                <strong>Couleur :</strong>
                <div className="text-gray-600">
                  • Identification visuelle
                  • Utilisée dans les plannings
                  • Facilitez la navigation
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CreateMatierePage