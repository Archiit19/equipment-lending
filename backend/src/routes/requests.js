import express from 'express';
import Joi from 'joi';
import dayjs from 'dayjs';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/role.js';
import Equipment from '../models/Equipment.js';
import Request from '../models/Request.js';
import { computeAvailableQuantity } from '../utils/availability.js';

const router = express.Router();

const createSchema = Joi.object({
  itemId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
});

router.post('/', auth, async (req, res, next) => {
  try {
    const { itemId, quantity, startDate, endDate } = await createSchema.validateAsync(req.body);
    if (dayjs(endDate).isBefore(dayjs(startDate))) return res.status(400).json({ error: 'endDate must be after startDate' });
    const item = await Equipment.findById(itemId);
    if (!item) return res.status(404).json({ error: 'Equipment not found' });
    const { available } = await computeAvailableQuantity(item._id, item.quantity, startDate, endDate);
    if (quantity > available) return res.status(400).json({ error: `Only ${available} available for selected period` });
    const created = await Request.create({
      item: item._id,
      requester: req.user.id,
      quantity,
      startDate,
      endDate,
      status: 'requested',
    });
    res.status(201).json(created);
  } catch (err) { next(err); }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const { all } = req.query;
    const filter = {};
    if (all === 'true' && (req.user.role === 'staff' || req.user.role === 'admin')) {
      // all requests
    } else {
      filter.requester = req.user.id;
    }
    const list = await Request.find(filter)
      .populate('item', 'name category')
      .populate('requester', 'name email')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { next(err); }
});

router.patch('/:id/approve', auth, requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const r = await Request.findById(req.params.id).populate('item');
    if (!r) return res.status(404).json({ error: 'Request not found' });
    if (r.status !== 'requested') return res.status(400).json({ error: 'Only requested can be approved' });
    const { available } = await computeAvailableQuantity(r.item._id, r.item.quantity, r.startDate, r.endDate);
    if (r.quantity > available) return res.status(400).json({ error: `Only ${available} available for selected period` });
    r.status = 'approved';
    r.decisionMaker = req.user.id;
    await r.save();
    res.json(r);
  } catch (err) { next(err); }
});

router.patch('/:id/reject', auth, requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const r = await Request.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Request not found' });
    if (!['requested','approved'].includes(r.status)) return res.status(400).json({ error: 'Only requested/approved can be rejected' });
    r.status = 'rejected';
    r.decisionMaker = req.user.id;
    await r.save();
    res.json(r);
  } catch (err) { next(err); }
});

router.patch('/:id/issue', auth, requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const r = await Request.findById(req.params.id).populate('item');
    if (!r) return res.status(404).json({ error: 'Request not found' });
    if (!['approved'].includes(r.status)) return res.status(400).json({ error: 'Only approved can be issued' });
    r.status = 'issued';
    r.issuedAt = new Date();
    r.decisionMaker = req.user.id;
    await r.save();
    res.json(r);
  } catch (err) { next(err); }
});

router.patch('/:id/return', auth, requireRole('staff', 'admin'), async (req, res, next) => {
  try {
    const r = await Request.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Request not found' });
    if (!['issued', 'overdue'].includes(r.status)) return res.status(400).json({ error: 'Only issued/overdue can be returned' });
    r.status = 'returned';
    r.returnedAt = new Date();
    r.decisionMaker = req.user.id;
    await r.save();
    res.json(r);
  } catch (err) { next(err); }
});

export default router;
