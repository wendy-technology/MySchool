import React, { useState } from 'react'
import { 
  Table, 
  Avatar, 
  Tag, 
  Button, 
  Dropdown, 
  Space, 
  Tooltip, 
  Modal, 
  message,
  Checkbox
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { 
  MoreOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
  KeyOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import type { 
  UserWithDetails, 
  UserRole, 
  PaginatedResponse, 
  UserFilters 
} from '@/types/api'
import { UserService } from '@/services'

interface UserTableProps {
  data: PaginatedResponse<UserWithDetails>
  loading: boolean
  filters: UserFilters
  onFiltersChange: (filters: UserFilters) => void
  onUserClick?: (user: UserWithDetails) => void
  onUserEdit?: (user: UserWithDetails) => void
  onUserDelete?: (user: UserWithDetails) => void
  onRefresh?: () => void
  selectedRowKeys?: string[]
  onSelectionChange?: (keys: string[]) => void
}

const { confirm } = Modal

const UserTable: React.FC<UserTableProps> = ({
  data,
  loading,
  filters,
  onFiltersChange,
  onUserClick,
  onUserEdit,
  onUserDelete,
  onRefresh,
  selectedRowKeys = [],
  onSelectionChange
}) => {
  const [localSelectedRowKeys, setLocalSelectedRowKeys] = useState<string[]>([])
  
  const currentSelectedRowKeys = onSelectionChange ? selectedRowKeys : localSelectedRowKeys
  const setSelectedRowKeys = onSelectionChange || setLocalSelectedRowKeys

  const handlePageChange = (page: number, pageSize?: number) => {
    onFiltersChange({
      ...filters,
      page,
      limit: pageSize || filters.limit
    })
  }

  const handleUserAction = async (action: string, user: UserWithDetails) => {
    try {
      switch (action) {
        case 'view':
          onUserClick?.(user)
          break
        case 'edit':
          onUserEdit?.(user)
          break
        case 'delete':
          confirm({
            title: 'Supprimer l\'utilisateur',
            content: `Êtes-vous sûr de vouloir supprimer ${user.prenom} ${user.nom} ?`,
            icon: <ExclamationCircleOutlined />,
            okText: 'Supprimer',
            okType: 'danger',
            cancelText: 'Annuler',
            onOk: () => onUserDelete?.(user)
          })
          break
        case 'toggle-status':
          await handleToggleStatus(user)
          break
        case 'reset-password':
          await handleResetPassword(user)
          break
      }
    } catch (error) {
      message.error('Une erreur est survenue')
    }
  }

  const handleToggleStatus = async (user: UserWithDetails) => {
    try {
      await UserService.toggleUserStatus(user.id)
      message.success(`Utilisateur ${user.estActif ? 'désactivé' : 'activé'} avec succès`)
      onRefresh?.()
    } catch (error) {
      message.error('Erreur lors du changement de statut')
    }
  }

  const handleResetPassword = async (user: UserWithDetails) => {
    try {
      const result = await UserService.resetPassword(user.id)
      Modal.info({
        title: 'Mot de passe réinitialisé',
        content: (
          <div>
            <p>Nouveau mot de passe temporaire pour {user.prenom} {user.nom}:</p>
            <p className="font-mono text-lg bg-gray-100 p-2 rounded">
              {result.temporaryPassword}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              L'utilisateur devra changer ce mot de passe lors de sa prochaine connexion.
            </p>
          </div>
        ),
        width: 500
      })
    } catch (error) {
      message.error('Erreur lors de la réinitialisation du mot de passe')
    }
  }

  const getActionMenuItems = (user: UserWithDetails) => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'Voir détails',
      onClick: () => handleUserAction('view', user)
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Modifier',
      onClick: () => handleUserAction('edit', user)
    },
    {
      type: 'divider' as const
    },
    {
      key: 'toggle-status',
      icon: user.estActif ? <StopOutlined /> : <CheckCircleOutlined />,
      label: user.estActif ? 'Désactiver' : 'Activer',
      onClick: () => handleUserAction('toggle-status', user)
    },
    {
      key: 'reset-password',
      icon: <KeyOutlined />,
      label: 'Réinitialiser mot de passe',
      onClick: () => handleUserAction('reset-password', user)
    },
    {
      type: 'divider' as const
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Supprimer',
      danger: true,
      onClick: () => handleUserAction('delete', user)
    }
  ]

  const columns: ColumnsType<UserWithDetails> = [
    {
      title: '',
      key: 'avatar',
      width: 60,
      render: (_, user) => (
        <Avatar
          size="large"
          icon={<UserOutlined />}
          src={user.photoUrl}
          className="bg-blue-500"
        >
          {!user.photoUrl && `${user.prenom[0]}${user.nom[0]}`}
        </Avatar>
      )
    },
    {
      title: 'Nom & Prénom',
      key: 'name',
      sorter: true,
      render: (_, user) => (
        <div>
          <div className="font-medium text-gray-900">
            {user.prenom} {user.nom}
          </div>
          {(user.nomArabe || user.prenomArabe) && (
            <div className="text-sm text-gray-500" dir="rtl">
              {user.prenomArabe} {user.nomArabe}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      render: (email: string) => (
        <span className="text-blue-600">{email}</span>
      )
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Administrateur', value: 'ADMIN' },
        { text: 'Enseignant', value: 'ENSEIGNANT' },
        { text: 'Élève', value: 'ELEVE' },
        { text: 'Parent', value: 'PARENT' }
      ],
      render: (role: UserRole) => {
        const config = getRoleConfig(role)
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        )
      }
    },
    {
      title: 'Informations',
      key: 'info',
      render: (_, user) => (
        <div className="text-sm">
          {user.role === 'ENSEIGNANT' && user.enseignant && (
            <div className="text-blue-600">
              📚 {user.enseignant.specialite}
            </div>
          )}
          {user.role === 'ELEVE' && user.eleve?.classe && (
            <div className="text-green-600">
              🏫 {user.eleve.classe.nom}
            </div>
          )}
          {user.role === 'PARENT' && user.parent && (
            <div className="text-purple-600">
              💼 {user.parent.profession}
            </div>
          )}
          {user.telephone && (
            <div className="text-gray-500">
              📞 {user.telephone}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Statut',
      dataIndex: 'estActif',
      key: 'status',
      filters: [
        { text: 'Actif', value: true },
        { text: 'Inactif', value: false }
      ],
      render: (estActif: boolean) => (
        <Tag color={estActif ? 'success' : 'error'}>
          {estActif ? 'Actif' : 'Inactif'}
        </Tag>
      )
    },
    {
      title: 'Créé le',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => (
        <span className="text-gray-500">
          {new Date(date).toLocaleDateString('fr-FR')}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, user) => (
        <Dropdown
          menu={{ items: getActionMenuItems(user) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            className="hover:bg-gray-100"
          />
        </Dropdown>
      )
    }
  ]

  const rowSelection = {
    selectedRowKeys: currentSelectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
    getCheckboxProps: (user: UserWithDetails) => ({
      disabled: user.role === 'ADMIN' && user.id === 'current-user-id', // Disable deleting current admin
    })
  }

  return (
    <div>
      {/* Bulk actions */}
      {currentSelectedRowKeys.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {currentSelectedRowKeys.length} utilisateur(s) sélectionné(s)
            </span>
            <Space>
              <Button size="small" onClick={() => setSelectedRowKeys([])}>
                Annuler
              </Button>
              <Button type="primary" size="small">
                Actions groupées
              </Button>
            </Space>
          </div>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={data.data.map(user => ({ ...user, key: user.id }))}
        loading={loading}
        rowSelection={rowSelection}
        pagination={{
          current: filters.page || 1,
          pageSize: filters.limit || 25,
          total: data.pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} sur ${total} utilisateurs`,
          onChange: handlePageChange,
          onShowSizeChange: handlePageChange
        }}
        scroll={{ x: 1200 }}
        className="custom-table"
        rowClassName={(user) => user.estActif ? '' : 'opacity-60'}
        onRow={(user) => ({
          onDoubleClick: () => onUserClick?.(user),
          className: 'cursor-pointer hover:bg-gray-50'
        })}
      />
    </div>
  )
}

const getRoleConfig = (role: UserRole) => {
  const configs = {
    ADMIN: { label: 'Administrateur', color: 'red', icon: '👑' },
    ENSEIGNANT: { label: 'Enseignant', color: 'blue', icon: '👨‍🏫' },
    ELEVE: { label: 'Élève', color: 'green', icon: '👨‍🎓' },
    PARENT: { label: 'Parent', color: 'purple', icon: '👨‍👩‍👧‍👦' }
  }
  return configs[role] || { label: role, color: 'default', icon: '👤' }
}

export default UserTable