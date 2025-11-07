import express from 'express';
import auth from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Retrieve user notifications such as overdue alerts and status updates
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications for the logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications retrieved successfully
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
router.get('/', auth, async (req, res, next) => {
    try {
        const items = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) { next(err); }
});

export default router;
