import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import {
  LandingPage,
  HomePage,
  LoginPage,
  RegisterPage,
  PatternsPage,
  NewPatternPage,
  PatternDetailPage,
  PatternGeneratorPage,
  AnnotationToolPage,
  TrainingDashboardPage,
  ResultsGalleryPage,
  IdentityManagementPage,
  DelegationConsolePage,
  WalletDashboardPage,
  TemplateLibraryPage,
} from '@/pages'

/**
 * Application Routes Configuration
 *
 * Routes are organized as follows:
 * - Public routes: /, /login, /register
 * - Protected routes: All other routes require authentication
 */
const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/home',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  // Protected Routes
  {
    path: '/patterns',
    element: (
      <ProtectedRoute>
        <PatternsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patterns/new',
    element: (
      <ProtectedRoute>
        <NewPatternPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patterns/generate',
    element: (
      <ProtectedRoute>
        <PatternGeneratorPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patterns/:id',
    element: (
      <ProtectedRoute>
        <PatternDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/annotate',
    element: (
      <ProtectedRoute>
        <AnnotationToolPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/training',
    element: (
      <ProtectedRoute>
        <TrainingDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/results',
    element: (
      <ProtectedRoute>
        <ResultsGalleryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/identity',
    element: (
      <ProtectedRoute>
        <IdentityManagementPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/delegation',
    element: (
      <ProtectedRoute>
        <DelegationConsolePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wallet',
    element: (
      <ProtectedRoute>
        <WalletDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/templates',
    element: (
      <ProtectedRoute>
        <TemplateLibraryPage />
      </ProtectedRoute>
    ),
  },

  // 404 Not Found
  {
    path: '*',
    element: (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold text-gray-900">404</h1>
          <p className="mb-8 text-xl text-gray-600">Page not found</p>
          <a
            href="/"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Go Home
          </a>
        </div>
      </div>
    ),
  },
])

/**
 * AppRouter Component
 *
 * Main router component that wraps the entire application
 */
export function AppRouter() {
  return <RouterProvider router={router} />
}
