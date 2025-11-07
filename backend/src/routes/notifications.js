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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 6572a9cfe55adf001edbb456
 *                   user:
 *                     type: string
 *                     example: 656b4cf27a1dcd1234567890
 *                   title:
 *                     type: string
 *                     example: Overdue equipment
 *                   message:
 *                     type: string
 *                     example: Your booking for "DSLR Camera" is overdue. Please return immediately.
 *                   read:
 *                     type: boolean
 *                     example: false
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-11-07T10:45:00.000Z
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-11-07T10:50:00.000Z
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
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.get('/', auth, async (req, res, next) => {
    try {
        const items = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        next(err);
    }
});

export default router;
