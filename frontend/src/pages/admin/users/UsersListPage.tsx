import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Button, 
  Space, 
  message, 
  Modal,
  Drawer,
  Spin,
  Alert
} from 'antd'
import { 
  PlusOutlined, 
  ReloadOutlined,
  UserAddOutlined,
  UploadOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { UserTable, UserFilters, UserCard, BulkActions } from '@/components/users'
import { UserService } from '@/services'
import type { 
  UserWithDetails, 
  UserFilters as UserFiltersType, 
  PaginatedResponse 
} from '@/types/api'

const UsersListPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Detect role filter from URL
  const getRoleFromPath = () => {
    const path = location.pathname
    if (path.includes('enseignants')) return 'ENSEIGNANT'
    if (path.includes('eleves')) return 'ELEVE'
    if (path.includes('parents')) return 'PARENT'
    return undefined
  }

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('enseignants')) return 'Gestion des Enseignants'
    if (path.includes('eleves')) return 'Gestion des Élèves'
    if (path.includes('parents')) return 'Gestion des Parents'
    return 'Gestion des Utilisateurs'
  }

  const getPageDescription = () => {
    const path = location.pathname
    if (path.includes('enseignants')) return 'Gérez les comptes des enseignants'
    if (path.includes('eleves')) return 'Gérez les comptes des élèves'
    if (path.includes('parents')) return 'Gérez les comptes des parents'
    return 'Gérez les comptes utilisateurs de votre établissement'
  }
  
  // State
  const [users, setUsers] = useState<PaginatedResponse<UserWithDetails>>({
    data: [],
    pagination: { page: 1, limit: 25, total: 0, pages: 0 }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  
  // Filters state - initialize with role from URL
  const [filters, setFilters] = useState<UserFiltersType>({
    page: 1,
    limit: 25,
    role: getRoleFromPath(),
    estActif: undefined,
    search: undefined
  })

  // Load users
  const loadUsers = async (currentFilters: UserFiltersType = filters) => {
    try {
      setLoading(true)
      setError(null)
      const data = await UserService.getUsers(currentFilters)
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs')
      message.error('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  // Effects
  useEffect(() => {
    loadUsers()
  }, [filters])

  // Update filters when URL changes
  useEffect(() => {
    const roleFromPath = getRoleFromPath()
    if (roleFromPath !== filters.role) {
      setFilters(prev => ({
        ...prev,
        role: roleFromPath,
        page: 1 // Reset to first page
      }))
    }
  }, [location.pathname])

  // Handlers
  const handleFiltersChange = (newFilters: UserFiltersType) => {
    setFilters(newFilters)
    setSelectedRowKeys([]) // Clear selection when filters change
  }

  const handleFiltersReset = () => {
    const resetFilters: UserFiltersType = {
      page: 1,
      limit: 25,
      role: undefined,
      estActif: undefined,
      search: undefined
    }
    setFilters(resetFilters)
  }

  const handleRefresh = () => {
    loadUsers()
    setSelectedRowKeys([])
  }

  const handleUserClick = (user: UserWithDetails) => {
    setSelectedUser(user)
    setDrawerVisible(true)
  }

  const handleUserEdit = (user: UserWithDetails) => {
    navigate(`/admin/utilisateurs/${user.id}/modifier`)
  }

  const handleUserDelete = async (user: UserWithDetails) => {
    try {
      await UserService.deleteUser(user.id)
      message.success(`Utilisateur ${user.prenom} ${user.nom} supprimé avec succès`)
      handleRefresh()
    } catch (error) {
      message.error('Erreur lors de la suppression de l\'utilisateur')
    }
  }

  const handleCreateUser = () => {
    navigate('/admin/utilisateurs/nouveau')
  }

  const handleImportUsers = () => {
    navigate('/admin/utilisateurs/import')
  }

  const selectedUsers = users.data.filter(user => 
    selectedRowKeys.includes(user.id)
  )

  const tableProps = {
    data: users,
    loading,
    filters,
    onFiltersChange: handleFiltersChange,
    onUserClick: handleUserClick,
    onUserEdit: handleUserEdit,
    onUserDelete: handleUserDelete,
    onRefresh: handleRefresh,
    selectedRowKeys,
    onSelectionChange: setSelectedRowKeys
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">
            {getPageTitle()}
          </h1>
          <p className="text-gray-600 mt-1">
            {getPageDescription()}
          </p>
        </div>
        
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Actualiser
          </Button>
          
          <Button
            icon={<UploadOutlined />}
            onClick={handleImportUsers}
          >
            Importer
          </Button>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateUser}
            size="large"
          >
            Nouvel Utilisateur
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {users.pagination.total}
          </div>
          <div className="text-gray-600">Total Utilisateurs</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {users.data.filter(u => u.estActif).length}
          </div>
          <div className="text-gray-600">Actifs</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {users.data.filter(u => !u.estActif).length}
          </div>
          <div className="text-gray-600">Inactifs</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {selectedRowKeys.length}
          </div>
          <div className="text-gray-600">Sélectionnés</div>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Erreur"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      {/* Filters */}
      <UserFilters
        filters={filters}
        onChange={handleFiltersChange}
        onReset={handleFiltersReset}
        loading={loading}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedRowKeys={selectedRowKeys}
        selectedUsers={selectedUsers}
        filters={filters}
        onClearSelection={() => setSelectedRowKeys([])}
        onRefresh={handleRefresh}
        onImport={handleImportUsers}
      />

      {/* Users Table */}
      <Card>
        <UserTable
          {...tableProps}
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={setSelectedRowKeys}
        />
      </Card>

      {/* User Details Drawer */}
      <Drawer
        title={selectedUser ? `${selectedUser.prenom} ${selectedUser.nom}` : 'Détails utilisateur'}
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Space>
            <Button
              icon={<UserAddOutlined />}
              onClick={() => selectedUser && handleUserEdit(selectedUser)}
            >
              Modifier
            </Button>
          </Space>
        }
      >
        {selectedUser ? (
          <UserCard
            user={selectedUser}
            onEdit={() => {
              setDrawerVisible(false)
              handleUserEdit(selectedUser)
            }}
            onResetPassword={async () => {
              try {
                const result = await UserService.resetPassword(selectedUser.id)
                Modal.info({
                  title: 'Mot de passe réinitialisé',
                  content: (
                    <div>
                      <p>Nouveau mot de passe temporaire :</p>
                      <p className="font-mono text-lg bg-gray-100 p-2 rounded">
                        {result.temporaryPassword}
                      </p>
                    </div>
                  )
                })
              } catch (error) {
                message.error('Erreur lors de la réinitialisation')
              }
            }}
          />
        ) : (
          <Spin size="large" className="flex justify-center items-center h-64" />
        )}
      </Drawer>
    </div>
  )
}

export default UsersListPage