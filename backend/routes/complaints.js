const express = require('express');
const router = express.Router();
const axios = require('axios');
const Complaint = require('../models/Complaint');
const auth = require('../middleware/auth');

// submit public
router.post('/', async (req, res) => {
  try {
    const { day, meal, name, rollNo, complaint, token, 'g-recaptcha-response': gToken } = req.body;
    const captchaToken = token || gToken;

    if (!day || !meal || !complaint) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    if (!captchaToken) {
      return res.status(400).json({ msg: 'Captcha token missing' });
    }

    // Verify captcha with Google
    const secret = process.env.RECAPTCHA_SECRET;
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${captchaToken}`;

    const response = await axios.post(verifyURL);
    if (!response.data.success) {
      return res.status(400).json({ msg: 'Captcha verification failed' });
    }

    // Save complaint in DB
    const doc = await Complaint.create({ day, meal, name, rollNo, complaint });
    res.status(201).json({ msg: 'Complaint created', id: doc._id });

  } catch (e) {
    console.error('Complaint route error:', e.message);
    res.status(500).json({ msg: e.message });
  }
});

// list all - admin only
router.get('/', auth, async (req, res) => {
  try {
    const items = await Complaint.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

// update status
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ msg: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
