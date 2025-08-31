import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const nav = useNavigate();

  const submit = async(e)=>{
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      setMsg('Logged in ✔');
      setTimeout(()=>nav('/dashboard'), 700);
    } catch (err){
      setMsg('Login failed');
    }
  };

  return (
    <div className="card center">
      <h2>Admin Login</h2>
      <form onSubmit={submit} style={{width:320}}>
        <label className="input">Username</label>
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="admin" required/>
        <label className="input">Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="admin123" required/>
        <button className="btn" type="submit">Login</button>
        {msg && <div className="muted" style={{marginTop:10}}>{msg}</div>}
      </form>
    </div>
  );
}
