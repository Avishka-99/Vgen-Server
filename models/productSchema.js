 
const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const multer = require('multer');
const path = require('path');


// Define the User model


const product = sequelize.define('product', {
 productId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
              autoIncrement: true


 },quantity:{
        type: DataTypes.INTEGER,    
        allowNull: true
 },description:{
        type: DataTypes.STRING,
        allowNull: true
 },productName:{
        type: DataTypes.STRING,
        allowNull: true
 },price:{
        type: DataTypes.DECIMAL,
        allowNull: true
 },
productImage:{
        type: DataTypes.STRING,    
        allowNull: true
 },
productType:{
              type: DataTypes.STRING,
              allowNull: true
},veganType:{
              type: DataTypes.STRING,
              allowNull: true

},

},     
{
    timestamps: false,
});


module.exports = product;