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
  Badge,
  Tooltip
} from 'antd'
import { 
  PlusOutlined, 
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  BookOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { MatiereService } from '@/services'
import type { 
  PaginatedResponse 
} from '@/types/api'
import type { MatiereWithDetails, MatiereFilters } from '@/services/matiereService'

const { Search } = Input
const { Option } = Select

const MatieresListPage: React.FC = () => {
  const navigate = useNavigate()
  
  const [matieres, setMatieres] = useState<PaginatedResponse<MatiereWithDetails>>({
    data: [],
    pagination: { page: 1, limit: 25, total: 0, pages: 0 }
  })
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<MatiereFilters>({
    page: 1,
    limit: 25
  })

  // Load matieres
  const loadMatieres = async (currentFilters: MatiereFilters = filters) => {
    try {
      setLoading(true)
      const data = await MatiereService.getMatieres(currentFilters)
      setMatieres(data)
    } catch (error) {
      message.error('Erreur lors du chargement des matières')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMatieres()
  }, [filters])

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }))
  }

  const handleCoefficientChange = (coefficient: number) => {
    setFilters(prev => ({ ...prev, coefficient: coefficient === 0 ? undefined : coefficient, page: 1 }))
  }

  const handleTableChange = (pagination: any) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize
    }))
  }

  const handleDelete = async (matiere: MatiereWithDetails) => {
    Modal.confirm({
      title: 'Supprimer la matière',
      content: `Êtes-vous sûr de vouloir supprimer "${matiere.nom}" ?`,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await MatiereService.deleteMatiere(matiere.id)
          message.success('Matière supprimée avec succès')
          loadMatieres()
        } catch (error) {
          message.error('Erreur lors de la suppression')
        }
      }
    })
  }

  const handleBulkCreate = () => {
    Modal.confirm({
      title: 'Créer les matières standard',
      content: 'Voulez-vous créer automatiquement toutes les matières du programme algérien ?',
      okText: 'Créer',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          const standardMatieres = MatiereService.getStandardMatieres().map(matiere => ({
            ...matiere,
            code: MatiereService.generateMatiereCode(matiere.nom)
          }))
          
          await MatiereService.bulkCreateMatieres(standardMatieres)
          message.success(`${standardMatieres.length} matières créées avec succès`)
          loadMatieres()
        } catch (error) {
          message.error('Erreur lors de la création en lot')
        }
      }
    })
  }

  const getCoefficientColor = (coefficient: number) => {
    if (coefficient >= 3) return 'red'
    if (coefficient >= 2) return 'orange'
    return 'green'
  }

  const columns = [
    {
      title: 'Matière',
      key: 'matiere',
      render: (_: any, record: MatiereWithDetails) => (
        <div>
          <div className="font-medium flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: record.couleur }}
            />
            <BookOutlined className="text-gray-400" />
            {record.nom}
          </div>
          {record.nomArabe && (
            <div className="text-sm text-gray-500" dir="rtl">
              {record.nomArabe}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            Code: {record.code}
          </div>
        </div>
      )
    },
    {
      title: 'Coefficient',
      key: 'coefficient',
      width: 120,
      render: (_: any, record: MatiereWithDetails) => (
        <Tag color={getCoefficientColor(record.coefficient)} className="text-center">
          Coeff. {record.coefficient}
        </Tag>
      )
    },
    {
      title: 'Enseignants',
      key: 'enseignants',
      render: (_: any, record: MatiereWithDetails) => (
        <div className="flex items-center gap-2">
          <UserOutlined className="text-blue-500" />
          <span>{record.enseignants?.length || 0}</span>
          {record.enseignants?.length > 0 && (
            <Tooltip title={record.enseignants.map(e => `${e.prenom} ${e.nom}`).join(', ')}>
              <Badge count={record.enseignants.length} style={{ backgroundColor: '#52c41a' }} />
            </Tooltip>
          )}
        </div>
      )
    },
    {
      title: 'Classes',
      key: 'classes',
      render: (_: any, record: MatiereWithDetails) => (
        <div className="flex items-center gap-2">
          <TeamOutlined className="text-green-500" />
          <span>{record.classes?.length || 0}</span>
          {record.classes?.length > 0 && (
            <Tooltip title={record.classes.map(c => c.nom).join(', ')}>
              <Badge count={record.classes.length} style={{ backgroundColor: '#1890ff' }} />
            </Tooltip>
          )}
        </div>
      )
    },
    {
      title: 'Évaluations',
      key: 'evaluations',
      render: (_: any, record: MatiereWithDetails) => (
        <div className="flex items-center gap-2">
          <FileTextOutlined className="text-purple-500" />
          <span>{record.nombreEvaluations || 0}</span>
        </div>
      )
    },
    {
      title: 'Statut',
      key: 'status',
      render: (_: any, record: MatiereWithDetails) => {
        const hasEnseignants = record.enseignants?.length > 0
        const hasClasses = record.classes?.length > 0
        
        if (hasEnseignants && hasClasses) {
          return <Badge status="success" text="Active" />
        } else if (hasEnseignants || hasClasses) {
          return <Badge status="warning" text="Partielle" />
        } else {
          return <Badge status="default" text="Inactive" />
        }
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: MatiereWithDetails) => {
        const menuItems = [
          {
            key: 'view',
            label: 'Voir détails',
            icon: <EyeOutlined />,
            onClick: () => navigate(`/admin/matieres/${record.id}`)
          },
          {
            key: 'edit',
            label: 'Modifier',
            icon: <EditOutlined />,
            onClick: () => navigate(`/admin/matieres/${record.id}/modifier`)
          },
          {
            key: 'teachers',
            label: 'Gérer enseignants',
            icon: <UserOutlined />,
            onClick: () => navigate(`/admin/matieres/${record.id}/enseignants`)
          },
          {
            key: 'classes',
            label: 'Gérer classes',
            icon: <TeamOutlined />,
            onClick: () => navigate(`/admin/matieres/${record.id}/classes`)
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
            Gestion des Matières
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les matières et leurs associations
          </p>
        </div>
        
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadMatieres()}
            disabled={loading}
          >
            Actualiser
          </Button>

          <Button
            onClick={handleBulkCreate}
            disabled={loading}
          >
            Matières Standard
          </Button>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/matieres/nouvelle')}
            size="large"
          >
            Nouvelle Matière
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {matieres.pagination.total}
          </div>
          <div className="text-gray-600">Total Matières</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {matieres.data.filter(m => m.enseignants?.length > 0).length}
          </div>
          <div className="text-gray-600">Avec Enseignants</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {matieres.data.reduce((sum, m) => sum + (m.nombreEvaluations || 0), 0)}
          </div>
          <div className="text-gray-600">Total Évaluations</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {matieres.data.reduce((sum, m) => sum + m.coefficient, 0)}
          </div>
          <div className="text-gray-600">Coefficients Totaux</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <Search
              placeholder="Rechercher une matière..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch('')}
            />
          </div>
          <Select
            placeholder="Coefficient"
            style={{ width: 150 }}
            allowClear
            onChange={handleCoefficientChange}
          >
            <Option value={0}>Tous coefficients</Option>
            <Option value={1}>Coefficient 1</Option>
            <Option value={2}>Coefficient 2</Option>
            <Option value={3}>Coefficient 3</Option>
            <Option value={4}>Coefficient 4+</Option>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={matieres.data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: matieres.pagination.page,
            pageSize: matieres.pagination.limit,
            total: matieres.pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} sur ${total} matières`
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  )
}

export default MatieresListPage