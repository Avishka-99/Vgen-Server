 
const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const multer = require('multer');
const path = require('path');


// Define the User model


const sellProduct = sequelize.define('sell_product', {
 productId:{
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    foriegnKey:true,
         
}, manufactureId:{
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    foriegnKey:true,
     
},quantity:{
        type: DataTypes.FLOAT,    
        allowNull: true
 },price:{
        type: DataTypes.FLOAT,
        allowNull: true
 },
},     
{
    timestamps: false,
});


module.exports = sellProduct;