import React from 'react'
import { Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  EditOutlined,
  UserDeleteOutlined,
  CalendarOutlined,
  BookOutlined,
  UserOutlined,
} from '@ant-design/icons'

const TeacherSidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/enseignant/dashboard',
      icon: <DashboardOutlined />,
      label: 'Tableau de bord',
      onClick: () => navigate('/enseignant/dashboard'),
    },
    {
      key: '/enseignant/classes',
      icon: <TeamOutlined />,
      label: 'Mes Classes',
      onClick: () => navigate('/enseignant/classes'),
    },
    {
      key: 'teaching',
      icon: <FileTextOutlined />,
      label: 'Enseignement',
      children: [
        {
          key: '/enseignant/evaluations',
          label: 'Évaluations',
          onClick: () => navigate('/enseignant/evaluations'),
        },
        {
          key: '/enseignant/notes',
          label: 'Saisie des notes',
          onClick: () => navigate('/enseignant/notes'),
        },
        {
          key: '/enseignant/bulletins',
          label: 'Bulletins',
          onClick: () => navigate('/enseignant/bulletins'),
        },
      ],
    },
    {
      key: '/enseignant/absences',
      icon: <UserDeleteOutlined />,
      label: 'Absences',
      onClick: () => navigate('/enseignant/absences'),
    },
    {
      key: '/enseignant/emploi-du-temps',
      icon: <CalendarOutlined />,
      label: 'Mon Emploi du temps',
      onClick: () => navigate('/enseignant/emploi-du-temps'),
    },
    {
      key: '/enseignant/cahier-texte',
      icon: <BookOutlined />,
      label: 'Cahier de texte',
      onClick: () => navigate('/enseignant/cahier-texte'),
    },
    {
      key: '/enseignant/profil',
      icon: <UserOutlined />,
      label: 'Mon Profil',
      onClick: () => navigate('/enseignant/profil'),
    },
  ]

  const getSelectedKeys = () => {
    const path = location.pathname
    return [path]
  }

  const getOpenKeys = () => {
    const path = location.pathname
    const openKeys = []

    if (path.includes('/enseignant/evaluations') || path.includes('/enseignant/notes') || 
        path.includes('/enseignant/bulletins')) {
      openKeys.push('teaching')
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

export default TeacherSidebar