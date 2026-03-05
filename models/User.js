const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  tokens_available: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  tokens_used: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  tokens_total_purchased: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  subscription_plan: {
    type: DataTypes.ENUM('free', 'basic', 'pro', 'enterprise'),
    defaultValue: 'free'
  },
  subscription_status: {
    type: DataTypes.ENUM('active', 'inactive', 'cancelled', 'expired'),
    defaultValue: 'active'
  },
  subscription_start_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  subscription_end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  auto_renew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

// Hash password before saving
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.addTokens = async function(amount) {
  this.tokens_available += amount;
  this.tokens_total_purchased += amount;
  await this.save();
  return this;
};

User.prototype.useTokens = async function(amount, type, metadata = {}) {
  if (this.tokens_available < amount) {
    throw new Error('Insufficient tokens');
  }
  
  this.tokens_available -= amount;
  this.tokens_used += amount;
  await this.save();
  
  // Create token usage record
  await TokenUsage.create({
    user_id: this.id,
    type,
    tokens_used: amount,
    metadata: JSON.stringify(metadata)
  });
  
  return this;
};

User.prototype.hasEnoughTokens = function(amount) {
  return this.tokens_available >= amount;
};

module.exports = User;