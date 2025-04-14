import express from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user profile (protected route)
router.get('/profile', authenticateToken, getProfile);

export default router;
