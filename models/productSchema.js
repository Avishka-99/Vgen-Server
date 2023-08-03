 
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
},
 description:{
        type: DataTypes.STRING,
        allowNull: true
 },productName:{
        type: DataTypes.STRING,
        allowNull: true
 },
 
productImage:{
        type: DataTypes.STRING,    
        allowNull: true
 },
 product_category:{
       type: DataTypes.STRING,
       allowNull: true
},vegan_category:{
       type: DataTypes.STRING,
       allowNull: true
},
row_category:{
       type: DataTypes.STRING,
       allowNull: true
},
},     
{
    timestamps: false,
});


module.exports = product;