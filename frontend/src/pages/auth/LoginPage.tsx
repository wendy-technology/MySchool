import React, { useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Alert, Spin } from 'antd'
import { UserOutlined, LockOutlined, BookOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store'
import { login } from '@/store/authSlice'
import type { LoginRequest, UserRole } from '@/types/api'

const { Title, Text } = Typography

const LoginPage: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { isLoading, isAuthenticated, user } = useAppSelector((state) => state.auth)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as any)?.from?.pathname || getDashboardPath(user.role)
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, user, navigate, location])

  const handleSubmit = async (values: LoginRequest) => {
    try {
      const result = await dispatch(login(values)).unwrap()
      if (result.user) {
        const dashboardPath = getDashboardPath(result.user.role)
        navigate(dashboardPath, { replace: true })
      }
    } catch (error) {
      // Error is handled by the slice and will show notification
      console.error('Login failed:', error)
    }
  }

  const getDashboardPath = (role: UserRole): string => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard'
      case 'ENSEIGNANT':
        return '/enseignant/dashboard'
      case 'ELEVE':
        return '/eleve/dashboard'
      case 'PARENT':
        return '/parent/dashboard'
      default:
        return '/login'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
            <BookOutlined className="text-2xl" />
          </div>
          <Title level={2} className="text-gray-900 mb-2">
            MySchool
          </Title>
          <Text className="text-gray-600">
            Système de gestion scolaire algérien
          </Text>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0">
          <Title level={3} className="text-center mb-6 text-gray-800">
            Connexion
          </Title>

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            size="large"
            layout="vertical"
            className="custom-form"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Veuillez entrer votre email' },
                { type: 'email', message: 'Format email invalide' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Entrez votre email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="motDePasse"
              label="Mot de passe"
              rules={[
                { required: true, message: 'Veuillez entrer votre mot de passe' },
                { min: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Entrez votre mot de passe"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item className="mb-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
                className="h-12 text-lg font-medium"
              >
                Se connecter
              </Button>
            </Form.Item>
          </Form>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <Text strong className="block mb-3 text-gray-700">
              Comptes de démonstration :
            </Text>
            <div className="space-y-2 text-sm">
              <div>
                <Text className="font-medium">Admin:</Text>{' '}
                <Text code>admin@cem-ibnkhaldoun.edu.dz</Text>
              </div>
              <div>
                <Text className="font-medium">Enseignant:</Text>{' '}
                <Text code>maths@cem-ibnkhaldoun.edu.dz</Text>
              </div>
              <div>
                <Text className="font-medium">Élève:</Text>{' '}
                <Text code>yasmine.benamara@cem-ibnkhaldoun.edu.dz</Text>
              </div>
              <div>
                <Text className="font-medium">Parent:</Text>{' '}
                <Text code>ali.benamara@gmail.com</Text>
              </div>
              <div className="mt-2">
                <Text className="font-medium">Mot de passe:</Text>{' '}
                <Text code>{'{rôle}123'}</Text> (ex: admin123)
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <Text className="text-gray-500 text-sm">
            © 2024 MySchool. Système éducatif algérien.
          </Text>
        </div>
      </div>
    </div>
  )
}

export default LoginPage