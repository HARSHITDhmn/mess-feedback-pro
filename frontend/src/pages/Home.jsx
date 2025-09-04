import React, { useState } from 'react';
import api from '../utils/api';
import menu from '../menu.json';

const days = Object.keys(menu);

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={'toast ' + (type || '')}>{msg}</div>;
}

export default function Home() {
  const [selected, setSelected] = useState(days[0]);
  const [form, setForm] = useState({ name: '', rollNo: '', complaint: '' });
  const [meal, setMeal] = useState('Breakfast');
  const [toast, setToast] = useState(null);

  const submit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Get reCAPTCHA response (from v2 checkbox)
      const token = window.grecaptcha.getResponse();

      if (!token) {
        setToast({ msg: '⚠️ Please complete the reCAPTCHA', type: 'error' });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      // ✅ Send form + token to backend
      await api.post('/api/complaints', {
        day: selected,
        meal,
        ...form,
        token, // 👈 backend will validate this
      });

      setToast({ msg: '✅ Complaint submitted', type: 'success' });
      setForm({ name: '', rollNo: '', complaint: '' });

      // Reset captcha after successful submission
      if (window.grecaptcha) {
        window.grecaptcha.reset();
      }
    } catch (err) {
      setToast({ msg: '❌ Failed to submit. Try again.', type: 'error' });
    }

    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="grid">
      <div className="card">
        <h2>Weekly Menu</h2>
        <div className="menu-day">
          {days.map((d) => (
            <button
              key={d}
              className={'day-btn ' + (d === selected ? 'active' : '')}
              onClick={() => setSelected(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="card small">
          <h3>{selected}</h3>
          <p className="muted">Select a meal below to report an issue</p>
          <div className="meal-list">
            {Object.entries(menu[selected]).map(([m, desc]) => (
              <div
                key={m}
                className={'meal-card ' + (meal === m ? 'sel' : '')}
                onClick={() => setMeal(m)}
              >
                <div className="meal-title">{m}</div>
                <div className="meal-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Report an Issue</h3>
        <p className="muted">
          Day: <strong>{selected}</strong> • Meal: <strong>{meal}</strong>
        </p>
        <form onSubmit={submit}>
          <label className="input">Your name</label>
          <input
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name (optional)"
          />
          <label className="input">Roll No</label>
          <input
            name="rollNo"
            value={form.rollNo}
            onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
            placeholder="Roll no (optional)"
          />
          <label className="input">Describe the issue</label>
          <textarea
            name="complaint"
            value={form.complaint}
            onChange={(e) => setForm({ ...form, complaint: e.target.value })}
            placeholder="What was wrong with the dish?"
            required
          />

          {/* ✅ reCAPTCHA v2 widget */}
          <div
            className="g-recaptcha"
            data-sitekey="6LfZN74rAAAAAJiRRNdmYRgPka5u-mnlxfjKwwYB" // 🔹 your site key here
            style={{ margin: '1rem 0' }}
          ></div>

          <button className="btn" type="submit">
            Submit complaint
          </button>
        </form>
        <Toast msg={toast && toast.msg} type={toast && toast.type} />
      </div>
    </div>
  );
}
