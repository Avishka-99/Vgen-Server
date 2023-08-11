const { DataTypes } = require('sequelize');
const sequelize = require('./db');


// Define the User model
const orders = sequelize.define('order', {
 orderId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
              foriegnKey:true,     
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
}
},
 {
    timestamps: false,
});


module.exports = orders;