const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TokenPackage = sequelize.define('TokenPackage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tokens: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  price_currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR'
  },
  type: {
    type: DataTypes.ENUM('one_time', 'subscription', 'bonus'),
    defaultValue: 'one_time'
  },
  duration: {
    type: DataTypes.INTEGER, // in days, for subscription packages
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  features: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('features');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('features', JSON.stringify(value));
    }
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = TokenPackage;