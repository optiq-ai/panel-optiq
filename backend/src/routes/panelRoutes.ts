import express from 'express';
import { 
  getAllPanels, 
  getPanelById, 
  getPanelsForUser,
  createPanel, 
  updatePanel, 
  deletePanel,
  getPanelGroups,
  updatePanelSettings
} from '../controllers/panelController';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get panels for current user
router.get('/user', getPanelsForUser);

// Get all panels (admin only)
router.get('/', isAdmin, getAllPanels);

// Get panel by ID (admin only)
router.get('/:id', isAdmin, getPanelById);

// Create panel (admin only)
router.post('/', isAdmin, createPanel);

// Update panel (admin only)
router.put('/:id', isAdmin, updatePanel);

// Delete panel (admin only)
router.delete('/:id', isAdmin, deletePanel);

// Get groups for a panel (admin only)
router.get('/:id/groups', isAdmin, getPanelGroups);

// Update panel settings (admin only)
router.put('/:id/settings', isAdmin, updatePanelSettings);

export default router;
