import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Breadcrumb } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store'
import { logout } from '@/store/authSlice'
import type { UserRole } from '@/types/api'
import AdminSidebar from './sidebars/AdminSidebar'
import TeacherSidebar from './sidebars/TeacherSidebar'
import StudentSidebar from './sidebars/StudentSidebar'
import ParentSidebar from './sidebars/ParentSidebar'

const { Header, Sider, Content } = Layout
const { Text } = Typography

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
  }

  const getSidebarComponent = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <AdminSidebar />
      case 'ENSEIGNANT':
        return <TeacherSidebar />
      case 'ELEVE':
        return <StudentSidebar />
      case 'PARENT':
        return <ParentSidebar />
      default:
        return <AdminSidebar />
    }
  }

  const getUserMenuItems = () => [
    {
      key: 'profile',
      label: 'Mon Profil',
      icon: <UserOutlined />,
      onClick: () => navigate(`/${user?.role.toLowerCase()}/profil`),
    },
    {
      key: 'settings',
      label: 'Paramètres',
      icon: <SettingOutlined />,
      onClick: () => navigate(`/${user?.role.toLowerCase()}/parametres`),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Déconnexion',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ]

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur'
      case 'ENSEIGNANT':
        return 'Enseignant'
      case 'ELEVE':
        return 'Élève'
      case 'PARENT':
        return 'Parent'
      default:
        return role
    }
  }

  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const items = [
      {
        title: 'Accueil',
      },
    ]

    if (pathSegments.length > 1) {
      items.push({
        title: pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1),
      })
    }

    return items
  }

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="shadow-lg"
        theme="dark"
        width={280}
        collapsedWidth={80}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">MS</span>
            </div>
            {!collapsed && (
              <span className="text-white font-bold text-lg">MySchool</span>
            )}
          </div>
        </div>

        {/* Sidebar Menu */}
        {user && getSidebarComponent(user.role)}
      </Sider>

      <Layout>
        {/* Header */}
        <Header className="bg-white shadow-sm px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-600 hover:text-blue-600"
            />

            <Breadcrumb items={getBreadcrumbItems()} />
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button
              type="text"
              icon={<BellOutlined />}
              className="text-gray-600 hover:text-blue-600"
            />

            {/* User Menu */}
            <Dropdown
              menu={{ items: getUserMenuItems() }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2">
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  className="bg-blue-600"
                />
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.prenom} {user?.nom}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user && getRoleDisplayName(user.role)}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content className="p-6 bg-gray-50 min-h-0">
          <div className="fade-in">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout