const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  token_package_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'TokenPackages',
      key: 'id'
    }
  },
  order_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  payment_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR'
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  tokens_purchased: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cashfree_response: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('cashfree_response');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('cashfree_response', JSON.stringify(value));
    }
  },
  failure_reason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Payment;