import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import TypingApp from './pages/TypingApp'
import ProfilePage from './pages/ProfilePage'
import { Loader2 } from 'lucide-react'

// Code Splitting for Admin Pages
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'))

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()

  // Only allow if logged in and username is 'admin'
  if (!user || user.username !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* Main App */}
      <Route path="/" element={<TypingApp />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* Admin Panel (Lazy Loaded and Protected) */}
      <Route
        path="/manage/*"
        element={
          <ProtectedAdminRoute>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              </div>
            }>
              <AdminDashboard />
            </Suspense>
          </ProtectedAdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
