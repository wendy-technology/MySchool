import React, { useState } from 'react'
import { 
  Card, 
  Button, 
  Form, 
  Input, 
  Select,
  message,
  Row,
  Col,
  Divider
} from 'antd'
import { 
  ArrowLeftOutlined, 
  SaveOutlined,
  BankOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { EtablissementService } from '@/services'
import type { CreateEtablissementForm } from '@/services/etablissementService'

const { Option } = Select
const { TextArea } = Input

const CreateEtablissementPage: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: CreateEtablissementForm) => {
    try {
      setLoading(true)
      console.log('Création établissement:', values)
      
      await EtablissementService.createEtablissement(values)
      message.success('Établissement créé avec succès!')
      
      // Redirect to list
      navigate('/admin/etablissements', { replace: true })
      
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/admin/etablissements')
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">
            Nouvel Établissement
          </h1>
          <p className="text-gray-600 mt-1">
            Créer un nouvel établissement scolaire
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
              <BankOutlined className="text-blue-600" />
              Informations générales
            </h3>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="nom"
                  label="Nom de l'établissement"
                  rules={[
                    { required: true, message: 'Le nom est requis' },
                    { min: 3, message: 'Le nom doit contenir au moins 3 caractères' }
                  ]}
                >
                  <Input placeholder="Ex: Lycée Ibn Khaldoun" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="nomArabe"
                  label="Nom en arabe"
                >
                  <Input 
                    placeholder="اسم المؤسسة"
                    dir="rtl"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="wilaya"
                  label="Wilaya"
                  rules={[
                    { required: true, message: 'La wilaya est requise' }
                  ]}
                >
                  <Select
                    placeholder="Sélectionner une wilaya"
                    showSearch
                    optionFilterProp="children"
                  >
                    {EtablissementService.getWilayas().map(wilaya => (
                      <Option key={wilaya} value={wilaya}>{wilaya}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="commune"
                  label="Commune"
                  rules={[
                    { required: true, message: 'La commune est requise' }
                  ]}
                >
                  <Input placeholder="Ex: Bab Ezzouar" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="telephone"
                  label="Téléphone"
                  rules={[
                    { pattern: /^[0-9+\-\s()]+$/, message: 'Format de téléphone invalide' }
                  ]}
                >
                  <Input placeholder="+213 21 XX XX XX" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="adresse"
              label="Adresse"
              rules={[
                { required: true, message: 'L\'adresse est requise' }
              ]}
            >
              <TextArea 
                rows={3}
                placeholder="Adresse complète de l'établissement"
              />
            </Form.Item>

            <Form.Item
              name="adresseArabe"
              label="Adresse en arabe"
            >
              <TextArea 
                rows={3}
                placeholder="العنوان الكامل للمؤسسة"
                dir="rtl"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { type: 'email', message: 'Format d\'email invalide' }
              ]}
            >
              <Input placeholder="contact@etablissement.edu.dz" />
            </Form.Item>
          </div>

          <Divider />

          {/* Informations direction */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">
              Direction
            </h3>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="directeur"
                  label="Directeur/Directrice"
                >
                  <Input placeholder="Nom complet du directeur" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="directeurArabe"
                  label="Directeur (العربية)"
                >
                  <Input 
                    placeholder="اسم المدير"
                    dir="rtl"
                  />
                </Form.Item>
              </Col>
            </Row>
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
              Créer l'établissement
            </Button>
          </div>
        </Form>
      </Card>

      {/* Help Information */}
      <Card className="mt-6" title="💡 Informations utiles">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Nom de l'établissement</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Utilisez le nom officiel complet</li>
              <li>• Évitez les abréviations</li>
              <li>• Le nom apparaîtra sur tous les documents</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Localisation</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• La wilaya et commune sont obligatoires</li>
              <li>• L'adresse doit être précise et complète</li>
              <li>• Ces informations servent pour les rapports officiels</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default CreateEtablissementPage