import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Notifications() {
    const [list, setList] = useState([]);
    useEffect(() => {
        api.get('/notifications').then(res => setList(res.data));
    }, []);
    return (
        <div className="card" style={{maxWidth:600, margin:'4rem auto'}}>
            <h2>Notifications</h2>
            {list.length ? (
                list.map(n => (
                    <div key={n._id} style={{borderBottom:'1px solid #eee', padding:'0.75rem 0'}}>
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                    </div>
                ))
            ) : <p>No notifications</p>}
        </div>
    );
}
