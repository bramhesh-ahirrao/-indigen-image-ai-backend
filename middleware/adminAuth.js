const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'admin-secret-key');
    const admin = await Admin.findByPk(decoded.id);
    
    if (!admin || !admin.is_active) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = adminAuth;