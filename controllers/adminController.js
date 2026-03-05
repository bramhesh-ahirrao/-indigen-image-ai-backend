const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin, SystemSettings, ApiKey, User, Payment, TokenPackage, TokenUsage } = require('../models');
const { Op } = require('sequelize');

// Generate JWT token for admin
const generateAdminToken = (adminId) => {
  return jwt.sign({ id: adminId }, process.env.ADMIN_JWT_SECRET || 'admin-secret-key', {
    expiresIn: process.env.ADMIN_JWT_EXPIRE || '24h'
  });
};

// Admin login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await admin.update({ last_login: new Date() });

    const token = generateAdminToken(admin.id);
    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current admin
const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin.id, {
      attributes: ['id', 'username', 'email', 'role', 'last_login', 'created_at']
    });
    res.json({ admin });
  } catch (error) {
    console.error('Get current admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// API Keys management
const getApiKeys = async (req, res) => {
  try {
    const apiKeys = await ApiKey.findAll({
      order: [['service_name', 'ASC'], ['key_name', 'ASC']]
    });
    res.json({ apiKeys });
  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createApiKey = async (req, res) => {
  try {
    const { service_name, key_name, key_value, description, is_active } = req.body;

    const apiKey = await ApiKey.create({
      service_name,
      key_name,
      key_value,
      description,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({ apiKey });
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_name, key_name, key_value, description, is_active } = req.body;

    const apiKey = await ApiKey.findByPk(id);
    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    await apiKey.update({
      service_name,
      key_name,
      key_value,
      description,
      is_active
    });

    res.json({ apiKey });
  } catch (error) {
    console.error('Update API key error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = await ApiKey.findByPk(id);

    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    await apiKey.destroy();
    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Token Packages management
const getTokenPackages = async (req, res) => {
  try {
    const packages = await TokenPackage.findAll({
      order: [['price_amount', 'ASC']]
    });
    res.json({ packages });
  } catch (error) {
    console.error('Get token packages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createTokenPackage = async (req, res) => {
  try {
    const { name, tokens, price_amount, price_currency, type, description, is_active } = req.body;

    const tokenPackage = await TokenPackage.create({
      name,
      tokens,
      price_amount,
      price_currency: price_currency || 'INR',
      type,
      description,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({ package: tokenPackage });
  } catch (error) {
    console.error('Create token package error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTokenPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, tokens, price_amount, price_currency, type, description, is_active } = req.body;

    const tokenPackage = await TokenPackage.findByPk(id);
    if (!tokenPackage) {
      return res.status(404).json({ message: 'Token package not found' });
    }

    await tokenPackage.update({
      name,
      tokens,
      price_amount,
      price_currency,
      type,
      description,
      is_active
    });

    res.json({ package: tokenPackage });
  } catch (error) {
    console.error('Update token package error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteTokenPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const tokenPackage = await TokenPackage.findByPk(id);

    if (!tokenPackage) {
      return res.status(404).json({ message: 'Token package not found' });
    }

    await tokenPackage.destroy();
    res.json({ message: 'Token package deleted successfully' });
  } catch (error) {
    console.error('Delete token package error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// User management
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = search ? {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    const users = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        { model: Payment, as: 'payments', attributes: ['id', 'amount', 'status', 'created_at'] },
        { model: TokenUsage, as: 'tokenUsages', attributes: ['id', 'tokens_used', 'created_at'] }
      ]
    });

    res.json({
      users: users.rows,
      pagination: {
        total: users.count,
        page: parseInt(page),
        pages: Math.ceil(users.count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      include: [
        { model: Payment, as: 'payments' },
        { model: TokenUsage, as: 'tokenUsages' }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, tokens_available, subscription_plan } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      name,
      email,
      tokens_available,
      subscription_plan
    });

    res.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Payment management
const getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const payments = await Payment.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: TokenPackage, as: 'tokenPackage', attributes: ['id', 'name', 'tokens'] }
      ]
    });

    res.json({
      payments: payments.rows,
      pagination: {
        total: payments.count,
        page: parseInt(page),
        pages: Math.ceil(payments.count / limit)
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id, {
      include: [
        { model: User, as: 'user' },
        { model: TokenPackage, as: 'tokenPackage' }
      ]
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// System settings
const getSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findAll({
      order: [['setting_key', 'ASC']]
    });
    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await SystemSettings.update(
        { setting_value: value },
        { where: { setting_key: key } }
      );
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Analytics
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalRevenue = await Payment.sum('amount', { where: { status: 'completed' } });
    const activeSubscriptions = await User.count({ where: { subscription_plan: { [Op.ne]: 'free' } } });
    const totalTokensUsed = await TokenUsage.sum('tokens_used');

    const recentPayments = await Payment.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
    });

    res.json({
      totalUsers,
      totalRevenue: totalRevenue || 0,
      activeSubscriptions,
      totalTokensUsed: totalTokensUsed || 0,
      recentPayments
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayUsers = await User.count({
      where: { created_at: { [Op.gte]: today } }
    });

    const todayRevenue = await Payment.sum('amount', {
      where: {
        status: 'completed',
        created_at: { [Op.gte]: today }
      }
    });

    const todayTokens = await TokenUsage.sum('tokens_used', {
      where: { created_at: { [Op.gte]: today } }
    });

    res.json({
      todayUsers,
      todayRevenue: todayRevenue || 0,
      todayTokens: todayTokens || 0
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  login,
  getCurrentAdmin,
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  getTokenPackages,
  createTokenPackage,
  updateTokenPackage,
  deleteTokenPackage,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getPayments,
  getPayment,
  getSettings,
  updateSettings,
  getAnalytics,
  getDashboardStats
};