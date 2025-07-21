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
  Progress,
  Tooltip,
  Badge
} from 'antd'
import { 
  PlusOutlined, 
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  TeamOutlined,
  UserOutlined,
  BookOutlined,
  HomeOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ClasseService } from '@/services'
import type { 
  PaginatedResponse 
} from '@/types/api'
import type { ClasseWithDetails, ClasseFilters } from '@/services/classeService'

const { Search } = Input
const { Option } = Select

const ClassesListPage: React.FC = () => {
  const navigate = useNavigate()
  
  const [classes, setClasses] = useState<PaginatedResponse<ClasseWithDetails>>({
    data: [],
    pagination: { page: 1, limit: 25, total: 0, pages: 0 }
  })
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<ClasseFilters>({
    page: 1,
    limit: 25
  })

  // Load classes
  const loadClasses = async (currentFilters: ClasseFilters = filters) => {
    try {
      setLoading(true)
      const data = await ClasseService.getClasses(currentFilters)
      setClasses(data)
    } catch (error) {
      message.error('Erreur lors du chargement des classes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClasses()
  }, [filters])

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }))
  }

  const handleNiveauChange = (niveau: string) => {
    setFilters(prev => ({ ...prev, niveau: niveau === 'all' ? undefined : niveau, page: 1 }))
  }

  const handleCycleChange = (cycle: string) => {
    setFilters(prev => ({ ...prev, cycle: cycle === 'all' ? undefined : cycle, page: 1 }))
  }

  const handleFiliereChange = (filiere: string) => {
    setFilters(prev => ({ ...prev, filiere: filiere === 'all' ? undefined : filiere, page: 1 }))
  }

  const handleTableChange = (pagination: any) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize
    }))
  }

  const handleDelete = async (classe: ClasseWithDetails) => {
    Modal.confirm({
      title: 'Supprimer la classe',
      content: `Êtes-vous sûr de vouloir supprimer "${classe.nom}" ?`,
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await ClasseService.deleteClasse(classe.id)
          message.success('Classe supprimée avec succès')
          loadClasses()
        } catch (error) {
          message.error('Erreur lors de la suppression')
        }
      }
    })
  }

  const getEffectifColor = (actuel: number, max: number) => {
    const ratio = actuel / max
    if (ratio >= 0.9) return 'red'
    if (ratio >= 0.7) return 'orange'
    return 'green'
  }

  const columns = [
    {
      title: 'Classe',
      key: 'classe',
      render: (_: any, record: ClasseWithDetails) => (
        <div>
          <div className="font-medium flex items-center gap-2">
            <HomeOutlined className="text-blue-600" />
            {record.nom}
          </div>
          {record.nomArabe && (
            <div className="text-sm text-gray-500" dir="rtl">
              {record.nomArabe}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            {record.salleClasse && `📍 ${record.salleClasse}`}
          </div>
        </div>
      )
    },
    {
      title: 'Niveau & Filière',
      key: 'niveau',
      render: (_: any, record: ClasseWithDetails) => (
        <div>
          <Tag color="blue">{record.cycle}</Tag>
          <div className="text-sm mt-1">{record.niveau}</div>
          <div className="text-xs text-gray-500">{record.filiere}</div>
        </div>
      )
    },
    {
      title: 'Effectif',
      key: 'effectif',
      render: (_: any, record: ClasseWithDetails) => {
        const ratio = (record.effectifActuel / record.effectifMax) * 100
        return (
          <div>
            <div className="flex items-center gap-2">
              <TeamOutlined />
              <span className="font-medium">
                {record.effectifActuel}/{record.effectifMax}
              </span>
            </div>
            <Progress 
              percent={ratio} 
              size="small" 
              strokeColor={getEffectifColor(record.effectifActuel, record.effectifMax)}
              showInfo={false}
            />
            <div className="text-xs text-gray-500 mt-1">
              {record.effectifMax - record.effectifActuel} places libres
            </div>
          </div>
        )
      }
    },
    {
      title: 'Enseignants',
      key: 'enseignants',
      render: (_: any, record: ClasseWithDetails) => (
        <div>
          <div className="flex items-center gap-2">
            <UserOutlined />
            <span>{record.enseignants?.length || 0} enseignants</span>
          </div>
          {record.enseignantPrincipal && (
            <div className="text-xs text-green-600 mt-1">
              👨‍🏫 {record.enseignantPrincipal.prenom} {record.enseignantPrincipal.nom}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Statut',
      key: 'status',
      render: (_: any, record: ClasseWithDetails) => {
        const ratio = record.effectifActuel / record.effectifMax
        let status = 'success'
        let text = 'Disponible'
        
        if (ratio >= 1) {
          status = 'error'
          text = 'Complète'
        } else if (ratio >= 0.9) {
          status = 'warning'  
          text = 'Presque pleine'
        }
        
        return <Badge status={status as any} text={text} />
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: ClasseWithDetails) => {
        const menuItems = [
          {
            key: 'view',
            label: 'Voir détails',
            icon: <EyeOutlined />,
            onClick: () => navigate(`/admin/classes/${record.id}`)
          },
          {
            key: 'edit',
            label: 'Modifier',
            icon: <EditOutlined />,
            onClick: () => navigate(`/admin/classes/${record.id}/modifier`)
          },
          {
            key: 'students',
            label: 'Gérer élèves',
            icon: <TeamOutlined />,
            onClick: () => navigate(`/admin/classes/${record.id}/eleves`)
          },
          {
            key: 'teachers',
            label: 'Gérer enseignants',
            icon: <UserOutlined />,
            onClick: () => navigate(`/admin/classes/${record.id}/enseignants`)
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
            Gestion des Classes
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez les classes et leurs affectations
          </p>
        </div>
        
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadClasses()}
            disabled={loading}
          >
            Actualiser
          </Button>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/classes/nouvelle')}
            size="large"
          >
            Nouvelle Classe
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {classes.pagination.total}
          </div>
          <div className="text-gray-600">Total Classes</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {classes.data.reduce((sum, c) => sum + c.effectifActuel, 0)}
          </div>
          <div className="text-gray-600">Total Élèves</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {classes.data.filter(c => c.effectifActuel < c.effectifMax).length}
          </div>
          <div className="text-gray-600">Places Disponibles</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {new Set(classes.data.map(c => c.cycle)).size}
          </div>
          <div className="text-gray-600">Cycles</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <Search
              placeholder="Rechercher une classe..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch('')}
            />
          </div>
          <Select
            placeholder="Cycle"
            style={{ width: 150 }}
            allowClear
            onChange={handleCycleChange}
          >
            <Option value="all">Tous les cycles</Option>
            {ClasseService.getCycles().map(cycle => (
              <Option key={cycle.value} value={cycle.value}>{cycle.label}</Option>
            ))}
          </Select>
          <Select
            placeholder="Niveau"
            style={{ width: 180 }}
            allowClear
            onChange={handleNiveauChange}
          >
            <Option value="all">Tous les niveaux</Option>
            {ClasseService.getNiveaux().map(niveau => (
              <Option key={niveau.value} value={niveau.value}>{niveau.label}</Option>
            ))}
          </Select>
          <Select
            placeholder="Filière"
            style={{ width: 200 }}
            allowClear
            onChange={handleFiliereChange}
          >
            <Option value="all">Toutes les filières</Option>
            {ClasseService.getFilieres().map(filiere => (
              <Option key={filiere.value} value={filiere.value}>{filiere.label}</Option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={classes.data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: classes.pagination.page,
            pageSize: classes.pagination.limit,
            total: classes.pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} sur ${total} classes`
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  )
}

export default ClassesListPage