import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import './styles.css';

function App(){
  return (
    <BrowserRouter>
      <header className="topbar">
        <div className="brand">
          <div className="logo">🍽️</div>
          <div>
            <h1>VBH Mess Feedback</h1>
            <div className="tag">Report problems with today's food — fast & friendly</div>
          </div>
        </div>
        <nav className="navlinks">
          <Link to="/">Home</Link>
          <Link to="/login">Admin Login</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
        </Routes>
      </main>
      <footer className="footer">© VBH Mess — Built with care</footer>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(<App/>);
