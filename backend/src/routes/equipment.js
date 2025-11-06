import express from 'express';
import Joi from 'joi';
import Equipment from '../models/Equipment.js';
import Request from '../models/Request.js';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/role.js';
import { computeAvailableQuantity } from '../utils/availability.js';

const router = express.Router();

const equipmentSchema = Joi.object({
  name: Joi.string().min(2).required(),
  category: Joi.string().required(),
  condition: Joi.string().default('good'),
  quantity: Joi.number().integer().min(0).required(),
  description: Joi.string().allow(''),
});


router.get('/', auth, async (req, res, next) => {
  try {
    const { q, category, availableOnly, startDate, endDate } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: new RegExp(q, 'i') };
    if (category) filter.category = category;
    const items = await Equipment.find(filter).sort({ createdAt: -1 }).lean();
    // optional availability preview if dates provided
    if (availableOnly === 'true' && startDate && endDate) {
      const filtered = [];
      for (const it of items) {
        const { available } = await computeAvailableQuantity(it._id, it.quantity, startDate, endDate);
        if (available > 0) filtered.push({ ...it, available });
      }
      return res.json(filtered);
    }
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const payload = await equipmentSchema.validateAsync(req.body);
    const created = await Equipment.create(payload);
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.put('/:id', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const payload = await equipmentSchema.validateAsync(req.body);
    const updated = await Equipment.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const active = await Request.countDocuments({ item: req.params.id, status: { $in: ['requested','approved','issued'] } });
    if (active > 0) return res.status(400).json({ error: 'Cannot delete: equipment has active requests' });
    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;


router.get('/:id', auth, async (req, res, next) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { next(err); }
});
