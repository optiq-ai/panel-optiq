import express from 'express';
import { 
  getAllApplicationStatuses, 
  getApplicationStatusById, 
  createApplicationStatus, 
  updateApplicationStatus, 
  deleteApplicationStatus 
} from '../controllers/applicationStatusController';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authenticateToken);
router.use(isAdmin);

// Get all application statuses
router.get('/', getAllApplicationStatuses);

// Get application status by ID
router.get('/:id', getApplicationStatusById);

// Create application status
router.post('/', createApplicationStatus);

// Update application status
router.put('/:id', updateApplicationStatus);

// Delete application status
router.delete('/:id', deleteApplicationStatus);

export default router;
