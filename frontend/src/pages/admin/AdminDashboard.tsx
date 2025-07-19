import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Typography, Table, Tag, Progress, Spin } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  UserDeleteOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const { Title, Text } = Typography

interface DashboardStats {
  totalEleves: number
  totalEnseignants: number
  totalClasses: number
  totalEvaluations: number
  absencesToday: number
  bulletinsGeneres: number
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalEleves: 156,
        totalEnseignants: 24,
        totalClasses: 12,
        totalEvaluations: 45,
        absencesToday: 8,
        bulletinsGeneres: 120,
      })
      setLoading(false)
    }, 1000)
  }, [])

  const mockClassData = [
    { classe: '1ère AM A', effectif: 28, moyenne: 14.5, absences: 2 },
    { classe: '1ère AM B', effectif: 30, moyenne: 13.8, absences: 4 },
    { classe: '2ème AM A', effectif: 26, moyenne: 15.2, absences: 1 },
    { classe: '2ème AM B', effectif: 29, moyenne: 14.1, absences: 3 },
    { classe: '3ème AM A', effectif: 25, moyenne: 15.8, absences: 0 },
  ]

  const mockSubjectData = [
    { name: 'Mathématiques', moyenne: 14.2, color: '#8884d8' },
    { name: 'Français', moyenne: 13.8, color: '#82ca9d' },
    { name: 'Arabe', moyenne: 15.1, color: '#ffc658' },
    { name: 'Anglais', moyenne: 12.9, color: '#ff7300' },
    { name: 'Sciences', moyenne: 13.5, color: '#00ff88' },
  ]

  const recentActivities = [
    { action: 'Nouvelle évaluation créée', user: 'Mme. Boumediene', time: 'Il y a 5 min', type: 'evaluation' },
    { action: 'Bulletin généré', user: 'Système', time: 'Il y a 15 min', type: 'bulletin' },
    { action: 'Absence signalée', user: 'M. Meziane', time: 'Il y a 30 min', type: 'absence' },
    { action: 'Nouvel élève inscrit', user: 'Admin', time: 'Il y a 1h', type: 'user' },
  ]

  const classColumns = [
    {
      title: 'Classe',
      dataIndex: 'classe',
      key: 'classe',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Effectif',
      dataIndex: 'effectif',
      key: 'effectif',
      render: (value: number) => (
        <div className="flex items-center space-x-2">
          <UserOutlined />
          <span>{value}</span>
        </div>
      ),
    },
    {
      title: 'Moyenne',
      dataIndex: 'moyenne',
      key: 'moyenne',
      render: (value: number) => (
        <Tag color={value >= 15 ? 'green' : value >= 12 ? 'orange' : 'red'}>
          {value.toFixed(1)}/20
        </Tag>
      ),
    },
    {
      title: 'Absences du jour',
      dataIndex: 'absences',
      key: 'absences',
      render: (value: number) => (
        <span className={value > 0 ? 'text-red-500' : 'text-green-500'}>
          {value}
        </span>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Title level={2}>Tableau de bord Administrateur</Title>
        <Text className="text-gray-600">
          Vue d'ensemble de votre établissement scolaire
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Élèves"
              value={stats?.totalEleves}
              prefix={<UserOutlined />}
              suffix={<ArrowUpOutlined style={{ color: '#3f8600' }} />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card green">
            <Statistic
              title="Enseignants"
              value={stats?.totalEnseignants}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card orange">
            <Statistic
              title="Classes"
              value={stats?.totalClasses}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card red">
            <Statistic
              title="Absences Aujourd'hui"
              value={stats?.absencesToday}
              prefix={<UserDeleteOutlined />}
              suffix={stats && stats.absencesToday > 5 ? <ArrowUpOutlined style={{ color: '#fff' }} /> : null}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts and Tables Row */}
      <Row gutter={[16, 16]}>
        {/* Class Overview */}
        <Col xs={24} lg={14}>
          <Card title="Vue d'ensemble des classes" className="h-full">
            <Table
              dataSource={mockClassData}
              columns={classColumns}
              pagination={false}
              size="small"
              className="custom-table"
            />
          </Card>
        </Col>

        {/* Subject Performance */}
        <Col xs={24} lg={10}>
          <Card title="Performance par matière" className="h-full">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={mockSubjectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="moyenne"
                >
                  {mockSubjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]}>
        {/* Performance Chart */}
        <Col xs={24} lg={16}>
          <Card title="Évolution des moyennes mensuelles">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockSubjectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 20]} />
                <Tooltip />
                <Bar dataKey="moyenne" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col xs={24} lg={8}>
          <Card title="Activités récentes" className="h-full">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'evaluation' ? 'bg-blue-500' :
                    activity.type === 'bulletin' ? 'bg-green-500' :
                    activity.type === 'absence' ? 'bg-red-500' : 'bg-orange-500'
                  }`} />
                  <div className="flex-1">
                    <Text className="block text-sm font-medium">
                      {activity.action}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      Par {activity.user} • {activity.time}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Progress Indicators */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card title="Progression des bulletins">
            <Progress
              percent={75}
              status="active"
              strokeColor={{ from: '#108ee9', to: '#87d068' }}
            />
            <Text className="text-sm text-gray-600 mt-2 block">
              {stats?.bulletinsGeneres} bulletins générés sur {stats?.totalEleves}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card title="Taux de présence">
            <Progress
              percent={95}
              status="success"
              strokeColor="#52c41a"
            />
            <Text className="text-sm text-gray-600 mt-2 block">
              Excellent taux de présence cette semaine
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card title="Évaluations en cours">
            <Progress
              percent={60}
              status="normal"
              strokeColor="#1890ff"
            />
            <Text className="text-sm text-gray-600 mt-2 block">
              {stats?.totalEvaluations} évaluations planifiées ce mois
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminDashboard