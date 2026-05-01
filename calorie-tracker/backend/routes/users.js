import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Log from '../models/Log.js';

const router = express.Router();

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update daily goal
router.put('/goal', auth, async (req, res) => {
  const { dailyGoal } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { dailyGoal },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get streak (consecutive days with logs)
router.get('/streak', auth, async (req, res) => {
  try {
    const dates = await Log.aggregate([
      { $match: { userId: req.user.userId } },
      { $group: { _id: '$date' } },
      { $sort: { _id: -1 } }
    ]);
    const uniqueDates = dates.map(d => d._id).sort();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date(today);
    for (let i = 0; i < 100; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) streak++;
      else break;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    res.json({ streak });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;