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

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Manage equipment borrowing requests
 */

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Create a new equipment request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: ID of the equipment item
 *               quantity:
 *                 type: number
 *                 description: Quantity requested
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of borrowing
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of borrowing
 *     responses:
 *       201:
 *         description: Request created successfully
 *       400:
 *         description: Validation error or unavailable quantity
 *       404:
 *         description: Equipment not found
 */
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

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: Get requests for current user or all (admin/staff)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *         description: If true, fetch all requests (admin/staff only)
 *     responses:
 *       200:
 *         description: List of requests retrieved successfully
 */
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

/**
 * @swagger
 * /api/requests/{id}/approve:
 *   patch:
 *     summary: Approve a request (Staff/Admin)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID to approve
 *     responses:
 *       200:
 *         description: Request approved successfully
 *       400:
 *         description: Invalid state transition
 *       404:
 *         description: Request not found
 */
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

/**
 * @swagger
 * /api/requests/{id}/reject:
 *   patch:
 *     summary: Reject a request (Staff/Admin)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID to reject
 *     responses:
 *       200:
 *         description: Request rejected successfully
 *       400:
 *         description: Invalid request state
 *       404:
 *         description: Request not found
 */
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

/**
 * @swagger
 * /api/requests/{id}/issue:
 *   patch:
 *     summary: Mark a request as issued
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID to issue
 *     responses:
 *       200:
 *         description: Request marked as issued
 *       400:
 *         description: Only approved requests can be issued
 *       404:
 *         description: Request not found
 */
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

/**
 * @swagger
 * /api/requests/{id}/return:
 *   patch:
 *     summary: Mark a request as returned
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID to mark as returned
 *     responses:
 *       200:
 *         description: Request marked as returned successfully
 *       400:
 *         description: Invalid request status
 *       404:
 *         description: Request not found
 */
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
