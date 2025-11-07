import express from 'express';
import auth from '../middleware/auth.js';
import Equipment from '../models/Equipment.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Fetch equipment data for dashboard and filtering
 */

/**
 * @swagger
 * /api/dashboard/equipment:
 *   get:
 *     summary: Get all equipment items (dashboard view)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword for equipment name
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter equipment by category
 *     responses:
 *       200:
 *         description: List of equipment fetched successfully
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
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
