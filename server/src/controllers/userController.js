import {
  getAllUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById,
} from '../models.js';

/**
 * Get all users (admin only)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function getUsers(req, res, next) {
  try {
    const users = await getAllUsers();

    const formattedUsers = users.map((user) => ({
      id: user.nid,
      username: user.struser,
      name: user.strname,
      email: user.stremail,
      tel: user.strtel,
      company: user.strcompany,
      address: user.straddress,
      role: user.role || 'user',
      limitCar: user.nlimitcar,
      createdAt: user.created_at,
    }));

    res.json(formattedUsers);
  } catch (error) {
    next(error);
  }
}

/**
 * Get user by ID
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function getUser(req, res, next) {
  try {
    const { id } = req.params;

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.nid,
      username: user.struser,
      name: user.strname,
      email: user.stremail,
      tel: user.strtel,
      company: user.strcompany,
      address: user.straddress,
      role: user.role || 'user',
      limitCar: user.nlimitcar,
      createdAt: user.created_at,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new user (admin only)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function addUser(req, res, next) {
  try {
    const userData = {
      strUser: req.body.username,
      strPassword: req.body.password,
      strName: req.body.name,
      strEmail: req.body.email,
      strTel: req.body.tel,
      strCompany: req.body.company,
      strAddress: req.body.address,
      role: req.body.role || 'user',
      nLimitCar: req.body.limitCar || 100,
    };

    if (!userData.strUser || !userData.strPassword) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await createUser(userData);

    res.status(201).json({
      id: user.nid,
      username: user.struser,
      name: user.strname,
      message: 'User created successfully',
    });
  } catch (error) {
    if (error.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    next(error);
  }
}

/**
 * Update user (admin only)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;

    const userData = {
      strName: req.body.name,
      strEmail: req.body.email,
      strTel: req.body.tel,
      strCompany: req.body.company,
      strAddress: req.body.address,
      role: req.body.role,
      nLimitCar: req.body.limitCar,
    };

    const user = await updateUserById(id, userData);

    res.json({
      id: user.nid,
      username: user.struser,
      name: user.strname,
      email: user.stremail,
      role: user.role,
      message: 'User updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete user (admin only)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    // Don't allow deleting self
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await deleteUserById(id);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
