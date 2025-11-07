import express from 'express';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/role.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Admin operations for managing registered users
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get list of all registered users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users retrieved successfully
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
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     example: john@example.com
 *                   role:
 *                     type: string
 *                     example: staff
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-11-01T09:12:34.000Z
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-11-07T10:15:00.000Z
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
 *       403:
 *         description: Forbidden (user not admin)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Access denied. Admin privileges required.
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
router.get('/', auth, requireRole('admin'), async (req, res, next) => {
    try {
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) { next(err); }
});

export default router;
