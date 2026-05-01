// import './App.css'

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// 🔖 Lazy loading all pages
// Each page becomes a separate JS chunk
// Downloaded only when user navigates to it
// const Home               = lazy(() => import('./pages/Home'))
// const JobDetail          = lazy(() => import('./pages/JobDetail'))
// const Login              = lazy(() => import('./pages/Login'))
// const Register           = lazy(() => import('./pages/Register'))
// const CandidateDashboard = lazy(() => import('./pages/CandidateDashboard'))
// const AdminDashboard     = lazy(() => import('./pages/AdminDashboard'))

// 🔖 QueryClient config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:   1000 * 60,      // 1 min — data is fresh for 1 min
      gcTime:      1000 * 60 * 5,  // 5 min — keep in cache for 5 min
      retry:       1,              // retry once on failure
      refetchOnWindowFocus: false, // don't refetch when tab regains focus
    }
  }
})

// Loading fallback while lazy chunk downloads
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', height: 'calc(100vh - 64px)'
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        border: '3px solid #e2e8f0',
        borderTopColor: '#2563eb',
        animation: 'spin 0.7s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Navbar />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"          element={<Home />} />
                <Route path="/jobs/:id"  element={<JobDetail />} />
                <Route path="/login"     element={<Login />} />
                <Route path="/register"  element={<Register />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <CandidateDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>

            {/* 🔖 react-hot-toast — global notification system */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: '8px', fontWeight: 600 }
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App