import React from 'react'
import { Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  UserDeleteOutlined,
  TrophyOutlined,
  MessageOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons'

const ParentSidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/parent/dashboard',
      icon: <DashboardOutlined />,
      label: 'Tableau de bord',
      onClick: () => navigate('/parent/dashboard'),
    },
    {
      key: '/parent/enfants',
      icon: <TeamOutlined />,
      label: 'Mes Enfants',
      onClick: () => navigate('/parent/enfants'),
    },
    {
      key: 'tracking',
      icon: <FileTextOutlined />,
      label: 'Suivi scolaire',
      children: [
        {
          key: '/parent/notes',
          label: 'Notes',
          onClick: () => navigate('/parent/notes'),
        },
        {
          key: '/parent/bulletins',
          label: 'Bulletins',
          onClick: () => navigate('/parent/bulletins'),
        },
        {
          key: '/parent/absences',
          label: 'Absences',
          onClick: () => navigate('/parent/absences'),
        },
      ],
    },
    {
      key: '/parent/emploi-du-temps',
      icon: <CalendarOutlined />,
      label: 'Emploi du temps',
      onClick: () => navigate('/parent/emploi-du-temps'),
    },
    {
      key: '/parent/communications',
      icon: <MessageOutlined />,
      label: 'Communications',
      onClick: () => navigate('/parent/communications'),
    },
    {
      key: '/parent/profil',
      icon: <UserOutlined />,
      label: 'Mon Profil',
      onClick: () => navigate('/parent/profil'),
    },
  ]

  const getSelectedKeys = () => {
    const path = location.pathname
    return [path]
  }

  const getOpenKeys = () => {
    const path = location.pathname
    const openKeys = []

    if (path.includes('/parent/notes') || path.includes('/parent/bulletins') || 
        path.includes('/parent/absences')) {
      openKeys.push('tracking')
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

export default ParentSidebar