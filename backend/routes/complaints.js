const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const auth = require('../middleware/auth');

// submit public
router.post('/', async (req, res) => {
  try {
    const { day, meal, name, rollNo, complaint } = req.body;
    if (!day || !meal || !complaint) return res.status(400).json({ msg: 'Missing required fields' });
    const doc = await Complaint.create({ day, meal, name, rollNo, complaint });
    res.status(201).json({ msg: 'Complaint created', id: doc._id });
  } catch (e) {
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
