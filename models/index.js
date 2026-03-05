const User = require('./User');
const TokenPackage = require('./TokenPackage');
const Payment = require('./Payment');
const TokenUsage = require('./TokenUsage');
const Admin = require('./Admin');
const SystemSettings = require('./SystemSettings');
const ApiKey = require('./ApiKey');

// Define associations
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(TokenUsage, { foreignKey: 'user_id', as: 'tokenUsages' });
TokenUsage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

TokenPackage.hasMany(Payment, { foreignKey: 'token_package_id', as: 'payments' });
Payment.belongsTo(TokenPackage, { foreignKey: 'token_package_id', as: 'tokenPackage' });

module.exports = {
  User,
  TokenPackage,
  Payment,
  TokenUsage,
  Admin,
  SystemSettings,
  ApiKey
};