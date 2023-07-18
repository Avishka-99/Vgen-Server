
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const placeOrder = sequelize.define('place_order', {
    orderId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey:true,
        autoIncrement:true,
    },productId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,
    },resturantManagerId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,
    },userId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,
    
    },
    } ,
 {
    timestamps: false,
});

module.exports = placeOrder;