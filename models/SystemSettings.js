const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemSettings = sequelize.define('SystemSettings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    setting_key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    setting_value: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'SystemSettings',
    timestamps: true,
});

module.exports = SystemSettings;
