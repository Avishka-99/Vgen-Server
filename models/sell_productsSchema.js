 
const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const multer = require('multer');
const path = require('path');

const product = require('./productSchema');
 const product_manufacture = require('./product_manufactureSchema');
// Define the User model


const sellProduct = sequelize.define('sell_product', {
    sellId:{
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
},
 productId:{
    type: DataTypes.INTEGER,
    allowNull: false,
    reference:{
        model:product,
        key:'productId'
    }
         
},manufactureId:{
    type: DataTypes.INTEGER,
    allowNull: false,
    reference:{
        model:product_manufacture,
        key:'productManufactureId'

},quantity:{
        type: DataTypes.FLOAT,    
        allowNull: true
 },price:{
        type: DataTypes.FLOAT,
        allowNull: true
 },
},
},    
{
    timestamps: false,
});



module.exports = sellProduct;