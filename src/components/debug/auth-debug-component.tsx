"use client"

import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { useEffect, useState } from 'react'

export function AuthDebug() {
  const { user, token } = useAuthStore()
  const [testResult, setTestResult] = useState<string>('')
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null)

  useEffect(() => {
    // Check localStorage token
    if (typeof window !== 'undefined') {
      setLocalStorageToken(localStorage.getItem('auth_token'))
    }
  }, [])

  const testAPI = async () => {
    try {
      setTestResult('Testing API...')
      const response = await api.get('/auth/profile')
      setTestResult(`Success: ${JSON.stringify(response, null, 2)}`)
    } catch (error: any) {
      setTestResult(`Error: ${error.message}`)
    }
  }

  return (
    <div className="fixed top-4 right-4 bg-black/90 p-4 rounded-lg text-xs text-black z-50 max-w-sm">
      <div className="space-y-2">
        <div><strong>Auth Debug:</strong></div>
        <div>Authenticated: {user ? 'Yes' : 'No'}</div>
        {user && (
          <>
            <div>User Role: {user.role}</div>
            <div>User ID: {user.id}</div>
            <div>User Email: {user.email}</div>
          </>
        )}
        <div>Store Token: {token ? 'Present' : 'Missing'}</div>
        <div>LS Token: {localStorageToken ? 'Present' : 'Missing'}</div>
        <div>Token Match: {token === localStorageToken ? 'Yes' : 'No'}</div>
        <button 
          onClick={testAPI}
          className="bg-blue-500 px-2 py-1 rounded text-black"
        >
          Test API
        </button>
        {testResult && (
          <div className="bg-gray-800 p-2 rounded mt-2 max-h-32 overflow-auto">
            <pre>{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  )
}