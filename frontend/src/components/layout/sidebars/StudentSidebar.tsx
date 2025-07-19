import React from 'react'
import { Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserDeleteOutlined,
  BookOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons'

const StudentSidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/eleve/dashboard',
      icon: <DashboardOutlined />,
      label: 'Tableau de bord',
      onClick: () => navigate('/eleve/dashboard'),
    },
    {
      key: '/eleve/notes',
      icon: <FileTextOutlined />,
      label: 'Mes Notes',
      onClick: () => navigate('/eleve/notes'),
    },
    {
      key: '/eleve/bulletins',
      icon: <TrophyOutlined />,
      label: 'Mes Bulletins',
      onClick: () => navigate('/eleve/bulletins'),
    },
    {
      key: '/eleve/emploi-du-temps',
      icon: <CalendarOutlined />,
      label: 'Mon Emploi du temps',
      onClick: () => navigate('/eleve/emploi-du-temps'),
    },
    {
      key: '/eleve/absences',
      icon: <UserDeleteOutlined />,
      label: 'Mes Absences',
      onClick: () => navigate('/eleve/absences'),
    },
    {
      key: '/eleve/devoirs',
      icon: <BookOutlined />,
      label: 'Devoirs & Leçons',
      onClick: () => navigate('/eleve/devoirs'),
    },
    {
      key: '/eleve/profil',
      icon: <UserOutlined />,
      label: 'Mon Profil',
      onClick: () => navigate('/eleve/profil'),
    },
  ]

  const getSelectedKeys = () => {
    const path = location.pathname
    return [path]
  }

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={getSelectedKeys()}
      items={menuItems}
      className="h-full border-r-0"
    />
  )
}

export default StudentSidebar