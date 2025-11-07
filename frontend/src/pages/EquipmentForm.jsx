import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import '../styles/equipmentForm.css'

export default function EquipmentForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const [form, setForm] = useState({ name:'', category:'media', condition:'good', quantity:1, description:'' })
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try { const { data } = await api.get('/equipment/' + id); setForm({ name:data.name, category:data.category, condition:data.condition, quantity:data.quantity, description:data.description||'' }); } catch {}
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      if (id) {
        await api.put('/equipment/' + id, form)
      } else {
        await api.post('/equipment', form)
      }
      nav('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed')
    }
  }

  return (
    <div className="card" style={{maxWidth:640}}>
      <h2>{id ? 'Edit' : 'Add'} Equipment</h2>
      {error && <div className="card" style={{background:'#fee'}}>{error}</div>}
      <form onSubmit={onSubmit}>
        <label>Name</label>
        <input className="input" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
        <label>Category</label>
        <select value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
          <option value="media">Media</option>
          <option value="lab">Lab</option>
          <option value="sports">Sports</option>
        </select>
        <label>Condition</label>
        <input className="input" value={form.condition} onChange={e => setForm({...form, condition:e.target.value})} />
        <label>Quantity</label>
        <input className="input" type="number" min="0" value={form.quantity} onChange={e => setForm({...form, quantity:Number(e.target.value)})} />
        <label>Description</label>
        <textarea className="input" value={form.description} onChange={e => setForm({...form, description:e.target.value})} />
        <button className="btn primary" style={{marginTop:8}} type="submit">Save</button>
      </form>
    </div>
  )
}
