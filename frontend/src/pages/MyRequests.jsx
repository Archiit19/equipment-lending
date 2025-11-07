import { useEffect, useState } from 'react'
import api from '../api/axios'

const Badge = ({ children }) => <span className="badge">{children}</span>

export default function MyRequests() {
  const [list, setList] = useState([])
  const load = async () => {
    const { data } = await api.get('/requests')
    setList(data)
  }
  useEffect(() => { load() }, [])

  return (
    <div>
      <h2>My Requests</h2>
      <table className="table">
        <thead>
          <tr><th>Item</th><th>Qty</th><th>From</th><th>To</th><th>Status</th></tr>
        </thead>
        <tbody>
          {list.map(r => (
            <tr key={r._id}>
              <td>{r.item?.name}</td>
              <td>{r.quantity}</td>
              <td>{new Date(r.startDate).toLocaleDateString()}</td>
              <td>{new Date(r.endDate).toLocaleDateString()}</td>
              <td><Badge>{r.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <p>No requests yet.</p>}
    </div>
  )
}
