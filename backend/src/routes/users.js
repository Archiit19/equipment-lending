import express from 'express';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/role.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
});

export default router;
