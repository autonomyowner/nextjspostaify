'use client'

import { useState, useEffect } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useConvexAuth, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

export default function AuthTestPage() {
  const { signIn, signOut } = useAuthActions()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [testPassword, setTestPassword] = useState('testpassword123')
  const [logs, setLogs] = useState<string[]>([])
  const [cookies, setCookies] = useState<string>('')
  const [envVars, setEnvVars] = useState<Record<string, string>>({})

  // Try to get current user from Convex
  const currentUser = useQuery(api.users.getCurrentUser)

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    // Gather environment info
    setEnvVars({
      'NEXT_PUBLIC_CONVEX_URL': process.env.NEXT_PUBLIC_CONVEX_URL || 'NOT SET',
      'Window Location': typeof window !== 'undefined' ? window.location.href : 'N/A',
      'Window Origin': typeof window !== 'undefined' ? window.location.origin : 'N/A',
    })

    // Get cookies (only accessible ones)
    if (typeof document !== 'undefined') {
      setCookies(document.cookie || '(no accessible cookies)')
    }

    addLog('Page loaded')
    addLog(`isAuthenticated: ${isAuthenticated}`)
    addLog(`isLoading: ${isLoading}`)
  }, [isAuthenticated, isLoading])

  useEffect(() => {
    if (currentUser !== undefined) {
      addLog(`Current user query result: ${JSON.stringify(currentUser)}`)
    }
  }, [currentUser])

  const testEmailSignUp = async () => {
    addLog('Starting email sign-up test...')
    try {
      const formData = new FormData()
      formData.set('email', testEmail)
      formData.set('password', testPassword)
      formData.set('name', 'Test User')
      formData.set('flow', 'signUp')

      addLog('Calling signIn("password", formData) with flow=signUp...')
      const result = await signIn('password', formData)
      addLog(`Sign-up result: ${JSON.stringify(result)}`)
      addLog('Sign-up completed successfully!')

      // Check cookies after
      setTimeout(() => {
        setCookies(document.cookie || '(no accessible cookies)')
        addLog(`Cookies after sign-up: ${document.cookie || '(none)'}`)
      }, 1000)
    } catch (error: any) {
      addLog(`Sign-up ERROR: ${error.message || error}`)
      console.error('Sign-up error:', error)
    }
  }

  const testEmailSignIn = async () => {
    addLog('Starting email sign-in test...')
    try {
      const formData = new FormData()
      formData.set('email', testEmail)
      formData.set('password', testPassword)
      formData.set('flow', 'signIn')

      addLog('Calling signIn("password", formData) with flow=signIn...')
      const result = await signIn('password', formData)
      addLog(`Sign-in result: ${JSON.stringify(result)}`)
      addLog('Sign-in completed successfully!')

      // Check cookies after
      setTimeout(() => {
        setCookies(document.cookie || '(no accessible cookies)')
        addLog(`Cookies after sign-in: ${document.cookie || '(none)'}`)
      }, 1000)
    } catch (error: any) {
      addLog(`Sign-in ERROR: ${error.message || error}`)
      console.error('Sign-in error:', error)
    }
  }

  const testGoogleSignIn = async () => {
    addLog('Starting Google sign-in test...')
    addLog('This will redirect to Google OAuth...')
    try {
      await signIn('google', { redirectTo: '/auth-test' })
    } catch (error: any) {
      addLog(`Google sign-in ERROR: ${error.message || error}`)
      console.error('Google sign-in error:', error)
    }
  }

  const testSignOut = async () => {
    addLog('Starting sign-out test...')
    try {
      await signOut()
      addLog('Sign-out completed!')
      setTimeout(() => {
        setCookies(document.cookie || '(no accessible cookies)')
        addLog(`Cookies after sign-out: ${document.cookie || '(none)'}`)
      }, 500)
    } catch (error: any) {
      addLog(`Sign-out ERROR: ${error.message || error}`)
    }
  }

  const testDashboardAccess = () => {
    addLog('Testing dashboard access with window.location...')
    window.location.href = '/dashboard'
  }

  const checkMiddleware = async () => {
    addLog('Checking middleware by fetching /dashboard...')
    try {
      const response = await fetch('/dashboard', { redirect: 'manual' })
      addLog(`Fetch /dashboard status: ${response.status} ${response.type}`)
      if (response.type === 'opaqueredirect') {
        addLog('Middleware redirected (not authenticated)')
      } else {
        addLog('Middleware allowed access (authenticated)')
      }
    } catch (error: any) {
      addLog(`Middleware check error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Auth Diagnostic Test Page</h1>
        <p className="text-gray-400 mb-8">Use this page to test authentication and diagnose issues</p>

        {/* Current Status */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Auth Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400">isLoading:</span>
              <span className={`ml-2 ${isLoading ? 'text-yellow-400' : 'text-green-400'}`}>
                {String(isLoading)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">isAuthenticated:</span>
              <span className={`ml-2 ${isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
                {String(isAuthenticated)}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400">Current User:</span>
              <span className="ml-2 text-blue-400">
                {currentUser === undefined ? 'Loading...' : currentUser === null ? 'null (not logged in)' : currentUser.email || currentUser.name || 'User found'}
              </span>
            </div>
          </div>
        </div>

        {/* Environment */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment</h2>
          <div className="space-y-2 font-mono text-sm">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key}>
                <span className="text-gray-400">{key}:</span>
                <span className="ml-2 text-green-400 break-all">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cookies */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Accessible Cookies</h2>
          <p className="font-mono text-sm text-yellow-400 break-all">
            {cookies || '(none visible - auth cookies are httpOnly)'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Note: Auth cookies are typically httpOnly and not visible to JavaScript
          </p>
        </div>

        {/* Test Credentials */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="text"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
              />
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Auth Tests</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={testEmailSignUp}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium"
            >
              Test Sign Up
            </button>
            <button
              onClick={testEmailSignIn}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium"
            >
              Test Sign In
            </button>
            <button
              onClick={testGoogleSignIn}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium"
            >
              Test Google OAuth
            </button>
            <button
              onClick={testSignOut}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded font-medium"
            >
              Test Sign Out
            </button>
            <button
              onClick={checkMiddleware}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-medium"
            >
              Check Middleware
            </button>
            <button
              onClick={testDashboardAccess}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Test Logs</h2>
            <button
              onClick={() => setLogs([])}
              className="text-sm text-gray-400 hover:text-white"
            >
              Clear Logs
            </button>
          </div>
          <div className="bg-black rounded p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Run a test above.</p>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.includes('ERROR') ? 'text-red-400' :
                    log.includes('successfully') ? 'text-green-400' :
                    log.includes('result') ? 'text-blue-400' :
                    'text-gray-300'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Known Issues */}
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400">Known Issues to Check</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li><strong>Google OAuth redirects to convex.site:</strong> This is expected - OAuth callback goes through Convex, then should redirect back to your site via SITE_URL env var</li>
            <li><strong>Sign in succeeds but stays on page:</strong> Check if cookies are being set (httpOnly so not visible here)</li>
            <li><strong>Middleware keeps redirecting:</strong> Token verification failing - check JWKS and JWT_PRIVATE_KEY match</li>
            <li><strong>isAuthenticated stays false:</strong> WebSocket auth failing - check auth.config.ts domain setting</li>
          </ul>
        </div>

        {/* Config Checklist */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Required Convex Env Vars (Production)</h2>
          <ul className="font-mono text-sm space-y-1">
            <li className="text-green-400">AUTH_GOOGLE_ID - Google OAuth client ID</li>
            <li className="text-green-400">AUTH_GOOGLE_SECRET - Google OAuth client secret</li>
            <li className="text-green-400">AUTH_SECRET - Random secret for signing</li>
            <li className="text-green-400">JWT_PRIVATE_KEY - PKCS#8 RSA private key (PEM format)</li>
            <li className="text-green-400">JWKS - JSON Web Key Set (public key)</li>
            <li className="text-green-400">SITE_URL - Your frontend URL (https://postaify.com)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
