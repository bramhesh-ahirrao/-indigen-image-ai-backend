const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TokenUsage = sequelize.define('TokenUsage', {
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
  type: {
    type: DataTypes.ENUM('image_generation', 'video_generation', 'text_generation'),
    allowNull: false
  },
  tokens_used: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  metadata: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('metadata');
      return rawValue ? JSON.parse(rawValue) : {};
    },
    set(value) {
      this.setDataValue('metadata', JSON.stringify(value));
    }
  }
});

module.exports = TokenUsage;