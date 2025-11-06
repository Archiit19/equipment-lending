import express from 'express';
import auth from '../middleware/auth.js';
import Equipment from '../models/Equipment.js';

const router = express.Router();

router.get('/equipment', auth, async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: new RegExp(q, 'i') };
    if (category) filter.category = category;
    const items = await Equipment.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { next(err); }
});

export default router;
