import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/AppLayout'
import { useAuth } from './store/auth'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Pipeline from './pages/Pipeline'
import CompanyDetail from './pages/CompanyDetail'
import Rounds from './pages/Rounds'
import Journal from './pages/Journal'
import Experiences from './pages/Experiences'

export default function App() {
  const isAuthenticated = useAuth((s) => s.isAuthenticated)

  return (
    <Routes>
      {/* Public Landing & Auth */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <AppLayout />
          ) : (
            <Landing />
          )
        }
      >
        {isAuthenticated && <Route index element={<Dashboard />} />}
      </Route>

      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
      />

      {/* Protected In-App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/companies/:id" element={<CompanyDetail />} />
          <Route path="/rounds" element={<Rounds />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/experiences" element={<Experiences />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

