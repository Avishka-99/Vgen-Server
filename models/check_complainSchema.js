
const { DataTypes } = require('sequelize');
const sequelize = require('./db');

// Define the User model
const checkComplain = sequelize.define('check_complain', {
    complainId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        foriegnKey:true,
    },userId:{
        type: DataTypes.STRING,
        allowNull: true,
        foriegnKey:true,
    },date:{
        type: DataTypes.DATE,
        allowNull: true
    },action:{
        type: DataTypes.STRING,
        allowNull: true
    }
    }
    ,

 {
    timestamps: false,
});

module.exports = checkComplain;