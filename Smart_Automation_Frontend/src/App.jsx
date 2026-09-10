// src/App.jsx
import Landing from './pages/Landing.jsx'
import ScanDashboard from './pages/ScanDashboard.jsx'
import AnalyticsDashboard from './pages/AnalyticsDashboard.jsx'
import AdminRules from './pages/AdminRules.jsx'
import History from './pages/History.jsx'
import Products from './pages/Products.jsx'
import Alerts from './pages/Alerts.jsx'
import Placeholder from './pages/Placeholder.jsx'
import Login from './pages/Login.jsx'
import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/scan" element={<ProtectedRoute><ScanDashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Placeholder title="Reports" /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Placeholder title="Settings" /></ProtectedRoute>} />

        <Route
          path="/admin/rules"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminRules />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App