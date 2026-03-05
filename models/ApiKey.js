const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApiKey = sequelize.define('ApiKey', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    service_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    key_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    key_value: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'ApiKeys',
    timestamps: true,
});

module.exports = ApiKey;
