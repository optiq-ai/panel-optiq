import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/userController';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all users (admin only)
router.get('/', isAdmin, getAllUsers);

// Get user by ID (admin or self)
router.get('/:id', (req, res, next) => {
  const userId = parseInt(req.params.id);
  const requestingUser = (req as any).user;
  
  // Allow if admin or requesting own profile
  if (requestingUser.groups.includes('prezes') || requestingUser.id === userId) {
    next();
  } else {
    res.status(403).json({ message: 'Brak uprawnień do tego zasobu' });
  }
}, getUserById);

// Create user (admin only)
router.post('/', isAdmin, createUser);

// Update user (admin or self)
router.put('/:id', (req, res, next) => {
  const userId = parseInt(req.params.id);
  const requestingUser = (req as any).user;
  
  // Allow if admin or updating own profile
  if (requestingUser.groups.includes('prezes') || requestingUser.id === userId) {
    next();
  } else {
    res.status(403).json({ message: 'Brak uprawnień do tego zasobu' });
  }
}, updateUser);

// Delete user (admin only)
router.delete('/:id', isAdmin, deleteUser);

export default router;
