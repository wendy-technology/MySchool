import React from 'react'
import { Card, Avatar, Tag, Descriptions, Space, Button, Divider } from 'antd'
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HomeOutlined,
  CalendarOutlined,
  EditOutlined,
  KeyOutlined
} from '@ant-design/icons'
import type { UserWithDetails, UserRole } from '@/types/api'

interface UserCardProps {
  user: UserWithDetails
  onEdit?: () => void
  onResetPassword?: () => void
  loading?: boolean
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onResetPassword,
  loading = false
}) => {
  const getRoleConfig = (role: UserRole) => {
    const configs = {
      ADMIN: { label: 'Administrateur', color: 'red', icon: '👑' },
      ENSEIGNANT: { label: 'Enseignant', color: 'blue', icon: '👨‍🏫' },
      ELEVE: { label: 'Élève', color: 'green', icon: '👨‍🎓' },
      PARENT: { label: 'Parent', color: 'purple', icon: '👨‍👩‍👧‍👦' }
    }
    return configs[role] || { label: role, color: 'default', icon: '👤' }
  }

  const roleConfig = getRoleConfig(user.role)

  return (
    <Card
      loading={loading}
      actions={[
        <Button
          key="edit"
          type="text"
          icon={<EditOutlined />}
          onClick={onEdit}
        >
          Modifier
        </Button>,
        <Button
          key="reset-password"
          type="text"
          icon={<KeyOutlined />}
          onClick={onResetPassword}
        >
          Réinitialiser mot de passe
        </Button>
      ]}
    >
      {/* Header avec photo et infos principales */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar
          size={80}
          icon={<UserOutlined />}
          src={user.photoUrl}
          className="bg-blue-500 flex-shrink-0"
        >
          {!user.photoUrl && `${user.prenom[0]}${user.nom[0]}`}
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900 m-0">
              {user.prenom} {user.nom}
            </h3>
            <Tag 
              color={user.estActif ? 'success' : 'error'}
              className="ml-auto"
            >
              {user.estActif ? 'Actif' : 'Inactif'}
            </Tag>
          </div>
          
          {(user.nomArabe || user.prenomArabe) && (
            <div className="text-gray-600 mb-2" dir="rtl">
              {user.prenomArabe} {user.nomArabe}
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-3">
            <Tag color={roleConfig.color} className="mb-0">
              {roleConfig.icon} {roleConfig.label}
            </Tag>
          </div>
          
          <Space direction="vertical" size="small" className="w-full">
            <div className="flex items-center gap-2 text-gray-600">
              <MailOutlined />
              <span>{user.email}</span>
            </div>
            {user.telephone && (
              <div className="flex items-center gap-2 text-gray-600">
                <PhoneOutlined />
                <span>{user.telephone}</span>
              </div>
            )}
          </Space>
        </div>
      </div>

      <Divider />

      {/* Informations détaillées */}
      <Descriptions
        column={1}
        size="small"
        labelStyle={{ fontWeight: 'bold', color: '#666' }}
      >
        {user.adresse && (
          <Descriptions.Item 
            label={<><HomeOutlined /> Adresse</>}
          >
            {user.adresse}
          </Descriptions.Item>
        )}
        
        {user.dateNaissance && (
          <Descriptions.Item 
            label={<><CalendarOutlined /> Date de naissance</>}
          >
            {new Date(user.dateNaissance).toLocaleDateString('fr-FR')}
          </Descriptions.Item>
        )}
        
        {user.lieuNaissance && (
          <Descriptions.Item label="Lieu de naissance">
            {user.lieuNaissance}
          </Descriptions.Item>
        )}

        <Descriptions.Item label="Établissement">
          {user.etablissement?.nom}
        </Descriptions.Item>

        <Descriptions.Item label="Membre depuis">
          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
        </Descriptions.Item>
      </Descriptions>

      {/* Informations spécifiques au rôle */}
      {user.role === 'ENSEIGNANT' && user.enseignant && (
        <>
          <Divider orientation="left">Informations Enseignant</Divider>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Matricule">
              {user.enseignant.matricule}
            </Descriptions.Item>
            <Descriptions.Item label="Spécialité">
              {user.enseignant.specialite}
              {user.enseignant.specialiteArabe && (
                <div className="text-gray-500" dir="rtl">
                  {user.enseignant.specialiteArabe}
                </div>
              )}
            </Descriptions.Item>
            {user.enseignant.matieres && user.enseignant.matieres.length > 0 && (
              <Descriptions.Item label="Matières enseignées">
                <Space wrap>
                  {user.enseignant.matieres.map(matiere => (
                    <Tag key={matiere.id} color="blue">
                      {matiere.nom}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        </>
      )}

      {user.role === 'ELEVE' && user.eleve && (
        <>
          <Divider orientation="left">Informations Élève</Divider>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Numéro élève">
              {user.eleve.numeroEleve}
            </Descriptions.Item>
            {user.eleve.classe && (
              <Descriptions.Item label="Classe">
                <Tag color="green">{user.eleve.classe.nom}</Tag>
                <div className="text-sm text-gray-500">
                  {user.eleve.classe.niveau} - {user.eleve.classe.filiere}
                </div>
              </Descriptions.Item>
            )}
            {user.eleve.parents && user.eleve.parents.length > 0 && (
              <Descriptions.Item label="Parents">
                <Space direction="vertical" size="small">
                  {user.eleve.parents.map(parent => (
                    <div key={parent.id} className="text-sm">
                      {parent.user.prenom} {parent.user.nom}
                      {parent.profession && (
                        <span className="text-gray-500 ml-2">
                          ({parent.profession})
                        </span>
                      )}
                    </div>
                  ))}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        </>
      )}

      {user.role === 'PARENT' && user.parent && (
        <>
          <Divider orientation="left">Informations Parent</Divider>
          <Descriptions column={1} size="small">
            {user.parent.profession && (
              <Descriptions.Item label="Profession">
                {user.parent.profession}
                {user.parent.professionArabe && (
                  <div className="text-gray-500" dir="rtl">
                    {user.parent.professionArabe}
                  </div>
                )}
              </Descriptions.Item>
            )}
            {user.parent.enfants && user.parent.enfants.length > 0 && (
              <Descriptions.Item label="Enfants">
                <Space direction="vertical" size="small">
                  {user.parent.enfants.map(enfant => (
                    <div key={enfant.id} className="text-sm">
                      {enfant.user.prenom} {enfant.user.nom}
                      {enfant.classe && (
                        <span className="text-gray-500 ml-2">
                          ({enfant.classe.nom})
                        </span>
                      )}
                    </div>
                  ))}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        </>
      )}
    </Card>
  )
}

export default UserCard