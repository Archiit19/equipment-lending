import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [dates, setDates] = useState({ start:'', end:'' })
  const [availableOnly, setAvailableOnly] = useState(false)

  const load = async () => {
    const params = new URLSearchParams()
    if (q)
        params.set('q', q)
    if (category)
        params.set('category', category)
    if (availableOnly) {
      if (dates.start)
          params.set('startDate', dates.start)
      if (dates.end)
          params.set('endDate', dates.end)
      params.set('availableOnly', 'true')
    }
    const { data } = await api.get('/equipment?' + params.toString())
    setItems(data)
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="card">
        <div className="row">
          <input className="input" placeholder="Search equipment..." value={q} onChange={e => setQ(e.target.value)} />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All categories</option>
            <option value="media">Media</option>
            <option value="lab">Lab</option>
            <option value="sports">Sports</option>
          </select>
          <label><input type="checkbox" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} /> Available only</label>
          {availableOnly && <>
            <input className="input" type="date" value={dates.start} onChange={e => setDates({...dates, start:e.target.value})} />
            <input className="input" type="date" value={dates.end} onChange={e => setDates({...dates, end:e.target.value})} />
          </>}
          <button className="btn" onClick={load}>Search</button>
        </div>
      </div>

      {items.map(it => (
        <div key={it._id} className="card">
          <div className="row">
            <div className="grow">
              <h3 style={{margin:'4px 0'}}>{it.name}</h3>
              <div>Category: <strong>{it.category}</strong> &nbsp; | &nbsp; Condition: <strong>{it.condition}</strong></div>
              <div>Total Qty: <strong>{it.quantity}</strong> {typeof it.available === 'number' && <>&nbsp;|&nbsp; Available for window: <strong>{it.available}</strong></>}</div>
              {it.description && <p>{it.description}</p>}
            </div>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <Link className="btn primary" to={`/request/${it._id}`}>Request</Link>
              {user?.role==='admin' && <Link className="btn" to={`/equipment/${it._id}/edit`}>Edit</Link>}
            </div>
          </div>
        </div>
      ))}

      {items.length === 0 && <p>No items found.</p>}
    </div>
  )
}
