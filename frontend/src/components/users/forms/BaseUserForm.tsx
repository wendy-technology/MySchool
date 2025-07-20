import React, { useState, useEffect } from 'react'
import { 
  Form, 
  Input, 
  DatePicker, 
  Switch, 
  Upload, 
  Avatar, 
  Button,
  Row,
  Col,
  Card,
  Space,
  message
} from 'antd'
import { UploadOutlined, UserOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import dayjs from 'dayjs'
import type { UserWithDetails, CreateUserForm, UpdateUserForm } from '@/types/api'

interface BaseUserFormProps {
  form: any
  user?: UserWithDetails
  disabled?: boolean
  showPasswordField?: boolean
  onPhotoChange?: (photoUrl: string) => void
}

const BaseUserForm: React.FC<BaseUserFormProps> = ({
  form,
  user,
  disabled = false,
  showPasswordField = true,
  onPhotoChange
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(user?.photoUrl)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        nomArabe: user.nomArabe,
        prenomArabe: user.prenomArabe,
        telephone: user.telephone,
        adresse: user.adresse,
        dateNaissance: user.dateNaissance ? dayjs(user.dateNaissance) : undefined,
        lieuNaissance: user.lieuNaissance,
        estActif: user.estActif
      })
      setPhotoUrl(user.photoUrl)
    }
  }, [user, form])

  const handlePhotoChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      return
    }
    if (info.file.status === 'done') {
      // Get the photo URL from response
      const url = info.file.response?.photoUrl
      if (url) {
        setPhotoUrl(url)
        onPhotoChange?.(url)
        message.success('Photo mise à jour avec succès')
      }
    } else if (info.file.status === 'error') {
      message.error('Erreur lors du téléchargement de la photo')
    }
  }

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('Vous ne pouvez télécharger que des images!')
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('L\'image doit faire moins de 2MB!')
      return false
    }
    return true
  }

  return (
    <>
      {/* Photo de profil */}
      <Card title="Photo de profil" className="mb-6">
        <div className="flex items-center gap-6">
          <Avatar
            size={100}
            icon={<UserOutlined />}
            src={photoUrl}
            className="bg-blue-500"
          >
            {!photoUrl && user && `${user.prenom[0]}${user.nom[0]}`}
          </Avatar>
          <div>
            <Upload
              name="photo"
              listType="text"
              fileList={fileList}
              onChange={handlePhotoChange}
              beforeUpload={beforeUpload}
              action={user ? `/api/users/${user.id}/photo` : undefined}
              disabled={disabled || !user}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} disabled={disabled || !user}>
                {photoUrl ? 'Changer la photo' : 'Ajouter une photo'}
              </Button>
            </Upload>
            <div className="text-sm text-gray-500 mt-2">
              Formats acceptés: JPG, PNG, GIF (max 2MB)
            </div>
          </div>
        </div>
      </Card>

      {/* Informations de base */}
      <Card title="Informations personnelles" className="mb-6">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="prenom"
              label="Prénom"
              rules={[
                { required: true, message: 'Le prénom est requis' },
                { min: 2, message: 'Le prénom doit contenir au moins 2 caractères' }
              ]}
            >
              <Input placeholder="Prénom" disabled={disabled} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="nom"
              label="Nom"
              rules={[
                { required: true, message: 'Le nom est requis' },
                { min: 2, message: 'Le nom doit contenir au moins 2 caractères' }
              ]}
            >
              <Input placeholder="Nom" disabled={disabled} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="prenomArabe"
              label="Prénom (العربية)"
            >
              <Input placeholder="الاسم الأول" disabled={disabled} dir="rtl" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="nomArabe"
              label="Nom (العربية)"
            >
              <Input placeholder="اللقب" disabled={disabled} dir="rtl" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="dateNaissance"
              label="Date de naissance"
            >
              <DatePicker
                placeholder="Sélectionner une date"
                style={{ width: '100%' }}
                disabled={disabled}
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="lieuNaissance"
              label="Lieu de naissance"
            >
              <Input placeholder="Lieu de naissance" disabled={disabled} />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Informations de contact */}
      <Card title="Informations de contact" className="mb-6">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'L\'email est requis' },
                { type: 'email', message: 'Format email invalide' }
              ]}
            >
              <Input placeholder="email@exemple.com" disabled={disabled} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="telephone"
              label="Téléphone"
              rules={[
                { pattern: /^(\+213|0)[5-7][0-9]{8}$/, message: 'Format de téléphone algérien invalide' }
              ]}
            >
              <Input placeholder="+213 XXX XXX XXX" disabled={disabled} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="adresse"
          label="Adresse"
        >
          <Input.TextArea 
            placeholder="Adresse complète" 
            disabled={disabled}
            rows={3}
          />
        </Form.Item>
      </Card>

      {/* Informations de compte */}
      <Card title="Informations de compte">
        {showPasswordField && (
          <Form.Item
            name="motDePasse"
            label="Mot de passe"
            rules={[
              { required: !user, message: 'Le mot de passe est requis' },
              { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' }
            ]}
          >
            <Input.Password 
              placeholder={user ? "Laisser vide pour ne pas changer" : "Mot de passe"}
              disabled={disabled}
            />
          </Form.Item>
        )}

        {user && (
          <Form.Item
            name="estActif"
            label="Statut du compte"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Actif"
              unCheckedChildren="Inactif"
              disabled={disabled}
            />
          </Form.Item>
        )}
      </Card>
    </>
  )
}

export default BaseUserForm