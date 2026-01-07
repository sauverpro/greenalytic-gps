import express from 'express';
import {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// All user management routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/users - Get all users
router.get('/', asyncHandler(getUsers));

// GET /api/users/:id - Get user by ID
router.get('/:id', asyncHandler(getUser));

// POST /api/users - Create new user
router.post('/', asyncHandler(addUser));

// PUT /api/users/:id - Update user
router.put('/:id', asyncHandler(updateUser));

// DELETE /api/users/:id - Delete user
router.delete('/:id', asyncHandler(deleteUser));

export default router;
