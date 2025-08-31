const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ msg: 'username & password required' });
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ msg: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ admin: { id: admin._id, username } }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '1d' });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
