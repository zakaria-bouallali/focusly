import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import Workspaces from './pages/Workspaces'
import WorkspaceDetail from './pages/WorkspaceDetail'
import KanbanBoard from './pages/KanbanBoard'
import ImportNotes from './pages/ImportNotes'
import Landing from './pages/Landing'
import SuperAdminDashboard from './pages/SuperAdminDashboard'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  if (!user) return children
  return user.is_super_admin ? <Navigate to="/super-admin" replace /> : <Navigate to="/workspaces" replace />
}

function SuperAdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!user.is_super_admin) return <Navigate to="/workspaces" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1730',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              fontSize: 13,
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#0f0f1a' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#0f0f1a' } },
          }}
        />
        <Routes>
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route path="/admin"       element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
          <Route path="/super-admin" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />

          <Route path="/workspaces"               element={<PrivateRoute><Workspaces /></PrivateRoute>} />
          <Route path="/workspaces/:id"           element={<PrivateRoute><WorkspaceDetail /></PrivateRoute>} />
          <Route path="/projects/:id"             element={<PrivateRoute><KanbanBoard /></PrivateRoute>} />
          <Route path="/projects/:id/import"      element={<PrivateRoute><ImportNotes /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

