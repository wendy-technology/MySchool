import React, { useState, useEffect } from 'react'
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
  Divider
} from 'antd'
import { 
  ArrowLeftOutlined, 
  SaveOutlined,
  HomeOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ClasseService } from '@/services'
import { UserService } from '@/services'
import type { CreateClasseForm } from '@/services/classeService'
import type { User } from '@/types/api'
import type { RootState } from '@/store'

const { Option } = Select

const CreateClassePage: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [enseignants, setEnseignants] = useState<User[]>([])
  const [loadingEnseignants, setLoadingEnseignants] = useState(false)
  
  const currentUser = useSelector((state: RootState) => state.auth.user)

  useEffect(() => {
    loadEnseignants()
  }, [])

  const loadEnseignants = async () => {
    try {
      setLoadingEnseignants(true)
      const data = await UserService.getTeachers()
      setEnseignants(data)
    } catch (error) {
      console.warn('Impossible de charger les enseignants')
      // Mock data
      setEnseignants([
        { id: 'teacher1', prenom: 'Ahmed', nom: 'Benali', email: 'ahmed.benali@school.dz', role: 'ENSEIGNANT' },
        { id: 'teacher2', prenom: 'Fatima', nom: 'Kaddour', email: 'fatima.kaddour@school.dz', role: 'ENSEIGNANT' }
      ] as User[])
    } finally {
      setLoadingEnseignants(false)
    }
  }

  const handleSubmit = async (values: CreateClasseForm) => {
    try {
      setLoading(true)
      
      const classeData = {
        ...values,
        etablissementId: currentUser?.etablissementId || 'etablissement-default',
        anneeScolaireId: 'annee-2024-2025' // TODO: Get from context or selection
      }
      
      console.log('Début création classe:', classeData)
      console.log('Current user:', currentUser)
      
      const result = await ClasseService.createClasse(classeData)
      console.log('Classe créée:', result)
      
      message.success('Classe créée avec succès!')
      navigate('/admin/classes', { replace: true })
      
    } catch (error) {
      console.error('Erreur création classe:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/admin/classes')
  }

  const handleCycleChange = (cycle: string) => {
    // Reset niveau and filiere when cycle changes
    form.setFieldsValue({ niveau: undefined, filiere: undefined })
  }

  const getNiveauxByCycle = (cycle: string) => {
    const niveaux = ClasseService.getNiveaux()
    if (cycle === 'PRIMAIRE') {
      return niveaux.filter(niveau => ['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(niveau.value))
    } else if (cycle === 'MOYEN') {
      return niveaux.filter(niveau => niveau.value.includes('_AM'))
    } else if (cycle === 'SECONDAIRE') {
      return niveaux.filter(niveau => niveau.value.includes('_AS') || niveau.value === 'TERMINALE')
    }
    return niveaux
  }

  const selectedCycle = Form.useWatch('cycle', form)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">
            Nouvelle Classe
          </h1>
          <p className="text-gray-600 mt-1">
            Créer une nouvelle classe
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

      {/* Form */}
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
              <HomeOutlined className="text-blue-600" />
              Informations de la classe
            </h3>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="nom"
                  label="Nom de la classe"
                  rules={[
                    { required: true, message: 'Le nom est requis' },
                    { min: 2, message: 'Le nom doit contenir au moins 2 caractères' }
                  ]}
                >
                  <Input placeholder="Ex: 1ère AS Sciences A" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="nomArabe"
                  label="Nom en arabe"
                >
                  <Input 
                    placeholder="اسم القسم"
                    dir="rtl"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="cycle"
                  label="Cycle"
                  rules={[
                    { required: true, message: 'Le cycle est requis' }
                  ]}
                >
                  <Select
                    placeholder="Sélectionner un cycle"
                    onChange={handleCycleChange}
                  >
                    {ClasseService.getCycles().map(cycle => (
                      <Option key={cycle.value} value={cycle.value}>{cycle.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="niveau"
                  label="Niveau"
                  rules={[
                    { required: true, message: 'Le niveau est requis' }
                  ]}
                >
                  <Select
                    placeholder="Sélectionner un niveau"
                    disabled={!selectedCycle}
                  >
                    {selectedCycle && getNiveauxByCycle(selectedCycle).map(niveau => (
                      <Option key={niveau.value} value={niveau.value}>{niveau.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="filiere"
                  label="Filière"
                  rules={[
                    { required: true, message: 'La filière est requise' }
                  ]}
                >
                  <Select
                    placeholder="Sélectionner une filière"
                    showSearch
                    optionFilterProp="children"
                  >
                    {ClasseService.getFilieres().map(filiere => (
                      <Option key={filiere.value} value={filiere.value}>{filiere.label}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="effectifMax"
                  label="Effectif maximum"
                  rules={[
                    { required: true, message: 'L\'effectif maximum est requis' },
                    { type: 'number', min: 1, max: 50, message: 'L\'effectif doit être entre 1 et 50' }
                  ]}
                  initialValue={35}
                >
                  <InputNumber 
                    min={1} 
                    max={50} 
                    style={{ width: '100%' }}
                    placeholder="35"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="salleClasse"
                  label="Salle de classe"
                >
                  <Input placeholder="Ex: Salle 101, Labo Sciences..." />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Enseignant principal */}
          <div className="mb-6">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
              <UserOutlined className="text-green-600" />
              Enseignant principal (optionnel)
            </h3>
            
            <Form.Item
              name="enseignantPrincipalId"
              label="Enseignant principal"
              help="L'enseignant principal sera responsable de cette classe"
            >
              <Select
                placeholder="Sélectionner un enseignant principal"
                allowClear
                loading={loadingEnseignants}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const enseignant = enseignants.find(e => e.id === option?.value)
                  if (!enseignant) return false
                  const searchText = `${enseignant.prenom} ${enseignant.nom} ${enseignant.email}`.toLowerCase()
                  return searchText.includes(input.toLowerCase())
                }}
              >
                {enseignants.map(enseignant => (
                  <Option key={enseignant.id} value={enseignant.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {enseignant.prenom} {enseignant.nom}
                      </span>
                      <span className="text-xs text-gray-500">
                        {enseignant.email}
                      </span>
                    </div>
                  </Option>
                ))}
              </Select>
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
              Créer la classe
            </Button>
          </div>
        </Form>
      </Card>

      {/* Help Information */}
      <Card className="mt-6" title="💡 Informations utiles">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Naming des classes</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Utilisez une nomenclature claire (ex: 1ère AS Sciences A)</li>
              <li>• Différenciez les sections par des lettres (A, B, C...)</li>
              <li>• Le nom apparaîtra dans tous les documents</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Effectif et organisation</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• L'effectif max recommandé : 30-35 élèves</li>
              <li>• Vous pourrez modifier ces paramètres plus tard</li>
              <li>• L'enseignant principal peut être assigné après création</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default CreateClassePage