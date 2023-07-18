const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the veganUser model
const veganUser = sequelize.define('vegan_user', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey:true,
        autoIncrement:true,

    },veganCategory:{
        type: DataTypes.STRING,
        allowNull: true
    },latitude:{
        type: DataTypes.STRING,
        allowNull: true
    },longitude:{
        type: DataTypes.STRING,
        allowNull: true
    },
}, {
    timestamps: false,
});

module.exports = veganUser;