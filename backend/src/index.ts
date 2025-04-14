import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import groupRoutes from './routes/groupRoutes';
import panelRoutes from './routes/panelRoutes';
import applicationStatusRoutes from './routes/applicationStatusRoutes';
import adminRoutes from './routes/adminRoutes';

// Initialize environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/panels', panelRoutes);
app.use('/api/application-status', applicationStatusRoutes);
app.use('/api/admin', adminRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Dashboard API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
