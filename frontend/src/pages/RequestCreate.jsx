import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'

export default function RequestCreate() {
  const { id } = useParams()
  const nav = useNavigate()
  const [equipment, setEquipment] = useState(null)
  const [form, setForm] = useState({ quantity:1, startDate:'', endDate:'' })
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try { const { data } = await api.get('/equipment/' + id); setEquipment(data); } catch { setEquipment(null); }
    }
    load()
  }, [id])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/requests', { itemId: id, ...form })
      nav('/requests')
    } catch (err) {
      setError(err.response?.data?.error || 'Request failed')
    }
  }

  if (!equipment) return <p>Loading...</p>
  return (
    <div className="card" style={{maxWidth:520}}>
      <h2>Request: {equipment.name}</h2>
      <p>Category: {equipment.category} • Total Qty: {equipment.quantity}</p>
      {error && <div className="card" style={{background:'#fee'}}>{error}</div>}
      <form onSubmit={onSubmit}>
        <label>Quantity</label>
        <input className="input" type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity:Number(e.target.value)})} />
        <label>Start date</label>
        <input className="input" type="date" value={form.startDate} onChange={e => setForm({...form, startDate:e.target.value})} />
        <label>End date</label>
        <input className="input" type="date" value={form.endDate} onChange={e => setForm({...form, endDate:e.target.value})} />
        <button className="btn primary" style={{marginTop:8}} type="submit">Submit Request</button>
      </form>
    </div>
  )
}
