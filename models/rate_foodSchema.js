
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const rateFood = sequelize.define('rate_food', {
    id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,

    },userId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,

    },productId:{
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
},

 {
    timestamps: false,
});

module.exports = rateFood;