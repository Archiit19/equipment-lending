import express from 'express';
import auth from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const items = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { next(err); }
});

export default router;
