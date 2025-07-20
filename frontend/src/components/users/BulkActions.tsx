import React from 'react'
import { Button, Space, Dropdown, Modal, message } from 'antd'
import { 
  CheckCircleOutlined, 
  StopOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  DownloadOutlined,
  UploadOutlined
} from '@ant-design/icons'
import { UserService } from '@/services'
import type { UserFilters } from '@/types/api'

interface BulkActionsProps {
  selectedRowKeys: string[]
  selectedUsers: any[]
  filters: UserFilters
  onClearSelection: () => void
  onRefresh: () => void
  onImport?: () => void
}

const { confirm } = Modal

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedRowKeys,
  selectedUsers,
  filters,
  onClearSelection,
  onRefresh,
  onImport
}) => {
  const handleBulkActivate = () => {
    const inactiveUsers = selectedUsers.filter(user => !user.estActif)
    if (inactiveUsers.length === 0) {
      message.warning('Aucun utilisateur inactif sélectionné')
      return
    }

    confirm({
      title: 'Activer les utilisateurs',
      content: `Êtes-vous sûr de vouloir activer ${inactiveUsers.length} utilisateur(s) ?`,
      icon: <CheckCircleOutlined />,
      okText: 'Activer',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          const userIds = inactiveUsers.map(user => user.id)
          await UserService.bulkActivate(userIds)
          message.success(`${userIds.length} utilisateur(s) activé(s) avec succès`)
          onClearSelection()
          onRefresh()
        } catch (error) {
          message.error('Erreur lors de l\'activation')
        }
      }
    })
  }

  const handleBulkDeactivate = () => {
    const activeUsers = selectedUsers.filter(user => user.estActif)
    const adminUsers = activeUsers.filter(user => user.role === 'ADMIN')
    
    if (adminUsers.length > 0) {
      message.warning('Impossible de désactiver des administrateurs')
      return
    }

    if (activeUsers.length === 0) {
      message.warning('Aucun utilisateur actif sélectionné')
      return
    }

    confirm({
      title: 'Désactiver les utilisateurs',
      content: `Êtes-vous sûr de vouloir désactiver ${activeUsers.length} utilisateur(s) ?`,
      icon: <StopOutlined />,
      okText: 'Désactiver',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          const userIds = activeUsers.map(user => user.id)
          await UserService.bulkDeactivate(userIds)
          message.success(`${userIds.length} utilisateur(s) désactivé(s) avec succès`)
          onClearSelection()
          onRefresh()
        } catch (error) {
          message.error('Erreur lors de la désactivation')
        }
      }
    })
  }

  const handleBulkDelete = () => {
    const adminUsers = selectedUsers.filter(user => user.role === 'ADMIN')
    
    if (adminUsers.length > 0) {
      message.warning('Impossible de supprimer des administrateurs')
      return
    }

    confirm({
      title: 'Supprimer les utilisateurs',
      content: (
        <div>
          <p>Êtes-vous sûr de vouloir supprimer {selectedRowKeys.length} utilisateur(s) ?</p>
          <p className="text-red-600 text-sm">
            ⚠️ Cette action est irréversible et supprimera définitivement :
          </p>
          <ul className="text-sm text-gray-600 mt-2">
            <li>• Les comptes utilisateurs</li>
            <li>• Toutes les données associées</li>
            <li>• L'historique des activités</li>
          </ul>
        </div>
      ),
      icon: <ExclamationCircleOutlined />,
      okText: 'Supprimer définitivement',
      okType: 'danger',
      cancelText: 'Annuler',
      width: 500,
      onOk: async () => {
        try {
          const userIds = selectedUsers
            .filter(user => user.role !== 'ADMIN')
            .map(user => user.id)
          
          await UserService.bulkDelete(userIds)
          message.success(`${userIds.length} utilisateur(s) supprimé(s) avec succès`)
          onClearSelection()
          onRefresh()
        } catch (error) {
          message.error('Erreur lors de la suppression')
        }
      }
    })
  }

  const handleExport = async () => {
    try {
      const blob = await UserService.exportUsers(filters)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      message.success('Export terminé avec succès')
    } catch (error) {
      message.error('Erreur lors de l\'export')
    }
  }

  const bulkActionItems = [
    {
      key: 'activate',
      icon: <CheckCircleOutlined />,
      label: 'Activer la sélection',
      onClick: handleBulkActivate,
      disabled: selectedUsers.every(user => user.estActif)
    },
    {
      key: 'deactivate',
      icon: <StopOutlined />,
      label: 'Désactiver la sélection',
      onClick: handleBulkDeactivate,
      disabled: selectedUsers.every(user => !user.estActif || user.role === 'ADMIN')
    },
    {
      type: 'divider' as const
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Supprimer la sélection',
      danger: true,
      onClick: handleBulkDelete,
      disabled: selectedUsers.some(user => user.role === 'ADMIN')
    }
  ]

  if (selectedRowKeys.length === 0) {
    return (
      <div className="flex justify-between items-center">
        <div />
        <Space>
          {onImport && (
            <Button 
              icon={<UploadOutlined />}
              onClick={onImport}
            >
              Importer
            </Button>
          )}
          <Button 
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Exporter
          </Button>
        </Space>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
      <div className="flex items-center gap-3">
        <span className="text-blue-800 font-medium">
          {selectedRowKeys.length} utilisateur(s) sélectionné(s)
        </span>
        <Button 
          size="small" 
          onClick={onClearSelection}
        >
          Annuler la sélection
        </Button>
      </div>

      <Space>
        <Dropdown
          menu={{ items: bulkActionItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="primary" icon={<MoreOutlined />}>
            Actions groupées
          </Button>
        </Dropdown>
      </Space>
    </div>
  )
}

export default BulkActions