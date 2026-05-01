import express from 'express';
import auth from '../middleware/auth.js';
import Log from '../models/Log.js';

const router = express.Router();

// Get logs for a specific date
router.get('/', auth, async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Date required' });
  try {
    const logs = await Log.find({ userId: req.user.userId, date });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a log
router.post('/', auth, async (req, res) => {
  const { meal, name, quantity, calories, date } = req.body;
  try {
    const log = new Log({
      userId: req.user.userId,
      meal,
      name,
      quantity,
      calories,
      date
    });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a log
router.delete('/:id', auth, async (req, res) => {
  try {
    const log = await Log.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!log) return res.status(404).json({ message: 'Log not found' });
    await log.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Weekly summary (last 7 days)
router.get('/weekly-summary', auth, async (req, res) => {
  try {
    const today = new Date();
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      last7.push(d.toISOString().split('T')[0]);
    }
    const logs = await Log.find({ userId: req.user.userId, date: { $in: last7 } });
    const summary = last7.map(date => ({
      date,
      totalCalories: logs.filter(l => l.date === date).reduce((sum, l) => sum + l.calories, 0)
    }));
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;