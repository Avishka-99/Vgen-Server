
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const productManufacture = sequelize.define('product_manufacture', {
    productManufactureId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey:true,
    },latitude:{
        type: DataTypes.STRING,
        allowNull: true
    },longitude:{
        type: DataTypes.STRING,
        allowNull: true
    },productType:{
        type: DataTypes.STRING,
        allowNull: true
    },accountNo:{
        type: DataTypes.STRING,
        allowNull: true
    },openTime:{
        //time
        type:DataTypes.TIME,
        allowNull: true
    },closeTime:{
        //time
        type:DataTypes.TIME,
        allowNull: true
    }
    }
    ,

 {
    timestamps: false,
});

module.exports = productManufacture;