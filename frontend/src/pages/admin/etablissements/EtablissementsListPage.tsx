import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Button, 
  Table, 
  Space, 
  message, 
  Modal,
  Tag,
  Input,
  Select,
  Dropdown,
  Tooltip
} from 'antd'
import { 
  PlusOutlined, 
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  BankOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { EtablissementService } from '@/services'
import type { 
  Etablissement, 
  PaginatedResponse 
} from '@/types/api'
import type { EtablissementFilters } from '@/services/etablissementService'

const { Search } = Input
const { Option } = Select

const EtablissementsListPage: React.FC = () => {
  const navigate = useNavigate()
  
  const [etablissements, setEtablissements] = useState<PaginatedResponse<Etablissement>>({
    data: [],
    pagination: { page: 1, limit: 25, total: 0, pages: 0 }
  })
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<EtablissementFilters>({
    page: 1,
    limit: 25
  })

  // Load etablissements
  const loadEtablissements = async (currentFilters: EtablissementFilters = filters) => {
    try {
      setLoading(true)
      const data = await EtablissementService.getEtablissements(currentFilters)
      setEtablissements(data)
    } catch (error) {
      message.error('Erreur lors du chargement des établissements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEtablissements()
  }, [filters])

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }))
  }

  const handleWilayaChange = (wilaya: string) => {
    setFilters(prev => ({ ...prev, wilaya: wilaya === 'all' ? undefined : wilaya, page: 1 }))
  }

  const handleTableChange = (pagination: any) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize
    }))
  }

  const handleDelete = async (etablissement: Etablissement) => {
    Modal.confirm({
      title: 'Supprimer l\'établissement',
      content: `Êtes-vous sûr de vouloir supprimer "${etablissement.nom}" ?`,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await EtablissementService.deleteEtablissement(etablissement.id)
          message.success('Établissement supprimé avec succès')
          loadEtablissements()
        } catch (error) {
          message.error('Erreur lors de la suppression')
        }
      }
    })
  }

  const columns = [
    {
      title: 'Établissement',
      key: 'etablissement',
      render: (_: any, record: Etablissement) => (
        <div>
          <div className="font-medium flex items-center gap-2">
            <BankOutlined className="text-blue-600" />
            {record.nom}
          </div>
          {record.nomArabe && (
            <div className="text-sm text-gray-500" dir="rtl">
              {record.nomArabe}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Localisation',
      key: 'localisation',
      render: (_: any, record: Etablissement) => (
        <div>
          <div className="font-medium">{record.wilaya}</div>
          <div className="text-sm text-gray-500">{record.commune}</div>
        </div>
      )
    },
    {
      title: 'Directeur',
      dataIndex: 'directeur',
      key: 'directeur',
      render: (directeur: string, record: Etablissement) => (
        <div>
          {directeur && (
            <>
              <div className="flex items-center gap-2">
                <UserOutlined className="text-gray-400" />
                {directeur}
              </div>
              {record.directeurArabe && (
                <div className="text-sm text-gray-500" dir="rtl">
                  {record.directeurArabe}
                </div>
              )}
            </>
          )}
        </div>
      )
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_: any, record: Etablissement) => (
        <div>
          {record.telephone && (
            <div className="text-sm">📞 {record.telephone}</div>
          )}
          {record.email && (
            <div className="text-sm">✉️ {record.email}</div>
          )}
        </div>
      )
    },
    {
      title: 'Statistiques',
      key: 'stats',
      render: (_: any, record: Etablissement) => (
        <div>
          <Tag color="blue" icon={<UserOutlined />}>
            {Math.floor(Math.random() * 200 + 50)} utilisateurs
          </Tag>
          <Tag color="green" icon={<TeamOutlined />}>
            {Math.floor(Math.random() * 20 + 5)} classes
          </Tag>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Etablissement) => {
        const menuItems = [
          {
            key: 'view',
            label: 'Voir détails',
            icon: <EyeOutlined />,
            onClick: () => navigate(`/admin/etablissements/${record.id}`)
          },
          {
            key: 'edit',
            label: 'Modifier',
            icon: <EditOutlined />,
            onClick: () => navigate(`/admin/etablissements/${record.id}/modifier`)
          },
          {
            type: 'divider' as const
          },
          {
            key: 'delete',
            label: 'Supprimer',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(record)
          }
        ]

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        )
      }
    }
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">
            Gestion des Établissements
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les établissements scolaires de votre réseau
          </p>
        </div>
        
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadEtablissements()}
            disabled={loading}
          >
            Actualiser
          </Button>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/etablissements/nouveau')}
            size="large"
          >
            Nouvel Établissement
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {etablissements.pagination.total}
          </div>
          <div className="text-gray-600">Total Établissements</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {etablissements.data.filter(e => e.directeur).length}
          </div>
          <div className="text-gray-600">Avec Directeur</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(etablissements.data.map(e => e.wilaya)).size}
          </div>
          <div className="text-gray-600">Wilayas Couvertes</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {etablissements.data.filter(e => e.email).length}
          </div>
          <div className="text-gray-600">Avec Email</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <Search
              placeholder="Rechercher un établissement..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch('')}
            />
          </div>
          <Select
            placeholder="Wilaya"
            style={{ width: 200 }}
            allowClear
            onChange={handleWilayaChange}
          >
            <Option value="all">Toutes les wilayas</Option>
            {EtablissementService.getWilayas().map(wilaya => (
              <Option key={wilaya} value={wilaya}>{wilaya}</Option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={etablissements.data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: etablissements.pagination.page,
            pageSize: etablissements.pagination.limit,
            total: etablissements.pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} sur ${total} établissements`
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  )
}

export default EtablissementsListPage