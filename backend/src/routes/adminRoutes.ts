import express from 'express';
import { 
  getAllApplicationStatuses, 
  checkAllApplicationStatuses,
  getDashboardStats,
  getSystemSettings,
  updateSystemSettings
} from '../controllers/adminController';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authenticateToken);
router.use(isAdmin);

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get system settings
router.get('/settings', getSystemSettings);

// Update system settings
router.put('/settings', updateSystemSettings);

// Check status of all applications
router.post('/check-status', checkAllApplicationStatuses);

export default router;
