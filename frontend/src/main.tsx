import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as Sentry from '@sentry/react'
import App from './App'
import './index.css'

// ============================================================================
// Sentry Error Tracking Initialization
// ============================================================================

// Get environment from import.meta.env (Vite)
const environment = import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE || 'development'
const sentryDsn = import.meta.env.VITE_SENTRY_DSN
const version = import.meta.env.VITE_VERSION || 'unknown'

// Initialize Sentry if DSN is provided
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment,
    release: `lanfinitas-frontend@${version}`,

    // Performance Monitoring
    integrations: [
      // Browser tracing for performance monitoring
      Sentry.browserTracingIntegration({
        // Set sampling rate for performance monitoring
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/api\.lanfinitas\.com/,
          /^https:\/\/.*\.lanfinitas\.com/,
        ],
      }),

      // Session Replay for debugging
      Sentry.replayIntegration({
        // Session replay sample rate (% of sessions to record)
        maskAllText: true,
        blockAllMedia: true,
      }),

      // React-specific integration
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
      }),
    ],

    // Sample rates based on environment
    tracesSampleRate: environment === 'production' ? 0.1 : environment === 'staging' ? 0.5 : 1.0,

    // Session Replay sample rates
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 0.5,
    replaysOnErrorSampleRate: environment === 'production' ? 1.0 : 1.0,

    // Capture console messages
    beforeSend(event, hint) {
      // Filter out non-error events in production
      if (environment === 'production') {
        // Don't send 404s or client errors
        if (event.exception?.values?.[0]?.type === 'NotFoundError') {
          return null
        }

        // Filter out network errors (user may have lost connection)
        if (event.exception?.values?.[0]?.type === 'NetworkError') {
          return null
        }
      }

      return event
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'atomicFindClose',
      // Network errors
      'NetworkError',
      'Network request failed',
      // React hydration errors (not critical)
      'Hydration failed',
      // ResizeObserver (benign)
      'ResizeObserver loop limit exceeded',
    ],

    // Don't send PII
    sendDefaultPii: false,

    // Attach stack traces to all messages
    attachStacktrace: true,

    // Max breadcrumbs
    maxBreadcrumbs: 50,

    // Enable debug in development
    debug: environment === 'development',
  })

  console.info('Sentry error tracking initialized')
} else {
  console.warn('Sentry DSN not provided, error tracking disabled')
}

// ============================================================================
// React Query Configuration
// ============================================================================

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

// ============================================================================
// Application Render
// ============================================================================

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#dc2626' }}>
            Oops! Something went wrong
          </h1>
          <p style={{ marginBottom: '1.5rem', color: '#6b7280', maxWidth: '500px' }}>
            We're sorry for the inconvenience. Our team has been notified and is working on a fix.
          </p>
          <details style={{ marginBottom: '1.5rem', textAlign: 'left', maxWidth: '600px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '0.5rem', color: '#4b5563' }}>
              Error details
            </summary>
            <pre style={{
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
              overflow: 'auto',
              fontSize: '0.875rem',
              color: '#1f2937'
            }}>
              {error?.toString()}
            </pre>
          </details>
          <button
            onClick={resetError}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            Try again
          </button>
        </div>
      )}
      showDialog={false}
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
)
