import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student' })
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      nav('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="row">
      <div className="card" style={{maxWidth: 480}}>
        <h2>Register</h2>
        {error && <div className="card" style={{background:'#fee'}}>{error}</div>}
        <form onSubmit={onSubmit}>
          <label>Name</label>
          <input className="input" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
          <label>Email</label>
          <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
          <label>Password</label>
          <input className="input" type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} required />
          <label>Role</label>
          <select value={form.role} onChange={e => setForm({...form, role:e.target.value})}>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
          </select>
          <button className="btn primary" style={{marginTop:8}} type="submit">Create account</button>
        </form>
        <p>Have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}
