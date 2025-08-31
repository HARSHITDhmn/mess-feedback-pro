import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function Dashboard(){
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState(null);

  const load = async ()=>{
    try {
      const res = await api.get('/api/complaints');
      setItems(res.data);
    } catch (e){
      setMsg('Please login as admin to view complaints');
    }
  };
  useEffect(()=>{ load(); }, []);

  const mark = async (id, status)=>{
    try {
      await api.put('/api/complaints/'+id, { status });
      setItems(items.map(it=> it._id===id?{...it, status}:it));
    } catch (e){ setMsg('Action failed') }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {msg && <div className="muted">{msg}</div>}
      <div className="card">
        <table className="complaints-table">
          <thead><tr><th>Day</th><th>Meal</th><th>Name</th><th>Roll</th><th>Complaint</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(it=> <tr key={it._id}>
              <td>{it.day}</td>
              <td>{it.meal}</td>
              <td>{it.name||'-'}</td>
              <td>{it.rollNo||'-'}</td>
              <td style={{maxWidth:300}}>{it.complaint}</td>
              <td>{it.status}</td>
              <td>
                <button className="mini" onClick={()=>mark(it._id,'Resolved')}>Resolve</button>
                <button className="mini" onClick={()=>mark(it._1d,'Pending')}>Pending</button>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
