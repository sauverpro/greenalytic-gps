import jwt from 'jsonwebtoken';
import { authenticateUser, getUserByUsername } from '../models.js';

/**
 * Handle user login
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await authenticateUser(username, password);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.struser, role: user.role || 'user' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.struser,
        name: user.strname,
        email: user.stremail,
        company: user.strcompany,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user info
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function getCurrentUser(req, res, next) {
  try {
    const user = await getUserByUsername(req.user.username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.struser,
      name: user.strname,
      email: user.stremail,
      company: user.strcompany,
      tel: user.strtel,
      address: user.straddress,
      limitCar: user.nlimitcar,
      limitSubUser: user.nlimitsubuser,
    });
  } catch (error) {
    next(error);
  }
}
