import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import equipmentRoutes from './routes/equipment.js';
import requestRoutes from './routes/requests.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';
import errorHandler from './middleware/errorHandler.js';
import startOverdueJob from './jobs/overdueJob.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// DB
await connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Error handler
app.use(errorHandler);

// Cron Job (Overdue)
if ((process.env.CRON_ENABLED || 'true') === 'true') {
    startOverdueJob();
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
