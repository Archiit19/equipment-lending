import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function AdminRequests() {
  const [list, setList] = useState([])
  const [status, setStatus] = useState('all')
  const load = async () => {
    const { data } = await api.get('/requests?all=true')
    setList(data)
  }
  useEffect(() => { load() }, [])

  const act = async (id, action) => {
    await api.patch(`/requests/${id}/${action}`)
    load()
  }

  const filtered = list.filter(r => status==='all' ? true : r.status===status)

  return (
    <div>
      <h2>Manage Requests</h2>
      <div className="row">
        <label>Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="requested">requested</option>
          <option value="approved">approved</option>
          <option value="issued">issued</option>
          <option value="overdue">overdue</option>
        </select>
      </div>

      <table className="table" style={{marginTop:8}}>
        <thead>
          <tr><th>Item</th><th>By</th><th>Qty</th><th>From</th><th>To</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r._id}>
              <td>{r.item?.name}</td>
              <td>{r.requester?.name}</td>
              <td>{r.quantity}</td>
              <td>{new Date(r.startDate).toLocaleDateString()}</td>
              <td>{new Date(r.endDate).toLocaleDateString()}</td>
              <td>{r.status}</td>
              <td style={{display:'flex', gap:6}}>
                {r.status==='requested' && <button className="btn" onClick={() => act(r._id, 'approve')}>Approve</button>}
                {r.status==='requested' && <button className="btn" onClick={() => act(r._id, 'reject')}>Reject</button>}
                {r.status==='approved' && <button className="btn" onClick={() => act(r._id, 'issue')}>Issue</button>}
                {(r.status==='issued' || r.status==='overdue') && <button className="btn" onClick={() => act(r._id, 'return')}>Mark Returned</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && <p>No requests.</p>}
    </div>
  )
}
