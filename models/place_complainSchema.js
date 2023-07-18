
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const placeComplain = sequelize.define('place_complain', {
    complainId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey:true,
        autoIncrement:true,
    },orderId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        foriegnKey:true,
    },
    }
    ,

 {
    timestamps: false,
});

module.exports = placeComplain;