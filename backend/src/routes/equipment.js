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

/**
 * @swagger
 * tags:
 *   name: Equipment
 *   description: Manage school equipment (CRUD)
 */

/**
 * @swagger
 * /api/equipment:
 *   get:
 *     summary: Get all equipment items
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search equipment by name
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: availableOnly
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter to show only available items within date range
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for availability check
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for availability check
 *     responses:
 *       200:
 *         description: List of equipment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 656b4cf27a1dcd1234567890
 *                   name:
 *                     type: string
 *                     example: Microscope
 *                   category:
 *                     type: string
 *                     example: Lab
 *                   condition:
 *                     type: string
 *                     example: Good
 *                   quantity:
 *                     type: integer
 *                     example: 10
 *                   description:
 *                     type: string
 *                     example: Optical microscope with 100x zoom
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 */
router.get('/', auth, async (req, res, next) => {
    try {
        const { q, category, availableOnly, startDate, endDate } = req.query;
        const filter = {};
        if (q) filter.name = { $regex: new RegExp(q, 'i') };
        if (category) filter.category = category;
        const items = await Equipment.find(filter).sort({ createdAt: -1 }).lean();
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

/**
 * @swagger
 * /api/equipment:
 *   post:
 *     summary: Add new equipment (Admin only)
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - quantity
 *             properties:
 *               name:
 *                 type: string
 *                 example: Basketball Kit
 *               category:
 *                 type: string
 *                 example: Sports
 *               condition:
 *                 type: string
 *                 example: Fair
 *               quantity:
 *                 type: number
 *                 example: 6
 *               description:
 *                 type: string
 *                 example: Includes ball and jersey
 *     responses:
 *       201:
 *         description: Equipment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 6571d9bfe55adf001edbb123
 *                 name:
 *                   type: string
 *                   example: Basketball Kit
 *                 category:
 *                   type: string
 *                   example: Sports
 *                 condition:
 *                   type: string
 *                   example: Fair
 *                 quantity:
 *                   type: integer
 *                   example: 6
 *                 description:
 *                   type: string
 *                   example: Includes ball and jersey
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, requireRole('admin'), async (req, res, next) => {
    try {
        const payload = await equipmentSchema.validateAsync(req.body);
        const created = await Equipment.create(payload);
        res.status(201).json(created);
    } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/equipment/{id}:
 *   get:
 *     summary: Get equipment details by ID
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Equipment ID
 *     responses:
 *       200:
 *         description: Equipment details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 656b4cf27a1dcd1234567890
 *                 name:
 *                   type: string
 *                   example: Microscope
 *                 category:
 *                   type: string
 *                   example: Lab
 *                 condition:
 *                   type: string
 *                   example: Good
 *                 quantity:
 *                   type: integer
 *                   example: 10
 *                 description:
 *                   type: string
 *                   example: Optical microscope with 100x zoom
 *       404:
 *         description: Equipment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Not found
 */
router.get('/:id', auth, async (req, res, next) => {
    try {
        const item = await Equipment.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json(item);
    } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/equipment/{id}:
 *   put:
 *     summary: Update equipment details (Admin only)
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Equipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               condition:
 *                 type: string
 *               quantity:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Equipment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 656b4cf27a1dcd1234567890
 *                 name:
 *                   type: string
 *                   example: Microscope
 *                 category:
 *                   type: string
 *                   example: Lab
 *                 quantity:
 *                   type: integer
 *                   example: 10
 *                 condition:
 *                   type: string
 *                   example: Excellent
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Equipment not found
 */
router.put('/:id', auth, requireRole('admin'), async (req, res, next) => {
    try {
        const payload = await equipmentSchema.validateAsync(req.body);
        const updated = await Equipment.findByIdAndUpdate(req.params.id, payload, { new: true });
        res.json(updated);
    } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/equipment/{id}:
 *   delete:
 *     summary: Delete equipment (Admin only)
 *     tags: [Equipment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Equipment ID
 *     responses:
 *       200:
 *         description: Equipment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Cannot delete item with active requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Cannot delete: equipment has active requests
 *       404:
 *         description: Equipment not found
 */
router.delete('/:id', auth, requireRole('admin'), async (req, res, next) => {
    try {
        const active = await Request.countDocuments({
            item: req.params.id,
            status: { $in: ['requested','approved','issued']
            }
        });
        if (active > 0)
            return res.status(400).json({ error: 'Cannot delete: equipment has active requests' });
        await Equipment.findByIdAndDelete(req.params.id);
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
});

export default router;
