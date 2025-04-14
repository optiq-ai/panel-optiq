import express from 'express';
import { 
  getAllGroups, 
  getGroupById, 
  createGroup, 
  updateGroup, 
  deleteGroup,
  addUserToGroup,
  removeUserFromGroup
} from '../controllers/groupController';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all groups (all authenticated users)
router.get('/', getAllGroups);

// Get group by ID (all authenticated users)
router.get('/:id', getGroupById);

// Create group (admin only)
router.post('/', isAdmin, createGroup);

// Update group (admin only)
router.put('/:id', isAdmin, updateGroup);

// Delete group (admin only)
router.delete('/:id', isAdmin, deleteGroup);

// Add user to group (admin only)
router.post('/user', isAdmin, addUserToGroup);

// Remove user from group (admin only)
router.delete('/user/:userId/:groupId', isAdmin, removeUserFromGroup);

export default router;
