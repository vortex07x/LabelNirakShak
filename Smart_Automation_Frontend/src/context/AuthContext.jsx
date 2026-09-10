// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '../lib/apiClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('packcheck_user')
    const token = localStorage.getItem('packcheck_token')
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    const { data } = await apiClient.post('/auth/login', { email, password })
    localStorage.setItem('packcheck_token', data.token)
    localStorage.setItem('packcheck_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  async function register(name, email, password) {
    const { data } = await apiClient.post('/auth/register', { name, email, password })
    localStorage.setItem('packcheck_token', data.token)
    localStorage.setItem('packcheck_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  function logout() {
    localStorage.removeItem('packcheck_token')
    localStorage.removeItem('packcheck_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}