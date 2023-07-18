const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const restaurantRate = sequelize.define('restaurant_rate', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement:true,

    },userId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,
        
    },resturantManagerId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,
    },date:{
        type: DataTypes.DATE,
        allowNull: true
    },description:{
        type: DataTypes.STRING,
        allowNull: true
    },
}, {
    timestamps: false,
});

module.exports = restaurantRate;