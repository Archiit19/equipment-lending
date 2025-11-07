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
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (user not admin)
 */
router.get('/', auth, requireRole('admin'), async (req, res, next) => {
    try {
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) { next(err); }
});

export default router;
