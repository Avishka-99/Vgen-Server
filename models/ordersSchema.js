const { DataTypes } = require('sequelize');
const sequelize = require('./db');


// Define the User model
const orders = sequelize.define('orders', {
 orderId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey:true,
        autoIncrement:true,
 },quantity:{
        type: DataTypes.INTEGER,
        allowNull: true
 },date:{
        type: DataTypes.DATE,
        allowNull: true
 },time:{
        type: DataTypes.TIME,
        allowNull: true
 },amount:{
        type: DataTypes.INTEGER,
        allowNull: true
 },description:{
        type: DataTypes.STRING,
        allowNull: true
 },orderType:{
       type: DataTypes.STRING,
       allowNull: true
},orderState:{
        type: DataTypes.TINYINT,
        allowNull: true
 },deliveryPersonId:{
       type: DataTypes.INTEGER,
       allowNull: true,
       foriegnKey:true
},deliveryFee:{
       type: DataTypes.FLOAT,
       allowNull: true
},deliveryDate:{
       type: DataTypes.DATE,
       allowNull: true
},DeliveryTime:{
       type: DataTypes.TIME,
       allowNull: true
},deliveryState:{
       type: DataTypes.TINYINT,
       allowNull: true
},
},
 {
    timestamps: false,
});


module.exports = orders;