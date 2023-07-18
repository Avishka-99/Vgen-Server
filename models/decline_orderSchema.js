
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const declineOrder = sequelize.define('decline_order', {
    orderId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey:true,
    },deliveryPersonId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,
    
    }
    }
    ,

 {
    timestamps: false,
});

module.exports = declineOrder;