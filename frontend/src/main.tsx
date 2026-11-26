import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './app/globals.css'
import { isAuthenticated } from './lib/auth'

const HomePage = lazy(() => import('./app/home/HomePage'))
const DashboardPage = lazy(() => import('./app/dashboard/page'))
const LoginPage = lazy(() => import('./app/login/page'))
const RegisterPage = lazy(() => import('./app/register/page'))

const ChangePasswordPage = lazy(() => import('./app/change-password/page'))

const ForgotPasswordPage = lazy(() => import('./app/forgot-password/page'))

function AppRoutes() {
  useLocation()
  const signedIn = isAuthenticated()

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={signedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={signedIn ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/change-password" element={signedIn ? <ChangePasswordPage /> : <Navigate to="/login" replace />} />
      <Route path="/dashboard" element={signedIn ? <DashboardPage /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Suspense fallback={null}>
      <AppRoutes />
    </Suspense>
  </BrowserRouter>,
)
