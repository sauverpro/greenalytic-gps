import express from 'express';
import { login, getCurrentUser } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', asyncHandler(login));

// GET /api/auth/me
router.get('/me', authenticateToken, asyncHandler(getCurrentUser));

export default router;
