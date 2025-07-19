import React from 'react'
import { Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  UserOutlined,
  BankOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserDeleteOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons'

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Tableau de bord',
      onClick: () => navigate('/admin/dashboard'),
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Utilisateurs',
      children: [
        {
          key: '/admin/utilisateurs',
          label: 'Tous les utilisateurs',
          onClick: () => navigate('/admin/utilisateurs'),
        },
        {
          key: '/admin/enseignants',
          label: 'Enseignants',
          onClick: () => navigate('/admin/enseignants'),
        },
        {
          key: '/admin/eleves',
          label: 'Élèves',
          onClick: () => navigate('/admin/eleves'),
        },
        {
          key: '/admin/parents',
          label: 'Parents',
          onClick: () => navigate('/admin/parents'),
        },
      ],
    },
    {
      key: 'academic',
      icon: <BankOutlined />,
      label: 'Structure académique',
      children: [
        {
          key: '/admin/etablissements',
          label: 'Établissements',
          onClick: () => navigate('/admin/etablissements'),
        },
        {
          key: '/admin/classes',
          label: 'Classes',
          onClick: () => navigate('/admin/classes'),
        },
        {
          key: '/admin/matieres',
          label: 'Matières',
          onClick: () => navigate('/admin/matieres'),
        },
      ],
    },
    {
      key: 'evaluations',
      icon: <FileTextOutlined />,
      label: 'Évaluations & Notes',
      children: [
        {
          key: '/admin/evaluations',
          label: 'Évaluations',
          onClick: () => navigate('/admin/evaluations'),
        },
        {
          key: '/admin/notes',
          label: 'Notes',
          onClick: () => navigate('/admin/notes'),
        },
        {
          key: '/admin/bulletins',
          label: 'Bulletins',
          onClick: () => navigate('/admin/bulletins'),
        },
      ],
    },
    {
      key: 'attendance',
      icon: <UserDeleteOutlined />,
      label: 'Absences & Retards',
      children: [
        {
          key: '/admin/absences',
          label: 'Absences',
          onClick: () => navigate('/admin/absences'),
        },
        {
          key: '/admin/justificatifs',
          label: 'Justificatifs',
          onClick: () => navigate('/admin/justificatifs'),
        },
      ],
    },
    {
      key: 'schedule',
      icon: <CalendarOutlined />,
      label: 'Emploi du temps',
      children: [
        {
          key: '/admin/emploi-du-temps',
          label: 'Planning général',
          onClick: () => navigate('/admin/emploi-du-temps'),
        },
        {
          key: '/admin/creneaux',
          label: 'Créneaux horaires',
          onClick: () => navigate('/admin/creneaux'),
        },
        {
          key: '/admin/salles',
          label: 'Salles',
          onClick: () => navigate('/admin/salles'),
        },
      ],
    },
    {
      key: '/admin/statistiques',
      icon: <BarChartOutlined />,
      label: 'Statistiques',
      onClick: () => navigate('/admin/statistiques'),
    },
    {
      key: '/admin/parametres',
      icon: <SettingOutlined />,
      label: 'Paramètres',
      onClick: () => navigate('/admin/parametres'),
    },
  ]

  const getSelectedKeys = () => {
    const path = location.pathname
    return [path]
  }

  const getOpenKeys = () => {
    const path = location.pathname
    const openKeys = []

    if (path.includes('/admin/utilisateurs') || path.includes('/admin/enseignants') || 
        path.includes('/admin/eleves') || path.includes('/admin/parents')) {
      openKeys.push('users')
    }
    if (path.includes('/admin/etablissements') || path.includes('/admin/classes') || 
        path.includes('/admin/matieres')) {
      openKeys.push('academic')
    }
    if (path.includes('/admin/evaluations') || path.includes('/admin/notes') || 
        path.includes('/admin/bulletins')) {
      openKeys.push('evaluations')
    }
    if (path.includes('/admin/absences') || path.includes('/admin/justificatifs')) {
      openKeys.push('attendance')
    }
    if (path.includes('/admin/emploi-du-temps') || path.includes('/admin/creneaux') || 
        path.includes('/admin/salles')) {
      openKeys.push('schedule')
    }

    return openKeys
  }

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={getSelectedKeys()}
      defaultOpenKeys={getOpenKeys()}
      items={menuItems}
      className="h-full border-r-0"
    />
  )
}

export default AdminSidebar