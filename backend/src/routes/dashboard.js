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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 655a7d3f8d9e2a001e94f777
 *                   name:
 *                     type: string
 *                     example: DSLR Camera
 *                   category:
 *                     type: string
 *                     example: Media
 *                   condition:
 *                     type: string
 *                     example: Good
 *                   quantity:
 *                     type: integer
 *                     example: 4
 *                   description:
 *                     type: string
 *                     example: Canon EOS 90D kit
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-11-01T09:12:34.000Z
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-11-02T10:15:00.000Z
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.get('/equipment', auth, async (req, res, next) => {
    try {
        const { q, category } = req.query;
        const filter = {};
        if (q)
            filter.name = { $regex: new RegExp(q, 'i') };
        if (category)
            filter.category = category;
        const items = await Equipment.find(filter).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) { next(err); }
});

export default router;
