import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) api.get('/auth/me').then(({data}) => setUser(data)).catch(()=>{})
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, setUser, login, logout, register }}>
    {children}
  </AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
