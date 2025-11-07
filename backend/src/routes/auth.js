import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const registerSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('student', 'staff', 'admin').default('student'),
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user registration
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Pass@123
 *               role:
 *                 type: string
 *                 enum: [student, staff, admin]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already in use
 */
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password, role } = await registerSchema.validateAsync(req.body);
        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ error: 'Email already in use' });
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, passwordHash, role });
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, name, email, role } });
    } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Pass@123
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns current user's data
 *       401:
 *         description: Unauthorized (missing or invalid token)
 */
router.get('/me', auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        res.json(user);
    } catch (err) { next(err); }
});

export default router;
