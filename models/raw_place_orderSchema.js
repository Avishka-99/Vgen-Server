
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const rawPlaceOrder = sequelize.define('raw_place_order', {
orderId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey:true,
},productId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,
},productManufacturerId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,
},userId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,
},
}
, {
    timestamps: false,
});

module.exports = rawPlaceOrder;