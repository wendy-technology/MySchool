import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, App as AntApp } from 'antd'
import { Provider } from 'react-redux'
import frFR from 'antd/locale/fr_FR'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'

import { store } from '@/store'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import MainLayout from '@/components/layout/MainLayout'
import LoginPage from '@/pages/auth/LoginPage'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import UsersListPage from '@/pages/admin/users/UsersListPage'
import CreateUserPage from '@/pages/admin/users/CreateUserPage'
import EditUserPage from '@/pages/admin/users/EditUserPage'

// Configure dayjs
dayjs.locale('fr')

// Temporary placeholder components for routes
const TeacherDashboard = () => <div className="p-6"><h2>Dashboard Enseignant</h2></div>
const StudentDashboard = () => <div className="p-6"><h2>Dashboard Élève</h2></div>
const ParentDashboard = () => <div className="p-6"><h2>Dashboard Parent</h2></div>
const UnauthorizedPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
      <p className="text-xl text-gray-600 mb-8">Accès non autorisé</p>
      <p className="text-gray-500">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
    </div>
  </div>
)

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider
        locale={frFR}
        theme={{
          token: {
            colorPrimary: '#2563eb',
            borderRadius: 8,
            fontFamily: 'Inter, Cairo, system-ui, -apple-system, sans-serif',
          },
          components: {
            Layout: {
              siderBg: '#1e40af',
              headerBg: '#ffffff',
            },
          },
        }}
      >
        <AntApp>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Protected Routes with Layout */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Routes>
                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

                        {/* Admin Routes */}
                        <Route
                          path="/admin/dashboard"
                          element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                              <AdminDashboard />
                            </ProtectedRoute>
                          }
                        />
                        
                        {/* User Management Routes */}
                        <Route
                          path="/admin/utilisateurs"
                          element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                              <UsersListPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/enseignants"
                          element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                              <UsersListPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/eleves"
                          element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                              <UsersListPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/parents"
                          element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                              <UsersListPage />
                            </ProtectedRoute>
                          }
                        />
                        
                        {/* User Form Routes */}
                        <Route
                          path="/admin/utilisateurs/nouveau"
                          element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                              <CreateUserPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/utilisateurs/:id/modifier"
                          element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                              <EditUserPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/utilisateurs/:id"
                          element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                              <EditUserPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Teacher Routes */}
                        <Route
                          path="/enseignant/dashboard"
                          element={
                            <ProtectedRoute allowedRoles={['ENSEIGNANT']}>
                              <TeacherDashboard />
                            </ProtectedRoute>
                          }
                        />

                        {/* Student Routes */}
                        <Route
                          path="/eleve/dashboard"
                          element={
                            <ProtectedRoute allowedRoles={['ELEVE']}>
                              <StudentDashboard />
                            </ProtectedRoute>
                          }
                        />

                        {/* Parent Routes */}
                        <Route
                          path="/parent/dashboard"
                          element={
                            <ProtectedRoute allowedRoles={['PARENT']}>
                              <ParentDashboard />
                            </ProtectedRoute>
                          }
                        />

                        {/* Catch all - redirect to appropriate dashboard */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AntApp>
      </ConfigProvider>
    </Provider>
  )
}

export default App