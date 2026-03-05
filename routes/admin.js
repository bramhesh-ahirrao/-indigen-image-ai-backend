const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// Admin authentication
router.post('/auth/login', adminController.login);
router.get('/auth/me', adminAuth, adminController.getCurrentAdmin);

// API Keys management
router.get('/api-keys', adminAuth, adminController.getApiKeys);
router.post('/api-keys', adminAuth, adminController.createApiKey);
router.put('/api-keys/:id', adminAuth, adminController.updateApiKey);
router.delete('/api-keys/:id', adminAuth, adminController.deleteApiKey);

// Token Packages management
router.get('/token-packages', adminAuth, adminController.getTokenPackages);
router.post('/token-packages', adminAuth, adminController.createTokenPackage);
router.put('/token-packages/:id', adminAuth, adminController.updateTokenPackage);
router.delete('/token-packages/:id', adminAuth, adminController.deleteTokenPackage);

// User management
router.get('/users', adminAuth, adminController.getUsers);
router.get('/users/:id', adminAuth, adminController.getUser);
router.put('/users/:id', adminAuth, adminController.updateUser);
router.delete('/users/:id', adminAuth, adminController.deleteUser);

// Payment management
router.get('/payments', adminAuth, adminController.getPayments);
router.get('/payments/:id', adminAuth, adminController.getPayment);

// System settings
router.get('/settings', adminAuth, adminController.getSettings);
router.put('/settings', adminAuth, adminController.updateSettings);

// Analytics
router.get('/analytics', adminAuth, adminController.getAnalytics);
router.get('/analytics/dashboard', adminAuth, adminController.getDashboardStats);

module.exports = router;