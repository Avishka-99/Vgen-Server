
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const placeOrder = sequelize.define('place_order', {
    orderId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        foriegnKey:true,
        references: {
            model: 'order',
                 key: 'orderId'
          }

    },productId:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },resturantManagerId:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },userId:{
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    } ,
 {
    timestamps: false,
});

module.exports = placeOrder;