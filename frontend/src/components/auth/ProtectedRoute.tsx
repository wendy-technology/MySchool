import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store'
import { Spin } from 'antd'
import type { UserRole } from '@/types/api'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requireAuth?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth)
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    )
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If specific roles are required, check user role
  if (allowedRoles.length > 0 && user) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  // If user is authenticated but accessing login page, redirect to dashboard
  if (isAuthenticated && location.pathname === '/login') {
    const dashboardPath = getDashboardPath(user?.role)
    return <Navigate to={dashboardPath} replace />
  }

  return <>{children}</>
}

// Helper function to get dashboard path based on user role
const getDashboardPath = (role?: UserRole): string => {
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

export default ProtectedRoute