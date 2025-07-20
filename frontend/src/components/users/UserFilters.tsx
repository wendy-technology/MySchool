import React from 'react'
import { Input, Select, Button, Space, Card } from 'antd'
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons'
import type { UserRole, UserFilters as UserFiltersType } from '@/types/api'

const { Search } = Input
const { Option } = Select

interface UserFiltersProps {
  filters: UserFiltersType
  onChange: (filters: UserFiltersType) => void
  onReset: () => void
  loading?: boolean
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onChange,
  onReset,
  loading = false
}) => {
  const handleFilterChange = (key: keyof UserFiltersType, value: any) => {
    onChange({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filters change
    })
  }

  const handleSearch = (value: string) => {
    handleFilterChange('search', value.trim() || undefined)
  }

  const handleReset = () => {
    onReset()
  }

  return (
    <Card className="mb-6" bodyStyle={{ padding: '16px' }}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <Search
            placeholder="Rechercher par nom, prénom ou email..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
            onSearch={handleSearch}
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ maxWidth: 400 }}
          />
        </div>

        {/* Filters */}
        <Space wrap size="middle">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Rôle</label>
            <Select
              placeholder="Tous les rôles"
              value={filters.role || ''}
              onChange={(value) => handleFilterChange('role', value || undefined)}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="">Tous les rôles</Option>
              <Option value="ADMIN">Administrateur</Option>
              <Option value="ENSEIGNANT">Enseignant</Option>
              <Option value="ELEVE">Élève</Option>
              <Option value="PARENT">Parent</Option>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Statut</label>
            <Select
              placeholder="Tous les statuts"
              value={filters.estActif !== undefined ? String(filters.estActif) : ''}
              onChange={(value) => handleFilterChange('estActif', value === '' ? undefined : value === 'true')}
              style={{ width: 130 }}
              allowClear
            >
              <Option value="">Tous</Option>
              <Option value="true">Actif</Option>
              <Option value="false">Inactif</Option>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Par page</label>
            <Select
              value={filters.limit || 25}
              onChange={(value) => handleFilterChange('limit', value)}
              style={{ width: 80 }}
            >
              <Option value={10}>10</Option>
              <Option value={25}>25</Option>
              <Option value={50}>50</Option>
              <Option value={100}>100</Option>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 opacity-0">Actions</label>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                disabled={loading}
                title="Réinitialiser les filtres"
              />
            </Space>
          </div>
        </Space>
      </div>

      {/* Active filters indicator */}
      {(filters.role || filters.estActif !== undefined || filters.search) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FilterOutlined className="text-blue-500" />
            <span>Filtres actifs:</span>
            {filters.role && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Rôle: {getRoleLabel(filters.role)}
              </span>
            )}
            {filters.estActif !== undefined && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                Statut: {filters.estActif ? 'Actif' : 'Inactif'}
              </span>
            )}
            {filters.search && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                Recherche: "{filters.search}"
              </span>
            )}
            <Button
              type="link"
              size="small"
              onClick={handleReset}
              className="ml-2"
            >
              Tout effacer
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    ADMIN: 'Administrateur',
    ENSEIGNANT: 'Enseignant',
    ELEVE: 'Élève',
    PARENT: 'Parent'
  }
  return labels[role] || role
}

export default UserFilters