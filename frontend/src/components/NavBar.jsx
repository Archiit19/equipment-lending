import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useEffect, useState } from 'react'
import api from '../api/axios.js'
import '../styles/nav.css'

export default function NavBar() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const { data } = await api.get('/notifications')
        if (mounted) setNotifications(data.filter(n => !n.read))
      } catch {}
    }
    if (user) load()
    return () => { mounted = false }
  }, [user])

  return (
    <div className="nav">
      <Link to="/"><h1>Equipment Lending</h1></Link>
      {user && <>
        <Link to="/">Dashboard</Link>
        <Link to="/requests">My Requests</Link>
        {(user.role === 'admin') && <Link to="/equipment/new">Add Equipment</Link>}
        {(user.role === 'staff' || user.role === 'admin') && <Link to="/admin/requests">Manage Requests</Link>}
        <span className="grow" />
        <span>{user.name} <small>({user.role})</small></span>
          <Link to="/notifications" className="badge">
              🔔 {notifications.length}
          </Link>

          <button className="btn" onClick={() => { logout(); nav('/login'); }}>Logout</button>
      </>}
      {!user && <>
        <span className="grow" />
        <Link className="btn" to="/login">Login</Link>
        <Link className="btn" to="/register">Register</Link>
      </>}
    </div>
  )
}
