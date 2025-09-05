const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const Admin = require('./models/Admin');

dotenv.config();

const app = express();

// CORS — allow your Vercel site (and local dev)
app.use(cors({
  origin: ['https://mess-feedback-pro.vercel.app', 'http://localhost:5173'],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// rate limit (tune if you test a lot)
const limiter = rateLimit({ windowMs: 60 * 1000, max: 20 });
app.use(limiter);

// ✅ Keep routes simple; captcha is handled inside complaints.js
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/auth', require('./routes/auth'));

app.get('/', (_req, res) => res.json({ status: 'ok', service: 'mess-feedback-backend' }));

const { MONGO_URI = 'mongodb://127.0.0.1:27017/messFeedback', PORT = 5000 } = process.env;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');

    // default admin
    const username = process.env.DEFAULT_ADMIN_USERNAME || 'HARSHIT';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'MANJUd12345@@';
    const existing = await Admin.findOne({ username });
    if (!existing) {
      const hashed = await bcrypt.hash(password, 10);
      await Admin.create({ username, password: hashed });
      console.log('Default admin created ->', username);
    } else {
      console.log('Default admin exists ->', username);
    }

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });
